import { Card } from "@/components/ui/card";

export function PlaceCardSkeleton() {
  return (
    <Card aria-hidden="true" className="flex h-full flex-col">
      <div className="animate-pulse p-6 sm:p-8">
        <div className="flex gap-2">
          <div className="h-6 w-24 rounded-full bg-muted" />
          <div className="h-6 w-20 rounded-full bg-muted" />
        </div>
        <div className="mt-4 h-6 w-3/4 rounded-lg bg-muted" />
        <div className="mt-4 space-y-2">
          <div className="h-3 w-full rounded bg-muted" />
          <div className="h-3 w-5/6 rounded bg-muted" />
        </div>
      </div>
      <div className="mt-auto px-6 pb-6 sm:px-8 sm:pb-8">
        <div className="h-4 w-32 rounded bg-muted" />
      </div>
    </Card>
  );
}

export function PlacesGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3"
      role="status"
      aria-label="Chargement des lieux"
    >
      {Array.from({ length: count }, (_, index) => (
        <PlaceCardSkeleton key={index} />
      ))}
      <span className="sr-only">Chargement en cours…</span>
    </div>
  );
}