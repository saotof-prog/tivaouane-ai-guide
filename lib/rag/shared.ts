/**
 * Constantes, erreurs et types partagés de la couche RAG.
 *
 * Contrat public (historique, sans casse) : KNOWLEDGE_DIR, DEFAULT_LIMIT,
 * MAX_LIMIT, MAX_QUERY_LENGTH, KNOWLEDGE_CATEGORIES, SearchError,
 * SearchIndexStats, SearchProvider.
 */

import path from "node:path";
import type { KnowledgeCategoryId, SearchQuery, SearchResult, Source } from "@/types";

/** Dossier racine de la base de connaissances. */
export const KNOWLEDGE_DIR = path.join(process.cwd(), "data", "knowledge");

/** Nombre de résultats par défaut. */
export const DEFAULT_LIMIT = 10;

/** Nombre maximal de résultats accepté. */
export const MAX_LIMIT = 50;

/** Longueur maximale d’une requête. */
export const MAX_QUERY_LENGTH = 200;

/** Marqueur interdisant l’indexation d’une section (contenu non rédigé). */
export const TODO_MARKER = "TODO";

/** Catégories documentaires connues (lues depuis le README de data/knowledge/). */
export const KNOWLEDGE_CATEGORIES: readonly KnowledgeCategoryId[] = [
  "histoire",
  "patrimoine",
  "lieux",
  "culture",
  "personnalites",
  "evenements",
];

/** Erreur métier de la couche de recherche. */
export class SearchError extends Error {
  readonly code: "validation" | "internal";

  constructor(code: "validation" | "internal", message: string) {
    super(message);
    this.name = "SearchError";
    this.code = code;
  }
}

/** Fournisseur de recherche — contrat stable entre les couches. */
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
export type IndexedChunk = {
  documentId: string;
  title: string;
  summary?: string;
  categoryId: KnowledgeCategoryId;
  source: Source;
  tags: string[];
  updatedAt?: string;
  text: string;
};