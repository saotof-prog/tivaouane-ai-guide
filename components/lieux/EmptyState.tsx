import { Button } from "@/components/ui/button";
import { InboxIcon } from "@/components/home/icons";

export interface EmptyStateProps {
  onReset: () => void;
}

export function EmptyState({ onReset }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-card/50 px-6 py-16 text-center animate-fade-in">
      <span className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <InboxIcon className="size-7" />
      </span>
      <div className="space-y-1">
        <h2 className="font-display text-xl font-semibold">Aucun lieu trouvé</h2>
        <p className="text-sm text-muted-foreground">
          Essayez un autre mot-clé ou une autre catégorie pour élargir la recherche.
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={onReset}>
        Réinitialiser les filtres
      </Button>
    </div>
  );
}