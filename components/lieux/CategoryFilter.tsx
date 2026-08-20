"use client";

import { cn } from "@/lib/utils";
import { placeCategories, type PlaceCategoryId } from "@/lib/mock/places";

export interface CategoryFilterProps {
  value: PlaceCategoryId | "all";
  onChange: (value: PlaceCategoryId | "all") => void;
  disabled?: boolean;
}

export function CategoryFilter({ value, onChange, disabled = false }: CategoryFilterProps) {
  const options: { id: PlaceCategoryId | "all"; label: string }[] = [
    { id: "all", label: "Toutes" },
    ...placeCategories.map((category) => ({ id: category.id, label: category.label })),
  ];

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrer par catégorie">
      {options.map((option) => {
        const isActive = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            disabled={disabled}
            aria-pressed={isActive}
            className={cn(
              "cursor-pointer rounded-full border px-4 py-2 text-sm transition-colors",
              "disabled:pointer-events-none disabled:opacity-50",
              isActive
                ? "border-primary bg-primary text-primary-foreground shadow-xs"
                : "border-border bg-card text-foreground hover:border-primary hover:text-primary",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}