"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Sparkline } from "./Sparkline";

type Tone = "brand" | "accent" | "success" | "warn" | "error";

interface Props {
  label: string;
  value: ReactNode;
  hint?: string;
  /** Percentage change vs comparison window. Positive = green up, negative = red down (or red up for "response time"-style metrics where lower is better). */
  trend?: number;
  trendLabel?: string;
  /** When true, a negative trend is *good* (e.g., response time getting faster). Inverts color logic. */
  trendInverse?: boolean;
  sparkline?: { v: number }[];
  tone?: Tone;
  /** When true, card uses elevated brand-soft background to draw attention. */
  hero?: boolean;
  icon?: ReactNode;
  className?: string;
}

const TONE_COLORS: Record<Tone, string> = {
  brand: "var(--color-teal-600)",
  accent: "var(--color-gold-500)",
  success: "var(--color-mint-400)",
  warn: "var(--color-warn)",
  error: "var(--color-error)",
};

/**
 * Modern fintech KPI card: label up top with optional icon chip, big
 * tabular value, then optional sparkline + trend pill at the bottom.
 * Hover lifts subtly. Hero variant draws attention with brand-soft
 * background + elevated shadow.
 */
export function BentoStatCard({
  label,
  value,
  hint,
  trend,
  trendLabel,
  trendInverse,
  sparkline,
  tone = "brand",
  hero,
  icon,
  className,
}: Props) {
  const trendIsPositive = trend !== undefined && (trendInverse ? trend < 0 : trend > 0);
  const trendIsNegative = trend !== undefined && (trendInverse ? trend > 0 : trend < 0);
  const trendColor = trendIsPositive
    ? "text-[color:var(--color-mint-500)] bg-[color:var(--color-mint-100)]"
    : trendIsNegative
      ? "text-[color:var(--color-error)] bg-[rgba(194,85,76,0.10)]"
      : "text-[color:var(--color-fg-tertiary)] bg-[color:var(--color-bg-sunken)]";

  return (
    <div
      className={cn(
        "rounded-[var(--radius-md)] border p-5 transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)]",
        hero
          ? "bg-[color:var(--color-bg-brand-soft)] border-[color:var(--color-bg-brand-soft)] shadow-[var(--shadow-subtle)]"
          : "bg-[color:var(--color-bg-surface)] border-[color:var(--color-border-subtle)] shadow-[var(--shadow-subtle)]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <div className="font-[family-name:var(--font-display)] text-[0.78rem] font-semibold uppercase tracking-[0.06em] text-[color:var(--color-fg-tertiary)] mb-1">
            {label}
          </div>
          {hint ? (
            <div className="font-[family-name:var(--font-body)] text-[0.78rem] text-[color:var(--color-fg-tertiary)]">
              {hint}
            </div>
          ) : null}
        </div>
        {icon ? (
          <div
            className="size-9 rounded-full flex items-center justify-center shrink-0"
            style={{
              background: hero
                ? "rgba(255,255,255,0.6)"
                : "var(--color-bg-sunken)",
              color: TONE_COLORS[tone],
            }}
          >
            {icon}
          </div>
        ) : null}
      </div>

      <div
        className="font-[family-name:var(--font-display)] text-[2rem] font-semibold tracking-[-0.02em] leading-none tabular-nums text-[color:var(--color-fg-primary)] mb-3"
        dir="ltr"
      >
        {value}
      </div>

      {sparkline && sparkline.length > 0 ? (
        <div className="mb-2">
          <Sparkline data={sparkline} color={TONE_COLORS[tone]} height={32} />
        </div>
      ) : null}

      {trend !== undefined ? (
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full",
              "font-[family-name:var(--font-display)] text-[0.74rem] font-semibold tabular-nums",
              trendColor,
            )}
            dir="ltr"
          >
            {trend > 0 ? "↑" : trend < 0 ? "↓" : "·"}
            {Math.abs(trend).toFixed(trend % 1 === 0 ? 0 : 1)}%
          </span>
          {trendLabel ? (
            <span className="font-[family-name:var(--font-body)] text-[0.78rem] text-[color:var(--color-fg-tertiary)]">
              {trendLabel}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
