import { cn } from "@/lib/utils";
import { SparkleIcon, UserIcon, BookIcon } from "@/components/home/icons";

import type { ChatMessage, Source } from "@/types";

export interface ChatMessageProps {
  message: ChatMessage;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const sources = message.sources?.length ? message.sources : undefined;

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

        {sources && !isUser && (
          <details className="mt-3 border-t border-border/50 pt-3" open>
            <summary className="flex items-center gap-2 text-xs font-medium text-muted-foreground cursor-pointer">
              <BookIcon className="size-3.5 shrink-0" aria-hidden="true" />
              Sources ({sources.length})
            </summary>
            <ul className="mt-2 space-y-1.5">
              {sources.map((source: Source) => (
                <li key={source.id} className="text-xs text-muted-foreground/80">
                  <span className="font-medium">{source.title}</span>
                  {source.author && <span className="mx-1">—</span>}
                  {source.author && <span>{source.author}</span>}
                  {source.type && <span className="mx-1">({source.type})</span>}
                  {source.publishedAt && (
                    <time className="mx-1" dateTime={source.publishedAt}>
                      {new Date(source.publishedAt).toLocaleDateString("fr-FR", { year: "numeric", month: "long" })}
                    </time>
                  )}
                  {source.url && (
                    <a href={source.url} target="_blank" rel="noopener noreferrer" className="ml-1 underline hover:text-primary">
                      ↗
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>
    </div>
  );
}