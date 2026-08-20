import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Adds an error style driven by the `aria-invalid` accessibility attribute. */
  invalid?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, type = "text", ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        aria-invalid={invalid || undefined}
        className={cn(
          "h-11 w-full rounded-xl border border-input bg-card px-4 text-base text-foreground shadow-xs transition-colors",
          "placeholder:text-muted-foreground/75",
          "hover:border-foreground/25",
          "focus-visible:border-ring focus-visible:outline-none",
          "aria-invalid:border-destructive aria-invalid:focus-visible:border-destructive",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";