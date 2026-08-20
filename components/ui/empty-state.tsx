import { cn } from "@/lib/utils";
import { InboxIcon } from "@/components/home/icons";
import { Button } from "@/components/ui/button";

export interface EmptyStateProps {
  title: string;
  description?: string;
  onReset?: () => void;
  resetLabel?: string;
  className?: string;
}

export function EmptyState({
  title,
  description,
  onReset,
  resetLabel = "Réinitialiser les filtres",
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-card/50 px-6 py-16 text-center animate-fade-in",
        className,
      )}
    >
      <span className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <InboxIcon className="size-7" />
      </span>
      <div className="space-y-1">
        <h2 className="font-display text-xl font-semibold">{title}</h2>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {onReset ? (
        <Button variant="outline" size="sm" onClick={onReset}>
          {resetLabel}
        </Button>
      ) : null}
    </div>
  );
}