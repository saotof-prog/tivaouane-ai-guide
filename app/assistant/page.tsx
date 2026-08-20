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

export default function AssistantPage() {
  return (
    <Container size="narrow" className="flex flex-1 items-center justify-center py-20">
      <Card className="w-full animate-fade-in text-center">
        <CardHeader className="items-center text-center">
          <Badge variant="accent">Bientôt disponible</Badge>
          <CardTitle className="text-3xl">Assistant IA</CardTitle>
          <CardDescription>
            Posez vos questions sur Tivaouane : histoire, lieux emblématiques,
            événements et culture.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <p className="text-sm leading-6 text-muted-foreground">
            L&apos;interface de conversation arrive dans une prochaine étape.
          </p>
          <Button href="/" variant="outline">
            Retour à l&apos;accueil
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
}