/**
 * Données géographiques des lieux de Tivaouane.
 * Source unique pour les marqueurs de carte.
 * Coordonnées approximatives (WGS 84) — à affiner avec données officielles.
 */

import type { MapLocation, MapConfig, Coordinates } from "./types";
import type { PlaceCategoryId } from "@/types";

/** Coordonnées de référence de Tivaouane (centre-ville). */
export const TIVAOUANE_CENTER: Coordinates = {
  latitude: 14.9556,
  longitude: -16.8264,
};

/** Configuration par défaut de la carte. */
export const DEFAULT_MAP_CONFIG: MapConfig = {
  defaultViewport: {
    center: TIVAOUANE_CENTER,
    zoom: 14,
  },
  zoomRange: [11, 18],
  defaultTileUrl: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  tileAttribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
};

/** Lieux de Tivaouane avec coordonnées géographiques. */
export const TIVAOUANE_LOCATIONS: MapLocation[] = [
  {
    id: "grande-mosquee",
    name: "Grande Mosquée de Tivaouane",
    coordinates: { latitude: 14.9569, longitude: -16.8278 },
    category: "religieux",
    description:
      "Édifiée au début du XXᵉ siècle sous l'impulsion d'El Hadji Malick Sy, cœur spirituel de la cité tidiane. Point d'orgue du Gamou annuel.",
    image: "/images/la cite a explorer/l'esplandade des cérémonies .jpeg",
  },
  {
    id: "zawiya",
    name: "Zawiya de Tivaouane",
    coordinates: { latitude: 14.9542, longitude: -16.8291 },
    category: "religieux",
    description:
      "Résidence et lieu de recueillement du khalife général des Tidianes. Lieu de pèlerinage majeur pendant la Ziyara.",
    image: "/images/la cite a explorer/le mauselee.jpeg",
  },
  {
    id: "mausolees",
    name: "Mausolées des khalifes",
    coordinates: { latitude: 14.9538, longitude: -16.8285 },
    category: "religieux",
    description:
      "Nécropole des successeurs d'El Hadji Malick Sy. Lieu de méditation et de visite pour les disciples.",
    image: "/images/la cite a explorer/le mauselee.jpeg",
  },
  {
    id: "marche-central",
    name: "Marché central de Tivaouane",
    coordinates: { latitude: 14.9572, longitude: -16.8245 },
    category: "marches",
    description:
      "Cœur commercial de la ville. Artisanat local, tissus, épices et produits du terroir. Animation quotidienne.",
    image: "/images/la cite a explorer/le marche central.jpeg",
  },
  {
    id: "ateliers-artisanaux",
    name: "Ateliers artisanaux",
    coordinates: { latitude: 14.9585, longitude: -16.8238 },
    category: "marches",
    description:
      "Quartier des artisans : tisserands, forgerons, potiers, teinturiers. Savoir-faire transmis de génération en génération.",
    image: "/images/lieux/ateliers-artisanaux.jpg",
  },
  {
    id: "place-publique",
    name: "Place publique de la gare",
    coordinates: { latitude: 14.9601, longitude: -16.8221 },
    category: "espaces",
    description:
      "Point de convergence des transports, lieu de rencontre et d'échanges informels. Animation matinale et vespérale.",
    image: undefined,
  },
  {
    id: "medersa",
    name: "Médersa El Hadji Malick Sy",
    coordinates: { latitude: 14.9551, longitude: -16.8269 },
    category: "religieux",
    description:
      "École coranique fondée par le maître tidiane. Enseignement religieux et sciences islamiques. Patrimoine éducatif vivant.",
    image: undefined,
  },
  {
    id: "bibliothèque",
    name: "Bibliothèque municipale",
    coordinates: { latitude: 14.9564, longitude: -16.8257 },
    category: "espaces",
    description:
      "Fonds sur l'histoire locale, la culture tidiane et la littérature sénégalaise. Salle de lecture et expositions temporaires.",
    image: undefined,
  },
];

/** Catégories disponibles pour le filtrage (ordre d'affichage). */
export const MAP_CATEGORIES: readonly { id: PlaceCategoryId; label: string; color: string }[] = [
  { id: "religieux", label: "Lieux religieux", color: "#0B5A3A" },
  { id: "marches", label: "Marchés & artisanat", color: "#C79A3B" },
  { id: "restauration", label: "Restauration", color: "#B95430" },
  { id: "hebergement", label: "Hébergement", color: "#6E4F22" },
  { id: "espaces", label: "Espaces & places", color: "#5C431F" },
] as const;

/** Obtient la couleur associée à une catégorie. */
export function getCategoryColor(category: PlaceCategoryId): string {
  return MAP_CATEGORIES.find((c) => c.id === category)?.color ?? "#0B5A3A";
}

/** Obtient le libellé d'une catégorie. */
export function getCategoryLabel(category: PlaceCategoryId): string {
  return MAP_CATEGORIES.find((c) => c.id === category)?.label ?? category;
}

/** Recherche textuelle simple sur les lieux (nom + description + catégorie). */
export function searchLocations(
  locations: MapLocation[],
  query: string,
  category: PlaceCategoryId | "all" = "all",
): MapLocation[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (normalizedQuery === "" && category === "all") return locations;

  return locations.filter((loc) => {
    const matchesCategory = category === "all" || loc.category === category;
    if (!matchesCategory) return false;
    if (normalizedQuery === "") return true;

    const haystack = `${loc.name} ${loc.description ?? ""} ${getCategoryLabel(loc.category)}`.toLowerCase();
    return haystack.includes(normalizedQuery);
  });
}