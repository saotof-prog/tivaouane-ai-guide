"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { filterPlaces, mockPlaces, type PlaceCategoryId } from "@/lib/mock/places";
import { PlaceCard } from "./PlaceCard";
import { PlaceSearch } from "./PlaceSearch";
import { CategoryFilter } from "./CategoryFilter";
import { EmptyState } from "./EmptyState";
import { PlacesGridSkeleton } from "./PlacesGridSkeleton";

const LOADING_DELAY_MS = 700;

export function LieuxExplorer() {
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<PlaceCategoryId | "all">("all");

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), LOADING_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const places = useMemo(
    () => filterPlaces(mockPlaces, { query, category }),
    [query, category],
  );

  const handleReset = useCallback(() => {
    setQuery("");
    setCategory("all");
  }, []);

  if (isLoading) {
    return <PlacesGridSkeleton count={6} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <PlaceSearch value={query} onChange={setQuery} />
        <CategoryFilter value={category} onChange={setCategory} />
      </div>

      <p className="text-sm text-muted-foreground" aria-live="polite">
        {places.length > 0
          ? `${places.length} lieu${places.length > 1 ? "x" : ""} affiché${places.length > 1 ? "s" : ""}`
          : "Aucun lieu ne correspond aux filtres"}
      </p>

      {places.length === 0 ? (
        <EmptyState onReset={handleReset} />
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {places.map((place) => (
            <li key={place.id} className="flex">
              <PlaceCard place={place} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}