export interface NavLink {
  href: string;
  label: string;
}

export const NAV_LINKS: NavLink[] = [
  { href: "/", label: "Accueil" },
  { href: "/assistant", label: "Assistant IA" },
  { href: "/lieux", label: "Lieux" },
  { href: "/patrimoine", label: "Patrimoine" },
];