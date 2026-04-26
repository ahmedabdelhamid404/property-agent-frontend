"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Logo } from "./Logo";
import { useI18n } from "./I18nProvider";
import { broker } from "@/lib/storage";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

/**
 * Collapsed-by-default sidebar for the dashboard.
 * - Hovers expand to show labels (240px)
 * - Tooltip-style label appears on hover when collapsed
 * - Hidden on `<lg`; mobile uses a top-bar hamburger drawer instead
 */
export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useI18n();
  const [hovered, setHovered] = useState(false);
  const expanded = hovered;

  const items: NavItem[] = [
    {
      href: "/dashboard/overview",
      label: t("dashboard.tabStats"),
      icon: <OverviewIcon />,
    },
    {
      href: "/dashboard/leads",
      label: t("dashboard.tabLeads"),
      icon: <LeadsIcon />,
    },
    {
      href: "/dashboard/inventory",
      label: t("dashboard.tabInventory"),
      icon: <InventoryIcon />,
    },
    {
      href: "/dashboard/analytics",
      label: t("dashboard.tabAnalytics"),
      icon: <AnalyticsIcon />,
    },
    {
      href: "/dashboard/settings",
      label: t("dashboard.tabSettings"),
      icon: <SettingsIcon />,
    },
  ];

  function signOut() {
    broker.clear();
    router.push("/");
  }

  return (
    <aside
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "hidden lg:flex flex-col fixed inset-y-0 start-0 z-40",
        "bg-[color:var(--color-bg-surface)]",
        "border-e border-[color:var(--color-border-subtle)]",
        "shadow-[var(--shadow-subtle)]",
        "transition-[width] duration-200 ease-out",
        expanded ? "w-[240px]" : "w-[68px]",
      )}
      aria-label="Dashboard navigation"
    >
      {/* Logo */}
      <Link
        href="/dashboard/overview"
        className="flex items-center h-16 border-b border-[color:var(--color-border-subtle)] shrink-0 overflow-hidden ps-[18px]"
      >
        <Logo showWordmark={expanded} />
      </Link>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {items.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "group relative flex items-center h-11 rounded-[var(--radius-sm)]",
                    "transition-colors duration-150",
                    active
                      ? "bg-[color:var(--color-bg-brand-soft)] text-[color:var(--color-fg-brand)]"
                      : "text-[color:var(--color-fg-secondary)] hover:bg-[color:var(--color-bg-sunken)] hover:text-[color:var(--color-fg-primary)]",
                  )}
                >
                  <span className="size-11 shrink-0 inline-flex items-center justify-center">
                    {item.icon}
                  </span>
                  <span
                    className={cn(
                      "font-[family-name:var(--font-display)] text-[0.92rem] font-medium whitespace-nowrap",
                      "transition-opacity duration-150",
                      expanded ? "opacity-100" : "opacity-0 pointer-events-none",
                    )}
                  >
                    {item.label}
                  </span>

                  {/* Tooltip when collapsed */}
                  {!expanded ? (
                    <span
                      className={cn(
                        "absolute start-full ms-2 px-2.5 py-1.5 rounded-[var(--radius-xs)]",
                        "bg-[color:var(--color-neutral-900)] text-[color:var(--color-fg-inverse)]",
                        "font-[family-name:var(--font-display)] text-[0.8rem] font-medium whitespace-nowrap",
                        "opacity-0 group-hover:opacity-100 pointer-events-none",
                        "transition-opacity duration-150",
                        "shadow-[var(--shadow-card)]",
                      )}
                    >
                      {item.label}
                    </span>
                  ) : null}

                  {/* Active indicator pill */}
                  {active ? (
                    <span
                      aria-hidden
                      className="absolute start-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-full bg-[color:var(--color-fg-brand)]"
                    />
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer — sign out */}
      <div className="px-2 py-3 border-t border-[color:var(--color-border-subtle)] shrink-0">
        <button
          type="button"
          onClick={signOut}
          className={cn(
            "group relative flex items-center w-full h-11 rounded-[var(--radius-sm)]",
            "text-[color:var(--color-fg-secondary)] hover:bg-[color:var(--color-bg-sunken)] hover:text-[color:var(--color-error)]",
            "transition-colors duration-150",
          )}
          aria-label={t("nav.signOut")}
        >
          <span className="size-11 shrink-0 inline-flex items-center justify-center">
            <SignOutIcon />
          </span>
          <span
            className={cn(
              "font-[family-name:var(--font-display)] text-[0.92rem] font-medium whitespace-nowrap",
              "transition-opacity duration-150",
              expanded ? "opacity-100" : "opacity-0 pointer-events-none",
            )}
          >
            {t("nav.signOut")}
          </span>
          {!expanded ? (
            <span
              className={cn(
                "absolute start-full ms-2 px-2.5 py-1.5 rounded-[var(--radius-xs)]",
                "bg-[color:var(--color-neutral-900)] text-[color:var(--color-fg-inverse)]",
                "font-[family-name:var(--font-display)] text-[0.8rem] font-medium whitespace-nowrap",
                "opacity-0 group-hover:opacity-100 pointer-events-none",
                "transition-opacity duration-150",
                "shadow-[var(--shadow-card)]",
              )}
            >
              {t("nav.signOut")}
            </span>
          ) : null}
        </button>
      </div>
    </aside>
  );
}

/* ──────────────────────────────────────────────────────────────────
   Icons
   ────────────────────────────────────────────────────────────────── */

function OverviewIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="size-5">
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  );
}
function LeadsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="size-5">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function InventoryIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="size-5">
      <path d="M3 9l9-6 9 6v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}
function AnalyticsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="size-5">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
      <line x1="3" y1="20" x2="21" y2="20" />
    </svg>
  );
}
function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="size-5">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
function SignOutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="size-5">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
