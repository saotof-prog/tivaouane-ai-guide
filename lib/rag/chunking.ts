/**
 * Découpage des documents en chunks (responsabilité 2 du pipeline RAG).
 *
 * Un chunk est une section de texte bornée, prête pour l’indexation
 * lexicale et vectorielle. Les chunks gardent les métadonnées du document
 * parent (aucune donnée inventée).
 */

import type { IndexedChunk, SearchIndexStats } from "./shared";
import { TODO_MARKER } from "./shared";
import type { IngestedDocument } from "./ingestion";

/** Taille maximale (en mots) d’un chunk avant découpage. */
export const CHUNK_MAX_WORDS = 300;

/** Regroupe les paragraphes d’un corps de document en chunks bornés. */
export function splitIntoChunks(body: string): string[] {
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

/** Construit les chunks indexables d’un document (sections « TODO » exclues). */
export function chunkDocument(document: IngestedDocument, stats: SearchIndexStats): IndexedChunk[] {
  const chunks: IndexedChunk[] = [];
  for (const text of splitIntoChunks(document.body)) {
    if (text.includes(TODO_MARKER)) continue;
    chunks.push({
      documentId: document.documentId,
      title: document.title,
      summary: document.summary,
      categoryId: document.categoryId,
      source: document.source,
      tags: document.tags,
      updatedAt: document.updatedAt,
      text,
    });
  }
  stats.chunksIndexed += chunks.length;
  return chunks;
}

/** Découpe une liste de documents ingérés en une liste de chunks. */
export function chunkDocuments(
  documents: IngestedDocument[],
  stats: SearchIndexStats,
): IndexedChunk[] {
  const chunks: IndexedChunk[] = [];
  for (const document of documents) {
    chunks.push(...chunkDocument(document, stats));
  }
  return chunks;
}