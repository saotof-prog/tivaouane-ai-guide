import Link from "next/link";

import { cn } from "@/lib/utils";

export interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn("inline-flex items-center gap-2.5", className)}
    >
      <span
        aria-hidden="true"
        className="grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-emerald-700 via-primary to-emerald-950 text-gold-300 shadow-card ring-1 ring-black/10"
      >
        <svg viewBox="0 0 24 24" className="size-5" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M12 2a10 10 0 1 0 0 20a10 10 0 1 0 0-20M15 3.5a8.5 8.5 0 1 0 0 17a8.5 8.5 0 1 0 0-17z"
            clipRule="evenodd"
          />
          <path d="M16.5 4.5l.8 2.7 2.7.8-2.7.8-.8 2.7-.8-2.7-2.7-.8 2.7-.8.8-2.7z" />
        </svg>
      </span>
      <span className="font-display text-lg font-semibold tracking-tight text-foreground">
        Tivaouane<span className="text-accent">-AI</span>
      </span>
    </Link>
  );
}