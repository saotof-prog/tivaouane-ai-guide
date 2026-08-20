import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

import { ArrowRightIcon, MoonIcon } from "./icons";

export function CtaSection() {
  return (
    <section id="cta" aria-labelledby="cta-heading" className="pb-16 sm:pb-24">
      <Container>
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 px-6 py-14 text-center text-emerald-50 shadow-card sm:px-12 sm:py-20">
          <MoonIcon className="pointer-events-none absolute -right-8 -top-10 size-48 rotate-12 text-gold-300/15" />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-20 -left-16 size-56 rounded-full bg-accent/10 blur-3xl"
          />
          <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-6">
            <Badge variant="accent">Tivaouane vous attend</Badge>
            <h2
              id="cta-heading"
              className="text-3xl font-semibold tracking-tight sm:text-4xl"
            >
              Prêt à explorer Tivaouane&nbsp;?
            </h2>
            <p className="max-w-xl text-base leading-7 text-emerald-100/80 sm:text-lg">
              Commencez par une question à l&apos;assistant ou flânez librement
              parmi les lieux et les récits de la cité.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button href="/assistant" variant="accent" size="lg">
                Commencer avec l&apos;assistant
                <ArrowRightIcon className="size-4" />
              </Button>
              <Button href="/lieux" variant="secondary" size="lg">
                Explorer les lieux
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}