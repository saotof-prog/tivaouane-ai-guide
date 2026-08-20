import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const metadata: Metadata = {
  title: "Design System",
  description:
    "Système de design de Tivaouane-AI : couleurs, typographie, composants.",
};

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {title}
        </h2>
        <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
      {children}
    </section>
  );
}

function Swatch({
  className,
  label,
  hex,
}: {
  className: string;
  label: string;
  hex: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className={`h-16 w-full ${className}`} />
      <div className="space-y-0.5 px-3 py-2">
        <p className="text-xs font-medium">{label}</p>
        <p className="font-mono text-[10px] text-muted-foreground">{hex}</p>
      </div>
    </div>
  );
}

const semanticColors: Array<{ label: string; hex: string; className: string }> = [
  { label: "background", hex: "#FBF8F2", className: "bg-background" },
  { label: "foreground", hex: "#1C1A15", className: "bg-foreground" },
  { label: "card", hex: "#FFFFFF", className: "bg-card" },
  { label: "primary", hex: "#0B5A3A", className: "bg-primary" },
  { label: "secondary", hex: "#EFE7D8", className: "bg-secondary" },
  { label: "muted", hex: "#F2EDE2", className: "bg-muted" },
  { label: "accent · or", hex: "#C79A3B", className: "bg-accent" },
  { label: "destructive", hex: "#B93C30", className: "bg-destructive" },
  { label: "border", hex: "#E4DCCD", className: "bg-border" },
];

const goldScale = ["#FBF6EA", "#F5EBCE", "#EBD9A4", "#DFC174", "#D3AB4F", "#C79A3B", "#A87F2D", "#866225", "#6E4F22", "#5C431F"];
const terracottaScale = ["#FBF0EA", "#F6DDD0", "#EBCEA0", "#DD9673", "#CF7049", "#B95430", "#A14324", "#833521", "#6D2E21", "#5B2920"];

const shadows: Array<{ label: string; className: string }> = [
  { label: "shadow-xs", className: "shadow-xs" },
  { label: "shadow-sm", className: "shadow-sm" },
  { label: "shadow-md", className: "shadow-md" },
  { label: "shadow-lg", className: "shadow-lg" },
  { label: "shadow-xl", className: "shadow-xl" },
  { label: "shadow-card", className: "shadow-card" },
  { label: "shadow-gold", className: "shadow-gold" },
];

export default function DesignSystemPage() {
  return (
    <main className="flex-1 py-16 sm:py-24">
      <Container className="space-y-20">
        {/* Hero */}
        <header className="space-y-6">
          <Badge variant="accent">Design tokens · v1</Badge>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            Design System Tivaouane‑AI
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
            Une identité visuelle premium inspirée de Tivaouane, de son
            patrimoine religieux et de la culture sénégalaise : vert émeraude,
            or du Gamou, terracotta des cases et sables chauds de Thiès.
          </p>
        </header>

        {/* Couleurs */}
        <Section
          id="couleurs"
          title="Couleurs"
          description="Tokens sémantiques (bascule mode clair / sombre automatique) et échelles de marque statiques."
        >
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {semanticColors.map((c) => (
              <Swatch key={c.label} {...c} />
            ))}
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Or patrimonial
              </h3>
              <div className="flex flex-wrap gap-2">
                {goldScale.map((hex, i) => (
                  <span
                    key={hex}
                    title={`gold-${(i + 1) * 100}`}
                    className="size-10 rounded-lg border border-border"
                    style={{ backgroundColor: hex }}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Terracotta
              </h3>
              <div className="flex flex-wrap gap-2">
                {terracottaScale.map((hex, i) => (
                  <span
                    key={hex}
                    title={`terracotta-${(i + 1) * 100}`}
                    className="size-10 rounded-lg border border-border"
                    style={{ backgroundColor: hex }}
                  />
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* Typographie */}
        <Section
          id="typographie"
          title="Typographie"
          description="Fraunces (affichage, titres) — Geist (texte courant), Geist Mono (code)."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-4xl">
                  La voix de Tivaouane
                </CardTitle>
                <CardDescription>Fraunces · display · 600</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm">Geist · corps de texte · 400 · 400</p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Tivaouane, cité du Mawlid, rayonne chaque année de sa
                  lumière : la Grande Mosquée, la ziyara et l’héritage d’El
                  Hadji Malick Sy guident pèlerins et visiteurs.
                </p>
                <p className="font-mono text-xs text-muted-foreground">
                  Geist Mono · lib/utils.ts · sans-serif
                </p>
              </CardContent>
            </Card>
            <div className="space-y-4">
              {[
                { size: "text-5xl", label: "display · hero" },
                { size: "text-4xl", label: "display · h1" },
                { size: "text-3xl", label: "display · h2" },
                { size: "text-2xl", label: "display · h3" },
                { size: "text-xl", label: "display · h4" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl border border-border bg-card px-5 py-4"
                >
                  <p className={`font-display font-semibold ${s.size}`}>
                    Mawlid & patrimoine
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* Spacing */}
        <Section
          id="espacement"
          title="Espacement"
          description="Échelle 4px (base 0.25rem), mobile-first : les paddings augmentent avec les breakpoints."
        >
          <div className="space-y-2.5">
            {[
              { label: "1 · 0.25rem", width: "w-4" },
              { label: "2 · 0.5rem", width: "w-8" },
              { label: "3 · 0.75rem", width: "w-12" },
              { label: "4 · 1rem", width: "w-16" },
              { label: "6 · 1.5rem", width: "w-24" },
              { label: "8 · 2rem", width: "w-32" },
              { label: "12 · 3rem", width: "w-48" },
              { label: "16 · 4rem", width: "w-64" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-3">
                <span className="w-24 shrink-0 font-mono text-xs text-muted-foreground">
                  {s.label}
                </span>
                <div
                  className={`h-4 rounded-sm bg-primary/60 ${s.width}`}
                />
                <span className="h-4 w-px bg-border" />
              </div>
            ))}
          </div>
        </Section>

        {/* Radii */}
        <Section
          id="radii"
          title="Border radius"
          description="Arrondis chaleureux : de la pastille au panneau, tous accessibles via rounded-*."
        >
          <div className="flex flex-wrap items-end gap-6">
            {[
              { label: "xs · 6px", value: "rounded-xs", size: "size-16" },
              { label: "sm · 8px", value: "rounded-sm", size: "size-16" },
              { label: "md · 10px", value: "rounded-md", size: "size-16" },
              { label: "lg · 14px", value: "rounded-lg", size: "size-16" },
              { label: "xl · 18px", value: "rounded-xl", size: "size-20" },
              { label: "2xl · 24px", value: "rounded-2xl", size: "size-24" },
              { label: "full", value: "rounded-full", size: "size-20" },
            ].map((r) => (
              <div key={r.label} className="flex flex-col items-center gap-2">
                <div
                  className={`bg-accent/80 ${r.value} ${r.size} border border-accent`}
                />
                <span className="text-xs text-muted-foreground">{r.label}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Ombres */}
        <Section
          id="ombres"
          title="Ombres"
          description="Ombres teintées de chaleur, douces et premium — la marque de fabrique de l'interface."
        >
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
            {shadows.map((s) => (
              <div
                key={s.label}
                className={`flex h-24 flex-col items-center justify-center rounded-xl border border-border bg-card ${s.className}`}
              >
                <span className="text-xs font-medium">{s.label}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Boutons */}
        <Section
          id="boutons"
          title="Boutons"
          description="Sept variantes, quatre tailles, état de chargement intégré et rendu `<a>` via href."
        >
          <div className="space-y-6 rounded-2xl border border-border bg-card p-6 sm:p-8">
            <div className="flex flex-wrap gap-3">
              <Button>Primaire</Button>
              <Button variant="secondary">Secondaire</Button>
              <Button variant="accent">Or patrimonial</Button>
              <Button variant="outline">Contour</Button>
              <Button variant="ghost">Fantôme</Button>
              <Button variant="destructive">Supprimer</Button>
              <Button variant="link">Lien</Button>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">Petit</Button>
              <Button size="md">Moyen</Button>
              <Button size="lg">Grand</Button>
              <Button size="icon" aria-label="Icône">
                ★
              </Button>
              <Button loading>Chargement…</Button>
              <Button disabled>Désactivé</Button>
            </div>
          </div>
        </Section>

        {/* Cartes */}
        <Section
          id="cartes"
          title="Cartes"
          description="Cartes de contenu avec en-tête, titre, description, contenu et pied de page."
        >
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader accent>
                <Badge variant="gold" className="w-fit">
                  Patrimoine
                </Badge>
                <CardTitle>La Grande Mosquée</CardTitle>
                <CardDescription>
                  Édifiée au début du XXᵉ siècle sous l’impulsion d’El Hadji
                  Malick Sy, cœur spirituel de la cité.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Point d’orgue du Gamou, elle accueille chaque année des
                  milliers de pèlerins venus du monde entier.
                </p>
              </CardContent>
              <CardFooter>
                <Button size="sm" variant="accent">
                  Visiter
                </Button>
                <Button size="sm" variant="ghost">
                  En savoir plus
                </Button>
              </CardFooter>
            </Card>

            <Card surface="soft">
              <CardHeader>
                <CardTitle>Manifestation annuelle</CardTitle>
                <CardDescription>
                  Le Gamou (Mawlid) : la plus grande célébration religieuse du
                  Sénégal.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Chants religieux, conférences et processions illuminent la
                  ville pendant la nuit du Maouloud.
                </p>
              </CardContent>
            </Card>

            <Card surface="outline">
              <CardHeader>
                <CardTitle>En bref</CardTitle>
                <CardDescription>Les essentiels de la cité.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Badge variant="success">Ziyara</Badge>
                <Badge variant="warning">Gamou</Badge>
                <Badge variant="info">Médersa</Badge>
                <Badge variant="terracotta">Culture</Badge>
              </CardContent>
            </Card>
          </div>
        </Section>

        {/* Formulaires */}
        <Section
          id="formulaires"
          title="Champs de saisie"
          description="Inputs accessibles : `aria-invalid` pour les erreurs, `invalid` pour le style."
        >
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-5 rounded-2xl border border-border bg-card p-6 sm:p-8">
              <div className="space-y-2">
                <Label htmlFor="demo-nom">Votre nom</Label>
                <Input id="demo-nom" placeholder="Ex. : Awa Diouf" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="demo-email" required>
                  Adresse e-mail
                </Label>
                <Input
                  id="demo-email"
                  type="email"
                  placeholder="awa@exemple.sn"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="demo-erreur">Code postal (erreur)</Label>
                <Input
                  id="demo-erreur"
                  invalid
                  defaultValue="000"
                  aria-describedby="demo-erreur-tip"
                />
                <p
                  id="demo-erreur-tip"
                  className="text-xs text-destructive"
                >
                  Code invalide — attendez 5 chiffres.
                </p>
              </div>
            </div>
            <div className="space-y-2 rounded-2xl border border-border bg-card p-6 sm:p-8">
              <Label htmlFor="demo-message">Votre message</Label>
              <Textarea
                id="demo-message"
                placeholder="Racontez votre visite…"
              />
            </div>
          </div>
        </Section>

        {/* Badges */}
        <Section
          id="badges"
          title="Badges"
          description="Pills de statut et de catégorie, cohérentes avec la palette."
        >
          <div className="flex flex-wrap gap-3 rounded-2xl border border-border bg-card p-6">
            <Badge>Primaire</Badge>
            <Badge variant="secondary">Secondaire</Badge>
            <Badge variant="accent">Accent</Badge>
            <Badge variant="outline">Contour</Badge>
            <Badge variant="destructive">Fermé</Badge>
            <Badge variant="success">Ouvert</Badge>
            <Badge variant="warning">Fréquentation élevée</Badge>
            <Badge variant="info">Médersa</Badge>
            <Badge variant="terracotta">Culture</Badge>
            <Badge variant="gold">Patrimoine</Badge>
          </div>
        </Section>
      </Container>
    </main>
  );
}