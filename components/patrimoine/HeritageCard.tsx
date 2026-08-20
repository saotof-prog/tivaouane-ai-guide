import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BookIcon, LandmarkIcon, SparkleIcon, XIcon } from "@/components/home/icons";
import { getHeritageCategoryLabel } from "@/lib/mock/patrimoine";
import type { HeritageItem } from "@/types";

const categoryIcons = {
  religieux: LandmarkIcon,
  historique: BookIcon,
  artisanat: SparkleIcon,
  gastronomie: SparkleIcon,
} as const;

export interface HeritageCardProps {
  article: HeritageItem;
  onSelect: (article: HeritageItem) => void;
}

export function HeritageCard({ article, onSelect }: HeritageCardProps) {
  const Icon = categoryIcons[article.category];

  return (
    <Card className="flex h-full flex-col animate-fade-in">
      <CardHeader
        accent
        className="cursor-pointer"
        onClick={() => onSelect(article)}
      >
        <div className="flex items-start justify-between gap-2">
          <span className="mb-1 grid size-10 place-items-center rounded-xl bg-accent/10 text-accent">
            <Icon className="size-5" />
          </span>
          <Badge variant="outline">Fiche d’exemple</Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{getHeritageCategoryLabel(article.category)}</Badge>
        </div>
        <CardTitle className="mt-2">{article.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm leading-relaxed text-muted-foreground">{article.excerpt}</p>
      </CardContent>
      <CardFooter>
        <div className="flex flex-wrap gap-1.5">
          {article.markers?.map((marker) => (
            <span
              key={marker}
              className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
            >
              {marker}
            </span>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
}

export function HeritageCardCloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Fermer la fiche"
      className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      <XIcon className="size-4" />
    </button>
  );
}