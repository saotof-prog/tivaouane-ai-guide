/**
 * Types du système cartographique de Tivaouane-AI.
 * Abstraction fournisseur-agnostique (Leaflet, MapLibre, Google Maps, etc.).
 */

import type { Place, PlaceCategoryId } from "@/types";

/** Coordonnées géographiques WGS 84. */
export type Coordinates = {
  latitude: number;
  longitude: number;
};

/** Emplacement affichable sur la carte. */
export type MapLocation = {
  id: string;
  name: string;
  coordinates: Coordinates;
  category: PlaceCategoryId;
  description?: string;
  image?: string;
  /** Données brutes du lieu pour le panneau d'info. */
  raw?: Place;
};

/** État de la vue caméra. */
export type MapViewport = {
  center: Coordinates;
  zoom: number;
};

/** Props communes à tout fournisseur de carte. */
export type MapProviderProps = {
  /** Conteneur DOM où monter la carte. */
  container: HTMLElement;
  /** Vue initiale. */
  initialViewport: MapViewport;
  /** Lieux à afficher. */
  locations: MapLocation[];
  /** Callback lors du changement de vue (pan/zoom). */
  onViewportChange?: (viewport: MapViewport) => void;
  /** Callback lors de la sélection d'un lieu. */
  onLocationSelect?: (location: MapLocation | null) => void;
  /** Callback lors du clic sur le fond de carte (désélection). */
  onMapClick?: () => void;
  /** Thème clair/sombre. */
  theme?: "light" | "dark";
  /** Langue pour les tuiles (si supporté). */
  language?: string;
  /** URL template des tuiles (optionnel, défaut depuis config). */
  defaultTileUrl?: string;
  /** Attribution des tuiles (optionnel, défaut depuis config). */
  tileAttribution?: string;
};

/** Interface qu'un fournisseur de carte doit implémenter. */
export type MapProvider = {
  /** Initialise la carte dans le conteneur. */
  init: (props: MapProviderProps) => Promise<void>;
  /** Met à jour les lieux affichés. */
  setLocations: (locations: MapLocation[]) => void;
  /** Centre la carte sur des coordonnées. */
  setCenter: (center: Coordinates, zoom?: number) => void;
  /** Définit le zoom. */
  setZoom: (zoom: number) => void;
  /** Sélectionne/désélectionne un marqueur. */
  setSelectedLocation: (location: MapLocation | null) => void;
  /** Applique un thème. */
  setTheme: (theme: "light" | "dark") => void;
  /** Nettoie les ressources (event listeners, instance carte). */
  destroy: () => void;
};

/** Fabrique de fournisseur de carte (permet l'injection de dépendance). */
export type MapProviderFactory = (container: HTMLElement) => Promise<MapProvider>;

/** Configuration du système cartographique. */
export type MapConfig = {
  /** Vue par défaut centrée sur Tivaouane. */
  defaultViewport: MapViewport;
  /** Zoom min/max autorisés. */
  zoomRange: [number, number];
  /** Fournisseur de tuiles par défaut (URL template avec {z}/{x}/{y}). */
  defaultTileUrl: string;
  /** Attribution tuiles. */
  tileAttribution: string;
};

/** Résultat de recherche de lieux. */
export type PlaceSearchResult = {
  location: MapLocation;
  /** Score de pertinence 0-1. */
  score: number;
};

/** Filtres applicables aux lieux. */
export type PlaceFilters = {
  query: string;
  category: PlaceCategoryId | "all";
};