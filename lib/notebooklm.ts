/**
 * Client NotebookLM REST API.
 *
 * Communique avec le serveur notebooklm-server
 * lancé localement sur http://127.0.0.1:8000.
 */

type NotebookLMResponse = {
  answer: string;
  conversation_id?: string;
  turn_number?: number;
};

const NOTEBOOKLM_API_URL =
  process.env.NOTEBOOKLM_API_URL ?? "http://127.0.0.1:8000";

const NOTEBOOKLM_SERVER_TOKEN =
  process.env.NOTEBOOKLM_SERVER_TOKEN;

const NOTEBOOKLM_NOTEBOOK_ID =
  process.env.NOTEBOOKLM_NOTEBOOK_ID;

/**
 * Pose une question à NotebookLM.
 */
export async function askNotebookLM(
  question: string,
): Promise<NotebookLMResponse> {
  if (!NOTEBOOKLM_SERVER_TOKEN) {
    throw new Error("NOTEBOOKLM_SERVER_TOKEN est manquant.");
  }

  if (!NOTEBOOKLM_NOTEBOOK_ID) {
    throw new Error("NOTEBOOKLM_NOTEBOOK_ID est manquant.");
  }

  const response = await fetch(
    `${NOTEBOOKLM_API_URL}/v1/notebooks/${NOTEBOOKLM_NOTEBOOK_ID}/chat`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${NOTEBOOKLM_SERVER_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question,
      }),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `NotebookLM API ${response.status}: ${errorText}`,
    );
  }

  const data = (await response.json()) as NotebookLMResponse;

  if (!data.answer || typeof data.answer !== "string") {
    throw new Error("NotebookLM a retourné une réponse invalide.");
  }

  return data;
}

/**
 * Supprime uniquement les références de sources
 * générées par NotebookLM :
 *
 * [1]
 * [2]
 * [1, 3]
 * [2, 5, 8]
 */
export function cleanNotebookLMResponse(text: string): string {
  return text
    .replace(/\[\s*\d+(?:\s*,\s*\d+)*\s*\]/g, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\s+([,.!?;:])/g, "$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}