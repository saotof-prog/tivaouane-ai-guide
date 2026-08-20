"use client";

import { SearchInput } from "@/components/ui/search-input";

export interface HeritageSearchProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function HeritageSearch({ value, onChange, disabled = false }: HeritageSearchProps) {
  return (
    <SearchInput
      value={value}
      onChange={onChange}
      disabled={disabled}
      placeholder="Rechercher un article…"
      label="Rechercher dans le patrimoine"
    />
  );
}