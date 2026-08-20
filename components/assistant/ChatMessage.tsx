import { cn } from "@/lib/utils";
import { SparkleIcon, UserIcon } from "@/components/home/icons";

import type { AssistantMessage } from "@/lib/mock/assistant";

export interface ChatMessageProps {
  message: AssistantMessage;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex w-full items-start gap-3",
        isUser ? "flex-row-reverse" : "flex-row",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "mt-1 flex size-9 shrink-0 items-center justify-center rounded-full",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-accent text-accent-foreground",
        )}
      >
        {isUser ? <UserIcon className="size-4.5" /> : <SparkleIcon className="size-4.5" />}
      </span>

      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed sm:max-w-[75%]",
          isUser
            ? "rounded-tr-sm bg-primary text-primary-foreground"
            : "rounded-tl-sm bg-card border border-border text-foreground",
        )}
      >
        <p className="whitespace-pre-line">{message.content}</p>
      </div>
    </div>
  );
}