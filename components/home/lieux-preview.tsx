import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import { Container } from "@/components/ui/container";

import { ArrowRightIcon, BookIcon, LandmarkIcon, MapPinIcon, SparkleIcon } from "./icons";
import { SectionHeading } from "./section-heading";

/**
 * Données de démonstration — fiches lieux à remplacer par le contenu réel.
 * Chaque carte est explicitement signalée « À venir ».
 */
const DEMO_LIEUX = [
  { icon: LandmarkIcon, title: "La Grande Mosquée" },
  { icon: MapPinIcon, title: "L'esplanade des cérémonies" },
  { icon: MapPinIcon, title: "Le mausolée" },
  { icon: BookIcon, title: "Les daaras" },
  { icon: MapPinIcon, title: "Le marché central" },
  { icon: SparkleIcon, title: "Le Magal de Tivaouane" },
] as const;

const PLACEHOLDER_DESCRIPTION =
  "Fiche de démonstration — les informations détaillées arrivent bientôt.";

export function LieuxPreviewSection() {
  return (
    <section
      id="lieux"
      aria-labelledby="lieux-heading"
      className="border-y border-border/60 bg-muted/30 py-16 sm:py-24"
    >
      <Container className="flex flex-col items-center gap-12">
        <SectionHeading
          id="lieux-heading"
          eyebrow="Découverte des lieux"
          title="La cité à explorer"
          description="Le cœur spirituel et les lieux de vie de Tivaouane, illustrés et décrits un par un."
        />
        <ul className="grid w-full gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {DEMO_LIEUX.map(({ icon: Icon, title }) => (
            <li key={title} className="h-full">
              <Card className="group h-full overflow-hidden">
                <div className="relative grid aspect-[16/9] place-items-center bg-gradient-to-br from-primary/15 via-accent/10 to-transparent text-primary/30">
                  <Icon className="size-12 transition-transform duration-300 group-hover:scale-110" />
                  <Badge
                    variant="outline"
                    className="absolute right-3 top-3 bg-background/70 text-foreground backdrop-blur-sm"
                  >
                    À venir
                  </Badge>
                </div>
                <CardContent className="flex flex-col gap-2">
                  <CardTitle className="mt-4 text-lg sm:text-xl">
                    {title}
                  </CardTitle>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {PLACEHOLDER_DESCRIPTION}
                  </p>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
        <Button href="/lieux" variant="outline" size="lg">
          Découvrir tous les lieux
          <ArrowRightIcon className="size-4" />
        </Button>
      </Container>
    </section>
  );
}