import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { LieuxExplorer } from "@/components/lieux";

export default function LieuxPage() {
  return (
    <Container className="flex flex-1 flex-col py-8 sm:py-12">
      <div className="mb-8 flex flex-col items-start gap-3 sm:items-center sm:text-center">
        <Badge variant="secondary">Démonstration d’interface</Badge>
        <h1 className="font-display text-3xl sm:text-4xl">Lieux</h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          Découvrez les lieux emblématiques de Tivaouane : Grande Mosquée,
          mausolées, places historiques et sites spirituels.
        </p>
      </div>
      <LieuxExplorer />
    </Container>
  );
}