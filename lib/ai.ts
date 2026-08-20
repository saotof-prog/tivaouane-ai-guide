/**
 * Couche IA de Tivaouane AI Guide.
 *
 * Ce module contient uniquement de la logique IA (fournisseur de modèle de
 * langage et construction des prompts). Il ne connaît ni l’interface
 * utilisateur, ni les routes HTTP.
 *
* Aucune clé d’API n’est stockée ici : la configuration est lue depuis les
 * variables d’environnement au moment du premier appel (singleton paresseux).
 * Variables prises en charge :
 *   - OPENAI_API_KEY        (requise, également utilisée pour les embeddings)
 *   - OPENAI_BASE_URL       (optionnelle, défaut : https://api.openai.com/v1)
 *   - OPENAI_MODEL          (optionnelle, défaut : gpt-4o-mini)
 *   - OPENAI_TEMPERATURE    (optionnelle, défaut : 0.2)
 *   - OPENAI_MAX_TOKENS     (optionnelle, défaut : 1024)
 *
 * Le contexte RAG (numéroté et borné) est construit par lib/rag/context.ts ;
 * ce module ne reçoit que le texte prêt pour le prompt système.
 */

/** Nombre maximal de messages d’historique envoyés au modèle. */
export const AI_HISTORY_LIMIT = 20;

/** Temps maximal d’attente d’une réponse du modèle, en millisecondes. */
const REQUEST_TIMEOUT_MS = 30_000;

const DEFAULT_BASE_URL = "https://api.openai.com/v1";
const DEFAULT_MODEL = "gpt-4o-mini";
const DEFAULT_TEMPERATURE = 0.2;
const DEFAULT_MAX_TOKENS = 1024;
const MIN_MAX_TOKENS = 64;
const MAX_MAX_TOKENS = 4096;

/** Message d’une conversation tel qu’envoyé au modèle de langage. */
export type ChatCompletionMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

/** Message d’historique transmis par le client (seuls rôle et contenu sont utiles). */
export type ChatHistoryEntry = {
  role: "user" | "assistant";
  content: string;
};

/** Erreurs métier levées par la couche IA. */
export class AIError extends Error {
  readonly code: "configuration" | "network" | "provider" | "invalid_response";

  constructor(code: AIError["code"], message: string) {
    super(message);
    this.name = "AIError";
    this.code = code;
  }
}

/** Configuration lue depuis les variables d’environnement. */
type ChatModelConfig = {
  apiKey: string;
  baseUrl: string;
  model: string;
  temperature: number;
  maxTokens: number;
};

/** Lit la configuration du modèle. Lève AIError si la clé est absente. */
function readConfig(): ChatModelConfig {
  const apiKey = (process.env.OPENAI_API_KEY ?? "").trim();
  if (!apiKey) {
    throw new AIError(
      "configuration",
      "La clé API du fournisseur d’IA n’est pas configurée (OPENAI_API_KEY).",
    );
  }

  let temperature = DEFAULT_TEMPERATURE;
  const rawTemperature = (process.env.OPENAI_TEMPERATURE ?? "").trim();
  if (rawTemperature) {
    const parsed = Number(rawTemperature);
    if (Number.isFinite(parsed) && parsed >= 0 && parsed <= 1) {
      temperature = parsed;
    }
  }

  let maxTokens = DEFAULT_MAX_TOKENS;
  const rawMaxTokens = (process.env.OPENAI_MAX_TOKENS ?? "").trim();
  if (rawMaxTokens) {
    const parsed = Number(rawMaxTokens);
    if (Number.isFinite(parsed) && parsed >= MIN_MAX_TOKENS) {
      maxTokens = Math.min(Math.floor(parsed), MAX_MAX_TOKENS);
    }
  }

  const baseUrl = (process.env.OPENAI_BASE_URL ?? DEFAULT_BASE_URL).trim().replace(/\/+$/, "");

  return {
    apiKey,
    baseUrl,
    model: (process.env.OPENAI_MODEL ?? DEFAULT_MODEL).trim() || DEFAULT_MODEL,
    temperature,
    maxTokens,
  };
}

/** Modèle de chat : production d’une réponse textuelle à partir de messages. */
export interface ChatModel {
  readonly name: string;
  complete(messages: ChatCompletionMessage[]): Promise<string>;
}

/** Fournisseur compatible avec l’API « chat completions » d’OpenAI. */
export class OpenAICompatibleChatModel implements ChatModel {
  readonly name = "openai-compatible";

  private readonly config: ChatModelConfig;

  constructor(config: ChatModelConfig) {
    this.config = config;
  }

  async complete(messages: ChatCompletionMessage[]): Promise<string> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      let response: Response;
      try {
        response = await fetch(`${this.config.baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${this.config.apiKey}`,
          },
          body: JSON.stringify({
            model: this.config.model,
            messages,
            temperature: this.config.temperature,
            max_tokens: this.config.maxTokens,
          }),
          signal: controller.signal,
        });
      } catch {
        throw new AIError(
          "network",
          "Impossible de joindre le fournisseur d’IA. Réessayez dans quelques instants.",
        );
      }

      if (response.status === 401 || response.status === 403) {
        throw new AIError(
          "configuration",
          "La clé API du fournisseur d’IA est invalide ou n’a pas accès au modèle demandé.",
        );
      }
      if (response.status === 429) {
        throw new AIError(
          "provider",
          "Le fournisseur d’IA est momentanément surchargé. Réessayez dans quelques instants.",
        );
      }
      if (!response.ok) {
        throw new AIError(
          "provider",
          `Le fournisseur d’IA a renvoyé une erreur (statut ${response.status}).`,
        );
      }

      let content: unknown;
      try {
        const payload: unknown = await response.json();
        content =
          typeof payload === "object" && payload !== null
            ? (payload as { choices?: Array<{ message?: { content?: unknown } }> }).choices?.[0]
                ?.message?.content
            : undefined;
      } catch {
        throw new AIError(
          "invalid_response",
          "Le fournisseur d’IA a renvoyé une réponse illisible.",
        );
      }

      if (typeof content !== "string" || content.trim() === "") {
        throw new AIError(
          "invalid_response",
          "Le modèle a renvoyé une réponse vide ou mal formée.",
        );
      }

      return content;
    } finally {
      clearTimeout(timeout);
    }
  }
}

let cachedModel: ChatModel | null = null;

/** Retourne le modèle de chat configuré (singleton paresseux). */
export function getChatModel(): ChatModel {
  if (cachedModel === null) {
    cachedModel = new OpenAICompatibleChatModel(readConfig());
  }
  return cachedModel;
}

/**
 * Construit la liste des messages envoyés au modèle :
 * prompt système (avec le contexte RAG numéroté) + historique + message de l’utilisateur.
 */
export function buildChatCompletionMessages(options: {
  userMessage: string;
  history: ChatHistoryEntry[];
  context: string | null;
}): ChatCompletionMessage[] {
  const { userMessage, history, context } = options;

  const messages: ChatCompletionMessage[] = [
    { role: "system", content: buildSystemPrompt(context) },
  ];

  for (const entry of history.slice(-AI_HISTORY_LIMIT)) {
    messages.push({ role: entry.role, content: entry.content });
  }

  messages.push({ role: "user", content: userMessage });
  return messages;
}

/** Prompt système : rôle de l’assistant + contexte relatif à la question posée. */
function buildSystemPrompt(context: string | null): string {
  const hasContext = context !== null && context.trim() !== "";
  const contextText = hasContext
    ? context
    : "Aucune source pertinente n’a été trouvée dans la base de connaissances pour cette question.";

  return [
    "Tu es l’assistant de Tivaouane AI Guide, un guide intelligent de la ville de Tivaouane (Sénégal) : son histoire, sa zawiya, ses mosquées, son patrimoine, son artisanat, ses restaurants et ses événements.",
    "Réponds toujours en français, de façon claire, amicale et concise.",
    "",
    "Règles strictes :",
    "1. Réponds UNIQUEMENT à partir du « Contexte » ci-dessous et de l’historique de la conversation.",
    "2. N’invente jamais d’information : si la réponse ne figure pas dans le contexte, dis explicitement que cette information n’est pas encore disponible dans la base de connaissances, puis propose une question proche.",
    "3. Cite les sources utilisées en référence aux numéros du contexte, par exemple « (source [1]) » ou « d’après [2] ». Ne fais jamais référence à un numéro dont le contenu ne t’a pas été fourni.",
    "4. Si le contexte est vide, indique-le et oriente l’utilisateur vers les catégories disponibles (histoire, patrimoine, lieux, culture, personnalités, événements).",
    "",
    "Contexte (extraits numérotés de la base de connaissances) :",
    contextText,
  ].join("\n");
}