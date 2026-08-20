/**
 * Modèles de données de Tivaouane AI Guide.
 * Source de vérité unique : les mocks et composants dérivent de ces types.
 */

/** Catégorie générique : identifiant stable + libellé affichable. */
export type Category = {
  id: string;
  label: string;
};

/** Identifiants de catégories de lieux (filtres de la page Lieux). */
export type PlaceCategoryId =
  | "religieux"
  | "marches"
  | "restauration"
  | "hebergement"
  | "espaces";

/** Identifiants de catégories du patrimoine (filtres de la page Patrimoine). */
export type HeritageCategoryId =
  | "religieux"
  | "historique"
  | "artisanat"
  | "gastronomie";

/** Identifiants de catégories documentaires de la base de connaissances (data/knowledge/). */
export type KnowledgeCategoryId =
  | "histoire"
  | "patrimoine"
  | "lieux"
  | "culture"
  | "personnalites"
  | "evenements";

/** Coordonnées géographiques en degrés décimaux (WGS 84). */
export type GeographicCoordinates = {
  latitude: number;
  longitude: number;
};

/** Nature de la source d’information. */
export type SourceType = "livre" | "article" | "site" | "archive" | "interview" | "officiel";

/** Source d’information : référence traçable pour chaque donnée. */
export type Source = {
  id: string;
  title: string;
  type: SourceType;
  author?: string;
  url?: string;
  /** Date de publication ou de consultation (ISO 8601). */
  publishedAt?: string;
};

/** Fiche descriptive d’un lieu de Tivaouane. */
export type Place = {
  id: string;
  name: string;
  category: PlaceCategoryId;
  /** Description d’exemple — aucune donnée vérifiée, à remplacer par la base de connaissances. */
  description: string;
  /** Chemin public de l’image d’illustration (ex. « /images/lieux/monument.jpg »). */
  image?: string;
  location?: GeographicCoordinates;
  sources?: Source[];
};

/** Section éditoriale d’un article du patrimoine. */
export type HeritageSection = {
  heading: string;
  body: string;
};

/** Fiche éditoriale du patrimoine (article long, structuré en sections). */
export type HeritageItem = {
  id: string;
  title: string;
  category: HeritageCategoryId;
  /** Résumé d’exemple, affiché sur la carte. */
  excerpt: string;
  /** Corps de l’article (fiche d’exemple uniquement — aucune donnée vérifiée). */
  sections: HeritageSection[];
  /** Marqueurs courts affichés en pastilles (ex. « Rassemblements »). */
  markers?: string[];
  sources?: Source[];
};

/** Document brut de la future base de connaissances (RAG). */
export type KnowledgeDocument = {
  id: string;
  title: string;
  /** Résumé destiné aux résultats de recherche. */
  summary?: string;
  /** Contenu du document (texte brut ou Markdown). */
  content: string;
  source: Source;
  categoryId?: KnowledgeCategoryId;
  tags?: string[];
  /** Date de dernière mise à jour (ISO 8601). */
  updatedAt?: string;
};

/** Résultat de recherche issu des documents de connaissance. */
export type SearchResult = {
  documentId: string;
  title: string;
  /** Extraits pertinents autour de la requête. */
  excerpt: string;
  /** Pertinence du résultat, entre 0 et 1. */
  score: number;
  source: Source;
  categoryId?: KnowledgeCategoryId;
};

/** Requête de recherche dans la base de connaissances. */
export type SearchQuery = {
  query: string;
  /** Filtre optionnel par catégorie documentaire. */
  category?: KnowledgeCategoryId;
  /** Nombre maximal de résultats (1 à 50, défaut : 10). */
  limit?: number;
};

/** Rôle de l’auteur d’un message de chat. */
export type ChatRole = "user" | "assistant";

/** Message d’une conversation avec l’assistant. */
export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  /** Horodatage de création (ISO 8601). */
  createdAt?: string;
  /** Sources éventuelles citées dans le message de l’assistant. */
  sources?: Source[];
};

/** Requête envoyée à l’API de l’assistant. */
export type ChatRequest = {
  message: string;
  conversationId?: string;
  /** Historique de la conversation pour le contexte. */
  history?: ChatMessage[];
};

/** Réponse renvoyée par l’API de l’assistant. */
export type ChatResponse = {
  message: ChatMessage;
  conversationId?: string;
  sources?: Source[];
};