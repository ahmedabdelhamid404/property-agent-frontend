"use client";

import { useCallback, useEffect, useState } from "react";
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
import { formatPhone, relativeTime, truncate } from "@/lib/utils";

const PAGE_SIZE = 20;

export function LeadsSection() {
  const { t } = useI18n();
  const [data, setData] = useState<LeadsPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await apiBroker.leads({
        page,
        pageSize: PAGE_SIZE,
        status: statusFilter || undefined,
      });
      setData(r);
    } catch {
      toast.error(t("dashboard.leads.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, t]);

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

        <div className="w-[220px]">
          <Select
            label={t("dashboard.leads.filterLabel")}
            options={[
              { value: "", label: t("dashboard.leads.filterAll") },
              { value: "New", label: t("dashboard.status.new") },
              { value: "Notified", label: t("dashboard.status.notified") },
              { value: "Contacted", label: t("dashboard.status.contacted") },
              { value: "Closed", label: t("dashboard.status.closed") },
            ]}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={6} />
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
