import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";

import { ArrowRightIcon, ChatIcon, CheckIcon } from "./icons";
import { SectionHeading } from "./section-heading";

const EXAMPLES = [
  "Réponses en français, adaptées aux visiteurs",
  "Axé sur les lieux, le patrimoine et l'histoire",
  "Navigation simple vers chaque fiche",
];

export function AssistantPreviewSection() {
  return (
    <section
      id="assistant"
      aria-labelledby="assistant-heading"
      className="py-16 sm:py-24"
    >
      <Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col gap-5">
          <SectionHeading
            id="assistant-heading"
            align="left"
            badgeVariant="secondary"
            eyebrow="Assistant IA"
            title="Dialoguez avec la cité"
          />
          <p className="text-base leading-7 text-muted-foreground sm:text-lg">
            Un assistant pensé pour Tivaouane&nbsp;: posez une question sur un
            lieu, un événement ou un aspect de l&apos;histoire de la ville, et
            laissez le guide s&apos;occuper du reste.
          </p>
          <ul className="flex flex-col gap-3">
            {EXAMPLES.map((item) => (
              <li
                key={item}
                className="flex items-center gap-3 text-sm sm:text-base"
              >
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-success/10 text-success">
                  <CheckIcon className="size-3.5" />
                </span>
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-2">
            <Button href="/assistant" size="lg">
              Rencontrer l&apos;assistant
              <ArrowRightIcon className="size-4" />
            </Button>
          </div>
        </div>

        <div className="relative">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-accent/15 to-primary/10 blur-2xl"
          />
          <Card className="relative p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-4">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-emerald-700 to-emerald-950 text-gold-300">
                  <ChatIcon className="size-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold">Assistant Tivaouane</p>
                  <p className="text-xs text-muted-foreground">
                    Maquette d&apos;échange
                  </p>
                </div>
              </div>
              <Badge variant="outline">Bientôt disponible</Badge>
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <div className="flex items-end gap-2">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-emerald-700 to-emerald-950 text-gold-300">
                  <ChatIcon className="size-3.5" />
                </span>
                <div className="max-w-[85%] rounded-3xl rounded-bl-sm bg-muted px-4 py-2.5 text-sm leading-relaxed text-foreground">
                  Bonjour&nbsp;! Je suis l&apos;assistant Tivaouane. Comment
                  puis-je vous aider&nbsp;?
                </div>
              </div>
              <div className="ml-auto max-w-[85%] rounded-3xl rounded-br-sm bg-primary px-4 py-2.5 text-sm leading-relaxed text-primary-foreground">
                Que visiter à Tivaouane&nbsp;?
              </div>
              <div className="flex items-end gap-2">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-emerald-700 to-emerald-950 text-gold-300">
                  <ChatIcon className="size-3.5" />
                </span>
                <div className="max-w-[85%] rounded-3xl rounded-bl-sm bg-muted px-4 py-2.5 text-sm italic leading-relaxed text-muted-foreground">
                  [Maquette&nbsp;— la réponse de l&apos;assistant apparaîtra
                  ici.]
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 text-sm text-muted-foreground">
              Posez votre question…
              <span className="ml-auto grid size-7 place-items-center rounded-full bg-primary/10 text-primary">
                <ArrowRightIcon className="size-3.5" />
              </span>
            </div>
          </Card>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Interface de démonstration — fonctionnalité en cours de
            développement.
          </p>
        </div>
      </Container>
    </section>
  );
}