import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = {
  variant: {
    primary:
      "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 active:bg-primary/95",
    secondary:
      "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/90",
    accent:
      "bg-accent text-accent-foreground shadow-gold hover:bg-accent/90 active:bg-accent/95",
    outline:
      "border border-border bg-transparent text-foreground hover:bg-muted active:bg-muted/70",
    ghost: "bg-transparent text-foreground hover:bg-muted active:bg-muted/70",
    destructive:
      "bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90",
    link: "text-primary underline-offset-4 hover:underline",
  },
  size: {
    sm: "h-9 gap-2 rounded-full px-4 text-sm",
    md: "h-11 gap-2 rounded-full px-6 text-sm",
    lg: "h-12 gap-2.5 rounded-full px-8 text-base",
    icon: "size-11 rounded-full",
  },
} as const;

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonVariants.variant;
  size?: keyof typeof buttonVariants.size;
  loading?: boolean;
  href?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      href,
      children,
      disabled,
      type = "button",
      ...props
    },
    ref,
  ) => {
    const classes = cn(
      "inline-flex cursor-pointer items-center justify-center whitespace-nowrap font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
      buttonVariants.variant[variant],
      buttonVariants.size[size],
      className,
    );

    if (href) {
      return (
        <a className={classes} href={href} aria-disabled={disabled}>
          {children}
        </a>
      );
    }

    return (
      <button
        ref={ref}
        type={type}
        className={classes}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading ? (
          <span
            aria-hidden="true"
            className="size-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
          />
        ) : null}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";

export interface IconButtonProps extends ButtonProps {
  label: string;
}

export function IconButton({ label, size = "icon", children, ...props }: IconButtonProps) {
  return (
    <Button aria-label={label} size={size} {...props}>
      {children}
    </Button>
  );
}