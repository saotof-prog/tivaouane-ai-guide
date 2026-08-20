import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { Chat } from "@/components/assistant";

export default function AssistantPage() {
  return (
    <Container size="narrow" className="flex flex-1 flex-col py-8 sm:py-12">
      <div className="mb-6 flex flex-col items-start gap-3 sm:items-center sm:text-center">
        <Badge variant="accent">Démonstration d’interface</Badge>
        <h1 className="font-display text-3xl sm:text-4xl">Assistant IA</h1>
        <p className="text-sm leading-6 text-muted-foreground">
          Posez vos questions sur Tivaouane : histoire, lieux emblématiques,
          événements et culture.
        </p>
      </div>
      <Chat />
    </Container>
  );
}