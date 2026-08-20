"use client";

import { useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SendIcon } from "@/components/home/icons";

export interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [value, setValue] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="w-full">
      <div className="flex items-end gap-2 rounded-2xl border border-input bg-card p-2 shadow-xs transition-colors focus-within:border-ring">
        <textarea
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              formRef.current?.requestSubmit();
            }
          }}
          rows={1}
          disabled={disabled}
          aria-label="Votre message à l’assistant"
          placeholder={disabled ? "L’assistant répond…" : "Posez votre question sur Tivaouane…"}
          className={cn(
            "max-h-40 min-h-[2.75rem] w-full resize-none bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/75",
            "focus-visible:outline-none",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        />
        <Button
          type="submit"
          size="icon"
          variant="accent"
          disabled={disabled || value.trim().length === 0}
          aria-label="Envoyer le message"
        >
          <SendIcon className="size-4.5" />
        </Button>
      </div>
      <p className="mt-2 text-center text-xs text-muted-foreground/75">
        Démonstration d’interface — les réponses ne sont pas basées sur une base documentaire.
      </p>
    </form>
  );
}