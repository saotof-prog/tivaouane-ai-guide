# Tivaouane-AI

Assistant intelligent et guide interactif de la ville de Tivaouane : lieux,
patrimoine et histoire, nourris par une base de connaissances locale.

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com) v4
- ESLint (`eslint-config-next`)

## Structure du projet

```
├── app/                  # Routes et pages (App Router)
│   └── api/              # API Routes (chat, search — à venir)
├── components/
│   ├── ui/               # Composants UI génériques
│   ├── assistant/        # Composants du chat
│   ├── map/              # Composants cartographiques
│   └── layout/           # Navigation, footer, etc.
├── lib/                  # Logique applicative (AI, RAG, DB — à venir)
├── data/
│   └── knowledge/        # Contenu source (lieux, patrimoine, histoire)
├── public/
│   ├── images/
│   └── icons/
├── scripts/              # Scripts d'outillage (ingestion de contenu — à venir)
└── types/                # Types TypeScript partagés
```

## Commandes

```bash
npm run dev      # Serveur de développement
npm run build    # Build de production
npm run start    # Serveur de production
npm run lint     # ESLint
```

## Variables d'environnement

Copier `.env.example` vers `.env.local` et ajuster les valeurs :

| Variable | Description | Requise |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | URL publique du site (SEO, OpenGraph) | Oui |

Les clés d'API (LLM, bases de données, etc.) seront ajoutées ici lors des
phases ultérieures — elles ne sont jamais exposées côté client.