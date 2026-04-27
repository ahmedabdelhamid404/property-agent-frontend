"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { apiBroker, type BrokerNotification } from "@/lib/api";
import { useBrokerEvents } from "@/lib/useBrokerEvents";
import { useI18n } from "./I18nProvider";
import { ChatDetailDrawer } from "./ChatDetailDrawer";
import { cn, relativeTime } from "@/lib/utils";

/**
 * T7 — Notification bell dropdown for the dashboard top bar.
 *
 * Behavior:
 *   - On mount, GET /api/broker/notifications to seed the list.
 *   - Subscribe to SSE; new notifications prepend + show toast.
 *   - Click a notification → opens the chat-detail drawer (FE-3).
 *   - "Mark read" / "Dismiss" call REST endpoints.
 *
 * Severity drives the toast color and bell pulse — Urgent shakes briefly.
 */
const MAX_LIST = 30;

export function NotificationBell() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<BrokerNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [pulse, setPulse] = useState(false);
  const [drawerSessionId, setDrawerSessionId] = useState<number | null>(null);
  const bellRef = useRef<HTMLDivElement | null>(null);

  /* ── seed from REST ──────────────────────────────────────────── */
  const refresh = useCallback(async () => {
    try {
      const r = await apiBroker.notifications(false, MAX_LIST);
      setItems(r.items);
      setUnread(r.unreadCount);
    } catch {
      // Silent — toast spam on a transient 401 isn't useful.
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  /* ── subscribe to SSE ────────────────────────────────────────── */
  useBrokerEvents({
    onNotification: (n) => {
      setItems((prev) => [n, ...prev.filter((x) => x.id !== n.id)].slice(0, MAX_LIST));
      setUnread((u) => u + 1);
      setPulse(true);
      // Severity drives toast variant.
      const text = n.title;
      if (n.severity === "Urgent") toast.error(text);
      else if (n.severity === "Warn") toast.warning(text);
      else toast.message(text);
      // Reset pulse after a moment.
      setTimeout(() => setPulse(false), 2000);
    },
  });

  /* ── close on outside click ─────────────────────────────────── */
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!bellRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  async function markRead(id: number) {
    try {
      await apiBroker.markNotificationRead(id);
      setItems((prev) =>
        prev.map((x) => (x.id === id ? { ...x, readAt: new Date().toISOString() } : x)),
      );
      setUnread((u) => Math.max(0, u - 1));
    } catch {
      toast.error(t("dashboard.notifications.markFailed"));
    }
  }

  async function dismiss(id: number) {
    try {
      await apiBroker.dismissNotification(id);
      setItems((prev) => prev.filter((x) => x.id !== id));
      setUnread((u) => Math.max(0, u - 1));
    } catch {
      toast.error(t("dashboard.notifications.dismissFailed"));
    }
  }

  function openSession(n: BrokerNotification) {
    if (n.chatSessionId) {
      setDrawerSessionId(n.chatSessionId);
      setOpen(false);
      if (!n.readAt) markRead(n.id);
    }
  }

  return (
    <>
      <div className="relative" ref={bellRef}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={t("dashboard.notifications.aria")}
          className={cn(
            "size-10 inline-flex items-center justify-center rounded-full relative",
            "border border-[color:var(--color-border-subtle)] bg-[color:var(--color-bg-surface)]",
            "hover:border-[color:var(--color-border-default)] transition-colors",
            pulse && "animate-pulse",
          )}
        >
          <BellIcon />
          {unread > 0 ? (
            <span
              className={cn(
                "absolute -top-1 -end-1 min-w-[18px] h-[18px] px-1 rounded-full",
                "bg-[color:var(--color-error)] text-white",
                "text-[0.7rem] font-bold leading-[18px] text-center",
              )}
            >
              {unread > 99 ? "99+" : unread}
            </span>
          ) : null}
        </button>

        {open ? (
          <div
            className={cn(
              "absolute end-0 mt-2 w-[360px] max-h-[480px]",
              "rounded-[var(--radius-md)] bg-[color:var(--color-bg-surface)]",
              "border border-[color:var(--color-border-subtle)] shadow-[var(--shadow-card)]",
              "overflow-hidden flex flex-col z-50",
            )}
            role="menu"
          >
            <div className="px-4 py-3 border-b border-[color:var(--color-border-subtle)] flex items-center justify-between">
              <span className="font-[family-name:var(--font-display)] text-[0.95rem] font-semibold">
                {t("dashboard.notifications.title")}
              </span>
              <span className="text-[0.78rem] text-[color:var(--color-fg-tertiary)]">
                {unread} {t("dashboard.notifications.unreadShort")}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="px-4 py-10 text-center text-[0.85rem] text-[color:var(--color-fg-tertiary)]">
                  {t("dashboard.notifications.empty")}
                </div>
              ) : (
                <ul className="divide-y divide-[color:var(--color-border-subtle)]">
                  {items.map((n) => (
                    <li key={n.id}>
                      <NotificationRow
                        notification={n}
                        onClick={() => openSession(n)}
                        onMarkRead={() => markRead(n.id)}
                        onDismiss={() => dismiss(n.id)}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ) : null}
      </div>

      <ChatDetailDrawer
        sessionId={drawerSessionId}
        onClose={() => setDrawerSessionId(null)}
      />
    </>
  );
}

function NotificationRow({
  notification,
  onClick,
  onMarkRead,
  onDismiss,
}: {
  notification: BrokerNotification;
  onClick: () => void;
  onMarkRead: () => void;
  onDismiss: () => void;
}) {
  const { t } = useI18n();
  const unread = !notification.readAt;
  const sevColor =
    notification.severity === "Urgent"
      ? "var(--color-error)"
      : notification.severity === "Warn"
        ? "var(--color-warning)"
        : "var(--color-fg-brand)";

  return (
    <div
      onClick={onClick}
      className={cn(
        "px-4 py-3 cursor-pointer hover:bg-[color:var(--color-bg-sunken)]",
        unread && "bg-[color:var(--color-bg-brand-soft)]/30",
      )}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="mt-1.5 size-2 rounded-full shrink-0"
          style={{ backgroundColor: sevColor }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-[family-name:var(--font-display)] text-[0.85rem] font-semibold truncate">
              {notification.title}
            </span>
            <span className="text-[0.72rem] text-[color:var(--color-fg-tertiary)] whitespace-nowrap">
              {relativeTime(notification.createdAt)}
            </span>
          </div>
          {notification.body ? (
            <p className="mt-0.5 text-[0.8rem] text-[color:var(--color-fg-secondary)] line-clamp-2">
              {notification.body}
            </p>
          ) : null}
          <div className="mt-1.5 flex items-center gap-3 text-[0.72rem]">
            <span
              className="px-2 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: `${sevColor}20`, color: sevColor }}
            >
              {t(`dashboard.notifications.type.${notification.type}`)}
            </span>
            {unread ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkRead();
                }}
                className="text-[color:var(--color-fg-brand)] hover:underline"
              >
                {t("dashboard.notifications.markRead")}
              </button>
            ) : null}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDismiss();
              }}
              className="text-[color:var(--color-fg-tertiary)] hover:underline"
            >
              {t("dashboard.notifications.dismiss")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BellIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5 text-[color:var(--color-fg-primary)]"
    >
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}
