import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { MapView, MapWrapper } from "@/components/map";

export const metadata = {
  title: "Carte interactive",
  description: "Explorez Tivaouane sur une carte interactive : lieux religieux, marchés, patrimoine et espaces publics.",
};

export default function CartePage() {
  return (
    <MapWrapper>
      <div className="flex flex-1 flex-col">
        {/* En-tête */}
        <Container className="py-8 sm:py-12">
          <div className="mb-6 flex flex-col items-start gap-3 sm:items-center sm:text-center">
            <Badge variant="accent">Carte interactive</Badge>
            <h1 className="font-display text-3xl sm:text-4xl">Carte de Tivaouane</h1>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              Explorez les lieux emblématiques de la cité : Grande Mosquée, zawiya, mausolées, marché central,
              ateliers artisanaux et espaces publics. Utilisez la recherche et les filtres pour trouver un lieu.
            </p>
          </div>
        </Container>

        {/* Carte plein écran */}
        <Container className="flex-1 px-3 pb-8 sm:px-6">
          <MapView
            height="h-[calc(100vh-14rem)] min-h-[500px]"
            initialFilters={{ query: "", category: "all" }}
          />
        </Container>
      </div>
    </MapWrapper>
  );
}