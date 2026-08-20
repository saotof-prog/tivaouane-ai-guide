/**
 * Construction du contexte du modèle (responsabilité 5 du pipeline RAG).
 *
 * Transforme les résultats de la recherche en un contexte texte borné et
 * numéroté (« [1] », « [2] », …) que le modèle est invité à citer. Les
 * métadonnées de chaque source sont conservées pour l’affichage, sans
 * aucune donnée inventée.
 *
 *   Question → recherche hybride → top-K → Contexte numéroté → prompt
 */

import { SearchError, type SearchProvider } from "./shared";
import { MAX_QUERY_LENGTH } from "./shared";
import { getSearchProvider, normalizeQuery } from "./retrieval";
import type { SearchResult } from "@/types";

/** Nombre maximal de résultats injectés dans le contexte (top-K). */
export const CONTEXT_MAX_RESULTS = 5;

/** Taille maximale du contexte en caractères (bornage de la fenêtre). */
export const CONTEXT_MAX_CHARS = 6_000;

/** Personnalité du contexte : chaque entrée occupe environ 700 caractères. */
const CONTEXT_ENTRY_MAX_CHARS = Math.floor(CONTEXT_MAX_CHARS / CONTEXT_MAX_RESULTS);

/** Contexte prêt pour le modèle : texte numéroté + résultats ordonnés. */
export type RetrievalContext = {
  /** Texte numéroté (« [1] », « [2] », …) à injecter dans le prompt système. */
  context: string;
  /** Résultats dans l’ordre du contexte (index + 1 = numéro de citation). */
  results: SearchResult[];
};

function buildEntry(index: number, result: SearchResult): string {
  const sourceTitle = result.source?.title ?? result.title;
  let excerpt = result.excerpt.trim();
  if (excerpt.length > CONTEXT_ENTRY_MAX_CHARS) {
    excerpt = `${excerpt.slice(0, CONTEXT_ENTRY_MAX_CHARS).trimEnd()}…`;
  }
  return `[${index}] ${result.title} — ${sourceTitle}\n${excerpt}`;
}

/**
 * Recherche hybride puis construction du contexte borné.
 * Lève un SearchError avec code « validation » si la requête est invalide.
 */
export async function buildRetrievalContext(
  query: string,
  provider: SearchProvider = getSearchProvider(),
): Promise<RetrievalContext> {
  const normalized = normalizeQuery(query);
  if (normalized === "") {
    throw new SearchError("validation", "La requête est vide.");
  }
  if (normalized.length > MAX_QUERY_LENGTH) {
    throw new SearchError(
      "validation",
      `La requête dépasse ${MAX_QUERY_LENGTH} caractères.`,
    );
  }

  const results = await provider.search({ query: normalized, limit: CONTEXT_MAX_RESULTS });
  if (results.length === 0) {
    return { context: "", results: [] };
  }

  const entries = results
    .map((result, index) => buildEntry(index + 1, result))
    .filter((entry) => entry.length > 0);

  return { context: entries.join("\n\n"), results };
}