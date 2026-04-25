"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Select } from "@/components/Select";
import { TableSkeleton } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { apiBroker, type Lead, type LeadStatus, type LeadsPage } from "@/lib/api";
import { formatPhone, relativeTime, truncate } from "@/lib/utils";

const PAGE_SIZE = 20;

export function LeadsSection() {
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
      toast.error("ما قدرتش أحمّل العملاء");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  async function changeStatus(id: number, status: LeadStatus) {
    setUpdatingId(id);
    try {
      await apiBroker.updateLeadStatus(id, status);
      toast.success("الحالة اتحدّثت");
      // Optimistic local update
      setData((d) =>
        d
          ? { ...d, items: d.items.map((l) => (l.id === id ? { ...l, status } : l)) }
          : d,
      );
    } catch {
      toast.error("ما قدرتش أحدّث الحالة");
    } finally {
      setUpdatingId(null);
    }
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-[1.6rem] text-[color:var(--color-ink)] tracking-tight">
            دفتر العملاء
          </h2>
          {data ? (
            <p className="mt-1 font-[family-name:var(--font-serif)] italic text-[0.92rem] text-[color:var(--color-ink-faint)]">
              {data.total === 0
                ? "ما فيش عملاء"
                : `إجمالي ${data.total} عميل`}
            </p>
          ) : null}
        </div>

        <div className="w-[220px]">
          <Select
            label="فلترة حسب الحالة"
            options={[
              { value: "", label: "كل الحالات" },
              { value: "New", label: "جديد" },
              { value: "Notified", label: "اتنبه" },
              { value: "Contacted", label: "تواصلت معاه" },
              { value: "Closed", label: "مغلق" },
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
          title={statusFilter ? "ما فيش عملاء بالحالة دي" : "لسه ما وصلكش عملاء"}
          hint={
            statusFilter
              ? "غيّر الفلتر، أو ابدأ بنشر رابط الواتساب الخاص بيك."
              : "أول عميل يفتح رابط الواتساب الخاص بيك ويطلب يتواصل، هيظهر في الدفتر هنا."
          }
        />
      ) : (
        <div className="sheet overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-start">
              <thead>
                <tr className="border-b border-[color:var(--color-rule-strong)] bg-[color:var(--color-vellum)]">
                  <Th>#</Th>
                  <Th>العميل</Th>
                  <Th>الموبايل</Th>
                  <Th>آخر رسالة</Th>
                  <Th>عقارات</Th>
                  <Th>الحالة</Th>
                  <Th>وصل</Th>
                  <Th></Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--color-rule)]">
                {data.items.map((l) => (
                  <tr key={l.id} className="row-hover transition-colors">
                    <Td className="num text-[color:var(--color-ink-faint)] tabular numerals" dir="ltr">
                      #{l.id}
                    </Td>
                    <Td>
                      <span className="font-[family-name:var(--font-body)] text-[1rem]">
                        {l.customerName ?? "—"}
                      </span>
                    </Td>
                    <Td dir="ltr">
                      <span className="font-[family-name:var(--font-mono)] text-[0.92rem] tabular text-[color:var(--color-ink)]">
                        {formatPhone(l.customerPhone)}
                      </span>
                    </Td>
                    <Td>
                      <span className="font-[family-name:var(--font-body)] italic text-[0.95rem] text-[color:var(--color-ink-soft)]">
                        {l.lastMessageExcerpt
                          ? `«${truncate(l.lastMessageExcerpt, 80)}»`
                          : "—"}
                      </span>
                    </Td>
                    <Td className="num tabular numerals" dir="ltr">
                      {l.listingsCount}
                    </Td>
                    <Td>
                      <Badge tone={statusTone(l.status)} dot>
                        {statusLabel(l.status)}
                      </Badge>
                    </Td>
                    <Td>
                      <span className="font-[family-name:var(--font-serif)] italic text-[0.88rem] text-[color:var(--color-ink-faint)]">
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
            <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-[color:var(--color-rule)] bg-[color:var(--color-vellum)]">
              <span className="font-[family-name:var(--font-serif)] italic text-[0.85rem] text-[color:var(--color-ink-faint)]">
                صفحة <span className="tabular numerals lining" dir="ltr">{page}</span> من{" "}
                <span className="tabular numerals lining" dir="ltr">{totalPages}</span>
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  السابق ←
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  → التالي
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
  if (lead.status === "Closed") {
    return (
      <span className="font-[family-name:var(--font-serif)] italic text-[0.85rem] text-[color:var(--color-ink-faint)]">
        مغلق
      </span>
    );
  }
  return (
    <div className="flex items-center gap-1.5 justify-end">
      {lead.status !== "Contacted" ? (
        <Button size="sm" variant="ghost" loading={busy} onClick={onContact}>
          تواصلت
        </Button>
      ) : null}
      <Button size="sm" variant="ghost" loading={busy} onClick={onClose}>
        أغلق
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

function statusLabel(s: string) {
  switch (s) {
    case "New":
      return "جديد";
    case "Notified":
      return "اتنبه";
    case "Contacted":
      return "تواصلت";
    case "Closed":
      return "مغلق";
    default:
      return s;
  }
}
