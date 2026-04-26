"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { LanguageToggle } from "./LanguageToggle";
import { useI18n } from "./I18nProvider";
import { broker } from "@/lib/storage";
import { cn } from "@/lib/utils";

type PageKey = "overview" | "leads" | "inventory" | "analytics" | "settings";

function detectPage(pathname: string): PageKey {
  if (pathname.startsWith("/dashboard/leads")) return "leads";
  if (pathname.startsWith("/dashboard/inventory")) return "inventory";
  if (pathname.startsWith("/dashboard/analytics")) return "analytics";
  if (pathname.startsWith("/dashboard/settings")) return "settings";
  return "overview";
}

export function DashboardTopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useI18n();
  const [name, setName] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setName(broker.getProfile().name);
  }, []);

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  const page = detectPage(pathname);

  function signOut() {
    broker.clear();
    router.push("/");
  }

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-30",
          "bg-[color:var(--color-bg-canvas)]/85 backdrop-blur-md",
          "border-b border-[color:var(--color-border-subtle)]",
        )}
      >
        <div className="px-4 md:px-6 lg:px-8 h-16 flex items-center gap-3">
          {/* Mobile-only: hamburger + logo */}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            className={cn(
              "lg:hidden size-10 inline-flex items-center justify-center rounded-full",
              "border border-[color:var(--color-border-subtle)] bg-[color:var(--color-bg-surface)]",
              "hover:border-[color:var(--color-border-default)] transition-colors",
            )}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="size-5 text-[color:var(--color-fg-primary)]">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <Link href="/dashboard/overview" className="lg:hidden">
            <Logo />
          </Link>

          {/* Page title — visible on lg+ */}
          <div className="hidden lg:block">
            <h1 className="font-[family-name:var(--font-display)] text-[1.2rem] font-semibold tracking-[-0.015em] text-[color:var(--color-fg-primary)] leading-tight">
              {t(`dashboard.pageTitle.${page}`)}
            </h1>
            <p className="font-[family-name:var(--font-body)] text-[0.82rem] text-[color:var(--color-fg-tertiary)] mt-0.5 line-clamp-1">
              {t(`dashboard.pageSubtitle.${page}`)}
            </p>
          </div>

          {/* Right rail */}
          <div className="ms-auto flex items-center gap-3">
            {name ? (
              <span className="hidden xl:block font-[family-name:var(--font-body)] text-[0.88rem] text-[color:var(--color-fg-secondary)] truncate max-w-[200px]">
                {name}
              </span>
            ) : null}
            <LanguageToggle />
          </div>
        </div>
      </header>

      {/* Mobile off-canvas drawer */}
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} onSignOut={signOut} />
    </>
  );
}

/* ──────────────────────────────────────────────────────────────────
   Mobile drawer with the same nav items as the sidebar
   ────────────────────────────────────────────────────────────────── */

function MobileDrawer({
  open,
  onClose,
  onSignOut,
}: {
  open: boolean;
  onClose: () => void;
  onSignOut: () => void;
}) {
  const pathname = usePathname();
  const { t } = useI18n();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const items = [
    { href: "/dashboard/overview", label: t("dashboard.tabStats") },
    { href: "/dashboard/leads", label: t("dashboard.tabLeads") },
    { href: "/dashboard/inventory", label: t("dashboard.tabInventory") },
    { href: "/dashboard/analytics", label: t("dashboard.tabAnalytics") },
    { href: "/dashboard/settings", label: t("dashboard.tabSettings") },
  ];

  return (
    <div
      aria-hidden={!open}
      className={
        "fixed inset-0 z-50 lg:hidden " +
        (open ? "pointer-events-auto" : "pointer-events-none")
      }
    >
      <button
        type="button"
        aria-label={t("common.cancel")}
        onClick={onClose}
        tabIndex={open ? 0 : -1}
        className={
          "absolute inset-0 bg-[rgba(13,74,74,0.4)] backdrop-blur-sm transition-opacity duration-200 " +
          (open ? "opacity-100" : "opacity-0")
        }
      />
      <div
        role="dialog"
        aria-modal="true"
        className={
          "absolute inset-y-0 start-0 w-[80%] max-w-[320px] " +
          "bg-[color:var(--color-bg-surface)] " +
          "border-e border-[color:var(--color-border-subtle)] " +
          "shadow-[var(--shadow-hero)] flex flex-col " +
          "transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] " +
          (open ? "translate-x-0" : "-translate-x-full rtl:translate-x-full")
        }
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[color:var(--color-border-subtle)]">
          <Logo />
          <button
            type="button"
            onClick={onClose}
            aria-label={t("common.cancel")}
            className="size-9 inline-flex items-center justify-center rounded-full hover:bg-[color:var(--color-bg-sunken)] transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-5 py-6">
          <ul className="space-y-1">
            {items.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={
                      "block px-4 py-3 rounded-[var(--radius-md)] " +
                      "font-[family-name:var(--font-display)] text-[1.05rem] font-medium " +
                      "transition-colors duration-200 " +
                      (active
                        ? "bg-[color:var(--color-bg-brand-soft)] text-[color:var(--color-fg-brand)]"
                        : "text-[color:var(--color-fg-primary)] hover:bg-[color:var(--color-bg-sunken)]")
                    }
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="px-5 py-5 border-t border-[color:var(--color-border-subtle)] flex items-center justify-between gap-3">
          <LanguageToggle />
          <button
            type="button"
            onClick={() => {
              onSignOut();
              onClose();
            }}
            className={
              "inline-flex items-center gap-2 h-10 px-4 rounded-full " +
              "border border-[color:var(--color-border-subtle)] " +
              "bg-[color:var(--color-bg-surface)] " +
              "font-[family-name:var(--font-display)] text-[0.88rem] font-medium " +
              "text-[color:var(--color-fg-primary)] " +
              "hover:border-[color:var(--color-border-default)] hover:text-[color:var(--color-error)] " +
              "transition-colors"
            }
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="size-4">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            {t("nav.signOut")}
          </button>
        </div>
      </div>
    </div>
  );
}
