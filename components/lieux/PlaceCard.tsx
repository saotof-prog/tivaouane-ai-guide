import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPinIcon } from "@/components/home/icons";
import { getPlaceCategoryLabel } from "@/lib/mock/places";
import type { Place } from "@/types";

export interface PlaceCardProps {
  place: Place;
}

export function PlaceCard({ place }: PlaceCardProps) {
  return (
    <Card className="flex h-full flex-col animate-fade-in">
      <CardHeader className="flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{getPlaceCategoryLabel(place.category)}</Badge>
          <Badge variant="outline">Fiche d’exemple</Badge>
        </div>
        <CardTitle className="mt-2">{place.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed text-muted-foreground">{place.description}</p>
      </CardContent>
      <CardFooter>
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPinIcon className="size-3.5" />
          Tivaouane, Sénégal
        </span>
      </CardFooter>
    </Card>
  );
}