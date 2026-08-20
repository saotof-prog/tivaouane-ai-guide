"use client";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { SearchIcon, XIcon } from "@/components/home/icons";

export interface PlaceSearchProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function PlaceSearch({ value, onChange, disabled = false }: PlaceSearchProps) {
  return (
    <div className="relative w-full">
      <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 size-4.5 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        aria-label="Rechercher un lieu"
        placeholder="Rechercher un lieu…"
        className="pl-10 pr-10"
      />
      {value.length > 0 && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Effacer la recherche"
          className={cn(
            "absolute right-2.5 top-1/2 flex size-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full",
            "text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
            "disabled:pointer-events-none disabled:opacity-50",
          )}
          disabled={disabled}
        >
          <XIcon className="size-4" />
        </button>
      )}
    </div>
  );
}