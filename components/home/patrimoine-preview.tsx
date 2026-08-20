import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import type { ReactElement } from "react";

import { ArrowRightIcon, BookIcon, MoonIcon, SparkleIcon, type IconProps } from "./icons";
import { SectionHeading } from "./section-heading";

interface PatrimoineTheme {
  icon: (props: IconProps) => ReactElement;
  title: string;
  description: string;
  badge?: string;
}

const PATRIMOINE_THEMES: PatrimoineTheme[] = [
  {
    icon: BookIcon,
    title: "La Tijaniyya",
    description:
      "Tivaouane est l'un des principaux centres de la confrérie tidjane au Sénégal, héritage spirituel de la cité.",
  },
  {
    icon: SparkleIcon,
    title: "Le Magal",
    description:
      "Événement annuel majeur célébré par la communauté tivaouanaise, temps fort de l'année spirituelle.",
  },
  {
    icon: MoonIcon,
    title: "La Révolution de 1962",
    description:
      "[Récit historique à venir — chapitre en cours d'élaboration.]",
    badge: "À venir",
  },
] as const;

export function PatrimoinePreviewSection() {
  return (
    <section
      id="patrimoine"
      aria-labelledby="patrimoine-heading"
      className="py-16 sm:py-24"
    >
      <Container className="flex flex-col items-center gap-12">
        <SectionHeading
          id="patrimoine-heading"
          eyebrow="Patrimoine & histoire"
          title="Les grands récits de la cité"
          description="Les axes historiques et spirituels qui font l'identité de Tivaouane."
        />
        <div className="grid w-full gap-5 md:grid-cols-3">
          {PATRIMOINE_THEMES.map(({ icon: Icon, title, description, badge }) => (
            <Card key={title} className="group h-full">
              <CardHeader accent>
                <span className="mb-1 grid size-10 place-items-center rounded-xl bg-accent/10 text-accent transition-transform duration-300 group-hover:scale-105">
                  <Icon className="size-5" />
                </span>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="text-lg sm:text-xl">{title}</CardTitle>
                  {badge ? (
                    <Badge variant="outline">{badge}</Badge>
                  ) : null}
                </div>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
        <Button href="/patrimoine" variant="outline" size="lg">
          Explorer le patrimoine
          <ArrowRightIcon className="size-4" />
        </Button>
      </Container>
    </section>
  );
}