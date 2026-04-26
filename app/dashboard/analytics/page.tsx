"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { FilledAreaChart } from "@/components/AreaChart";
import { DonutChart } from "@/components/DonutChart";
import { useI18n } from "@/components/I18nProvider";
import { apiBroker, type Lead } from "@/lib/api";
import { formatNumber } from "@/lib/utils";

const DAY_MS = 24 * 60 * 60 * 1000;

interface Computed {
  leads: Lead[];
  perDay: { label: string; value: number; iso: string }[];
  statusCounts: Record<string, number>;
  channelCounts: Record<string, number>;
  weekResponse: { label: string; value: number }[]; // minutes
}

export default function AnalyticsPage() {
  const { t, locale } = useI18n();
  const [data, setData] = useState<Computed | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const page = await apiBroker.leads({ page: 1, pageSize: 500 });
        if (cancelled) return;

        const items = page.items;
        const now = new Date();

        // Per-day counts for last 30 days
        const perDay: { label: string; value: number; iso: string }[] = [];
        for (let i = 29; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(d.getDate() - i);
          d.setHours(0, 0, 0, 0);
          const iso = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;
          const label = d.toLocaleDateString(
            locale === "ar" ? "ar-EG" : "en-GB",
            { month: "short", day: "numeric" },
          );
          perDay.push({ label, value: 0, iso });
        }
        const dayMap = new Map(perDay.map((d) => [d.iso, d]));

        // Status + channel + response time
        const statusCounts: Record<string, number> = {
          New: 0,
          Notified: 0,
          Contacted: 0,
          Closed: 0,
        };
        const channelCounts: Record<string, number> = {
          Email: 0,
          WhatsApp: 0,
          Both: 0,
          None: 0,
        };

        // Weekly avg response — last 8 weeks
        const weekBuckets: { sum: number; n: number; label: string }[] = [];
        for (let i = 7; i >= 0; i--) {
          const start = new Date(now);
          start.setDate(start.getDate() - i * 7);
          weekBuckets.push({
            sum: 0,
            n: 0,
            label: `W${i === 0 ? "now" : "-" + i}`,
          });
        }

        for (const l of items) {
          const created = new Date(l.createdAt);
          const iso = `${created.getFullYear()}-${(created.getMonth() + 1).toString().padStart(2, "0")}-${created.getDate().toString().padStart(2, "0")}`;
          const bucket = dayMap.get(iso);
          if (bucket) bucket.value++;

          if (l.status in statusCounts) statusCounts[l.status]++;

          if (!l.notifiedAt) channelCounts.None++;
          else if (l.notificationChannelUsed === "Email") channelCounts.Email++;
          else if (l.notificationChannelUsed === "WhatsApp")
            channelCounts.WhatsApp++;
          else if (l.notificationChannelUsed === "Both") channelCounts.Both++;
          else channelCounts.None++;

          if (l.notifiedAt) {
            const minutes =
              (new Date(l.notifiedAt).getTime() - created.getTime()) / 60000;
            if (minutes >= 0 && minutes < 60 * 24 * 7) {
              const weeksAgo = Math.floor(
                (now.getTime() - created.getTime()) / (DAY_MS * 7),
              );
              const idx = 7 - weeksAgo;
              if (idx >= 0 && idx < weekBuckets.length) {
                weekBuckets[idx].sum += minutes;
                weekBuckets[idx].n++;
              }
            }
          }
        }

        const weekResponse = weekBuckets.map((b, i) => ({
          label: i === 7 ? "now" : `${7 - i}w`,
          value: b.n === 0 ? 0 : Math.round(b.sum / b.n),
        }));

        setData({
          leads: items,
          perDay,
          statusCounts,
          channelCounts,
          weekResponse,
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
  }, [locale, t]);

  const statusSlices = useMemo(() => {
    if (!data) return [];
    return [
      {
        key: "New",
        label: t("dashboard.status.new"),
        value: data.statusCounts.New,
        color: "var(--color-warn)",
      },
      {
        key: "Notified",
        label: t("dashboard.status.notified"),
        value: data.statusCounts.Notified,
        color: "var(--color-teal-600)",
      },
      {
        key: "Contacted",
        label: t("dashboard.status.contacted"),
        value: data.statusCounts.Contacted,
        color: "var(--color-mint-400)",
      },
      {
        key: "Closed",
        label: t("dashboard.status.closed"),
        value: data.statusCounts.Closed,
        color: "var(--color-gold-600)",
      },
    ];
  }, [data, t]);

  const channelSlices = useMemo(() => {
    if (!data) return [];
    return [
      {
        key: "Email",
        label: t("dashboard.analytics.channelMix.email"),
        value: data.channelCounts.Email,
        color: "var(--color-teal-600)",
      },
      {
        key: "WhatsApp",
        label: t("dashboard.analytics.channelMix.whatsapp"),
        value: data.channelCounts.WhatsApp,
        color: "var(--color-mint-400)",
      },
      {
        key: "Both",
        label: t("dashboard.analytics.channelMix.both"),
        value: data.channelCounts.Both,
        color: "var(--color-gold-500)",
      },
      {
        key: "None",
        label: t("dashboard.analytics.channelMix.none"),
        value: data.channelCounts.None,
        color: "var(--color-neutral-300)",
      },
    ];
  }, [data, t]);

  if (loading) {
    return <AnalyticsSkeleton />;
  }

  if (!data || data.leads.length === 0) {
    return (
      <div className="sheet p-12 text-center">
        <p className="font-[family-name:var(--font-body)] text-[1rem] text-[color:var(--color-fg-tertiary)]">
          {t("dashboard.analytics.empty")}
        </p>
      </div>
    );
  }

  const totalLeads = data.leads.length;
  const closedTotal = data.statusCounts.Closed;
  const closedPct =
    totalLeads === 0 ? 0 : Math.round((closedTotal / totalLeads) * 100);

  return (
    <div className="space-y-6">
      {/* Leads per day — full width */}
      <ChartCard
        title={t("dashboard.analytics.leadsPerDay.title")}
        subtitle={t("dashboard.analytics.leadsPerDay.subtitle")}
      >
        <FilledAreaChart
          data={data.perDay.map((d) => ({ label: d.label, value: d.value }))}
          formatTooltipValue={(v) => formatNumber(v)}
        />
      </ChartCard>

      {/* Status + channel donuts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title={t("dashboard.analytics.statusMix.title")}
          subtitle={t("dashboard.analytics.statusMix.subtitle")}
        >
          <div className="flex justify-center pt-2 pb-4">
            <DonutChart
              data={statusSlices}
              centerValue={formatNumber(totalLeads)}
              centerLabel={t("dashboard.stats.totalLeads")}
            />
          </div>
        </ChartCard>

        <ChartCard
          title={t("dashboard.analytics.channelMix.title")}
          subtitle={t("dashboard.analytics.channelMix.subtitle")}
        >
          <div className="flex justify-center pt-2 pb-4">
            <DonutChart
              data={channelSlices}
              centerValue={`${closedPct}%`}
              centerLabel={t("dashboard.stats.conversionRate")}
            />
          </div>
        </ChartCard>
      </div>

      {/* Response trend */}
      <ChartCard
        title={t("dashboard.analytics.responseTrend.title")}
        subtitle={t("dashboard.analytics.responseTrend.subtitle")}
      >
        <FilledAreaChart
          data={data.weekResponse.map((d) => ({
            label: d.label,
            value: d.value,
          }))}
          color="var(--color-gold-500)"
          height={220}
          formatTooltipValue={(v) =>
            v < 60
              ? `${v}${t("dashboard.stats.minutes")}`
              : `${(v / 60).toFixed(1)}${t("dashboard.stats.hours")}`
          }
        />
      </ChartCard>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────────────────────────── */

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="sheet p-6 md:p-7">
      <div className="mb-5">
        <h3 className="font-[family-name:var(--font-display)] text-[1.05rem] font-semibold tracking-[-0.012em] text-[color:var(--color-fg-primary)]">
          {title}
        </h3>
        <p className="font-[family-name:var(--font-body)] text-[0.85rem] text-[color:var(--color-fg-tertiary)] mt-1 leading-snug">
          {subtitle}
        </p>
      </div>
      {children}
    </div>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="sheet p-6 h-80">
        <div className="skeleton h-4 w-40 mb-4" />
        <div className="skeleton h-3 w-72 mb-6" />
        <div className="skeleton h-56 w-full" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="sheet p-6 h-80">
          <div className="skeleton h-4 w-40 mb-4" />
          <div className="skeleton h-3 w-72 mb-6" />
          <div className="skeleton size-44 rounded-full mx-auto" />
        </div>
        <div className="sheet p-6 h-80">
          <div className="skeleton h-4 w-40 mb-4" />
          <div className="skeleton h-3 w-72 mb-6" />
          <div className="skeleton size-44 rounded-full mx-auto" />
        </div>
      </div>
    </div>
  );
}
