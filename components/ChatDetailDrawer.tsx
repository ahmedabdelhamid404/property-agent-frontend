"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { apiBroker, type ChatTurnLogRow, type SessionTranscript } from "@/lib/api";
import { useI18n } from "./I18nProvider";
import { cn, formatPhone, relativeTime } from "@/lib/utils";
import { useBrokerEvents } from "@/lib/useBrokerEvents";

/**
 * T7 — Slide-in drawer that shows the FULL conversation for a chat session.
 * Replaces the prior "LastMessageExcerpt" preview which only showed 80 chars.
 *
 * Three sections:
 *   1. Header — customer phone, platform, broker-handling badge.
 *   2. Transcript — every turn rendered as a chat bubble (user/bot), with
 *      a collapsible Debug panel showing T6 metadata (route, retrieved IDs,
 *      risk flags) so the broker can see WHY the bot answered the way it did.
 *   3. Action footer — "Take over" / "Hand back" + "Close".
 *
 * SSE keeps the transcript fresh: when a takeover/handback event lands for
 * THIS session id, we re-fetch the transcript so the badge updates without a
 * page refresh.
 */
export function ChatDetailDrawer({
  sessionId,
  onClose,
}: {
  sessionId: number | null;
  onClose: () => void;
}) {
  const { t, locale } = useI18n();
  const [data, setData] = useState<SessionTranscript | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const open = sessionId != null;

  const load = useCallback(async () => {
    if (!sessionId) return;
    setLoading(true);
    setError(null);
    try {
      const r = await apiBroker.sessionTranscript(sessionId);
      setData(r);
    } catch {
      setError(t("dashboard.chat.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [sessionId, t]);

  useEffect(() => {
    if (open) load();
    else setData(null);
  }, [open, load]);

  // Lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // ESC closes.
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Refresh on takeover/handback for our session.
  useBrokerEvents({
    onTakeover: (p) => {
      if (sessionId && p.sessionId === sessionId) load();
    },
    onHandback: (p) => {
      if (sessionId && p.sessionId === sessionId) load();
    },
  });

  async function takeOver() {
    if (!sessionId) return;
    setPending(true);
    try {
      await apiBroker.takeOverSession(sessionId);
      toast.success(t("dashboard.takeover.success"));
      load();
    } catch {
      toast.error(t("dashboard.takeover.failed"));
    } finally {
      setPending(false);
    }
  }

  async function handBack() {
    if (!sessionId) return;
    setPending(true);
    try {
      await apiBroker.handBackSession(sessionId);
      toast.success(t("dashboard.takeover.handbackSuccess"));
      load();
    } catch {
      toast.error(t("dashboard.takeover.failed"));
    } finally {
      setPending(false);
    }
  }

  return (
    <div
      aria-hidden={!open}
      className={cn(
        "fixed inset-0 z-50",
        open ? "pointer-events-auto" : "pointer-events-none",
      )}
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label={t("common.cancel")}
        onClick={onClose}
        tabIndex={open ? 0 : -1}
        className={cn(
          "absolute inset-0 bg-[rgba(13,74,74,0.4)] backdrop-blur-sm transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0",
        )}
      />

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "absolute inset-y-0 end-0 w-full md:w-[640px] max-w-[100vw]",
          "bg-[color:var(--color-bg-canvas)]",
          "border-s border-[color:var(--color-border-subtle)]",
          "shadow-[var(--shadow-hero)] flex flex-col",
          "transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]",
          open ? "translate-x-0" : "translate-x-full rtl:-translate-x-full",
        )}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[color:var(--color-border-subtle)] flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-[family-name:var(--font-display)] text-[1.05rem] font-semibold truncate">
              {t("dashboard.chat.title")}
              {data ? (
                <span className="ms-2 text-[color:var(--color-fg-tertiary)] font-normal">
                  · #{data.id}
                </span>
              ) : null}
            </h3>
            {data ? (
              <p className="text-[0.82rem] text-[color:var(--color-fg-tertiary)] mt-0.5">
                {formatPhone(extractPhone(data.userId))} · {data.platform} ·{" "}
                {data.turnCount} {t("dashboard.chat.turns")}
                {data.isBrokerHandling ? (
                  <span className="ms-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[color:var(--color-warning)]/15 text-[color:var(--color-warning)] text-[0.72rem] font-medium">
                    <span className="size-1.5 rounded-full bg-[color:var(--color-warning)]" />
                    {t("dashboard.takeover.handlingBadge")}
                  </span>
                ) : null}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("common.cancel")}
            className="size-9 inline-flex items-center justify-center rounded-full hover:bg-[color:var(--color-bg-sunken)]"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {loading ? (
            <div className="space-y-3">
              <div className="skeleton h-12 rounded-[var(--radius-md)]" />
              <div className="skeleton h-12 rounded-[var(--radius-md)] w-3/4" />
              <div className="skeleton h-12 rounded-[var(--radius-md)]" />
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <p className="text-[color:var(--color-error)]">{error}</p>
              <button
                type="button"
                onClick={load}
                className="mt-3 text-[color:var(--color-fg-brand)] hover:underline"
              >
                {t("common.retry")}
              </button>
            </div>
          ) : data && data.turns.length === 0 ? (
            <p className="text-center py-10 text-[color:var(--color-fg-tertiary)]">
              {t("dashboard.chat.empty")}
            </p>
          ) : data ? (
            <ul className="space-y-4">
              {data.turns.map((turn) => (
                <li key={turn.turnIndex}>
                  <TurnBubbles turn={turn} locale={locale} />
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[color:var(--color-border-subtle)] flex items-center justify-between gap-3 bg-[color:var(--color-bg-surface)]">
          <span className="text-[0.78rem] text-[color:var(--color-fg-tertiary)]">
            {data?.isBrokerHandling
              ? t("dashboard.takeover.handlingHint")
              : t("dashboard.takeover.botHandlingHint")}
          </span>
          {data?.isBrokerHandling ? (
            <button
              type="button"
              onClick={handBack}
              disabled={pending}
              className={cn(
                "h-10 px-4 rounded-full font-medium text-[0.88rem]",
                "border border-[color:var(--color-border-default)]",
                "bg-[color:var(--color-bg-surface)]",
                "hover:border-[color:var(--color-fg-brand)] hover:text-[color:var(--color-fg-brand)]",
                "disabled:opacity-60",
              )}
            >
              {t("dashboard.takeover.handback")}
            </button>
          ) : (
            <button
              type="button"
              onClick={takeOver}
              disabled={pending || !data}
              className={cn(
                "h-10 px-4 rounded-full font-medium text-[0.88rem]",
                "bg-[color:var(--color-fg-brand)] text-[color:var(--color-fg-inverse)]",
                "hover:opacity-90 disabled:opacity-60",
              )}
            >
              {t("dashboard.takeover.takeover")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────
   One turn = customer bubble + bot bubble + collapsible debug panel
   ────────────────────────────────────────────────────────────────── */

function TurnBubbles({ turn, locale }: { turn: ChatTurnLogRow; locale: "ar" | "en" }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  const hasRiskFlags = (turn.hallucinationRiskFlags?.length ?? 0) > 0;

  return (
    <div className="space-y-2">
      {/* Customer bubble */}
      {turn.userMessage ? (
        <div className="flex justify-end">
          <div className="max-w-[85%] px-3.5 py-2.5 rounded-[18px] rounded-ee-sm bg-[color:var(--color-bg-brand-soft)] text-[color:var(--color-fg-primary)]">
            <p className="text-[0.92rem] whitespace-pre-wrap break-words">
              {turn.userMessage}
            </p>
            <span className="text-[0.7rem] text-[color:var(--color-fg-tertiary)] mt-1 block">
              {turn.inputModality === "Voice" ? "🎙 " : ""}
              {relativeTime(turn.createdAt, locale)}
            </span>
          </div>
        </div>
      ) : null}

      {/* Bot bubble */}
      {turn.assistantReply ? (
        <div className="flex justify-start">
          <div
            className={cn(
              "max-w-[85%] px-3.5 py-2.5 rounded-[18px] rounded-ss-sm",
              "bg-[color:var(--color-bg-surface)] border border-[color:var(--color-border-subtle)]",
            )}
          >
            <p className="text-[0.92rem] whitespace-pre-wrap break-words text-[color:var(--color-fg-primary)]">
              {turn.assistantReply}
            </p>
          </div>
        </div>
      ) : null}

      {/* Debug panel toggle */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "text-[0.72rem] text-[color:var(--color-fg-tertiary)] hover:underline inline-flex items-center gap-1.5",
          hasRiskFlags && "text-[color:var(--color-warning)]",
        )}
      >
        <span aria-hidden>{open ? "▼" : "▶"}</span>
        {t("dashboard.chat.debugLabel")}
        {turn.routeTaken ? (
          <span className="px-1.5 py-0.5 rounded bg-[color:var(--color-bg-sunken)] font-mono text-[0.68rem]">
            {turn.routeTaken}
          </span>
        ) : null}
        {hasRiskFlags ? (
          <span className="text-[color:var(--color-warning)] font-medium">
            ⚠ {turn.hallucinationRiskFlags?.length}
          </span>
        ) : null}
        <span className="text-[color:var(--color-fg-tertiary)]">
          · {turn.latencyMs}ms · {turn.modelUsed}
        </span>
      </button>

      {open ? (
        <div className="text-[0.78rem] bg-[color:var(--color-bg-sunken)] rounded-[var(--radius-sm)] p-3 space-y-1.5 font-mono">
          <DebugRow label="Route" value={turn.routeTaken ?? "—"} />
          <DebugRow
            label="Listings"
            value={
              turn.retrievedListingIds?.length
                ? turn.retrievedListingIds.join(", ")
                : "—"
            }
          />
          <DebugRow
            label="Knowledge"
            value={
              turn.retrievedKnowledgeIds?.length
                ? turn.retrievedKnowledgeIds.join(", ")
                : "—"
            }
          />
          <DebugRow
            label="Risk flags"
            value={
              hasRiskFlags ? (turn.hallucinationRiskFlags ?? []).join(", ") : "—"
            }
            danger={hasRiskFlags}
          />
          <DebugRow label="Modality" value={turn.inputModality} />
          <DebugRow label="Addr by name" value={turn.addressedByName ? "yes" : "no"} />
        </div>
      ) : null}
    </div>
  );
}

function DebugRow({
  label,
  value,
  danger,
}: {
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div className="flex gap-2">
      <span className="w-[100px] shrink-0 text-[color:var(--color-fg-tertiary)]">
        {label}
      </span>
      <span
        className={cn(
          "flex-1 break-all",
          danger
            ? "text-[color:var(--color-warning)] font-medium"
            : "text-[color:var(--color-fg-primary)]",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-5">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function extractPhone(userId: string | null | undefined): string | null {
  if (!userId) return null;
  return userId.startsWith("wa:") ? userId.slice(3) : userId;
}
