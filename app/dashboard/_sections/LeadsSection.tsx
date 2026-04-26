"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Select } from "@/components/Select";
import { TableSkeleton } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { useI18n } from "@/components/I18nProvider";
import {
  apiBroker,
  type Lead,
  type LeadStatus,
  type LeadsPage,
} from "@/lib/api";
import { cn, formatPhone, relativeTime, truncate } from "@/lib/utils";

const PAGE_SIZE = 20;
type ViewMode = "table" | "kanban";

const KANBAN_STATUSES: LeadStatus[] = [
  "New",
  "Notified",
  "Contacted",
  "Closed",
];

export function LeadsSection() {
  const { t } = useI18n();
  const [data, setData] = useState<LeadsPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [view, setView] = useState<ViewMode>("table");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // Kanban needs all leads in one shot — bump pageSize when in kanban view.
      const r = await apiBroker.leads({
        page: view === "kanban" ? 1 : page,
        pageSize: view === "kanban" ? 200 : PAGE_SIZE,
        status: view === "kanban" ? undefined : statusFilter || undefined,
      });
      setData(r);
    } catch {
      toast.error(t("dashboard.leads.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, t, view]);

  useEffect(() => {
    load();
  }, [load]);

  async function changeStatus(id: number, status: LeadStatus) {
    setUpdatingId(id);
    try {
      await apiBroker.updateLeadStatus(id, status);
      toast.success(t("dashboard.leads.statusUpdated"));
      setData((d) =>
        d
          ? {
              ...d,
              items: d.items.map((l) =>
                l.id === id ? { ...l, status } : l,
              ),
            }
          : d,
      );
    } catch {
      toast.error(t("dashboard.leads.statusUpdateFailed"));
    } finally {
      setUpdatingId(null);
    }
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-[1.4rem] font-semibold tracking-[-0.015em] text-[color:var(--color-fg-primary)]">
            {t("dashboard.leads.title")}
          </h2>
          {data ? (
            <p className="mt-1 font-[family-name:var(--font-body)] text-[0.88rem] text-[color:var(--color-fg-tertiary)]">
              {data.total === 0
                ? t("dashboard.leads.none")
                : `${data.total} ${t("dashboard.leads.title").toLowerCase()}`}
            </p>
          ) : null}
        </div>

        <div className="flex items-center gap-3">
          <ViewToggle value={view} onChange={setView} />
          {view === "table" ? (
            <div className="w-[200px]">
              <Select
                label={t("dashboard.leads.filterLabel")}
                options={[
                  { value: "", label: t("dashboard.leads.filterAll") },
                  { value: "New", label: t("dashboard.status.new") },
                  { value: "Notified", label: t("dashboard.status.notified") },
                  {
                    value: "Contacted",
                    label: t("dashboard.status.contacted"),
                  },
                  { value: "Closed", label: t("dashboard.status.closed") },
                ]}
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          ) : null}
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={6} />
      ) : view === "kanban" ? (
        <KanbanBoard
          leads={data?.items ?? []}
          updatingId={updatingId}
          onChangeStatus={changeStatus}
        />
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          title={
            statusFilter
              ? t("dashboard.leads.emptyFilteredTitle")
              : t("dashboard.leads.emptyTitle")
          }
          hint={
            statusFilter
              ? t("dashboard.leads.emptyFilteredHint")
              : t("dashboard.leads.emptyHint")
          }
        />
      ) : (
        <div className="sheet overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-start">
              <thead>
                <tr className="border-b border-[color:var(--color-border-default)] bg-[color:var(--color-bg-canvas)]">
                  <Th>{t("dashboard.leads.col.id")}</Th>
                  <Th>{t("dashboard.leads.col.customer")}</Th>
                  <Th>{t("dashboard.leads.col.mobile")}</Th>
                  <Th>{t("dashboard.leads.col.lastMessage")}</Th>
                  <Th>{t("dashboard.leads.col.listings")}</Th>
                  <Th>{t("dashboard.leads.col.status")}</Th>
                  <Th>{t("dashboard.leads.col.when")}</Th>
                  <Th></Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--color-border-subtle)]">
                {data.items.map((l) => (
                  <tr key={l.id} className="row-hover transition-colors">
                    <Td
                      className="num text-[color:var(--color-fg-tertiary)] tabular numerals"
                      dir="ltr"
                    >
                      #{l.id}
                    </Td>
                    <Td>
                      <span className="font-[family-name:var(--font-body)] text-[0.95rem]">
                        {l.customerName ?? "—"}
                      </span>
                    </Td>
                    <Td dir="ltr">
                      <span className="font-[family-name:var(--font-mono)] text-[0.88rem] text-[color:var(--color-fg-primary)]">
                        {formatPhone(l.customerPhone)}
                      </span>
                    </Td>
                    <Td>
                      <span className="font-[family-name:var(--font-body)] text-[0.92rem] text-[color:var(--color-fg-secondary)]">
                        {l.lastMessageExcerpt
                          ? `“${truncate(l.lastMessageExcerpt, 80)}”`
                          : "—"}
                      </span>
                    </Td>
                    <Td className="num tabular numerals" dir="ltr">
                      {l.listingsCount}
                    </Td>
                    <Td>
                      <Badge tone={statusTone(l.status)} dot>
                        {t(`dashboard.status.${l.status.toLowerCase()}`)}
                      </Badge>
                    </Td>
                    <Td>
                      <span className="font-[family-name:var(--font-body)] text-[0.85rem] text-[color:var(--color-fg-tertiary)]">
                        {relativeTime(l.createdAt)}
                      </span>
                    </Td>
                    <Td>
                      <LeadActions
                        lead={l}
                        busy={updatingId === l.id}
                        onContact={() => changeStatus(l.id, "Contacted")}
                        onClose={() => changeStatus(l.id, "Closed")}
                      />
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 ? (
            <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-[color:var(--color-border-subtle)] bg-[color:var(--color-bg-canvas)]">
              <span className="font-[family-name:var(--font-body)] text-[0.85rem] text-[color:var(--color-fg-tertiary)]">
                {t("dashboard.leads.page")}{" "}
                <span className="tabular numerals" dir="ltr">
                  {page}
                </span>{" "}
                {t("dashboard.leads.of")}{" "}
                <span className="tabular numerals" dir="ltr">
                  {totalPages}
                </span>
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  {t("dashboard.leads.prev")}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  {t("dashboard.leads.next")}
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────
   View toggle
   ────────────────────────────────────────────────────────────────── */

function ViewToggle({
  value,
  onChange,
}: {
  value: ViewMode;
  onChange: (v: ViewMode) => void;
}) {
  const { t } = useI18n();
  const opts: { id: ViewMode; label: string; icon: React.ReactNode }[] = [
    { id: "table", label: t("dashboard.leads.viewTable"), icon: <TableIcon /> },
    { id: "kanban", label: t("dashboard.leads.viewKanban"), icon: <BoardIcon /> },
  ];
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-[color:var(--color-border-subtle)] bg-[color:var(--color-bg-surface)] p-1">
      {opts.map((o) => {
        const active = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full",
              "font-[family-name:var(--font-display)] text-[0.82rem] font-medium",
              "transition-colors duration-200",
              active
                ? "bg-[color:var(--color-bg-brand)] text-[color:var(--color-fg-inverse)]"
                : "text-[color:var(--color-fg-tertiary)] hover:text-[color:var(--color-fg-primary)]",
            )}
          >
            {o.icon}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────
   Kanban
   ────────────────────────────────────────────────────────────────── */

function KanbanBoard({
  leads,
  updatingId,
  onChangeStatus,
}: {
  leads: Lead[];
  updatingId: number | null;
  onChangeStatus: (id: number, status: LeadStatus) => void;
}) {
  const buckets = useMemo(() => {
    const m: Record<LeadStatus, Lead[]> = {
      New: [],
      Notified: [],
      Contacted: [],
      Closed: [],
    };
    for (const l of leads) m[l.status]?.push(l);
    return m;
  }, [leads]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {KANBAN_STATUSES.map((status) => (
        <KanbanColumn
          key={status}
          status={status}
          leads={buckets[status]}
          updatingId={updatingId}
          onChangeStatus={onChangeStatus}
        />
      ))}
    </div>
  );
}

function KanbanColumn({
  status,
  leads,
  updatingId,
  onChangeStatus,
}: {
  status: LeadStatus;
  leads: Lead[];
  updatingId: number | null;
  onChangeStatus: (id: number, status: LeadStatus) => void;
}) {
  const { t } = useI18n();
  const accentColors: Record<LeadStatus, string> = {
    New: "var(--color-warn)",
    Notified: "var(--color-teal-600)",
    Contacted: "var(--color-mint-400)",
    Closed: "var(--color-fg-tertiary)",
  };
  return (
    <div className="rounded-[var(--radius-md)] bg-[color:var(--color-bg-canvas)] border border-[color:var(--color-border-subtle)] flex flex-col min-h-[300px]">
      <header className="flex items-center justify-between gap-2 px-4 py-3 border-b border-[color:var(--color-border-subtle)]">
        <div className="flex items-center gap-2">
          <span
            className="size-2 rounded-full"
            style={{ background: accentColors[status] }}
          />
          <span className="font-[family-name:var(--font-display)] text-[0.92rem] font-semibold text-[color:var(--color-fg-primary)]">
            {t(`dashboard.status.${status.toLowerCase()}`)}
          </span>
        </div>
        <span
          className="font-[family-name:var(--font-mono)] text-[0.78rem] text-[color:var(--color-fg-tertiary)] tabular-nums"
          dir="ltr"
        >
          {leads.length}
        </span>
      </header>
      <div className="flex-1 p-3 space-y-2.5">
        {leads.length === 0 ? (
          <p className="font-[family-name:var(--font-body)] text-[0.85rem] text-[color:var(--color-fg-tertiary)] text-center pt-8 pb-4">
            {t("dashboard.leads.kanbanEmptyColumn")}
          </p>
        ) : (
          leads.map((l) => (
            <KanbanCard
              key={l.id}
              lead={l}
              busy={updatingId === l.id}
              onChangeStatus={onChangeStatus}
            />
          ))
        )}
      </div>
    </div>
  );
}

function KanbanCard({
  lead,
  busy,
  onChangeStatus,
}: {
  lead: Lead;
  busy: boolean;
  onChangeStatus: (id: number, status: LeadStatus) => void;
}) {
  const { t } = useI18n();
  const next = nextStatus(lead.status);
  return (
    <div className="rounded-[var(--radius-sm)] border border-[color:var(--color-border-subtle)] bg-[color:var(--color-bg-surface)] p-3 hover:shadow-[var(--shadow-subtle)] transition-shadow">
      <div className="flex items-baseline justify-between gap-2 mb-1.5">
        <span className="font-[family-name:var(--font-body)] text-[0.92rem] font-medium text-[color:var(--color-fg-primary)] truncate">
          {lead.customerName ?? "—"}
        </span>
        <span
          className="font-[family-name:var(--font-mono)] text-[0.72rem] text-[color:var(--color-fg-tertiary)] shrink-0"
          dir="ltr"
        >
          #{lead.id}
        </span>
      </div>
      <p
        className="font-[family-name:var(--font-mono)] text-[0.78rem] text-[color:var(--color-fg-secondary)] mb-2"
        dir="ltr"
      >
        {formatPhone(lead.customerPhone)}
      </p>
      {lead.lastMessageExcerpt ? (
        <p className="font-[family-name:var(--font-body)] text-[0.82rem] text-[color:var(--color-fg-secondary)] mb-3 leading-snug line-clamp-2">
          “{truncate(lead.lastMessageExcerpt, 90)}”
        </p>
      ) : null}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-[color:var(--color-border-subtle)]">
        <span className="font-[family-name:var(--font-body)] text-[0.74rem] text-[color:var(--color-fg-tertiary)]">
          {relativeTime(lead.createdAt)}
        </span>
        {next ? (
          <Button
            size="sm"
            variant="ghost"
            loading={busy}
            onClick={() => onChangeStatus(lead.id, next)}
            className="!h-7 !px-3 !text-[0.78rem]"
          >
            {nextActionLabel(next, t)}
          </Button>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            loading={busy}
            onClick={() => onChangeStatus(lead.id, "Notified")}
            className="!h-7 !px-3 !text-[0.78rem]"
          >
            {t("dashboard.leads.action.reopen")}
          </Button>
        )}
      </div>
    </div>
  );
}

function nextStatus(s: LeadStatus): LeadStatus | null {
  switch (s) {
    case "New":
      return "Notified";
    case "Notified":
      return "Contacted";
    case "Contacted":
      return "Closed";
    case "Closed":
      return null;
  }
}

function nextActionLabel(s: LeadStatus, t: (k: string) => string): string {
  switch (s) {
    case "Notified":
      return t("dashboard.leads.action.markNotified");
    case "Contacted":
      return t("dashboard.leads.action.contacted");
    case "Closed":
      return t("dashboard.leads.action.close");
    default:
      return "";
  }
}

/* ──────────────────────────────────────────────────────────────────
   Table helpers (unchanged)
   ────────────────────────────────────────────────────────────────── */

function Th({ children }: { children?: React.ReactNode }) {
  return (
    <th className="px-4 py-2.5 text-start eyebrow whitespace-nowrap">
      {children}
    </th>
  );
}

function Td({
  children,
  className,
  dir,
}: {
  children?: React.ReactNode;
  className?: string;
  dir?: "ltr" | "rtl";
}) {
  return (
    <td
      className={`px-4 py-3.5 align-top whitespace-nowrap ${className ?? ""}`}
      dir={dir}
    >
      {children}
    </td>
  );
}

function LeadActions({
  lead,
  busy,
  onContact,
  onClose,
}: {
  lead: Lead;
  busy: boolean;
  onContact: () => void;
  onClose: () => void;
}) {
  const { t } = useI18n();
  if (lead.status === "Closed") {
    return (
      <span className="font-[family-name:var(--font-body)] text-[0.85rem] text-[color:var(--color-fg-tertiary)]">
        {t("dashboard.leads.action.closedLabel")}
      </span>
    );
  }
  return (
    <div className="flex items-center gap-1.5 justify-end">
      {lead.status !== "Contacted" ? (
        <Button size="sm" variant="ghost" loading={busy} onClick={onContact}>
          {t("dashboard.leads.action.contacted")}
        </Button>
      ) : null}
      <Button size="sm" variant="ghost" loading={busy} onClick={onClose}>
        {t("dashboard.leads.action.close")}
      </Button>
    </div>
  );
}

function statusTone(s: string) {
  switch (s) {
    case "Notified":
      return "teal" as const;
    case "Contacted":
      return "ok" as const;
    case "Closed":
      return "neutral" as const;
    default:
      return "warn" as const;
  }
}

/* Inline icons */
function TableIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-3.5">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="3" y1="15" x2="21" y2="15" />
      <line x1="12" y1="3" x2="12" y2="21" />
    </svg>
  );
}
function BoardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-3.5">
      <rect x="3" y="3" width="6" height="18" rx="1.5" />
      <rect x="11" y="3" width="6" height="11" rx="1.5" />
      <rect x="19" y="3" width="2" height="6" rx="1" />
    </svg>
  );
}
