"use client";

import { Toaster } from "sonner";
import { useI18n } from "./I18nProvider";

/**
 * Wraps Sonner's Toaster so its dir prop tracks the live locale.
 * Sonner reads dir on each render — the I18nProvider re-renders
 * when locale flips, so this re-applies automatically.
 */
export function LocaleAwareToaster() {
  const { dir } = useI18n();
  return (
    <Toaster
      position="bottom-center"
      dir={dir}
      richColors={false}
      closeButton={false}
      toastOptions={{
        style: {
          fontFamily:
            dir === "rtl" ? "var(--font-arabic)" : "var(--font-body)",
          background: "var(--color-bg-surface)",
          color: "var(--color-fg-primary)",
          border: "1px solid var(--color-border-subtle)",
          borderRadius: "var(--radius-sm)",
          boxShadow: "var(--shadow-card)",
        },
      }}
    />
  );
}
