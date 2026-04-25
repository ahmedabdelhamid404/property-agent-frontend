"use client";

import { cn } from "@/lib/utils";
import { forwardRef, type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const base =
  "inline-flex items-center justify-center gap-2 font-[family-name:var(--font-serif)] " +
  "transition-[background,color,border-color,box-shadow] duration-200 " +
  "disabled:opacity-50 disabled:cursor-not-allowed " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-brick)]";

const variants: Record<Variant, string> = {
  primary:
    "bg-[color:var(--color-ink)] text-[color:var(--color-paper-cream)] " +
    "hover:bg-[color:var(--color-brick-deep)] " +
    "shadow-[var(--shadow-leaf)]",
  secondary:
    "bg-[color:var(--color-paper-cream)] text-[color:var(--color-ink)] " +
    "border border-[color:var(--color-rule-strong)] " +
    "hover:border-[color:var(--color-ink)] hover:bg-[color:var(--color-vellum)]",
  ghost:
    "bg-transparent text-[color:var(--color-ink)] " +
    "hover:bg-[color:var(--color-brick-tint)]",
  destructive:
    "bg-[color:var(--color-err)] text-[color:var(--color-paper-cream)] " +
    "hover:opacity-90",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-[0.85rem] rounded-[var(--radius-xs)]",
  md: "h-11 px-5 text-[0.95rem] rounded-[var(--radius-sm)]",
  lg: "h-13 px-7 text-[1.05rem] rounded-[var(--radius-sm)]",
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
