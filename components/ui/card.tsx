import * as React from "react";

import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** "default" for solid surfaces, "soft" for tinted, "outline" for bordered transparent. */
  surface?: "default" | "soft" | "outline";
}

const surfaces = {
  default:
    "border border-border bg-card text-card-foreground shadow-card",
  soft: "border border-transparent bg-muted text-foreground",
  outline:
    "border border-border bg-transparent text-foreground shadow-none",
} as const;

export function Card({
  className,
  surface = "default",
  ...props
}: CardProps) {
  return (
    <div
      data-slot="card"
      className={cn(
        "rounded-2xl transition-shadow duration-300 hover:shadow-card-hover",
        surfaces[surface],
        className,
      )}
      {...props}
    />
  );
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Enables the decorative gold accent line above the title. */
  accent?: boolean;
}

export function CardHeader({
  className,
  accent = false,
  ...props
}: CardHeaderProps) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "relative flex flex-col gap-1.5 p-6 sm:p-8",
        accent &&
          "before:mb-1 before:block before:h-px before:w-10 before:bg-gradient-to-r before:from-accent before:to-transparent",
        className,
      )}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      data-slot="card-title"
      className={cn(
        "font-display text-xl font-semibold tracking-tight sm:text-2xl",
        className,
      )}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-sm leading-relaxed text-muted-foreground", className)}
      {...props}
    />
  );
}

export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="card-content"
      className={cn("p-6 pt-0 sm:p-8 sm:pt-0", className)}
      {...props}
    />
  );
}

export function CardFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex flex-wrap items-center gap-3 p-6 pt-0 sm:p-8 sm:pt-0",
        className,
      )}
      {...props}
    />
  );
}