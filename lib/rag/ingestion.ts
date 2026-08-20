/**
 * Ingestion de la base de connaissances.
 *
 * Lit les fichiers Markdown de `data/knowledge/`, parse le frontmatter
 * (YAML minimal contrôlé), valide chaque document et produit les
 * métadonnées purifiées (aucune donnée inventée, aucune section TODO).
 */

import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import type { Source, SourceType } from "@/types";
import type { KnowledgeCategoryId } from "@/types";
import { KNOWLEDGE_CATEGORIES, KNOWLEDGE_DIR, TODO_MARKER, type SearchIndexStats } from "./shared";

const VALID_STATUSES = new Set(["brouillon", "a_verifier", "valide"]);

const VALID_SOURCE_TYPES = new Set<SourceType>([
  "livre",
  "article",
  "site",
  "archive",
  "interview",
  "officiel",
]);

/** Métadonnées d’un document, sans son corps. */
export type DocumentMetadata = {
  documentId: string;
  title: string;
  summary?: string;
  categoryId: KnowledgeCategoryId;
  source: Source;
  tags: string[];
  updatedAt?: string;
};

/** Document ingéré : métadonnées + contenu Markdown brut. */
export type IngestedDocument = DocumentMetadata & {
  body: string;
};

type RawFrontmatter = Record<string, unknown>;

/** Retire les guillemets environnants et le commentaire éventuel d’une valeur YAML. */
function stripQuotes(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith("\"") && trimmed.endsWith("\"")) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  const commentIndex = trimmed.indexOf(" #");
  return commentIndex === -1 ? trimmed : trimmed.slice(0, commentIndex).trim();
}

/**
 * Parser minimal du frontmatter YAML — limité au format contrôlé défini
 * dans `data/knowledge/README.md` (scalaires, listes « - item » et objet
 * « source: » imbriqué). Renvoie null si la structure est inattendue.
 */
export function parseFrontmatter(raw: string): RawFrontmatter | null {
  const result: RawFrontmatter = {};
  let currentKey: string | null = null;

  for (const line of raw.split(/\r?\n/)) {
    if (line.trim() === "") continue;

    const listMatch = /^\s*-\s+(.+)$/.exec(line);
    if (listMatch) {
      if (currentKey === null) return null;
      const list = result[currentKey];
      if (!Array.isArray(list)) return null;
      list.push(stripQuotes(listMatch[1]));
      continue;
    }

    const keyMatch = /^(\s*)([\w-]+):\s*(.*)$/.exec(line);
    if (!keyMatch) return null;
    const [, indent, key, rawValue] = keyMatch;
    const value = rawValue.trim();

    if (indent.length > 0) {
      if (currentKey === null) return null;
      const parent = result[currentKey];
      if (parent === null || typeof parent !== "object" || Array.isArray(parent)) {
        return null;
      }
      if (value === "") continue;
      (parent as Record<string, unknown>)[key] = stripQuotes(value);
      continue;
    }

    currentKey = key;
    if (value === "[]") {
      result[key] = [];
    } else if (value === "") {
      result[key] = [];
    } else {
      result[key] = stripQuotes(value);
    }
  }

  return result;
}

/** Découpe un fichier en frontmatter et corps. Renvoie null sans délimiteur. */
export function splitFrontmatter(raw: string): { frontmatter: RawFrontmatter; body: string } | null {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
  if (!match) return null;
  const frontmatter = parseFrontmatter(match[1]);
  if (frontmatter === null) return null;
  return { frontmatter, body: raw.slice(match[0].length) };
}

/** Convertit la valeur « source » du frontmatter en Source. Renvoie null si incomplète. */
function toSourceOrNull(value: unknown): Source | null {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  const id = typeof record.id === "string" ? record.id.trim() : "";
  const title = typeof record.title === "string" ? record.title.trim() : "";
  const type = typeof record.type === "string" ? (record.type as SourceType) : undefined;
  if (id === "" || title === "" || type === undefined || !VALID_SOURCE_TYPES.has(type)) {
    return null;
  }
  const source: Source = { id, title, type };
  if (typeof record.author === "string" && record.author.trim() !== "") {
    source.author = record.author.trim();
  }
  if (typeof record.url === "string" && record.url.trim() !== "") {
    source.url = record.url.trim();
  }
  if (typeof record.publishedAt === "string" && record.publishedAt.trim() !== "") {
    source.publishedAt = record.publishedAt.trim();
  }
  return source;
}

/** Normalise une date ISO 8601 (JJ sur 10 caractères) ou renvoie undefined. */
function toDateOrUndefined(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return /^\d{4}-\d{2}-\d{2}/.test(trimmed) ? trimmed.slice(0, 10) : undefined;
}

/** Valide le frontmatter et construit les métadonnées. Renvoie null si ignoré. */
function buildMetadata(frontmatter: RawFrontmatter, stats: SearchIndexStats): DocumentMetadata | null {
  const id = typeof frontmatter.id === "string" ? frontmatter.id.trim() : "";
  const title = typeof frontmatter.title === "string" ? frontmatter.title.trim() : "";
  const status = typeof frontmatter.status === "string" ? frontmatter.status.trim() : "";
  const category = typeof frontmatter.category === "string" ? frontmatter.category.trim() : "";
  if (id === "" || title === "" || status === "" || category === "") {
    stats.skipped.invalidFrontmatter += 1;
    return null;
  }
  if (!VALID_STATUSES.has(status)) {
    stats.skipped.invalidFrontmatter += 1;
    return null;
  }
  if (status !== "valide") {
    stats.skipped.notValidated += 1;
    return null;
  }
  if (!KNOWLEDGE_CATEGORIES.includes(category as KnowledgeCategoryId)) {
    stats.skipped.invalidFrontmatter += 1;
    return null;
  }
  const source = toSourceOrNull(frontmatter.source);
  if (source === null) {
    stats.skipped.invalidFrontmatter += 1;
    return null;
  }

  const tags = Array.isArray(frontmatter.tags)
    ? frontmatter.tags
        .filter((tag): tag is string => typeof tag === "string")
        .map((tag) => tag.trim())
        .filter((tag) => tag !== "")
    : [];

  return {
    documentId: id,
    title,
    summary:
      typeof frontmatter.summary === "string" && frontmatter.summary.trim() !== ""
        ? frontmatter.summary.trim()
        : undefined,
    categoryId: category as KnowledgeCategoryId,
    source,
    tags,
    updatedAt: toDateOrUndefined(frontmatter.updatedAt),
  };
}

/** Liste récursive des fichiers Markdown de la base. */
async function listMarkdownFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { recursive: true });
  return entries
    .filter((entry) => entry.endsWith(".md"))
    .map((entry) => path.join(dir, entry));
}

/**
 * Ingère tous les documents valides de la base.
 * Une base absente ou vide renvoie simplement une liste vide.
 */
export async function ingestDocuments(): Promise<{ documents: IngestedDocument[]; stats: SearchIndexStats }> {
  const stats: SearchIndexStats = {
    filesScanned: 0,
    documentsIndexed: 0,
    chunksIndexed: 0,
    skipped: { missingFrontmatter: 0, invalidFrontmatter: 0, notValidated: 0 },
  };
  const documents: IngestedDocument[] = [];

  let files: string[];
  try {
    files = await listMarkdownFiles(KNOWLEDGE_DIR);
  } catch (error) {
    if ((error as NodeJS.ErrnoException)?.code === "ENOENT") {
      return { documents, stats };
    }
    throw error;
  }

  for (const file of files) {
    stats.filesScanned += 1;
    let raw: string;
    try {
      raw = await readFile(file, "utf8");
    } catch {
      continue; // fichier illisible : ignoré
    }
    const parsed = splitFrontmatter(raw);
    if (parsed === null) {
      stats.skipped.missingFrontmatter += 1;
      continue;
    }
    const metadata = buildMetadata(parsed.frontmatter, stats);
    if (metadata === null) continue;
    if (parsed.body.includes(TODO_MARKER)) continue;
    documents.push({ ...metadata, body: parsed.body });
    stats.documentsIndexed += 1;
  }

  return { documents, stats };
}