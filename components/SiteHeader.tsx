"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { LanguageToggle } from "./LanguageToggle";
import { MobileNavDrawer } from "./MobileNavDrawer";
import { useI18n } from "./I18nProvider";
import { broker } from "@/lib/storage";

interface Props {
  /** When true, also surface the broker's business name in the right rail. */
  showBrokerSession?: boolean;
}

export function SiteHeader({ showBrokerSession }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useI18n();
  const [authed, setAuthed] = useState(false);
  const [name, setName] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const has = !!broker.getKey();
    setAuthed(has);
    if (has) setName(broker.getProfile().name);
    setHydrated(true);
  }, [showBrokerSession, pathname]);

  // Auto-close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  function signOut() {
    broker.clear();
    router.push("/");
  }

  const links = [
    { href: "/", label: t("nav.home"), authedOnly: false, unauthedOnly: false },
    { href: "/login", label: t("nav.login"), authedOnly: false, unauthedOnly: true },
    { href: "/signup", label: t("nav.signup"), authedOnly: false, unauthedOnly: true },
  ];

  const visibleLinks = links.filter((l) => {
    if (!hydrated) return !l.authedOnly && !l.unauthedOnly;
    if (authed) return !l.unauthedOnly;
    return !l.authedOnly;
  });

  // Add "Dashboard" link to mobile drawer when authed (gives them a quick hop home)
  const mobileLinks = hydrated && authed
    ? [...visibleLinks, { href: "/dashboard", label: t("nav.dashboard") }]
    : visibleLinks;

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-[color:var(--color-border-subtle)] bg-[color:var(--color-bg-surface)]/80 backdrop-blur-md">
        <div className="deck flex items-center justify-between gap-4 py-4">
          <Link href="/" className="shrink-0" aria-label="Property-Agent home">
            <Logo />
          </Link>

          <nav
            className="hidden md:flex items-center gap-1"
            aria-label="Primary"
          >
            {visibleLinks.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={
                    "px-4 py-2 rounded-full text-[0.92rem] font-medium transition-colors duration-200 " +
                    "font-[family-name:var(--font-display)] " +
                    (active
                      ? "bg-[color:var(--color-bg-brand-soft)] text-[color:var(--color-fg-brand)]"
                      : "text-[color:var(--color-fg-secondary)] hover:bg-[color:var(--color-bg-sunken)] hover:text-[color:var(--color-fg-primary)]")
                  }
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 ms-auto md:ms-0">
            <LanguageToggle />

            {hydrated && authed ? (
              <>
                {showBrokerSession && name ? (
                  <span className="hidden lg:block font-[family-name:var(--font-body)] text-[0.88rem] text-[color:var(--color-fg-secondary)] truncate max-w-[180px] ms-2">
                    {name}
                  </span>
                ) : null}
                <button
                  type="button"
                  onClick={signOut}
                  aria-label={t("nav.signOut")}
                  className={
                    "hidden md:inline-flex items-center gap-2 h-9 px-3.5 rounded-full " +
                    "border border-[color:var(--color-border-subtle)] " +
                    "bg-[color:var(--color-bg-surface)] " +
                    "font-[family-name:var(--font-display)] text-[0.85rem] font-medium " +
                    "text-[color:var(--color-fg-primary)] " +
                    "hover:border-[color:var(--color-border-default)] hover:text-[color:var(--color-fg-brand)] " +
                    "transition-colors"
                  }
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-4"
                    aria-hidden
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  <span>{t("nav.signOut")}</span>
                </button>
              </>
            ) : hydrated ? (
              <Link
                href="/signup"
                className={
                  "hidden md:inline-flex items-center h-9 px-4 rounded-full " +
                  "bg-[color:var(--color-bg-brand)] text-[color:var(--color-fg-inverse)] " +
                  "font-[family-name:var(--font-display)] text-[0.88rem] font-medium " +
                  "hover:bg-[color:var(--color-bg-brand-hover)] " +
                  "transition-colors shadow-[var(--shadow-subtle)]"
                }
              >
                {t("nav.getStarted")}
              </Link>
            ) : null}

            {/* Mobile-only: hamburger */}
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
              aria-expanded={drawerOpen}
              className={
                "md:hidden size-10 inline-flex items-center justify-center rounded-full " +
                "border border-[color:var(--color-border-subtle)] " +
                "bg-[color:var(--color-bg-surface)] " +
                "hover:border-[color:var(--color-border-default)] " +
                "transition-colors"
              }
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-5 text-[color:var(--color-fg-primary)]"
                aria-hidden
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <MobileNavDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        links={mobileLinks}
        authed={hydrated && authed}
        onSignOut={signOut}
      />
    </>
  );
}
