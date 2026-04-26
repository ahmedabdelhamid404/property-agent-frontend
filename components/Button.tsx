"use client";

import { cn } from "@/lib/utils";
import { forwardRef, type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "accent" | "destructive";
type Size = "sm" | "md" | "lg";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const base =
  "inline-flex items-center justify-center gap-2 font-[family-name:var(--font-display)] font-medium " +
  "transition-[background,color,border-color,box-shadow,transform] duration-200 " +
  "disabled:opacity-50 disabled:cursor-not-allowed " +
  "active:translate-y-px " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-focus-ring)]";

const variants: Record<Variant, string> = {
  primary:
    "bg-[color:var(--color-bg-brand)] text-[color:var(--color-fg-inverse)] " +
    "hover:bg-[color:var(--color-bg-brand-hover)] " +
    "shadow-[var(--shadow-subtle)] hover:shadow-[var(--shadow-card)]",
  secondary:
    "bg-[color:var(--color-bg-surface)] text-[color:var(--color-fg-primary)] " +
    "border border-[color:var(--color-border-subtle)] " +
    "hover:border-[color:var(--color-border-default)] hover:bg-[color:var(--color-bg-sunken)]",
  ghost:
    "bg-transparent text-[color:var(--color-fg-secondary)] " +
    "hover:bg-[color:var(--color-bg-sunken)] hover:text-[color:var(--color-fg-primary)]",
  accent:
    "bg-[color:var(--color-bg-accent)] text-[color:var(--color-neutral-900)] " +
    "hover:brightness-95 " +
    "shadow-[var(--shadow-subtle)]",
  destructive:
    "bg-[color:var(--color-error)] text-[color:var(--color-fg-inverse)] " +
    "hover:opacity-90",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-[0.85rem] rounded-full",
  md: "h-11 px-5 text-[0.95rem] rounded-full",
  lg: "h-13 px-7 text-[1.05rem] rounded-full",
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { className, variant = "primary", size = "md", loading, disabled, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <span
          aria-hidden
          className="inline-block size-3.5 rounded-full border-2 border-current border-t-transparent animate-spin"
        />
      ) : null}
      {children}
    </button>
  );
});
