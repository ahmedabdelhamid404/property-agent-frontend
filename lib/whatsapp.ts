/**
 * Build the broker's wa.me magic link client-side. We prefer whatever
 * the backend returns (single source of truth) but fall back to this
 * helper when the platform's WhatsApp:BusinessNumber env var hasn't
 * been wired on the API yet — the number itself is public, so there's
 * no leak in baking it into the bundle.
 */

const FALLBACK_BUSINESS_NUMBER = "+15556427792";
const GREETING = "السلام عليكم";

export function buildWhatsappLink(
  magicCode: string | null | undefined,
): string | null {
  if (!magicCode) return null;
  const raw =
    process.env.NEXT_PUBLIC_WHATSAPP_BUSINESS_NUMBER ?? FALLBACK_BUSINESS_NUMBER;
  const digits = raw.replace(/\D/g, "");
  if (!digits) return null;
  const text = encodeURIComponent(`BR-${magicCode} ${GREETING}`);
  return `https://wa.me/${digits}?text=${text}`;
}

/** Resolve "best available" wa.me link — backend value wins, else build it. */
export function resolveWhatsappLink(
  fromBackend: string | null | undefined,
  magicCode: string | null | undefined,
): string | null {
  if (fromBackend && fromBackend.trim().length > 0) return fromBackend;
  return buildWhatsappLink(magicCode);
}
