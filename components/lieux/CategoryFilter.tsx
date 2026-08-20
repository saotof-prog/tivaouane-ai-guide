"use client";

import {
  CategoryFilter as UiCategoryFilter,
  type CategoryFilterProps,
} from "@/components/ui/category-filter";
import { placeCategories } from "@/lib/mock/places";
import type { PlaceCategoryId } from "@/types";

export interface PlaceCategoryFilterProps
  extends Omit<CategoryFilterProps, "value" | "onChange" | "options"> {
  value: PlaceCategoryId | "all";
  onChange: (value: PlaceCategoryId | "all") => void;
}

export function CategoryFilter({ value, onChange, ...props }: PlaceCategoryFilterProps) {
  const options: { id: string; label: string }[] = [
    { id: "all", label: "Toutes" },
    ...placeCategories.map((category) => ({ id: category.id, label: category.label })),
  ];

  return (
    <UiCategoryFilter
      value={value}
      onChange={(next) => onChange(next as PlaceCategoryId | "all")}
      options={options}
      label="Filtrer les lieux par catégorie"
      {...props}
    />
  );
}