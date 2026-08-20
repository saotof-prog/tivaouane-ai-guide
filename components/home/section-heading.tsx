import { Badge, type BadgeProps } from "@/components/ui/badge";

import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  /** Sets the `id` on the heading so the section can be labelled via `aria-labelledby`. */
  id?: string;
  eyebrow: string;
  title: string;
  description?: string;
  align?: "center" | "left";
  badgeVariant?: BadgeProps["variant"];
  className?: string;
}

export function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  align = "center",
  badgeVariant = "accent",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className,
      )}
    >
      <Badge variant={badgeVariant}>{eyebrow}</Badge>
      <h2
        id={id}
        className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl"
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg",
            align === "center" && "mx-auto",
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}