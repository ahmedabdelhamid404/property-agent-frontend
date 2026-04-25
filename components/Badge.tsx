import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Tone = "neutral" | "ok" | "warn" | "err" | "brick" | "teal";

interface Props {
  tone?: Tone;
  children: ReactNode;
  className?: string;
  dot?: boolean;
}

const tones: Record<Tone, string> = {
  neutral:
    "text-[color:var(--color-ink-soft)] border-[color:var(--color-rule-strong)] bg-[color:var(--color-paper-cream)]",
  ok:
    "text-[color:var(--color-ok)] border-[color:var(--color-ok)] bg-[color:var(--color-ok-tint)]",
  warn:
    "text-[color:var(--color-warn)] border-[color:var(--color-warn)] bg-[color:var(--color-warn-tint)]",
  err:
    "text-[color:var(--color-err)] border-[color:var(--color-err)] bg-[color:var(--color-err-tint)]",
  brick:
    "text-[color:var(--color-brick-deep)] border-[color:var(--color-brick)] bg-[color:var(--color-brick-tint)]",
  teal:
    "text-[color:var(--color-teal)] border-[color:var(--color-teal)] bg-[color:var(--color-teal-tint)]",
};

const dotColor: Record<Tone, string> = {
  neutral: "bg-[color:var(--color-ink-faint)]",
  ok: "bg-[color:var(--color-ok)]",
  warn: "bg-[color:var(--color-warn)]",
  err: "bg-[color:var(--color-err)]",
  brick: "bg-[color:var(--color-brick)]",
  teal: "bg-[color:var(--color-teal)]",
};

export function Badge({ tone = "neutral", children, className, dot }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5",
        "font-[family-name:var(--font-serif)] text-[0.78rem] tracking-[0.02em]",
        "border rounded-[var(--radius-xs)]",
        tones[tone],
        className,
      )}
    >
      {dot ? <span className={cn("size-1.5 rounded-full", dotColor[tone])} aria-hidden /> : null}
      {children}
    </span>
  );
}
