/**
 * Endpoint de recherche — GET /api/search?q=…&category=…&limit=…
 *
 * Renvoie { results: SearchResult[] } ou une erreur JSON
 * { error: { code, message } } (400 validation, 500 interne).
 */

import { type NextRequest, NextResponse } from "next/server";
import {
  DEFAULT_LIMIT,
  KNOWLEDGE_CATEGORIES,
  MAX_LIMIT,
  MAX_QUERY_LENGTH,
  SearchError,
  getSearchProvider,
} from "@/lib/rag";
import type { KnowledgeCategoryId, SearchQuery } from "@/types";

export const runtime = "nodejs";

const VALID_CATEGORIES = new Set<string>(KNOWLEDGE_CATEGORIES);

type ParsedQuery =
  | { ok: true; data: SearchQuery }
  | { ok: false; message: string };

/** Valide les paramètres de requête (aucune donnée n’est acceptée sans contrôle). */
function parseSearchParams(searchParams: URLSearchParams): ParsedQuery {
  const rawQuery = searchParams.get("q");
  const query = rawQuery?.trim() ?? "";
  if (query === "") {
    return { ok: false, message: "Le paramètre « q » est requis." };
  }
  if (query.length > MAX_QUERY_LENGTH) {
    return {
      ok: false,
      message: `La requête est trop longue (${MAX_QUERY_LENGTH} caractères maximum).`,
    };
  }

  const rawCategory = searchParams.get("category");
  const category =
    rawCategory !== null && rawCategory !== ""
      ? (rawCategory as KnowledgeCategoryId)
      : undefined;
  if (category !== undefined && !VALID_CATEGORIES.has(category)) {
    return { ok: false, message: "Catégorie inconnue." };
  }

  let limit = DEFAULT_LIMIT;
  const rawLimit = searchParams.get("limit");
  if (rawLimit !== null && rawLimit !== "") {
    const parsedLimit = Number(rawLimit);
    if (!Number.isInteger(parsedLimit) || parsedLimit < 1 || parsedLimit > MAX_LIMIT) {
      return {
        ok: false,
        message: `« limit » doit être un entier entre 1 et ${MAX_LIMIT}.`,
      };
    }
    limit = parsedLimit;
  }

  return { ok: true, data: { query, category, limit } };
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const parsed = parseSearchParams(request.nextUrl.searchParams);
  if (!parsed.ok) {
    return NextResponse.json(
      { error: { code: "validation", message: parsed.message } },
      { status: 400 },
    );
  }

  try {
    const results = await getSearchProvider().search(parsed.data);
    return NextResponse.json({ results });
  } catch (error) {
    if (error instanceof SearchError && error.code === "internal") {
      console.error("Recherche échouée :", error.message);
    } else {
      console.error("Erreur inattendue de la recherche :", error);
    }
    return NextResponse.json(
      { error: { code: "internal", message: "La recherche a échoué." } },
      { status: 500 },
    );
  }
}