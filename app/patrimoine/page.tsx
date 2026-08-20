import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { HeritageExplorer } from "@/components/patrimoine";

export default function PatrimoinePage() {
  return (
    <Container className="flex flex-1 flex-col py-8 sm:py-12">
      <div className="mb-8 flex flex-col items-start gap-3 sm:items-center sm:text-center">
        <Badge variant="secondary">Démonstration d’interface</Badge>
        <h1 className="font-display text-3xl sm:text-4xl">Patrimoine</h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          Une expérience éditoriale pour explorer les axes spirituels, historiques
          et culturels de Tivaouane. Fiches d’exemple de démonstration — contenus
          à venir avec la base de connaissances.
        </p>
      </div>
      <HeritageExplorer />
    </Container>
  );
}