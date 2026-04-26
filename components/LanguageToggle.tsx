"use client";

import { useI18n } from "./I18nProvider";
import { otherLocale } from "@/lib/i18n";

interface Props {
  className?: string;
  /** When true, render compact icon-style for tight nav bars. */
  compact?: boolean;
}

/**
 * Pill toggle that flips locale + html dir/lang.
 * Shows "EN | AR" with the current side highlighted.
 */
export function LanguageToggle({ className, compact }: Props) {
  const { locale, setLocale, hydrated } = useI18n();

  const flip = () => setLocale(otherLocale(locale));

  // Pre-hydration: render a stable shell so SSR matches CSR.
  if (!hydrated) {
    return (
      <div
        aria-hidden
        className={
          "inline-flex items-center gap-1 rounded-full border border-[color:var(--color-border-subtle)] " +
          "bg-[color:var(--color-bg-surface)] px-1 py-1 " +
          (className ?? "")
        }
      >
        <span className="px-3 py-1 text-[0.78rem] font-semibold text-[color:var(--color-fg-tertiary)]">
          EN
        </span>
        <span className="px-3 py-1 text-[0.78rem] font-semibold text-[color:var(--color-fg-tertiary)]">
          AR
        </span>
      </div>
    );
  }

  const pillBase =
    "px-3 py-1 rounded-full text-[0.78rem] font-semibold transition-colors duration-200 " +
    "font-[family-name:var(--font-display)]";
  const onCls =
    "bg-[color:var(--color-bg-brand)] text-[color:var(--color-fg-inverse)]";
  const offCls =
    "text-[color:var(--color-fg-tertiary)] hover:text-[color:var(--color-fg-primary)]";

  return (
    <button
      type="button"
      onClick={flip}
      aria-label={locale === "en" ? "Switch to Arabic" : "التبديل للإنجليزية"}
      className={
        "inline-flex items-center gap-1 rounded-full border border-[color:var(--color-border-subtle)] " +
        "bg-[color:var(--color-bg-surface)] p-1 " +
        "hover:border-[color:var(--color-border-default)] transition-colors " +
        (compact ? "scale-95 " : "") +
        (className ?? "")
      }
    >
      <span className={`${pillBase} ${locale === "en" ? onCls : offCls}`}>
        EN
      </span>
      <span className={`${pillBase} ${locale === "ar" ? onCls : offCls}`}>
        AR
      </span>
    </button>
  );
}
