import { SparkleIcon } from "@/components/home/icons";

export function TypingIndicator() {
  return (
    <div className="flex w-full items-start gap-3">
      <span
        aria-hidden="true"
        className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground"
      >
        <SparkleIcon className="size-4.5" />
      </span>
      <div
        role="status"
        aria-label="L’assistant est en train d’écrire"
        className="rounded-2xl rounded-tl-sm border border-border bg-card px-4 py-3"
      >
        <span className="flex items-center gap-1.5 py-1">
          <span className="size-1.5 animate-bounce rounded-full bg-foreground/40" />
          <span
            className="size-1.5 animate-bounce rounded-full bg-foreground/40"
            style={{ animationDelay: "120ms" }}
          />
          <span
            className="size-1.5 animate-bounce rounded-full bg-foreground/40"
            style={{ animationDelay: "240ms" }}
          />
        </span>
      </div>
    </div>
  );
}