/**
 * Recherche hybride (responsabilité 4 du pipeline RAG).
 *
 * Combinaison de deux scores pour couvrir à la fois la précision lexicale
 * (BM25 : termes exacts, titres, sigles) et la similarité sémantique
 * (cosinus des embeddings : « zawiya » ⇄ « confrérie tidjane »).
 *
 *   score_hybride = 0,35 · BM25_normalisé  +  0,65 · cosinus  (clampé)
 *
 * Règles de robustesse :
 *   - si les embeddings échouent (clé absente, réseau, fournisseur), le
 *     score bascule silencieusement sur le BM25 seul (comportement historique) ;
 *   - un seul résultat par document (le chunk le plus pertinent) ;
 *   - seuls les documents `status: valide` et les sections sans « TODO »
 *     sont indexés (aucune donnée inventée) ;
 *   - une base absente ou vide renvoie simplement zéro résultat.
 */

import { normalizeText } from "@/lib/utils";
import { DEFAULT_LIMIT, MAX_LIMIT, type IndexedChunk, type SearchIndexStats, type SearchProvider } from "./shared";
import { chunkDocuments } from "./chunking";
import { embedQuery, getEmbeddingsForChunks } from "./embeddings";
import { ingestDocuments } from "./ingestion";
import type { SearchQuery, SearchResult } from "@/types";

/** Pondération du score hybride (atténuable si un seul signal est disponible). */
export const HYBRID_WEIGHT_SEMANTIC = 0.65;
export const HYBRID_WEIGHT_LEXICAL = 1 - HYBRID_WEIGHT_SEMANTIC;

const EXCERPT_TARGET_LENGTH = 240;
const BM25_K1 = 1.5;
const BM25_B = 0.75;

/** Tokénise un texte (minuscules, sans diacritiques, mots de 2 caractères ou plus). */
export function tokenize(text: string): string[] {
  return normalizeText(text)
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 1);
}

/** Normalisation de la requête utilisateur avant recherche (responsabilité 1). */
export function normalizeQuery(query: string): string {
  return query
    .trim()
    .replace(/[\u00A0\u202F]+/g, " ")
    .replace(/\s+/g, " ");
}

type Bm25Index = {
  termsInChunk: Array<Map<string, number>>;
  termDocumentFrequency: Map<string, number>;
  documentCount: number;
  chunkLengths: number[];
  averageChunkLength: number;
};

/** Construit les statistiques BM25 (IDF au niveau document, TF au niveau chunk). */
function buildBm25Index(chunks: IndexedChunk[]): Bm25Index {
  const termsInChunk: Array<Map<string, number>> = [];
  const chunkLengths: number[] = [];
  const perDocumentTerms = new Map<string, Set<string>>();
  let totalLength = 0;

  chunks.forEach((chunk, index) => {
    const termFrequencies = new Map<string, number>();
    for (const term of tokenize(chunk.text)) {
      termFrequencies.set(term, (termFrequencies.get(term) ?? 0) + 1);
    }
    termsInChunk[index] = termFrequencies;
    const chunkLength = [...termFrequencies.values()].reduce(
      (sum, count) => sum + count,
      0,
    );
    chunkLengths[index] = chunkLength;
    totalLength += chunkLength;

    let documentTerms = perDocumentTerms.get(chunk.documentId);
    if (documentTerms === undefined) {
      documentTerms = new Set<string>();
      perDocumentTerms.set(chunk.documentId, documentTerms);
    }
    for (const term of termFrequencies.keys()) documentTerms.add(term);
  });

  const termDocumentFrequency = new Map<string, number>();
  for (const documentTerms of perDocumentTerms.values()) {
    for (const term of documentTerms) {
      termDocumentFrequency.set(term, (termDocumentFrequency.get(term) ?? 0) + 1);
    }
  }

  return {
    termsInChunk,
    termDocumentFrequency,
    documentCount: perDocumentTerms.size,
    chunkLengths,
    averageChunkLength: chunks.length > 0 ? totalLength / chunks.length : 0,
  };
}

/** Score BM25 d’un chunk pour les termes de la requête. */
function scoreChunk(index: Bm25Index, chunkIndex: number, queryTokens: string[]): number {
  const termFrequencies = index.termsInChunk[chunkIndex];
  const chunkLength = index.chunkLengths[chunkIndex];
  let score = 0;

  for (const term of queryTokens) {
    const termFrequency = termFrequencies.get(term) ?? 0;
    if (termFrequency === 0) continue;
    const documentFrequency = index.termDocumentFrequency.get(term) ?? 0;
    const inverseDocumentFrequency = Math.log(
      1 + (index.documentCount - documentFrequency + 0.5) / (documentFrequency + 0.5),
    );
    const denominator =
      termFrequency +
      BM25_K1 * (1 - BM25_B + BM25_B * (chunkLength / index.averageChunkLength));
    score += inverseDocumentFrequency * ((termFrequency * (BM25_K1 + 1)) / denominator);
  }

  return score;
}

/** Extrait une fenêtre de texte autour du premier terme de la requête. */
export function buildExcerpt(text: string, queryTokens: string[]): string {
  const normalizedText = normalizeText(text);
  const firstToken = queryTokens.find((token) => normalizedText.includes(token));

  if (firstToken === undefined) {
    // Aucune correspondance lexicale : c’est un match sémantique — début du chunk.
    const trimmed = text.trim();
    return trimmed.length <= EXCERPT_TARGET_LENGTH
      ? trimmed
      : `${trimmed.slice(0, EXCERPT_TARGET_LENGTH).trimEnd()}…`;
  }

  const position = normalizedText.indexOf(firstToken);
  const lengthRatio = text.length / Math.max(1, normalizedText.length);
  const rawPosition = Math.min(text.length, Math.floor(position * lengthRatio));
  const radius = EXCERPT_TARGET_LENGTH / 2;
  const start = Math.max(0, rawPosition - radius);
  const end = Math.min(text.length, rawPosition + radius + firstToken.length);
  const prefix = start > 0 ? "…" : "";
  const suffix = end < text.length ? "…" : "";
  return `${prefix}${text.slice(start, end).trim()}${suffix}`;
}

/** Similarité cosinus entre deux vecteurs unitaires (clampée à [0, 1]). */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0;
  for (let i = 0; i < a.length; i += 1) dot += a[i] * b[i];
  return Math.min(1, Math.max(0, dot));
}

/** Index en mémoire construit depuis data/knowledge/. */
export type LocalIndex = {
  chunks: IndexedChunk[];
  stats: SearchIndexStats;
  vectors: number[][] | null;
};

/** Fournisseur hybride : BM25 local + recherche vectorielle avec repli lexical. */
export class HybridSearchProvider implements SearchProvider {
  readonly name = "hybrid";
  private cachedIndex: LocalIndex | null = null;

  async search(query: SearchQuery): Promise<SearchResult[]> {
    const index = await this.getIndex();
    if (index.chunks.length === 0) return [];

    const normalized = normalizeQuery(query.query);
    if (normalized === "") return [];
    const queryTokens = [...new Set(tokenize(normalized))];

    const limit = Math.min(query.limit ?? DEFAULT_LIMIT, MAX_LIMIT);
    const bm25Index = buildBm25Index(index.chunks);

    // Question vectorielle (échec silencieux → repli lexical).
    const queryVector = index.vectors === null ? null : await embedQuery(normalized);
    const useSemantic = queryVector !== null && queryVector.length > 0;

    let maxLexical = 0;
    let maxSemantic = 0;
    const scores = new Array<{ lexical: number; semantic: number }>(index.chunks.length);
    index.chunks.forEach((chunk, chunkIndex) => {
      if (query.category !== undefined && chunk.categoryId !== query.category) {
        scores[chunkIndex] = { lexical: 0, semantic: 0 };
        return;
      }
      const lexical = scoreChunk(bm25Index, chunkIndex, queryTokens);
      const semantic =
        useSemantic && index.vectors !== null && index.vectors[chunkIndex] !== undefined
          ? cosineSimilarity(index.vectors[chunkIndex], queryVector as number[])
          : 0;
      scores[chunkIndex] = { lexical, semantic };
      if (lexical > maxLexical) maxLexical = lexical;
      if (semantic > maxSemantic) maxSemantic = semantic;
    });

    const lexicalDenominator = maxLexical > 0 ? maxLexical : 1;
    const semanticDenominator = maxSemantic > 0 ? maxSemantic : 1;

    const scored: Array<{ chunk: IndexedChunk; score: number }> = [];
    index.chunks.forEach((chunk, chunkIndex) => {
      const { lexical, semantic } = scores[chunkIndex];
      const normalizedLexical = lexical / lexicalDenominator;
      const normalizedSemantic = useSemantic ? semantic / semanticDenominator : 0;
      const score = useSemantic
        ? HYBRID_WEIGHT_LEXICAL * normalizedLexical + HYBRID_WEIGHT_SEMANTIC * normalizedSemantic
        : normalizedLexical;
      if (score > 0) scored.push({ chunk, score });
    });

    // Un résultat par document : on garde le chunk le plus pertinent.
    const bestPerDocument = new Map<string, { chunk: IndexedChunk; score: number }>();
    for (const item of scored) {
      const current = bestPerDocument.get(item.chunk.documentId);
      if (current === undefined || item.score > current.score) {
        bestPerDocument.set(item.chunk.documentId, item);
      }
    }

    const best = [...bestPerDocument.values()]
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
    const maxScore = best.length > 0 ? best[0].score : 0;

    return best.map(({ chunk, score }) => ({
      documentId: chunk.documentId,
      title: chunk.title,
      excerpt: buildExcerpt(chunk.text, queryTokens),
      score: maxScore > 0 ? Math.round((score / maxScore) * 10_000) / 10_000 : 0,
      source: chunk.source,
      categoryId: chunk.categoryId,
    }));
  }

  /** Statistiques de l’index courant (chargé si besoin). */
  async getStats(): Promise<SearchIndexStats> {
    const index = await this.getIndex();
    return index.stats;
  }

  /** En développement, l’index est rechargé à chaque requête pour refléter les edits. */
  private async getIndex(): Promise<LocalIndex> {
    if (process.env.NODE_ENV === "development" || this.cachedIndex === null) {
      this.cachedIndex = await loadIndex();
    }
    return this.cachedIndex;
  }
}

let searchProvider: SearchProvider | null = null;

/**
 * Provider singleton — recherche hybride prête pour le chat comme pour
 * la route /api/search (contrat SearchProvider inchangé).
 */
export function getSearchProvider(): SearchProvider {
  if (searchProvider === null) {
    searchProvider = new HybridSearchProvider();
  }
  return searchProvider;
}

/** Charge la base, découpe en chunks, calcule les vecteurs (échec → null). */
async function loadIndex(): Promise<LocalIndex> {
  const { documents, stats } = await ingestDocuments();
  const chunks = chunkDocuments(documents, stats);

  let vectors: number[][] | null = null;
  try {
    vectors = await getEmbeddingsForChunks(chunks);
  } catch {
    vectors = null; // repli lexical automatique (mentionné en tête de module)
  }
  return { chunks, stats, vectors };
}