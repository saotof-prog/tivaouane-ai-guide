"use client";

import { useEffect, useRef, useState } from "react";

import {
  getMockReply,
  mockSuggestedQuestions,
  type AssistantMessage,
  type SuggestedQuestion,
} from "@/lib/mock/assistant";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { SuggestedQuestions } from "./SuggestedQuestions";
import { TypingIndicator } from "./TypingIndicator";

const BOT_DELAY_MS = 900;

const WELCOME_MESSAGE: AssistantMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Assalamou alaykoum ! Je suis l’assistant de Tivaouane AI Guide. Je vous aiderai bientôt à découvrir la ville, ses lieux, son histoire et ses traditions. Posez-moi une question pour tester l’interface.",
};

export function Chat() {
  const [messages, setMessages] = useState<AssistantMessage[]>([WELCOME_MESSAGE]);
  const [isTyping, setIsTyping] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isTyping]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function handleSend(text: string) {
    if (isTyping) return;

    const userMessage = { id: crypto.randomUUID(), role: "user" as const, content: text };
    setMessages((previous) => [...previous, userMessage]);
    setIsTyping(true);
    setErrorMessage(null);

    timerRef.current = setTimeout(() => {
      const answered = handleAsk(text);
      if (!answered) return;
      setIsTyping(false);
    }, BOT_DELAY_MS);
  }

  function handleAsk(text: string): boolean {
    try {
      const reply = getMockReply(text);
      setMessages((previous) => [
        ...previous,
        { id: crypto.randomUUID(), role: "assistant" as const, content: reply },
      ]);
      return true;
    } catch {
      setErrorMessage(
        "Une erreur s’est produite lors de la génération de la réponse. Veuillez réessayer.",
      );
      setIsTyping(false);
      return false;
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