/**
 * Route POST /api/chat — assistant de Tivaouane AI Guide.
 *
 * Pipeline : requête utilisateur → validation → récupération du contexte
 * (RAG) → génération par le modèle → réponse structurée avec sources.
 *
 * Aucun contenu de message ni clé d’API n’est journalisé.
 */

import { NextResponse } from "next/server";

import { AIError, buildChatCompletionMessages, getChatModel, type ChatHistoryEntry } from "@/lib/ai";
import { buildRetrievalContext, SearchError } from "@/lib/rag";

import type { ChatResponse, SearchResult, Source } from "@/types";

/** L’API effectue des appels réseau sortants : runtime Node obligatoire. */
export const runtime = "nodejs";

const MAX_BODY_BYTES = 64_000;
const MAX_MESSAGE_LENGTH = 2_000;
const MAX_HISTORY_MESSAGES = 20;
const MAX_CONVERSATION_ID_LENGTH = 64;
const CONVERSATION_ID_PATTERN = /^[A-Za-z0-9_-]+$/;

/** Payload de chat validé, prêt pour l’orchestration. */
type ValidatedChatRequest = {
  message: string;
  conversationId?: string;
  history: ChatHistoryEntry[];
};

type ValidationResult =
  | { ok: true; value: ValidatedChatRequest }
  | { ok: false; problem: string };

/** Valide strictement le corps de la requête. */
function validateChatRequest(payload: unknown): ValidationResult {
  if (typeof payload !== "object" || payload === null) {
    return { ok: false, problem: "Le corps de la requête doit être un objet JSON." };
  }

  const record = payload as Record<string, unknown>;

  const message = record.message;
  if (typeof message !== "string" || message.trim() === "") {
    return { ok: false, problem: "Le message ne peut pas être vide." };
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return { ok: false, problem: `Le message ne peut pas dépasser ${MAX_MESSAGE_LENGTH} caractères.` };
  }

  let conversationId: string | undefined;
  if (record.conversationId !== undefined) {
    if (
      typeof record.conversationId !== "string" ||
      !CONVERSATION_ID_PATTERN.test(record.conversationId) ||
      record.conversationId.length > MAX_CONVERSATION_ID_LENGTH
    ) {
      return { ok: false, problem: "Le champ conversationId est invalide." };
    }
    conversationId = record.conversationId;
  }

  const history: ChatHistoryEntry[] = [];
  if (record.history !== undefined) {
    if (!Array.isArray(record.history)) {
      return { ok: false, problem: "L’historique doit être une liste de messages." };
    }
    if (record.history.length > MAX_HISTORY_MESSAGES) {
      return {
        ok: false,
        problem: `L’historique ne peut pas dépasser ${MAX_HISTORY_MESSAGES} messages.`,
      };
    }
    for (const entry of record.history) {
      if (typeof entry !== "object" || entry === null) {
        return { ok: false, problem: "Un message de l’historique est invalide." };
      }
      const { role, content } = entry as Record<string, unknown>;
      if (role !== "user" && role !== "assistant") {
        return { ok: false, problem: "Un rôle de l’historique est invalide." };
      }
      if (typeof content !== "string" || content.length > MAX_MESSAGE_LENGTH) {
        return { ok: false, problem: "Un contenu de l’historique est invalide." };
      }
      history.push({ role, content });
    }
  }

  return { ok: true, value: { message: message.trim(), conversationId, history } };
}

/** Réponse d’erreur JSON uniforme : { error: { code, message } }. */
function errorResponse(status: number, code: string, message: string): NextResponse {
  return NextResponse.json({ error: { code, message } }, { status });
}

/** Déduplique les sources des résultats de recherche (par identifiant). */
function collectSources(results: SearchResult[]): Source[] {
  const seen = new Set<string>();
  const sources: Source[] = [];
  for (const result of results) {
    const id = result.source?.id ?? result.documentId;
    if (seen.has(id)) continue;
    seen.add(id);
    if (result.source) sources.push(result.source);
  }
  return sources;
}

export async function POST(request: Request): Promise<NextResponse> {
  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return errorResponse(400, "validation", "Le corps de la requête est illisible.");
  }

  if (rawBody.length > MAX_BODY_BYTES) {
    return errorResponse(400, "validation", "Le corps de la requête est trop volumineux.");
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return errorResponse(400, "validation", "Le corps de la requête n’est pas un JSON valide.");
  }

  const validated = validateChatRequest(payload);
  if (!validated.ok) {
    return errorResponse(400, "validation", validated.problem);
  }

  const { message, conversationId, history } = validated.value;

  // Récupération du contexte dans la base de connaissances (RAG).
  let retrieval: { context: string; results: SearchResult[] };
  try {
    retrieval = await buildRetrievalContext(message);
  } catch (cause) {
    if (cause instanceof SearchError && cause.code === "validation") {
      return errorResponse(400, "validation", cause.message);
    }
    console.error("[chat] échec de la recherche de contexte", (cause as Error).message);
    return errorResponse(500, "retrieval", "La recherche de connaissances a échoué.");
  }

  const { context, results } = retrieval;

  // Production de la réponse par le modèle de langage.
  let chatModel;
  try {
    chatModel = getChatModel();
  } catch (cause) {
    if (cause instanceof AIError) {
      console.error(`[chat] modèle indisponible (${cause.code})`);
      return cause.code === "configuration"
        ? errorResponse(500, "configuration", cause.message)
        : errorResponse(502, "provider", cause.message);
    }
    console.error("[chat] erreur inattendue de configuration", (cause as Error).message);
    return errorResponse(500, "internal", "Une erreur interne est survenue.");
  }

  let content: string;
  try {
    content = await chatModel.complete(
      buildChatCompletionMessages({ userMessage: message, history, context }),
    );
  } catch (cause) {
    if (cause instanceof AIError) {
      console.error(`[chat] génération impossible (${cause.code})`);
      const status = cause.code === "configuration" ? 500 : 502;
      return errorResponse(status, cause.code, cause.message);
    }
    console.error("[chat] erreur inattendue du modèle", (cause as Error).message);
    return errorResponse(500, "internal", "Une erreur interne est survenue.");
  }

  const sources = collectSources(results);
  const responseBody: ChatResponse = {
    conversationId,
    message: {
      id: crypto.randomUUID(),
      role: "assistant",
      content,
      createdAt: new Date().toISOString(),
      sources: sources.length > 0 ? sources : undefined,
    },
  };

  return NextResponse.json(responseBody);
}