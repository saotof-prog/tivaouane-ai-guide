"use client";

import { cn } from "@/lib/utils";

export interface CategoryFilterOption {
  id: string;
  label: string;
}

export interface CategoryFilterProps {
  value: string;
  onChange: (value: string) => void;
  options: CategoryFilterOption[];
  label?: string;
  disabled?: boolean;
  className?: string;
}

export function CategoryFilter({
  value,
  onChange,
  options,
  label = "Filtrer par catégorie",
  disabled = false,
  className,
}: CategoryFilterProps) {
  return (
    <div
      className={cn("flex flex-wrap gap-2", className)}
      role="group"
      aria-label={label}
    >
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