"use client";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { SearchIcon, XIcon } from "@/components/home/icons";

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder,
  label = "Rechercher",
  disabled = false,
  className,
}: SearchInputProps) {
  return (
    <div className={cn("relative w-full", className)}>
      <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 size-4.5 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        aria-label={label}
        placeholder={placeholder}
        className="pr-10 pl-10"
      />
      {value.length > 0 && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Effacer la recherche"
          className={cn(
            "absolute top-1/2 right-2.5 flex size-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full",
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