import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Container } from "@/components/ui/container";

import { BookIcon, MapPinIcon, SparkleIcon } from "./icons";
import { SectionHeading } from "./section-heading";

const FEATURES = [
  {
    icon: SparkleIcon,
    title: "Un guide intelligent",
    description:
      "Posez vos questions sur la cité et recevez des réponses claires, en français, adaptées aux visiteurs comme aux curieux.",
  },
  {
    icon: MapPinIcon,
    title: "Des lieux emblématiques",
    description:
      "La Grande Mosquée, les places et les sites spirituels de Tivaouane, bientôt détaillés lieu par lieu.",
  },
  {
    icon: BookIcon,
    title: "Un patrimoine vivant",
    description:
      "La Tijaniyya, le Magal et l'histoire de la cité religieuse, racontés avec soin et rigueur.",
  },
] as const;

export function ValuePropsSection() {
  return (
    <section
      id="valeur"
      aria-labelledby="valeur-heading"
      className="border-y border-border/60 bg-muted/30 py-16 sm:py-24"
    >
      <Container className="flex flex-col items-center gap-12">
        <SectionHeading
          id="valeur-heading"
          eyebrow="Pourquoi Tivaouane‑AI"
          title="Tout Tivaouane, en un seul guide"
          description="Une porte d'entrée unique pour comprendre, visiter et raconter la cité religieuse du Sénégal."
        />
        <div className="grid w-full gap-5 md:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <Card key={title} surface="soft" className="group">
              <CardHeader>
                <span className="mb-2 grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-105">
                  <Icon className="size-5" />
                </span>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}