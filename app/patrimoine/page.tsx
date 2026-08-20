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

export default function PatrimoinePage() {
  return (
    <Container size="narrow" className="flex flex-1 items-center justify-center py-20">
      <Card className="w-full animate-fade-in text-center">
        <CardHeader className="items-center text-center">
          <Badge variant="secondary">Bientôt disponible</Badge>
          <CardTitle className="text-3xl">Patrimoine</CardTitle>
          <CardDescription>
            Plongez dans l&apos;histoire de la cité : la Révolution de 1962, la
            Tijaniyya, le Magal et les traditions tivaouanaises.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <p className="text-sm leading-6 text-muted-foreground">
            Les contenus patrimoniaux arrivent dans une prochaine étape.
          </p>
          <Button href="/" variant="outline">
            Retour à l&apos;accueil
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
}