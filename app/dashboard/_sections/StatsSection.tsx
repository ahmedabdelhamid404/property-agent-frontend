"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { StatCard } from "@/components/StatCard";
import { StatSkeleton } from "@/components/Skeleton";
import { Badge } from "@/components/Badge";
import { apiBroker, type Lead } from "@/lib/api";
import { formatNumber, formatPercent, relativeTime, formatPhone, truncate } from "@/lib/utils";

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
  const [data, setData] = useState<Derived | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        // Pull a wide page once and bucket client-side. Backend doesn't have
        // a dedicated /broker/stats yet — calling /leads is enough at trial
        // volume and gets us "recent activity" in the same request.
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
        const notifyRate = page.total > 0 ? Math.round((notified / page.total) * 1000) / 10 : 0;

        setData({
          total: page.total,
          today,
          last7,
          last30,
          notified,
          notifyRate,
          recent: page.items.slice(0, 5),
        });
      } catch (e) {
        if (!cancelled) toast.error("ما قدرتش أحمّل البيانات");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

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
          label="آخر 24 ساعة"
          labelEn="Today"
          value={formatNumber(data.today)}
          hint={data.today === 0 ? "لسه مفيش عملاء النهارده" : undefined}
        />
        <StatCard
          label="آخر 7 أيام"
          labelEn="Last 7 days"
          value={formatNumber(data.last7)}
        />
        <StatCard
          label="آخر 30 يوم"
          labelEn="Last 30 days"
          value={formatNumber(data.last30)}
        />
        <StatCard
          label="نسبة التنبيه الناجحة"
          labelEn="Notify success"
          value={formatPercent(data.notifyRate, 1)}
          tone={tone}
          hint={
            data.total === 0
              ? "ما حصلش تنبيه بعد"
              : `${formatNumber(data.notified)} من ${formatNumber(data.total)} عميل`
          }
        />
      </section>

      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-[family-name:var(--font-display)] text-[1.6rem] text-[color:var(--color-ink)] tracking-tight">
            آخر عملاء وصلوك
          </h2>
          <span
            className="eyebrow"
            dir="ltr"
            lang="en"
          >
            Recent activity
          </span>
        </div>

        {data.recent.length === 0 ? (
          <div className="sheet p-10 text-center">
            <p className="font-[family-name:var(--font-display)] text-[1.4rem] text-[color:var(--color-ink)] mb-2">
              مفيش عملاء بعد
            </p>
            <p className="font-[family-name:var(--font-serif)] italic text-[1rem] text-[color:var(--color-ink-faint)]">
              أول ما عميل يطلب يتواصل معاك، هيظهر هنا.
            </p>
          </div>
        ) : (
          <ul className="sheet divide-y divide-[color:var(--color-rule)]">
            {data.recent.map((l) => (
              <li
                key={l.id}
                className="row-hover flex items-baseline gap-4 px-5 py-4 transition-colors"
              >
                <span className="eyebrow tabular numerals shrink-0 w-12 text-end" dir="ltr">
                  #{l.id}
                </span>
                <div className="grow min-w-0">
                  <div className="flex items-baseline gap-3 mb-1">
                    <span className="font-[family-name:var(--font-body)] text-[1.05rem] text-[color:var(--color-ink)]">
                      {l.customerName ?? "عميل"}
                    </span>
                    <span
                      className="font-[family-name:var(--font-mono)] text-[0.85rem] text-[color:var(--color-ink-faint)] tabular"
                      dir="ltr"
                    >
                      {formatPhone(l.customerPhone)}
                    </span>
                  </div>
                  <p className="font-[family-name:var(--font-body)] italic text-[0.95rem] text-[color:var(--color-ink-soft)] truncate">
                    {l.lastMessageExcerpt
                      ? `«${truncate(l.lastMessageExcerpt, 110)}»`
                      : "—"}
                  </p>
                </div>
                <div className="shrink-0 flex flex-col items-end gap-1.5">
                  <Badge tone={statusTone(l.status)} dot>
                    {statusLabel(l.status)}
                  </Badge>
                  <span className="font-[family-name:var(--font-serif)] italic text-[0.8rem] text-[color:var(--color-ink-faint)]">
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
