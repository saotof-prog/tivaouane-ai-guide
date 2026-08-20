/**
 * Couche RAG de la base de connaissances — point d’entrée public.
 *
 * Pipeline : Question → Normalisation → Embedding → Recherche vectorielle
 * (+ lexicale BM25) → Top-K → Construction du contexte numéroté →
 * Prompt système → Génération (lib/ai.ts) → Réponse avec sources.
 *
 * Responsabilités séparées en modules :
 *   1. ingestion.ts — lecture et validation des documents ;
 *   2. chunking.ts — découpage en chunks bornés ;
 *   3. embeddings.ts — vecteurs sémantiques (cache + repli) ;
 *   4. retrieval.ts — recherche hybride BM25 + cosinus ;
 *   5. context.ts — contexte numéroté et borné ;
 *   6. lib/ai.ts — génération (system prompt + citations).
 *
 * L’API publique historique est préservée : @/lib/rag reste utilisable
 * pour la route /api/search (SearchProvider, constantes, SearchError).
 */

export { KNOWLEDGE_DIR, DEFAULT_LIMIT, MAX_LIMIT, MAX_QUERY_LENGTH, KNOWLEDGE_CATEGORIES } from "./shared";
export { SearchError, type SearchProvider, type SearchIndexStats } from "./shared";
export { cosineSimilarity, tokenize, normalizeQuery, HybridSearchProvider, getSearchProvider } from "./retrieval";
export { buildRetrievalContext, CONTEXT_MAX_RESULTS, CONTEXT_MAX_CHARS, type RetrievalContext } from "./context";