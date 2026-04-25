import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* ────────────────────────────────────────────────────────────────
   Formatters — the visual rhythm of the dashboard. We use Egyptian
   conventions where possible (Latin-Arabic mixed numerals are fine).
   ──────────────────────────────────────────────────────────────── */

export function formatNumber(n: number | null | undefined, fallback = "—"): string {
  if (n == null || Number.isNaN(n)) return fallback;
  return new Intl.NumberFormat("en-US").format(n);
}

export function formatPercent(n: number | null | undefined, decimals = 1): string {
  if (n == null || Number.isNaN(n)) return "—";
  return `${n.toFixed(decimals)}%`;
}

/** E.164-without-+ → +20 12 3456 7890 style spacing */
export function formatPhone(raw: string | null | undefined): string {
  if (!raw) return "—";
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("20") && digits.length === 12) {
    // +20 1X XXXX XXXX
    return `+${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 8)} ${digits.slice(8)}`;
  }
  return raw.startsWith("+") ? raw : `+${digits}`;
}

/** "12 Apr 2026" — month name keeps it editorial */
export function formatDate(iso: string | Date | null | undefined): string {
  if (!iso) return "—";
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

/** "12 Apr · 14:32" — for time-of-day inside long lists */
export function formatDateTime(iso: string | Date | null | undefined): string {
  if (!iso) return "—";
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return "—";
  const date = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
  }).format(d);
  const time = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
  return `${date} · ${time}`;
}

/** "منذ 12 دقيقة" / "12 min ago" — Arabic when locale is RTL */
export function relativeTime(
  iso: string | Date | null | undefined,
  locale: "ar" | "en" = "ar",
): string {
  if (!iso) return "—";
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return "—";

  const diffMs = Date.now() - d.getTime();
  const sec = Math.round(diffMs / 1000);
  const min = Math.round(sec / 60);
  const hr = Math.round(min / 60);
  const day = Math.round(hr / 24);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  if (sec < 60) return rtf.format(-sec, "second");
  if (min < 60) return rtf.format(-min, "minute");
  if (hr < 24) return rtf.format(-hr, "hour");
  if (day < 30) return rtf.format(-day, "day");
  return formatDate(d);
}

export function truncate(s: string | null | undefined, max: number): string {
  if (!s) return "";
  return s.length <= max ? s : `${s.slice(0, max - 1)}…`;
}

/** Copy-to-clipboard with promise — used by signup deed page */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Fallback for non-HTTPS dev origins
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}
