export type ClassValue = string | number | false | null | undefined;

/** Joins class names, filtering falsy values. */
export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}