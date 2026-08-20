import Link from "next/link";

import { Container } from "@/components/ui/container";

import { Logo } from "./logo";
import { NAV_LINKS } from "./nav-links";

const FOOTER_LINKS = [
  { href: "/ui", label: "Design system" },
  { href: "/lieux", label: "Lieux emblématiques" },
  { href: "/patrimoine", label: "Histoire & culture" },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/60 bg-muted/30">
      <Container className="py-14">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
          <div className="flex max-w-sm flex-col items-start gap-4">
            <Logo />
            <p className="text-sm leading-6 text-muted-foreground">
              Guide intelligent et interactif de Tivaouane : lieux
              emblématiques, patrimoine et histoire de la cité religieuse du
              Sénégal.
            </p>
          </div>

          <nav aria-label="Navigation pied de page">
            <h2 className="font-display text-xs font-semibold uppercase tracking-widest text-foreground">
              Navigation
            </h2>
            <ul className="mt-4 space-y-2.5">
              {NAV_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Découvrir">
            <h2 className="font-display text-xs font-semibold uppercase tracking-widest text-foreground">
              Découvrir
            </h2>
            <ul className="mt-4 space-y-2.5">
              {FOOTER_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} Tivaouane-AI · Conçu pour le Hackathon Tivaouane 2026
          </p>
          <p>Tivaouane · Sénégal</p>
        </div>
      </Container>
    </footer>
  );
}