"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  DEFAULT_LOCALE,
  LOCALES,
  type Locale,
  STORAGE_KEY,
  dirOf,
  lookup,
} from "@/lib/i18n";

interface I18nValue {
  locale: Locale;
  dir: "ltr" | "rtl";
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
  hydrated: boolean;
}

const I18nContext = createContext<I18nValue | null>(null);

function readStored(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw && (LOCALES as readonly string[]).includes(raw)) return raw as Locale;
  return DEFAULT_LOCALE;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [hydrated, setHydrated] = useState(false);

  // On mount, sync from localStorage and reflect on <html>.
  useEffect(() => {
    const initial = readStored();
    setLocaleState(initial);
    document.documentElement.setAttribute("lang", initial);
    document.documentElement.setAttribute("dir", dirOf(initial));
    setHydrated(true);
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.setAttribute("lang", next);
    document.documentElement.setAttribute("dir", dirOf(next));
  }, []);

  const value = useMemo<I18nValue>(
    () => ({
      locale,
      dir: dirOf(locale),
      setLocale,
      t: (key) => lookup(locale, key),
      hydrated,
    }),
    [locale, setLocale, hydrated],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used inside <I18nProvider>");
  }
  return ctx;
}

/** Convenience: just the t() function. */
export function useT() {
  return useI18n().t;
}
