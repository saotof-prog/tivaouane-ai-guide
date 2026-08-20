import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-28 right-[-12%] size-[26rem] rounded-full bg-accent/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-1/3 size-80 rounded-full bg-primary/10 blur-3xl"
      />
      <Container className="relative flex flex-col items-center gap-7 py-20 text-center sm:py-28">
        <div className="flex animate-fade-in flex-col items-center gap-7">
          <Badge variant="accent">Guide de Tivaouane · Patrimoine &amp; histoire</Badge>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            Tivaouane‑AI
          </h1>
          <p className="max-w-xl text-lg leading-8 text-muted-foreground sm:text-xl">
            Un assistant intelligent et un guide interactif de la ville de
            Tivaouane&nbsp;: lieux, patrimoine et histoire, nourris par une base
            de connaissances locale.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button href="/assistant" size="lg">
              Demander à l&apos;assistant
            </Button>
            <Button href="/lieux" variant="outline" size="lg">
              Explorer les lieux
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}