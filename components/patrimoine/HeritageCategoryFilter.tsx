"use client";

import { CategoryFilter, type CategoryFilterProps } from "@/components/ui/category-filter";
import { heritageCategories } from "@/lib/mock/patrimoine";
import type { HeritageCategoryId } from "@/types";

export interface HeritageCategoryFilterProps {
  value: HeritageCategoryId | "all";
  onChange: (value: HeritageCategoryId | "all") => void;
  disabled?: boolean;
}

export function HeritageCategoryFilter({
  value,
  onChange,
  disabled = false,
}: HeritageCategoryFilterProps) {
  const options: CategoryFilterProps["options"] = [
    { id: "all", label: "Toutes" },
    ...heritageCategories.map((category) => ({ id: category.id, label: category.label })),
  ];

  return (
    <CategoryFilter
      value={value}
      onChange={(next) => onChange(next as HeritageCategoryId | "all")}
      options={options}
      label="Filtrer par catégorie du patrimoine"
      disabled={disabled}
    />
  );
}