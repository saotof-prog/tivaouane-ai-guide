import { normalizeText } from "@/lib/utils";
import type { HeritageCategoryId, HeritageItem } from "@/types";

/** Libellés de catégories du patrimoine (pour l’affichage des filtres). */
export const heritageCategories = [
  { id: "religieux", label: "Patrimoine religieux" },
  { id: "historique", label: "Histoire & traditions" },
  { id: "artisanat", label: "Artisanat & savoir-faire" },
  { id: "gastronomie", label: "Gastronomie" },
] as const satisfies readonly { id: HeritageCategoryId; label: string }[];

export function getHeritageCategoryLabel(categoryId: HeritageCategoryId): string {
  return (
    heritageCategories.find((category) => category.id === categoryId)?.label ?? categoryId
  );
}

const demoBody = (): string =>
  "Fiche d’exemple de démonstration — ce contenu illustre la structure éditoriale prévue. " +
  "Aucune information historique, géographique ou factuelle n’y est présentée comme vérifiée. " +
  "Le contenu complet sera rédigé à partir de la base de connaissances dans une prochaine étape.";

export const mockHeritageArticles: HeritageItem[] = [
  {
    id: "grande-mosquee",
    title: "La Grande Mosquée",
    category: "religieux",
    excerpt:
      "Fiche d’exemple de démonstration — aperçu du lieu de prière central de la ville, à compléter avec la base de connaissances.",
    sections: [
      {
        heading: "Présentation",
        body: demoBody(),
      },
      {
        heading: "Rôle dans la vie de la cité",
        body:
          "Fiche d’exemple de démonstration — ce chapitre décrira le rôle du lieu dans la vie quotidienne et les grands rassemblements, à partir de sources vérifiées.",
      },
    ],
    markers: ["Culte", "Rassemblements"],
    image: "/images/la cite a explorer/l'esplandade des cérémonies .jpeg",
  },
  {
    id: "mausolees",
    title: "Les mausolées",
    category: "religieux",
    excerpt:
      "Fiche d’exemple de démonstration — aperçu des mausolées et des pratiques de visite, à compléter avec la base de connaissances.",
    sections: [
      {
        heading: "Présentation",
        body: demoBody(),
      },
      {
        heading: "Pratiques de visite",
        body:
          "Fiche d’exemple de démonstration — ce chapitre décrira les usages et coutumes de visite, à partir de sources vérifiées.",
      },
    ],
    markers: ["Visites", "Coutumes"],
    image: "/images/la cite a explorer/le mauselee.jpeg",
  },
  {
    id: "magal",
    title: "Les grands rassemblements spirituels",
    category: "religieux",
    excerpt:
      "Fiche d’exemple de démonstration — aperçu des grands rendez-vous spirituels de la ville, à compléter avec la base de connaissances.",
    sections: [
      {
        heading: "Présentation",
        body: demoBody(),
      },
      {
        heading: "Organisation",
        body:
          "Fiche d’exemple de démonstration — ce chapitre décrira l’organisation des rassemblements, à partir de sources vérifiées.",
      },
    ],
    markers: ["Rassemblements", "Pèlerinage"],
    image: "/images/la cite a explorer/grand gamou de tivaouane.jpeg",
  },
  {
    id: "histoire-de-la-cite",
    title: "Histoire de la cité",
    category: "historique",
    excerpt:
      "Fiche d’exemple de démonstration — aperçu de l’histoire de la ville, à compléter avec la base de connaissances.",
    sections: [
      {
        heading: "Présentation",
        body: demoBody(),
      },
      {
        heading: "Grandes étapes",
        body:
          "Fiche d’exemple de démonstration — ce chapitre retracera les grandes étapes de l’histoire de la cité, à partir de sources vérifiées.",
      },
    ],
    markers: ["Ville", "Tradition"],
  },
  {
    id: "routes-des-traditions",
    title: "Routes des traditions",
    category: "historique",
    excerpt:
      "Fiche d’exemple de démonstration — aperçu des traditions et coutumes locales, à compléter avec la base de connaissances.",
    sections: [
      {
        heading: "Présentation",
        body: demoBody(),
      },
      {
        heading: "Coutumes locales",
        body:
          "Fiche d’exemple de démonstration — ce chapitre décrira les coutumes et traditions locales, à partir de sources vérifiées.",
      },
    ],
    markers: ["Traditions", "Coutumes"],
  },
  {
    id: "savoir-faire-artisanaux",
    title: "Savoir-faire artisanaux",
    category: "artisanat",
    excerpt:
      "Fiche d’exemple de démonstration — aperçu des métiers et savoir-faire locaux, à compléter avec la base de connaissances.",
    sections: [
      {
        heading: "Présentation",
        body: demoBody(),
      },
      {
        heading: "Métiers et pratiques",
        body:
          "Fiche d’exemple de démonstration — ce chapitre décrira les métiers et pratiques artisanales, à partir de sources vérifiées.",
      },
    ],
    markers: ["Métiers", "Savoir-faire"],
  },
  {
    id: "cuisine-locale",
    title: "Cuisine et spécialités locales",
    category: "gastronomie",
    excerpt:
      "Fiche d’exemple de démonstration — aperçu de la cuisine locale et des spécialités, à compléter avec la base de connaissances.",
    sections: [
      {
        heading: "Présentation",
        body: demoBody(),
      },
      {
        heading: "Spécialités",
        body:
          "Fiche d’exemple de démonstration — ce chapitre présentera les spécialités culinaires locales, à partir de sources vérifiées.",
      },
    ],
    markers: ["Plats", "Produits locaux"],
  },
  {
    id: "art-de-la-table",
    title: "Art de recevoir et de la table",
    category: "gastronomie",
    excerpt:
      "Fiche d’exemple de démonstration — aperçu de l’art de recevoir et de la table, à compléter avec la base de connaissances.",
    sections: [
      {
        heading: "Présentation",
        body: demoBody(),
      },
      {
        heading: "Usages",
        body:
          "Fiche d’exemple de démonstration — ce chapitre décrira les usages de table et de réception, à partir de sources vérifiées.",
      },
    ],
    markers: ["Convivialité", "Usages"],
  },
];

export type HeritageFilters = {
  query: string;
  category: HeritageCategoryId | "all";
};

export function filterHeritageArticles(
  articles: HeritageItem[],
  filters: HeritageFilters,
): HeritageItem[] {
  const query = normalizeText(filters.query.trim());

  return articles.filter((article) => {
    if (filters.category !== "all" && article.category !== filters.category) {
      return false;
    }
    if (query.length === 0) return true;

    const haystack = normalizeText(
      `${article.title} ${getHeritageCategoryLabel(article.category)} ${article.excerpt}`,
    );
    return haystack.includes(query);
  });
}