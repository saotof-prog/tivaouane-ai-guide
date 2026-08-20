import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Adds an error style driven by the `aria-invalid` accessibility attribute. */
  invalid?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          "min-h-[9rem] w-full rounded-xl border border-input bg-card px-4 py-3 text-base text-foreground shadow-xs transition-colors",
          "placeholder:text-muted-foreground/75",
          "hover:border-foreground/25",
          "focus-visible:border-ring focus-visible:outline-none",
          "aria-invalid:border-destructive aria-invalid:focus-visible:border-destructive",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "resize-y",
          className,
        )}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";