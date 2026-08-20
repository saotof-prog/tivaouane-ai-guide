# Base de connaissances — Tivaouane AI Guide

Contenu documentaire local destiné au futur système RAG.
**Aucune donnée factuelle n’est encore validée :** cette base ne contient aujourd’hui que des squelettes
et des placeholders explicitement marqués `TODO`. Aucune connexion au LLM n’est faite à ce stade.

## Arborescence

```
data/knowledge/
├── README.md          ← ce document (format & conventions)
├── histoire/          ← histoire de la cité, grandes étapes
├── patrimoine/        ← mosquées, mausolées, patrimoine religieux et matériel
├── lieux/             ← sites, monuments, espaces, adresses pratiques
├── culture/           ← traditions, gastronomie, artisanat, vie quotidienne
├── personnalites/     ← figures marquantes (religieuses, historiques, culturelles)
└── evenements/        ← événements annuels et rassemblements
```

## Format des documents

Chaque document est un fichier **Markdown avec frontmatter YAML**.
Nom de fichier : `{slug}.md` en kebab-case (ex. `grande-mosquee.md`).
Un slug est unique : il sert d’identifiant humain lisible (`id` du frontmatter).

### Champs du frontmatter

| Champ | Type | Requis | Description |
| --- | --- | --- | --- |
| `id` | chaîne | oui | Identifiant unique, identique au slug du fichier (kebab-case). |
| `title` | chaîne | oui | Titre du document. Préfixe `TODO — ` tant qu’il n’est pas confirmé. |
| `category` | chaîne | oui | Catégorie documentaire : `histoire`, `patrimoine`, `lieux`, `culture`, `personnalites`, `evenements`. |
| `summary` | chaîne | non | Résumé d’une à deux phrases (utilisé pour les résultats de recherche). `TODO` si absent. |
| `status` | chaîne | oui | `brouillon` (squelette/TODO) · `a_verifier` (rédigé, sources à contrôler) · `valide` (prêt pour le RAG). |
| `lang` | chaîne | non | Code de langue du contenu. Défaut : `fr`. |
| `source` | objet | oui | Source d’information (voir ci-dessous). Référence unique par document. |
| `tags` | liste | non | Mots-clés de recherche (thèmes, entités, synonymes). |
| `updatedAt` | date | oui | Dernière mise à jour du fichier, ISO 8601 (`AAAA-MM-JJ`). |

### Objet `source`

| Champ | Type | Requis | Description |
| --- | --- | --- | --- |
| `id` | chaîne | oui | Identifiant de la source (ex. `livre-histoire-tivaouane-01`). `TODO-source-XXXX` provisoirement. |
| `title` | chaîne | oui | Titre de la source (livre, article, site, archive, interview…). |
| `type` | chaîne | oui | `livre` · `article` · `site` · `archive` · `interview` · `officiel`. |
| `author` | chaîne | non | Auteur ou institution. |
| `url` | chaîne | non | Lien vers la source en ligne. |
| `publishedAt` | date | non | Date de publication (ISO 8601). |

### Corps du document

- Sections Markdown (`##`, `###`) : une section = une idée/un sujet, pour faciliter le découpage en chunks.
- Toute information manquante ou non vérifiée est un placeholder explicite : `TODO`.
- **Règles d’or** :
  1. Aucun fait ne doit être inventé : seules les informations fournies ou sourcées sont rédigées.
  2. Toute affirmation doit pouvoir être rattachée à une source (`source` du frontmatter).
  3. Un document n’est `valide` que lorsque tous ses `TODO` sont résolus et ses sources contrôlées.

## Lien avec les types du projet

Le frontmatter est le format source. Lors de l’ingestion, chaque document sera transformé en
`KnowledgeDocument` (`types/index.ts`) — le mapping est décrit dans le README racine du projet au
moment de la mise en place du pipeline RAG (hors périmètre de cette étape).