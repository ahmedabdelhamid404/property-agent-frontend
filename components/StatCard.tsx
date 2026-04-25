import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface Props {
  label: string;
  labelEn?: string;
  value: ReactNode;
  hint?: string;
  tone?: "default" | "ok" | "warn" | "err";
  className?: string;
}

const tones = {
  default: "",
  ok: "text-[color:var(--color-ok)]",
  warn: "text-[color:var(--color-warn)]",
  err: "text-[color:var(--color-err)]",
};

/**
 * A stat card styled as a ledger entry — small uppercase label,
 * generous figure typography below, optional editorial hint.
 */
export function StatCard({ label, labelEn, value, hint, tone = "default", className }: Props) {
  return (
    <div className={cn("sheet p-6 md:p-7", className)}>
      <div className="flex items-baseline justify-between gap-3 mb-3">
        <span className="eyebrow">{label}</span>
        {labelEn ? (
          <span
            className="font-[family-name:var(--font-serif)] italic text-[0.78rem] text-[color:var(--color-ink-faint)]"
            dir="ltr"
            lang="en"
          >
            {labelEn}
          </span>
        ) : null}
      </div>
      <div className={cn("figure tabular numerals", tones[tone])}>{value}</div>
      {hint ? (
        <p className="mt-2 font-[family-name:var(--font-serif)] italic text-[0.88rem] text-[color:var(--color-ink-faint)]">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
