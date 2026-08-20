export type ClassValue = string | number | false | null | undefined;

/** Joins class names, filtering falsy values. */
export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}

/** Lowercases a string and strips diacritics for accent-insensitive comparison. */
export function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}