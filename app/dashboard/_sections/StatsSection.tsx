"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/Badge";
import { BentoStatCard } from "@/components/BentoStatCard";
import { FunnelChart } from "@/components/FunnelChart";
import { StatSkeleton } from "@/components/Skeleton";
import { useI18n } from "@/components/I18nProvider";
import { apiBroker, type Lead } from "@/lib/api";
import { formatNumber, formatPhone, relativeTime, truncate } from "@/lib/utils";

interface Derived {
  total: number;
  hot: number;          // New + Notified
  conversion: number;   // closed / total %
  avgResponseMs: number | null;
  closedMtd: number;
  perDayCounts: { v: number }[];      // last 14 days, leads received per day
  perDayClosed: { v: number }[];      // last 14 days, leads closed per day
  hotBreakdown: { v: number }[];      // last 14 days, hot count per day
  recent: Lead[];
  funnel: {
    received: number;
    notified: number;
    contacted: number;
    closed: number;
  };
}

const DAYS = 14;

export function StatsSection() {
  const { t } = useI18n();
  const [data, setData] = useState<Derived | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const page = await apiBroker.leads({ page: 1, pageSize: 500 });
        if (cancelled) return;

        const items = page.items;
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        // Bucket leads per day for the last DAYS days
        const dayKey = (d: Date) =>
          `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        const days: { key: string; received: number; closed: number; hot: number }[] = [];
        for (let i = DAYS - 1; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(d.getDate() - i);
          d.setHours(0, 0, 0, 0);
          days.push({ key: dayKey(d), received: 0, closed: 0, hot: 0 });
        }
        const dayMap = new Map(days.map((d) => [d.key, d]));

        let hot = 0;
        let closed = 0;
        let closedMtd = 0;
        let notified = 0;
        let contacted = 0;
        let responseSum = 0;
        let responseN = 0;

        for (const l of items) {
          const created = new Date(l.createdAt);
          const k = dayKey(created);
          const bucket = dayMap.get(k);
          if (bucket) bucket.received++;

          if (l.status === "New" || l.status === "Notified") {
            hot++;
            if (bucket) bucket.hot++;
          }
          if (l.status === "Notified" || l.status === "Contacted" || l.status === "Closed") {
            notified++;
          }
          if (l.status === "Contacted" || l.status === "Closed") {
            contacted++;
          }
          if (l.status === "Closed") {
            closed++;
            if (bucket) bucket.closed++;
            if (created >= monthStart) closedMtd++;
          }
          if (l.notifiedAt) {
            const nAt = new Date(l.notifiedAt).getTime();
            const cAt = created.getTime();
            const ms = nAt - cAt;
            if (ms >= 0 && ms < 1000 * 60 * 60 * 24 * 7) {
              // ignore clearly broken values
              responseSum += ms;
              responseN++;
            }
          }
        }

        const conversion = items.length === 0
          ? 0
          : Math.round((closed / items.length) * 1000) / 10;
        const avgResponseMs = responseN === 0 ? null : Math.round(responseSum / responseN);

        // Sort recent by createdAt desc
        const recent = [...items]
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          )
          .slice(0, 5);

        setData({
          total: page.total,
          hot,
          conversion,
          avgResponseMs,
          closedMtd,
          perDayCounts: days.map((d) => ({ v: d.received })),
          perDayClosed: days.map((d) => ({ v: d.closed })),
          hotBreakdown: days.map((d) => ({ v: d.hot })),
          recent,
          funnel: {
            received: items.length,
            notified,
            contacted,
            closed,
          },
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

  // Cumulative version of perDayCounts for the "Total leads" sparkline
  const totalLeadsSpark = useMemo(() => {
    if (!data) return [] as { v: number }[];
    let running = data.total - data.perDayCounts.reduce((s, d) => s + d.v, 0);
    return data.perDayCounts.map((d) => {
      running += d.v;
      return { v: running };
    });
  }, [data]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <StatSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!data) return null;

  const responseValue = formatResponse(data.avgResponseMs, t);

  // Funnel stages — colors map to the brand palette
  const funnelStages = [
    {
      key: "received",
      label: t("dashboard.funnel.stage.received"),
      count: data.funnel.received,
      color: "var(--color-teal-600)",
    },
    {
      key: "notified",
      label: t("dashboard.funnel.stage.notified"),
      count: data.funnel.notified,
      color: "var(--color-teal-500)",
    },
    {
      key: "contacted",
      label: t("dashboard.funnel.stage.contacted"),
      count: data.funnel.contacted,
      color: "var(--color-mint-400)",
    },
    {
      key: "closed",
      label: t("dashboard.funnel.stage.closed"),
      count: data.funnel.closed,
      color: "var(--color-gold-600)",
    },
  ];

  return (
    <div className="space-y-12">
      {/* ─── Bento KPI grid ─────────────────────────────────────── */}
      <section className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <BentoStatCard
          label={t("dashboard.stats.hotLeads")}
          hint={t("dashboard.stats.hotLeadsHint")}
          value={formatNumber(data.hot)}
          sparkline={data.hotBreakdown}
          tone={data.hot > 0 ? "error" : "brand"}
          hero={data.hot > 0}
          icon={<FlameIcon />}
        />
        <BentoStatCard
          label={t("dashboard.stats.totalLeads")}
          hint={t("dashboard.stats.totalLeadsHint")}
          value={formatNumber(data.total)}
          sparkline={totalLeadsSpark}
          tone="brand"
          icon={<UsersIcon />}
        />
        <BentoStatCard
          label={t("dashboard.stats.conversionRate")}
          hint={t("dashboard.stats.conversionRateHint")}
          value={`${data.conversion}%`}
          tone="success"
          icon={<TrendIcon />}
        />
        <BentoStatCard
          label={t("dashboard.stats.avgResponse")}
          hint={t("dashboard.stats.avgResponseHint")}
          value={responseValue}
          tone="warn"
          icon={<ClockIcon />}
        />
        <BentoStatCard
          label={t("dashboard.stats.closedMtd")}
          hint={t("dashboard.stats.closedMtdHint")}
          value={formatNumber(data.closedMtd)}
          sparkline={data.perDayClosed}
          tone="accent"
          icon={<CheckIcon />}
        />
      </section>

      {/* ─── Funnel + recent leads side-by-side ─────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] gap-8">
        <div className="sheet p-6 md:p-7">
          <div className="flex items-baseline justify-between mb-5">
            <div>
              <span className="eyebrow mb-1 block">
                {t("dashboard.funnel.eyebrow")}
              </span>
              <h2 className="font-[family-name:var(--font-display)] text-[1.3rem] font-semibold tracking-[-0.015em] text-[color:var(--color-fg-primary)]">
                {t("dashboard.funnel.title")}
              </h2>
            </div>
          </div>
          <FunnelChart stages={funnelStages} />
        </div>

        <div>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-[family-name:var(--font-display)] text-[1.3rem] font-semibold tracking-[-0.015em] text-[color:var(--color-fg-primary)]">
              {t("dashboard.stats.recentTitle")}
            </h2>
          </div>
          {data.recent.length === 0 ? (
            <div className="sheet p-8 text-center">
              <p className="font-[family-name:var(--font-display)] text-[1.05rem] font-semibold text-[color:var(--color-fg-primary)] mb-2">
                {t("dashboard.stats.emptyTitle")}
              </p>
              <p className="font-[family-name:var(--font-body)] text-[0.92rem] text-[color:var(--color-fg-tertiary)]">
                {t("dashboard.stats.emptyHint")}
              </p>
            </div>
          ) : (
            <ul className="sheet divide-y divide-[color:var(--color-border-subtle)]">
              {data.recent.map((l) => (
                <li
                  key={l.id}
                  className="row-hover flex items-baseline gap-3 px-4 py-3.5 transition-colors"
                >
                  <span
                    className="eyebrow tabular numerals shrink-0 w-10 text-end"
                    dir="ltr"
                  >
                    #{l.id}
                  </span>
                  <div className="grow min-w-0">
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <span className="font-[family-name:var(--font-body)] text-[0.95rem] font-medium text-[color:var(--color-fg-primary)]">
                        {l.customerName ?? t("dashboard.stats.unknownCustomer")}
                      </span>
                      <span
                        className="font-[family-name:var(--font-mono)] text-[0.78rem] text-[color:var(--color-fg-tertiary)]"
                        dir="ltr"
                      >
                        {formatPhone(l.customerPhone)}
                      </span>
                    </div>
                    <p className="font-[family-name:var(--font-body)] text-[0.85rem] text-[color:var(--color-fg-secondary)] truncate">
                      {l.lastMessageExcerpt
                        ? `“${truncate(l.lastMessageExcerpt, 90)}”`
                        : "—"}
                    </p>
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-1">
                    <Badge tone={statusTone(l.status)} dot>
                      {t(`dashboard.status.${l.status.toLowerCase()}`)}
                    </Badge>
                    <span className="font-[family-name:var(--font-body)] text-[0.74rem] text-[color:var(--color-fg-tertiary)]">
                      {relativeTime(l.createdAt)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
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

function formatResponse(
  ms: number | null,
  t: (k: string) => string,
): string {
  if (ms === null) return t("dashboard.stats.noData");
  const sec = Math.round(ms / 1000);
  if (sec < 60) return `${sec}${t("dashboard.stats.seconds")}`;
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}${t("dashboard.stats.minutes")}`;
  const hr = Math.round(min / 6) / 10;
  if (hr < 24) return `${hr}${t("dashboard.stats.hours")}`;
  const days = Math.round((hr / 24) * 10) / 10;
  return `${days}${t("dashboard.stats.days")}`;
}

/* ─── Inline icons (lucide-style, hand-rolled to avoid the dep) ── */

function FlameIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-4">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  );
}
function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-4">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function TrendIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-4">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-4">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-4">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
