"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { StatCard } from "@/components/StatCard";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { StatSkeleton, TableSkeleton } from "@/components/Skeleton";
import {
  apiAdmin,
  type AdminHealth,
  type AdminStats,
  type AdminTenantsPage,
  type FailedNotificationsResult,
} from "@/lib/api";
import { admin } from "@/lib/storage";
import {
  formatNumber,
  formatPercent,
  formatDateTime,
  relativeTime,
} from "@/lib/utils";

export function AdminDashboard({ onSignOut }: { onSignOut: () => void }) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [health, setHealth] = useState<AdminHealth | null>(null);
  const [tenants, setTenants] = useState<AdminTenantsPage | null>(null);
  const [failed, setFailed] = useState<FailedNotificationsResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  async function loadAll() {
    setLoading(true);
    try {
      const [s, h, t, f] = await Promise.all([
        apiAdmin.stats(),
        apiAdmin.health(),
        apiAdmin.tenants({ page: 1, pageSize: 50 }),
        apiAdmin.failedNotifications(24, 50),
      ]);
      setStats(s);
      setHealth(h);
      setTenants(t);
      setFailed(f);
    } catch {
      toast.error("ما قدرتش أحمّل لوحة الأدمن");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function toggleActive(id: number, current: boolean) {
    setTogglingId(id);
    try {
      const r = await apiAdmin.toggleTenantActive(id, !current);
      setTenants((p) =>
        p
          ? {
              ...p,
              items: p.items.map((t) =>
                t.id === id ? { ...t, isActive: r.isActive } : t,
              ),
            }
          : p,
      );
      toast.success(r.isActive ? "اتفعّل" : "اتوقّف");
    } catch {
      toast.error("ما قدرتش أغير الحالة");
    } finally {
      setTogglingId(null);
    }
  }

  function signOut() {
    admin.clear();
    onSignOut();
  }

  return (
    <>
      {/* Custom admin header — different from broker SiteHeader to mark
          territory: bordered double rule, "Platform" eyebrow */}
      <header className="border-b-2 border-double border-[color:var(--color-rule-strong)] bg-[color:var(--color-vellum)]">
        <div className="deck flex items-center justify-between gap-6 py-4">
          <Link href="/" aria-label="Home">
            <Logo />
          </Link>
          <div className="flex items-center gap-3">
            <Badge tone="brick">منطقة الأدمن</Badge>
            <button
              type="button"
              onClick={signOut}
              className="font-[family-name:var(--font-serif)] text-[0.85rem] tracking-[0.04em] uppercase text-[color:var(--color-ink-faint)] hover:text-[color:var(--color-brick)] transition-colors"
            >
              تسجيل الخروج
            </button>
          </div>
        </div>
      </header>

      <div className="deck pt-12 pb-8 flex items-baseline justify-between gap-4">
        <div>
          <p className="eyebrow mb-2 rise-1">منصة Property-Agent</p>
          <h1 className="rise-1 font-[family-name:var(--font-display)] text-[clamp(2.2rem,4vw,3rem)] tracking-tight text-[color:var(--color-ink)]">
            لوحة <em className="not-italic text-[color:var(--color-brick)]">المنصة</em>
          </h1>
        </div>
        <button
          type="button"
          onClick={loadAll}
          className="font-[family-name:var(--font-serif)] text-[0.92rem] linkish"
        >
          تحديث ↻
        </button>
      </div>

      {/* ─── HEALTH STRIP ────────────────────────────────────── */}
      <section className="deck rise-2 mb-10">
        <HealthCard health={health} loading={loading} />
      </section>

      {/* ─── PLATFORM STATS ──────────────────────────────────── */}
      <section className="deck rise-3 mb-12">
        <h2 className="eyebrow mb-4">نظرة عامة</h2>
        {loading || !stats ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <StatSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              label="الوسطاء النشطين"
              labelEn="Active brokers"
              value={formatNumber(stats.tenants.active)}
              hint={`${formatNumber(stats.tenants.total)} مسجل · ${formatNumber(stats.tenants.inactive)} موقوف`}
            />
            <StatCard
              label="عملاء النهارده"
              labelEn="Leads today"
              value={formatNumber(stats.leads.today)}
              hint={`${formatNumber(stats.leads.last7Days)} هذا الأسبوع`}
            />
            <StatCard
              label="إجمالي العملاء"
              labelEn="Total leads"
              value={formatNumber(stats.leads.total)}
              hint={`${formatNumber(stats.leads.last30Days)} في آخر 30 يوم`}
            />
            <StatCard
              label="نسبة التنبيه الناجحة"
              labelEn="Notify success"
              value={formatPercent(stats.leads.notificationSuccessRatePct)}
              tone={
                stats.leads.notificationSuccessRatePct >= 90
                  ? "ok"
                  : stats.leads.notificationSuccessRatePct >= 60
                  ? "warn"
                  : "err"
              }
              hint={`${formatNumber(stats.leads.notified)} اتنبه`}
            />
          </div>
        )}
      </section>

      {/* ─── TENANTS TABLE ───────────────────────────────────── */}
      <section className="deck mb-12">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-[family-name:var(--font-display)] text-[1.8rem] tracking-tight">
            الوسطاء
          </h2>
          <span className="eyebrow" dir="ltr" lang="en">
            Tenants
          </span>
        </div>
        {loading ? (
          <TableSkeleton rows={5} />
        ) : !tenants || tenants.items.length === 0 ? (
          <div className="sheet p-10 text-center font-[family-name:var(--font-serif)] italic text-[color:var(--color-ink-faint)]">
            لسه ما حدش سجّل
          </div>
        ) : (
          <div className="sheet overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[color:var(--color-rule-strong)] bg-[color:var(--color-vellum)]">
                    <Th>#</Th>
                    <Th>المكتب</Th>
                    <Th>الباقة</Th>
                    <Th>الكود</Th>
                    <Th>عملاء (إجمالي)</Th>
                    <Th>عملاء (7 أيام)</Th>
                    <Th>سجّل من</Th>
                    <Th>الحالة</Th>
                    <Th></Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[color:var(--color-rule)]">
                  {tenants.items.map((t) => (
                    <tr key={t.id} className="row-hover">
                      <Td className="tabular numerals" dir="ltr">
                        #{t.id}
                      </Td>
                      <Td>
                        <div className="font-[family-name:var(--font-body)] text-[1rem] text-[color:var(--color-ink)]">
                          {t.businessName ?? t.name ?? "—"}
                        </div>
                        {t.contactEmail ? (
                          <div
                            className="font-[family-name:var(--font-mono)] text-[0.82rem] text-[color:var(--color-ink-faint)]"
                            dir="ltr"
                          >
                            {t.contactEmail}
                          </div>
                        ) : null}
                      </Td>
                      <Td>
                        <span className="font-[family-name:var(--font-serif)] text-[0.92rem] tracking-[0.02em] uppercase text-[color:var(--color-ink-soft)]">
                          {t.planTier}
                        </span>
                      </Td>
                      <Td>
                        {t.magicCode ? (
                          <code
                            className="font-[family-name:var(--font-mono)] text-[0.85rem] text-[color:var(--color-brick)] tracking-tight"
                            dir="ltr"
                          >
                            BR-{t.magicCode}
                          </code>
                        ) : (
                          "—"
                        )}
                      </Td>
                      <Td className="tabular numerals" dir="ltr">
                        {formatNumber(t.leadsTotal)}
                      </Td>
                      <Td className="tabular numerals" dir="ltr">
                        {formatNumber(t.leadsLast7Days)}
                      </Td>
                      <Td>
                        <span className="font-[family-name:var(--font-serif)] italic text-[0.88rem] text-[color:var(--color-ink-faint)]">
                          {relativeTime(t.createdAt)}
                        </span>
                      </Td>
                      <Td>
                        <Badge tone={t.isActive ? "ok" : "neutral"} dot>
                          {t.isActive ? "نشط" : "موقوف"}
                        </Badge>
                      </Td>
                      <Td>
                        <Button
                          variant="ghost"
                          size="sm"
                          loading={togglingId === t.id}
                          onClick={() => toggleActive(t.id, t.isActive)}
                        >
                          {t.isActive ? "وقف" : "فعّل"}
                        </Button>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* ─── FAILED NOTIFICATIONS ────────────────────────────── */}
      <section className="deck pb-20">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-[family-name:var(--font-display)] text-[1.8rem] tracking-tight">
            تنبيهات فشلت
          </h2>
          <span className="eyebrow" dir="ltr" lang="en">
            Failed notifications · last 24h
          </span>
        </div>
        {loading ? (
          <TableSkeleton rows={3} />
        ) : !failed || failed.items.length === 0 ? (
          <div className="sheet p-10 text-center">
            <p className="font-[family-name:var(--font-display)] text-[1.4rem] text-[color:var(--color-ok)] mb-1">
              ما فيش فشل ✓
            </p>
            <p className="font-[family-name:var(--font-serif)] italic text-[0.95rem] text-[color:var(--color-ink-faint)]">
              كل التنبيهات في آخر 24 ساعة وصلت بنجاح.
            </p>
          </div>
        ) : (
          <div className="sheet overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[color:var(--color-rule-strong)] bg-[color:var(--color-vellum)]">
                  <Th>#</Th>
                  <Th>الوسيط</Th>
                  <Th>العميل</Th>
                  <Th>السن</Th>
                  <Th>الحالة</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--color-rule)]">
                {failed.items.map((it) => (
                  <tr key={it.id} className="row-hover">
                    <Td className="tabular numerals" dir="ltr">
                      #{it.id}
                    </Td>
                    <Td className="tabular numerals" dir="ltr">
                      tenant #{it.tenantId}
                    </Td>
                    <Td dir="ltr">
                      <span className="font-[family-name:var(--font-mono)] text-[0.92rem] tabular">
                        {it.customerPhone}
                      </span>
                    </Td>
                    <Td>
                      <span className="font-[family-name:var(--font-serif)] italic text-[0.92rem] text-[color:var(--color-ink-soft)]">
                        منذ {it.ageMinutes} دقيقة
                      </span>
                    </Td>
                    <Td>
                      <Badge tone="warn" dot>
                        لم يُنبَّه
                      </Badge>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

function HealthCard({
  health,
  loading,
}: {
  health: AdminHealth | null;
  loading: boolean;
}) {
  if (loading || !health) {
    return (
      <div className="sheet p-7">
        <div className="skeleton h-6 w-40 mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <div className="skeleton h-3 w-20 mb-2" />
              <div className="skeleton h-5 w-28" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const tone =
    health.status === "healthy"
      ? "ok"
      : health.status === "degraded"
      ? "warn"
      : "err";

  return (
    <div className="sheet p-7">
      <div className="flex items-baseline justify-between gap-4 mb-5">
        <div className="flex items-baseline gap-3">
          <h2 className="font-[family-name:var(--font-display)] text-[1.5rem] tracking-tight">
            صحة المنصة
          </h2>
          <Badge tone={tone} dot>
            {statusLabel(health.status)}
          </Badge>
        </div>
        <span
          className="font-[family-name:var(--font-serif)] italic text-[0.85rem] text-[color:var(--color-ink-faint)]"
          dir="ltr"
        >
          {formatDateTime(health.timestamp)}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-5">
        <HealthMetric
          label="قاعدة البيانات"
          labelEn="Database"
          value={health.checks.database.ok ? "متصل" : "مفصول"}
          tone={health.checks.database.ok ? "ok" : "err"}
        />
        <HealthMetric
          label="تنبيهات 24س"
          labelEn="24h notifications"
          value={`${formatNumber(health.checks.leadNotifications24h.notified)}/${formatNumber(health.checks.leadNotifications24h.attempted)}`}
        />
        <HealthMetric
          label="نسبة الفشل"
          labelEn="Failure rate"
          value={formatPercent(health.checks.leadNotifications24h.failureRatePct)}
          tone={
            health.checks.leadNotifications24h.failureRatePct < 10
              ? "ok"
              : health.checks.leadNotifications24h.failureRatePct < 50
              ? "warn"
              : "err"
          }
        />
        <HealthMetric
          label="بيئة التشغيل"
          labelEn="Environment"
          value={health.env}
        />
      </div>

      {/* Config presence — small text grid, dot per flag */}
      <div className="mt-7 pt-5 border-t border-[color:var(--color-rule)]">
        <p className="eyebrow mb-3">مفاتيح الإعداد</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2">
          {Object.entries(health.checks.configPresence).map(([k, v]) => (
            <div
              key={k}
              className="flex items-center gap-2 font-[family-name:var(--font-serif)] text-[0.88rem]"
              dir="ltr"
            >
              <span
                aria-hidden
                className={
                  "size-1.5 rounded-full shrink-0 " +
                  (typeof v === "boolean"
                    ? v
                      ? "bg-[color:var(--color-ok)]"
                      : "bg-[color:var(--color-err)]"
                    : "bg-[color:var(--color-ink-faint)]")
                }
              />
              <span className="text-[color:var(--color-ink-soft)] truncate">
                {k}
              </span>
              <span className="text-[color:var(--color-ink-faint)] ms-auto">
                {typeof v === "boolean" ? (v ? "✓" : "✗") : String(v)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HealthMetric({
  label,
  labelEn,
  value,
  tone,
}: {
  label: string;
  labelEn?: string;
  value: string;
  tone?: "ok" | "warn" | "err";
}) {
  const toneCls =
    tone === "ok"
      ? "text-[color:var(--color-ok)]"
      : tone === "warn"
      ? "text-[color:var(--color-warn)]"
      : tone === "err"
      ? "text-[color:var(--color-err)]"
      : "text-[color:var(--color-ink)]";
  return (
    <div>
      <div className="eyebrow mb-1">
        {label}
        {labelEn ? (
          <span className="ms-2 italic normal-case text-[color:var(--color-ink-faint)]" dir="ltr" lang="en">
            {labelEn}
          </span>
        ) : null}
      </div>
      <div
        className={
          "font-[family-name:var(--font-display)] text-[1.2rem] tabular numerals " +
          toneCls
        }
      >
        {value}
      </div>
    </div>
  );
}

function statusLabel(s: string) {
  switch (s) {
    case "healthy":
      return "بصحة جيدة";
    case "degraded":
      return "متراجع";
    case "unhealthy":
      return "متوقف";
    default:
      return s;
  }
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
