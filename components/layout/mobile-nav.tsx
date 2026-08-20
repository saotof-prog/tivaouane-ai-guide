"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

import { NAV_LINKS } from "./nav-links";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const hasOpened = useRef(false);

  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      hasOpened.current = true;
      panelRef.current
        ?.querySelector<HTMLAnchorElement>("a[href]")
        ?.focus();
    } else if (hasOpened.current) {
      toggleRef.current?.focus();
    }
  }, [open]);

  return (
    <>
      <Button
        ref={toggleRef}
        type="button"
        size="icon"
        variant="ghost"
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        aria-expanded={open}
        aria-controls="menu-mobile"
        className="md:hidden"
        onClick={() => setOpen((value) => !value)}
      >
        <span aria-hidden="true" className="relative block size-4">
          <span
            className={cn(
              "absolute left-0 top-0 h-0.5 w-full rounded-full bg-current transition-all duration-200",
              open && "top-1/2 -translate-y-1/2 rotate-45",
            )}
          />
          <span
            className={cn(
              "absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 rounded-full bg-current transition-opacity duration-200",
              open && "opacity-0",
            )}
          />
          <span
            className={cn(
              "absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-current transition-all duration-200",
              open && "bottom-1/2 translate-y-1/2 -rotate-45",
            )}
          />
        </span>
      </Button>

      <div
        ref={panelRef}
        id="menu-mobile"
        role="dialog"
        aria-modal="true"
        aria-label="Menu principal"
        className={cn(
          "absolute inset-x-0 top-full border-b border-border/60 bg-background/95 shadow-card backdrop-blur-md md:hidden",
          open ? "animate-fade-in" : "hidden",
        )}
      >
        <Container className="py-4">
          <nav aria-label="Navigation mobile">
            <ul className="flex flex-col gap-1">
              {NAV_LINKS.map(({ href, label }) => {
                const isActive =
                  href === "/" ? pathname === "/" : pathname.startsWith(href);

                return (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "flex items-center justify-between rounded-2xl px-4 py-3 text-base font-medium transition-colors",
                        isActive
                          ? "bg-muted text-foreground"
                          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                      )}
                    >
                      {label}
                      {isActive ? (
                        <span
                          aria-hidden="true"
                          className="size-1.5 rounded-full bg-accent"
                        />
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="mt-4 pb-2">
            <Button href="/assistant" className="w-full">
              Assistant IA
            </Button>
          </div>
        </Container>
      </div>
    </>
  );
}