/**
 * Embeddings (responsabilité 3 du pipeline RAG).
 *
 * Rôle : transformer la requête et les chunks en vecteurs numériques afin
 * de permettre une recherche par similarité sémantique, complémentaire du
 * scoring lexical BM25 (« zawiya » doit matcher « confrérie tidjane »).
 *
 * Choix d’implémentation (aucune dépendance ajoutée) :
 *   - l’API d’embeddings OpenAI est appelée via `fetch` (même clé que le
 *     chat), exactement comme le fournisseur de génération de lib/ai.ts ;
 *   - les vecteurs sont mis en cache sur disque (`.next/rag/`) et recalculés
 *     uniquement quand l’empreinte du contenu indexé change ;
 *   - en cas d’échec (clé absente, réseau, fournisseur), le retriever hybride
 *     bascule silencieusement sur le BM25 : l’assistant reste fonctionnel.
 */

import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

/** Dimension des vecteurs produits par text-embedding-3-small. */
export const DEFAULT_EMBEDDING_MODEL = "text-embedding-3-small";
const EMBEDDING_DIMENSION = 1536;
const EMBEDDING_BATCH_SIZE = 8;
const EMBEDDING_TIMEOUT_MS = 15_000;
const TITLE_PREFIX_MAX_CHARS = 80;

const CACHE_DIR = path.join(process.cwd(), ".next", "rag");
const CACHE_FILE = path.join(CACHE_DIR, "embedding-cache.json");

/** Erreur spécifique aux embeddings (pas exposée à l’API publique). */
export class EmbeddingsError extends Error {
  readonly code: "configuration" | "network" | "provider";

  constructor(code: "configuration" | "network" | "provider", message: string) {
    super(message);
    this.name = "EmbeddingsError";
    this.code = code;
  }
}

/** Fournisseur d’embeddings — remplaçable (même motif que ChatModel). */
export interface EmbeddingProvider {
  readonly name: string;
  /** Vecteurs normalisés (norme 1) pour une similarité cosinus simple (produit scalaire). */
  embed(texts: string[]): Promise<number[][]>;
}

type EmbeddingResponse = {
  data?: Array<{ embedding?: number[] }>;
  error?: { message?: string } | string;
};

function readApiConfig(): {
  apiKey: string;
  baseUrl: string;
  model: string;
} {
  return {
    apiKey: process.env.OPENAI_API_KEY ?? "",
    baseUrl: (process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1").replace(/\/+$/, ""),
    model: process.env.OPENAI_EMBEDDING_MODEL ?? DEFAULT_EMBEDDING_MODEL,
  };
}

/** Normalise un vecteur (norme L2 = 1) : le cosinus devient un produit scalaire. */
function normalizeVector(vector: number[]): number[] {
  const norm = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
  if (norm === 0) return vector;
  return vector.map((value) => value / norm);
}

/** Fournisseur OpenAI-compatible : POST /embeddings via fetch, par lots. */
export class OpenAIEmbeddingProvider implements EmbeddingProvider {
  readonly name = "openai-embeddings";

  async embed(texts: string[]): Promise<number[][]> {
    const { apiKey, baseUrl, model } = readApiConfig();
    if (apiKey === "") {
      throw new EmbeddingsError("configuration", "OPENAI_API_KEY non configurée.");
    }

    const vectors: number[][] = [];
    for (let offset = 0; offset < texts.length; offset += EMBEDDING_BATCH_SIZE) {
      const batch = texts.slice(offset, offset + EMBEDDING_BATCH_SIZE);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), EMBEDDING_TIMEOUT_MS);
      try {
        const response = await fetch(`${baseUrl}/embeddings`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({ model, input: batch }),
          signal: controller.signal,
        });

        if (response.status === 401 || response.status === 403) {
          throw new EmbeddingsError("configuration", "Clé d’API invalide ou refusée.");
        }
        if (!response.ok) {
          throw new EmbeddingsError(
            "provider",
            `Réponse ${response.status} du fournisseur d’embeddings.`,
          );
        }

        let payload: EmbeddingResponse;
        try {
          payload = (await response.json()) as EmbeddingResponse;
        } catch {
          throw new EmbeddingsError("provider", "Réponse JSON invalide du fournisseur.");
        }

        const data = payload.data;
        if (!Array.isArray(data) || data.length !== batch.length) {
          throw new EmbeddingsError("provider", "Format de réponse inattendu.");
        }
        for (const item of data) {
          const embedding = item.embedding;
          if (!Array.isArray(embedding) || embedding.length === 0) {
            throw new EmbeddingsError("provider", "Vecteur manquant dans la réponse.");
          }
          vectors.push(normalizeVector(embedding));
        }
      } catch (error) {
        if (error instanceof EmbeddingsError) throw error;
        if (error instanceof Error && error.name === "AbortError") {
          throw new EmbeddingsError("network", "Délai d’attente de l’appel embeddings dépassé.");
        }
        throw new EmbeddingsError("network", (error as Error).message);
      } finally {
        clearTimeout(timeout);
      }
    }
    return vectors;
  }
}

let embeddingProvider: EmbeddingProvider | null = null;

/** Provider singleton — point de remplacement d’un futur fournisseur local. */
export function getEmbeddingProvider(): EmbeddingProvider {
  if (embeddingProvider === null) {
    embeddingProvider = new OpenAIEmbeddingProvider();
  }
  return embeddingProvider;
}

/** Empreinte stable du corpus indexé : invalide le cache à la moindre modification. */
export function corpusFingerprint(chunks: Array<{ documentId: string; text: string }>): string {
  const hash = createHash("sha256");
  for (const chunk of chunks) {
    hash.update(`${chunk.documentId}\u0000${chunk.text}\u0000`);
  }
  return hash.digest("hex");
}

type CachePayload = {
  fingerprint: string;
  model: string;
  vectors: number[][];
};

/**
 * Construit — ou restaure depuis le cache — les vecteurs des chunks.
 * Le cache est basé sur l’empreinte du contenu : toute édition d’un fichier
 * invalide le tampon et provoque un nouvel appel d’embedding.
 * En cas d’échec, renvoie null (le retriever bascule en mode lexical).
 */
export async function getEmbeddingsForChunks(
  chunks: Array<{ documentId: string; title: string; text: string }>,
): Promise<number[][] | null> {
  if (chunks.length === 0) return [];

  const { model } = readApiConfig();
  const fingerprint = corpusFingerprint(chunks);

  let cached: CachePayload | null = null;
  try {
    cached = JSON.parse(await readFile(CACHE_FILE, "utf8")) as CachePayload;
  } catch {
    cached = null; // cache absent ou corrompu : recalcul
  }
  if (
    cached !== null &&
    cached.fingerprint === fingerprint &&
    cached.model === model &&
    Array.isArray(cached.vectors) &&
    cached.vectors.length === chunks.length
  ) {
    return cached.vectors;
  }

  const texts = chunks.map((chunk) => {
    const prefix = chunk.title.slice(0, TITLE_PREFIX_MAX_CHARS);
    return chunk.text.length > 0 ? `${prefix}\n${chunk.text}` : prefix;
  });

  const vectors = await getEmbeddingProvider().embed(texts);
  const payload: CachePayload = { fingerprint, model, vectors };
  try {
    await mkdir(CACHE_DIR, { recursive: true });
    await writeFile(CACHE_FILE, JSON.stringify(payload), "utf8");
  } catch {
    // cache non persistant (lecture seule, etc.) : on ignore, sans impact.
  }
  return vectors;
}

/** Vecteur normalisé d’une requête (ou null si l’embedding échoue). */
export async function embedQuery(query: string): Promise<number[] | null> {
  try {
    const vectors = await getEmbeddingProvider().embed([query]);
    return vectors[0] ?? null;
  } catch {
    return null;
  }
}

/** Dimension attendue des vecteurs (cohérence du produit scalaire). */
export function expectedEmbeddingDimension(): number {
  return EMBEDDING_DIMENSION;
}