"use client";

import { useEffect, useRef, useState } from "react";

import { mockSuggestedQuestions, type SuggestedQuestion } from "@/lib/mock/assistant";
import type { ChatMessage as ChatMessageModel, ChatRequest, ChatResponse } from "@/types";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { SuggestedQuestions } from "./SuggestedQuestions";
import { TypingIndicator } from "./TypingIndicator";

const WELCOME_MESSAGE: ChatMessageModel = {
  id: "welcome",
  role: "assistant",
  content:
    "Assalamou alaykoum ! Je suis l’assistant de Tivaouane AI Guide. Posez-moi une question sur la ville : son histoire, ses mosquées, son artisanat, ses restaurants ou ses événements.",
};

export function Chat() {
  const [messages, setMessages] = useState<ChatMessageModel[]>([WELCOME_MESSAGE]);
  const [isTyping, setIsTyping] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isTyping]);

  function handleSend(text: string) {
    if (isTyping) return;

    const userMessage: ChatMessageModel = { id: crypto.randomUUID(), role: "user", content: text };
    setMessages((previous) => [...previous, userMessage]);
    setIsTyping(true);
    setErrorMessage(null);

    void handleAsk(text);
  }

  async function handleAsk(text: string) {
    try {
      const requestBody: ChatRequest = { message: text, history: messages };
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        let problem =
          "Une erreur s’est produite lors de la génération de la réponse. Veuillez réessayer.";
        try {
          const body: unknown = await response.json();
          const message =
            typeof body === "object" && body !== null
              ? (body as { error?: { message?: unknown } }).error?.message
              : undefined;
          if (typeof message === "string" && message) problem = message;
        } catch {
          // Le corps n’est pas exploitable : conserver le message par défaut.
        }
        throw new Error(problem);
      }

      const data = (await response.json()) as ChatResponse;
      setMessages((previous) => [...previous, data.message]);
    } catch (cause) {
      setErrorMessage(
        cause instanceof Error ? cause.message : "Une erreur est survenue. Veuillez réessayer.",
      );
    } finally {
      setIsTyping(false);
    }
  }

  function handleSuggestedQuestion(question: SuggestedQuestion) {
    handleSend(question.label);
  }

  return (
    <div className="flex h-[calc(100dvh-12rem)] min-h-[28rem] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-card sm:h-[calc(100dvh-10rem)]">
      <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {isTyping && <TypingIndicator />}

        {errorMessage && (
          <div className="rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive" role="alert">
            <p>{errorMessage}</p>
          </div>
        )}
      </div>

      <div className="border-t border-border p-4 sm:p-6">
        <ChatInput onSend={handleSend} disabled={isTyping} />
        {messages.length === 1 && (
          <div className="mt-4">
            <SuggestedQuestions
              questions={mockSuggestedQuestions}
              onSelect={handleSuggestedQuestion}
              disabled={isTyping}
            />
          </div>
        )}
      </div>

      <div ref={scrollRef} aria-hidden="true" className="sr-only" />
    </div>
  );
}