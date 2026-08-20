import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getHeritageCategoryLabel } from "@/lib/mock/patrimoine";
import type { HeritageItem } from "@/types";
import { ArrowRightIcon, LandmarkIcon, CheckIcon } from "@/components/home/icons";
import { HeritageCardCloseButton } from "./HeritageCard";

export interface HeritageDetailProps {
  article: HeritageItem;
  suggestions: HeritageItem[];
  onClose: () => void;
  onSelect: (article: HeritageItem) => void;
}

export function HeritageDetail({
  article,
  suggestions,
  onClose,
  onSelect,
}: HeritageDetailProps) {
  return (
    <article className="animate-fade-in overflow-hidden rounded-2xl border border-border bg-card shadow-card">
      <header className="flex items-start justify-between gap-4 border-b border-border px-6 py-5 sm:px-8">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{getHeritageCategoryLabel(article.category)}</Badge>
          <Badge variant="outline">Fiche d’exemple</Badge>
        </div>
        <HeritageCardCloseButton onClick={onClose} />
      </header>

      <div className="space-y-8 px-6 py-6 sm:px-8 sm:py-8">
        <div className="flex items-start gap-4">
          <span className="hidden size-12 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent sm:grid">
            <LandmarkIcon className="size-6" />
          </span>
          <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            {article.title}
          </h2>
        </div>

        <p className="max-w-3xl text-base leading-7 text-muted-foreground">
          {article.excerpt}
        </p>

        <div className="space-y-6">
          {article.sections.map((section) => (
            <section key={section.heading} className="space-y-2">
              <h3 className="flex items-center gap-2 font-display text-lg font-semibold">
                <CheckIcon className="size-4 text-accent" />
                {section.heading}
              </h3>
              <p className="leading-relaxed text-muted-foreground">{section.body}</p>
            </section>
          ))}
        </div>

        {suggestions.length > 0 ? (
          <aside className="space-y-3 border-t border-border pt-6">
            <h3 className="font-display text-lg font-semibold">À découvrir aussi</h3>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <Button
                  key={suggestion.id}
                  variant="outline"
                  size="sm"
                  onClick={() => onSelect(suggestion)}
                >
                  {suggestion.title}
                  <ArrowRightIcon className="size-3.5" />
                </Button>
              ))}
            </div>
          </aside>
        ) : null}
      </div>
    </article>
  );
}