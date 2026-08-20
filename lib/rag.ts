/**
 * Couche de recherche de la base de connaissances (pré-RAG).
 *
 * Chaîne : SearchQuery → SearchProvider.search() → SearchResult[]
 *
 * Première version locale (« local-lexical ») : les documents Markdown de
 * `data/knowledge/` sont indexés en mémoire et scorés par un BM25 léger.
 * À terme, ce provider sera remplacé par une recherche vectorielle — le
 * contrat `SearchProvider` restera inchangé.
 *
 * Règles d’indexation (aucune donnée inventée) :
 *   - seul un document `status: valide` est indexé ;
 *   - toute section contenant le marqueur « TODO » est exclue ;
 *   - un document au frontmatter invalide ou incomplet est ignoré ;
 *   - une base absente ou vide renvoie simplement zéro résultat.
 */

import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { normalizeText } from "@/lib/utils";
import type {
  KnowledgeCategoryId,
  SearchQuery,
  SearchResult,
  Source,
  SourceType,
} from "@/types";

/** Dossier racine de la base de connaissances. */
export const KNOWLEDGE_DIR = path.join(process.cwd(), "data", "knowledge");

/** Nombre de résultats par défaut. */
export const DEFAULT_LIMIT = 10;

/** Nombre maximal de résultats accepté. */
export const MAX_LIMIT = 50;

/** Longueur maximale d’une requête. */
export const MAX_QUERY_LENGTH = 200;

/** Marqueur interdisant l’indexation d’une section (contenu non rédigé). */
const TODO_MARKER = "TODO";

/** Catégories documentaires connues (lues depuis le README de data/knowledge/). */
export const KNOWLEDGE_CATEGORIES: readonly KnowledgeCategoryId[] = [
  "histoire",
  "patrimoine",
  "lieux",
  "culture",
  "personnalites",
  "evenements",
];

const VALID_STATUSES = new Set(["brouillon", "a_verifier", "valide"]);

const VALID_SOURCE_TYPES = new Set<SourceType>([
  "livre",
  "article",
  "site",
  "archive",
  "interview",
  "officiel",
]);

/** Erreur métier de la couche de recherche. */
export class SearchError extends Error {
  readonly code: "validation" | "internal";

  constructor(code: "validation" | "internal", message: string) {
    super(message);
    this.name = "SearchError";
    this.code = code;
  }
}

/** Fournisseur de recherche — point de remplacement pour la future recherche vectorielle. */
export interface SearchProvider {
  readonly name: string;
  search(query: SearchQuery): Promise<SearchResult[]>;
}

/** Statistiques d’indexation, utiles au débogage. */
export type SearchIndexStats = {
  filesScanned: number;
  documentsIndexed: number;
  chunksIndexed: number;
  skipped: {
    missingFrontmatter: number;
    invalidFrontmatter: number;
    notValidated: number;
  };
};

/** Chunk indexé : section d’un document, prête pour le scoring. */
type IndexedChunk = {
  documentId: string;
  title: string;
  summary?: string;
  categoryId: KnowledgeCategoryId;
  source: Source;
  tags: string[];
  updatedAt?: string;
  text: string;
};

/** Index en mémoire construit depuis data/knowledge/. */
type LocalIndex = {
  chunks: IndexedChunk[];
  stats: SearchIndexStats;
};

type RawFrontmatter = Record<string, unknown>;

/** Retire les guillemets environnants et le commentaire éventuel d’une valeur YAML. */
function stripQuotes(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith("\"") && trimmed.endsWith("\"")) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  const commentIndex = trimmed.indexOf(" #");
  return commentIndex === -1 ? trimmed : trimmed.slice(0, commentIndex).trim();
}

/**
 * Parser minimal du frontmatter YAML — limité au format contrôlé défini
 * dans `data/knowledge/README.md` (scalaires, listes « - item » et objet
 * « source: » imbriqué). Renvoie null si la structure est inattendue.
 */
function parseFrontmatter(raw: string): RawFrontmatter | null {
  const result: RawFrontmatter = {};
  let currentKey: string | null = null;

  for (const line of raw.split(/\r?\n/)) {
    if (line.trim() === "") continue;

    const listMatch = /^\s*-\s+(.+)$/.exec(line);
    if (listMatch) {
      if (currentKey === null) return null;
      const list = result[currentKey];
      if (!Array.isArray(list)) return null;
      list.push(stripQuotes(listMatch[1]));
      continue;
    }

    const keyMatch = /^(\s*)([\w-]+):\s*(.*)$/.exec(line);
    if (!keyMatch) return null;
    const [, indent, key, rawValue] = keyMatch;
    const value = rawValue.trim();

    if (indent.length > 0) {
      if (currentKey === null) return null;
      const parent = result[currentKey];
      if (parent === null || typeof parent !== "object" || Array.isArray(parent)) {
        return null;
      }
      if (value === "") continue;
      (parent as Record<string, unknown>)[key] = stripQuotes(value);
      continue;
    }

    currentKey = key;
    if (value === "[]") {
      result[key] = [];
    } else if (value === "") {
      result[key] = []; // conteneur créé paresseusement par « - item » ou les clés imbriquées
    } else {
      result[key] = stripQuotes(value);
    }
  }

  return result;
}

/** Découpe un fichier en frontmatter et corps. Renvoie null sans délimiteur. */
function splitFrontmatter(raw: string): { frontmatter: RawFrontmatter; body: string } | null {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
  if (!match) return null;
  const frontmatter = parseFrontmatter(match[1]);
  if (frontmatter === null) return null;
  return { frontmatter, body: raw.slice(match[0].length) };
}

/** Convertit la valeur « source » du frontmatter en Source. Renvoie null si incomplète. */
function toSourceOrNull(value: unknown): Source | null {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  const id = typeof record.id === "string" ? record.id.trim() : "";
  const title = typeof record.title === "string" ? record.title.trim() : "";
  const type = typeof record.type === "string" ? (record.type as SourceType) : undefined;
  if (id === "" || title === "" || type === undefined || !VALID_SOURCE_TYPES.has(type)) {
    return null;
  }
  const source: Source = { id, title, type };
  if (typeof record.author === "string" && record.author.trim() !== "") {
    source.author = record.author.trim();
  }
  if (typeof record.url === "string" && record.url.trim() !== "") {
    source.url = record.url.trim();
  }
  if (typeof record.publishedAt === "string" && record.publishedAt.trim() !== "") {
    source.publishedAt = record.publishedAt.trim();
  }
  return source;
}

/** Normalise une date ISO 8601 (JJ sur 10 caractères) ou renvoie undefined. */
function toDateOrUndefined(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return /^\d{4}-\d{2}-\d{2}/.test(trimmed) ? trimmed.slice(0, 10) : undefined;
}

type ParsedDocument = Omit<IndexedChunk, "text">;

/** Valide le frontmatter et construit le document indexable. Renvoie null si ignoré. */
function buildDocument(
  frontmatter: RawFrontmatter,
  stats: SearchIndexStats,
): ParsedDocument | null {
  const id = typeof frontmatter.id === "string" ? frontmatter.id.trim() : "";
  const title = typeof frontmatter.title === "string" ? frontmatter.title.trim() : "";
  const status = typeof frontmatter.status === "string" ? frontmatter.status.trim() : "";
  const category = typeof frontmatter.category === "string" ? frontmatter.category.trim() : "";
  if (id === "" || title === "" || status === "" || category === "") {
    stats.skipped.invalidFrontmatter += 1;
    return null;
  }
  if (!VALID_STATUSES.has(status)) {
    stats.skipped.invalidFrontmatter += 1;
    return null;
  }
  if (status !== "valide") {
    stats.skipped.notValidated += 1;
    return null;
  }
  if (!KNOWLEDGE_CATEGORIES.includes(category as KnowledgeCategoryId)) {
    stats.skipped.invalidFrontmatter += 1;
    return null;
  }
  const source = toSourceOrNull(frontmatter.source);
  if (source === null) {
    stats.skipped.invalidFrontmatter += 1;
    return null;
  }

  const tags = Array.isArray(frontmatter.tags)
    ? frontmatter.tags
        .filter((tag): tag is string => typeof tag === "string")
        .map((tag) => tag.trim())
        .filter((tag) => tag !== "")
    : [];

  return {
    documentId: id,
    title,
    summary:
      typeof frontmatter.summary === "string" && frontmatter.summary.trim() !== ""
        ? frontmatter.summary.trim()
        : undefined,
    categoryId: category as KnowledgeCategoryId,
    source,
    tags,
    updatedAt: toDateOrUndefined(frontmatter.updatedAt),
  };
}

/** Taille maximale (en mots) d’un chunk avant découpage. */
const CHUNK_MAX_WORDS = 300;

/** Découpe le corps Markdown en chunks (regroupement de paragraphes). */
function splitIntoChunks(body: string): string[] {
  const paragraphs = body
    .split(/\r?\n\r?\n/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0);

  const chunks: string[] = [];
  let buffer: string[] = [];
  let bufferWords = 0;

  for (const paragraph of paragraphs) {
    const words = paragraph.split(/\s+/).length;
    if (bufferWords > 0 && bufferWords + words > CHUNK_MAX_WORDS) {
      chunks.push(buffer.join("\n\n"));
      buffer = [];
      bufferWords = 0;
    }
    buffer.push(paragraph);
    bufferWords += words;
  }
  if (buffer.length > 0) chunks.push(buffer.join("\n\n"));
  return chunks;
}

/** Liste récursive des fichiers Markdown de la base. */
async function listMarkdownFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { recursive: true });
  return entries
    .filter((entry) => entry.endsWith(".md"))
    .map((entry) => path.join(dir, entry));
}

/** Construit l’index en lisant data/knowledge/ (document valides, sections sans TODO). */
async function loadIndex(): Promise<LocalIndex> {
  const stats: SearchIndexStats = {
    filesScanned: 0,
    documentsIndexed: 0,
    chunksIndexed: 0,
    skipped: { missingFrontmatter: 0, invalidFrontmatter: 0, notValidated: 0 },
  };
  const chunks: IndexedChunk[] = [];

  let files: string[];
  try {
    files = await listMarkdownFiles(KNOWLEDGE_DIR);
  } catch (error) {
    if ((error as NodeJS.ErrnoException)?.code === "ENOENT") {
      return { chunks, stats }; // base absente : index vide
    }
    throw new SearchError(
      "internal",
      `Lecture de la base de connaissances impossible : ${(error as Error).message}`,
    );
  }

  for (const file of files) {
    stats.filesScanned += 1;
    let raw: string;
    try {
      raw = await readFile(file, "utf8");
    } catch {
      continue; // fichier illisible : ignoré
    }
    const parsed = splitFrontmatter(raw);
    if (parsed === null) {
      stats.skipped.missingFrontmatter += 1;
      continue;
    }
    const document = buildDocument(parsed.frontmatter, stats);
    if (document === null) continue;
    for (const text of splitIntoChunks(parsed.body)) {
      if (text.includes(TODO_MARKER)) continue;
      chunks.push({ ...document, text });
      stats.chunksIndexed += 1;
    }
    stats.documentsIndexed += 1;
  }

  return { chunks, stats };
}

/** Tokénise un texte (minuscules, sans diacritiques, mots de 2 caractères ou plus). */
function tokenize(text: string): string[] {
  return normalizeText(text)
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 1);
}

type Bm25Index = {
  termsInChunk: Array<Map<string, number>>;
  termDocumentFrequency: Map<string, number>;
  documentCount: number;
  chunkLengths: number[];
  averageChunkLength: number;
};

const BM25_K1 = 1.5;
const BM25_B = 0.75;

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

const EXCERPT_TARGET_LENGTH = 240;

/** Extrait une fenêtre de texte autour du premier terme de la requête. */
function buildExcerpt(text: string, queryTokens: string[]): string {
  const normalizedText = normalizeText(text);
  const firstToken = queryTokens.find((token) => normalizedText.includes(token));

  if (firstToken === undefined) {
    // Aucune correspondance : début du chunk tronqué.
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

/** Fournisseur local : index lexical BM25 sur data/knowledge/. */
export class LocalLexicalSearchProvider implements SearchProvider {
  readonly name = "local-lexical";
  private cachedIndex: LocalIndex | null = null;

  async search(query: SearchQuery): Promise<SearchResult[]> {
    const index = await this.getIndex();
    const queryTokens = [...new Set(tokenize(query.query))];
    if (index.chunks.length === 0 || queryTokens.length === 0) return [];

    const limit = Math.min(query.limit ?? DEFAULT_LIMIT, MAX_LIMIT);
    const bm25Index = buildBm25Index(index.chunks);

    const scored: Array<{ chunk: IndexedChunk; score: number }> = [];
    index.chunks.forEach((chunk, chunkIndex) => {
      if (query.category !== undefined && chunk.categoryId !== query.category) return;
      const score = scoreChunk(bm25Index, chunkIndex, queryTokens);
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

/** Provider singleton — point de branchement de la future recherche vectorielle. */
export function getSearchProvider(): SearchProvider {
  if (searchProvider === null) {
    searchProvider = new LocalLexicalSearchProvider();
  }
  return searchProvider;
}