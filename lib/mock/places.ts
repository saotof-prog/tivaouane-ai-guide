export const placeCategories = [
  { id: "religieux", label: "Lieux religieux" },
  { id: "marches", label: "Marchés & artisanat" },
  { id: "restauration", label: "Restauration" },
  { id: "hebergement", label: "Hébergement" },
  { id: "espaces", label: "Espaces & places" },
] as const;

export type PlaceCategoryId = (typeof placeCategories)[number]["id"];

export function getPlaceCategoryLabel(categoryId: PlaceCategoryId): string {
  return placeCategories.find((category) => category.id === categoryId)?.label ?? categoryId;
}

export type Place = {
  id: string;
  name: string;
  category: PlaceCategoryId;
  /** Description d’exemple — aucune donnée vérifiée, à remplacer par la base de connaissances. */
  description: string;
};

export const mockPlaces: Place[] = [
  {
    id: "grande-mosquee",
    name: "Grande Mosquée de Tivaouane",
    category: "religieux",
    description:
      "Fiche d’exemple de démonstration — description et informations pratiques à venir avec la base de connaissances.",
  },
  {
    id: "zawiya",
    name: "Zawiya de Tivaouane",
    category: "religieux",
    description:
      "Fiche d’exemple de démonstration — description et informations pratiques à venir avec la base de connaissances.",
  },
  {
    id: "marche-central",
    name: "Marché central de Tivaouane",
    category: "marches",
    description:
      "Fiche d’exemple de démonstration — description et informations pratiques à venir avec la base de connaissances.",
  },
  {
    id: "ateliers-artisanaux",
    name: "Ateliers artisanaux de la ville",
    category: "marches",
    description:
      "Fiche d’exemple de démonstration — description et informations pratiques à venir avec la base de connaissances.",
  },
  {
    id: "restaurant-du-centre",
    name: "Restaurant du centre-ville",
    category: "restauration",
    description:
      "Fiche d’exemple de démonstration — description et informations pratiques à venir avec la base de connaissances.",
  },
  {
    id: "marchand-de-bissap",
    name: "Marchand de bissap et jus locaux",
    category: "restauration",
    description:
      "Fiche d’exemple de démonstration — description et informations pratiques à venir avec la base de connaissances.",
  },
  {
    id: "hotel-de-la-gare",
    name: "Hôtel de la gare",
    category: "hebergement",
    description:
      "Fiche d’exemple de démonstration — description et informations pratiques à venir avec la base de connaissances.",
  },
  {
    id: "place-publique",
    name: "Place publique de la gare",
    category: "espaces",
    description:
      "Fiche d’exemple de démonstration — description et informations pratiques à venir avec la base de connaissances.",
  },
];

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export type PlaceFilters = {
  query: string;
  category: PlaceCategoryId | "all";
};

export function filterPlaces(places: Place[], filters: PlaceFilters): Place[] {
  const query = normalize(filters.query.trim());

  return places.filter((place) => {
    if (filters.category !== "all" && place.category !== filters.category) {
      return false;
    }
    if (query.length === 0) return true;

    const haystack = normalize(`${place.name} ${getPlaceCategoryLabel(place.category)}`);
    return haystack.includes(query);
  });
}