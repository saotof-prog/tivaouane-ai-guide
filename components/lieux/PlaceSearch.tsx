"use client";

import { SearchInput, type SearchInputProps } from "@/components/ui/search-input";

export type PlaceSearchProps = SearchInputProps;

export function PlaceSearch(props: PlaceSearchProps) {
  return <SearchInput {...props} placeholder="Rechercher un lieu…" label="Rechercher un lieu" />;
}