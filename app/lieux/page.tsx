import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Container } from "@/components/ui/container";

export default function LieuxPage() {
  return (
    <Container size="narrow" className="flex flex-1 items-center justify-center py-20">
      <Card className="w-full animate-fade-in text-center">
        <CardHeader className="items-center text-center">
          <Badge variant="secondary">Bientôt disponible</Badge>
          <CardTitle className="text-3xl">Lieux</CardTitle>
          <CardDescription>
            Découvrez les lieux emblématiques de Tivaouane : Grande Mosquée,
            mausolées, places historiques et sites spirituels.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <p className="text-sm leading-6 text-muted-foreground">
            Le catalogue des lieux arrive dans une prochaine étape.
          </p>
          <Button href="/" variant="outline">
            Retour à l&apos;accueil
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
}