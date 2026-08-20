import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

import { Logo } from "./logo";
import { MainNav } from "./main-nav";
import { MobileNav } from "./mobile-nav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/85 backdrop-blur-md">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
      >
        Aller au contenu principal
      </a>
      <Container className="relative flex h-16 items-center justify-between gap-4 lg:h-[4.5rem]">
        <Logo />
        <MainNav />
        <div className="flex items-center gap-1.5">
          <Button href="/assistant" size="sm" className="hidden sm:inline-flex">
            Assistant IA
          </Button>
          <MobileNav />
        </div>
      </Container>
    </header>
  );
}