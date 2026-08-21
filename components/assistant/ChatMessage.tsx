import { cn } from "@/lib/utils";
import { SparkleIcon, UserIcon, BookIcon, MapPinIcon } from "@/components/home/icons";

import type { ChatMessage, Source } from "@/types";

export interface ChatMessageProps {
  message: ChatMessage;
}

function LocationMap({ location }: { location: ChatMessage["location"] }) {
  if (!location) return null;

  const { latitude, longitude, name, zoom = 15 } = location;
  const embedUrl = `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d${Math.round(
    156412 * Math.pow(2, 15 - zoom)
  )}!2d${longitude}!3d${latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sfr!2ssn!4v${Date.now()}!5m2!1sfr!2ssn`;

  return (
    <div className="mt-4 rounded-xl border border-border/50 overflow-hidden bg-muted/30">
      <div className="flex items-center justify-between px-3 py-2 bg-muted/50 border-b border-border/50">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <MapPinIcon className="size-4 text-primary" aria-hidden="true" />
          <span>{name ?? "Localisation"}</span>
        </div>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline px-2 py-1 rounded bg-primary/10"
        >
          Ouvrir dans Google Maps
        </a>
      </div>
      <iframe
        title={`Carte de ${name ?? "la localisation"}`}
        src={embedUrl}
        width="100%"
        height={300}
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="block"
      />
    </div>
  );
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const sources = message.sources?.length ? message.sources : undefined;
  const location = message.location;

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

        {/* Carte Google Maps si localisation détectée */}
        {location && !isUser && <LocationMap location={location} />}

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