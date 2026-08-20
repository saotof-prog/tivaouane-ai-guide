"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  filterHeritageArticles,
  mockHeritageArticles,
} from "@/lib/mock/patrimoine";
import type { HeritageCategoryId, HeritageItem } from "@/types";
import { EmptyState } from "@/components/ui/empty-state";
import { HeritageCard } from "./HeritageCard";
import { HeritageDetail } from "./HeritageDetail";
import { HeritageSearch } from "./HeritageSearch";
import { HeritageCategoryFilter } from "./HeritageCategoryFilter";
import { HeritageGridSkeleton } from "./HeritageGridSkeleton";

const LOADING_DELAY_MS = 700;

export function HeritageExplorer() {
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<HeritageCategoryId | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), LOADING_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const articles = useMemo(
    () => filterHeritageArticles(mockHeritageArticles, { query, category }),
    [query, category],
  );

  const selectedArticle = useMemo(
    () =>
      selectedId ? mockHeritageArticles.find((article) => article.id === selectedId) ?? null : null,
    [selectedId],
  );

  const suggestions = useMemo(() => {
    if (!selectedArticle) return [];
    return articles.filter(
      (article) => article.id !== selectedArticle.id && article.category === selectedArticle.category,
    );
  }, [articles, selectedArticle]);

  const handleReset = useCallback(() => {
    setQuery("");
    setCategory("all");
    setSelectedId(null);
  }, []);

  const handleSelect = useCallback((article: HeritageItem) => {
    setSelectedId(article.id);
  }, []);

  const handleClose = useCallback(() => {
    setSelectedId(null);
  }, []);

  if (isLoading) {
    return <HeritageGridSkeleton count={6} />;
  }

  if (selectedArticle) {
    return (
      <div className="space-y-6">
        <HeritageDetail
          article={selectedArticle}
          suggestions={suggestions}
          onClose={handleClose}
          onSelect={handleSelect}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <HeritageSearch value={query} onChange={setQuery} />
        <HeritageCategoryFilter value={category} onChange={setCategory} />
      </div>

      <p className="text-sm text-muted-foreground" aria-live="polite">
        {articles.length > 0
          ? `${articles.length} fiche${articles.length > 1 ? "s" : ""} affichée${articles.length > 1 ? "s" : ""}`
          : "Aucune fiche ne correspond aux filtres"}
      </p>

      {articles.length === 0 ? (
        <EmptyState
          title="Aucun article trouvé"
          description="Essayez un autre mot-clé ou une autre catégorie pour élargir la recherche."
          onReset={handleReset}
        />
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {articles.map((article) => (
            <li key={article.id} className="flex">
              <HeritageCard article={article} onSelect={handleSelect} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}