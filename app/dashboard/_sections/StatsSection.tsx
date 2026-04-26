"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { StatCard } from "@/components/StatCard";
import { StatSkeleton } from "@/components/Skeleton";
import { Badge } from "@/components/Badge";
import { useI18n } from "@/components/I18nProvider";
import { apiBroker, type Lead } from "@/lib/api";
import {
  formatNumber,
  formatPercent,
  relativeTime,
  formatPhone,
  truncate,
} from "@/lib/utils";

interface Derived {
  total: number;
  today: number;
  last7: number;
  last30: number;
  notified: number;
  notifyRate: number;
  recent: Lead[];
}

export function StatsSection() {
  const { t } = useI18n();
  const [data, setData] = useState<Derived | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const page = await apiBroker.leads({ page: 1, pageSize: 200 });
        if (cancelled) return;

        const now = Date.now();
        const dayMs = 24 * 60 * 60 * 1000;
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        let today = 0,
          last7 = 0,
          last30 = 0,
          notified = 0;
        for (const l of page.items) {
          const t = new Date(l.createdAt).getTime();
          if (t >= todayStart.getTime()) today++;
          if (now - t <= 7 * dayMs) last7++;
          if (now - t <= 30 * dayMs) last30++;
          if (l.notifiedAt) notified++;
        }
        const notifyRate =
          page.total > 0
            ? Math.round((notified / page.total) * 1000) / 10
            : 0;

        setData({
          total: page.total,
          today,
          last7,
          last30,
          notified,
          notifyRate,
          recent: page.items.slice(0, 5),
        });
      } catch {
        if (!cancelled) toast.error(t("dashboard.loadFailed"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [t]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!data) return null;

  const tone =
    data.notifyRate >= 90 ? "ok" : data.notifyRate >= 60 ? "warn" : "err";

  return (
    <div className="space-y-10">
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          label={t("dashboard.stats.today")}
          value={formatNumber(data.today)}
          hint={data.today === 0 ? t("dashboard.stats.todayEmpty") : undefined}
        />
        <StatCard
          label={t("dashboard.stats.last7")}
          value={formatNumber(data.last7)}
        />
        <StatCard
          label={t("dashboard.stats.last30")}
          value={formatNumber(data.last30)}
        />
        <StatCard
          label={t("dashboard.stats.notifySuccess")}
          value={formatPercent(data.notifyRate, 1)}
          tone={tone}
          hint={
            data.total === 0
              ? t("dashboard.stats.noNotificationsYet")
              : `${formatNumber(data.notified)} / ${formatNumber(data.total)}`
          }
        />
      </section>

      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-[family-name:var(--font-display)] text-[1.4rem] font-semibold tracking-[-0.015em] text-[color:var(--color-fg-primary)]">
            {t("dashboard.stats.recentTitle")}
          </h2>
          <span className="eyebrow" dir="ltr" lang="en">
            {t("dashboard.stats.recentEnLabel")}
          </span>
        </div>

        {data.recent.length === 0 ? (
          <div className="sheet p-10 text-center">
            <p className="font-[family-name:var(--font-display)] text-[1.2rem] font-semibold text-[color:var(--color-fg-primary)] mb-2">
              {t("dashboard.stats.emptyTitle")}
            </p>
            <p className="font-[family-name:var(--font-body)] text-[0.95rem] text-[color:var(--color-fg-tertiary)]">
              {t("dashboard.stats.emptyHint")}
            </p>
          </div>
        ) : (
          <ul className="sheet divide-y divide-[color:var(--color-border-subtle)]">
            {data.recent.map((l) => (
              <li
                key={l.id}
                className="row-hover flex items-baseline gap-4 px-5 py-4 transition-colors"
              >
                <span
                  className="eyebrow tabular numerals shrink-0 w-12 text-end"
                  dir="ltr"
                >
                  #{l.id}
                </span>
                <div className="grow min-w-0">
                  <div className="flex items-baseline gap-3 mb-1">
                    <span className="font-[family-name:var(--font-body)] text-[1rem] font-medium text-[color:var(--color-fg-primary)]">
                      {l.customerName ?? t("dashboard.stats.unknownCustomer")}
                    </span>
                    <span
                      className="font-[family-name:var(--font-mono)] text-[0.85rem] text-[color:var(--color-fg-tertiary)]"
                      dir="ltr"
                    >
                      {formatPhone(l.customerPhone)}
                    </span>
                  </div>
                  <p className="font-[family-name:var(--font-body)] text-[0.92rem] text-[color:var(--color-fg-secondary)] truncate">
                    {l.lastMessageExcerpt
                      ? `“${truncate(l.lastMessageExcerpt, 110)}”`
                      : "—"}
                  </p>
                </div>
                <div className="shrink-0 flex flex-col items-end gap-1.5">
                  <Badge tone={statusTone(l.status)} dot>
                    {t(`dashboard.status.${l.status.toLowerCase()}`)}
                  </Badge>
                  <span className="font-[family-name:var(--font-body)] text-[0.78rem] text-[color:var(--color-fg-tertiary)]">
                    {relativeTime(l.createdAt)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
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
