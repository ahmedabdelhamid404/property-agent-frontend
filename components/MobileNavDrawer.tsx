"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { Logo } from "./Logo";
import { LanguageToggle } from "./LanguageToggle";
import { useI18n } from "./I18nProvider";

interface NavLink {
  href: string;
  label: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  links: NavLink[];
  authed: boolean;
  onSignOut?: () => void;
}

/**
 * Slide-out menu for <md viewports. Slides in from the end side
 * (right in LTR, left in RTL). Closes on escape or backdrop tap;
 * locks body scroll while open.
 */
export function MobileNavDrawer({
  open,
  onClose,
  links,
  authed,
  onSignOut,
}: Props) {
  const { t } = useI18n();
  const pathname = usePathname();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Move focus into the drawer when it opens
  useEffect(() => {
    if (open) drawerRef.current?.focus();
  }, [open]);

  return (
    <div
      aria-hidden={!open}
      className={
        "fixed inset-0 z-50 md:hidden " +
        (open ? "pointer-events-auto" : "pointer-events-none")
      }
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label={t("common.cancel")}
        onClick={onClose}
        tabIndex={open ? 0 : -1}
        className={
          "absolute inset-0 bg-[rgba(13,74,74,0.35)] backdrop-blur-sm transition-opacity duration-200 " +
          (open ? "opacity-100" : "opacity-0")
        }
      />

      {/* Panel — slides from end side */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        className={
          "absolute inset-y-0 end-0 w-[85%] max-w-[360px] " +
          "bg-[color:var(--color-bg-surface)] " +
          "shadow-[var(--shadow-hero)] " +
          "border-s border-[color:var(--color-border-subtle)] " +
          "flex flex-col " +
          "transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] " +
          "rtl:[&]:transform-none " +
          (open ? "translate-x-0" : "translate-x-full rtl:-translate-x-full")
        }
      >
        {/* Header inside drawer */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[color:var(--color-border-subtle)]">
          <Logo />
          <button
            type="button"
            onClick={onClose}
            aria-label={t("common.cancel")}
            className="size-9 inline-flex items-center justify-center rounded-full hover:bg-[color:var(--color-bg-sunken)] transition-colors"
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
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Links */}
        <nav className="flex-1 overflow-y-auto px-5 py-6">
          <ul className="space-y-1">
            {links.map((l) => {
              const active = pathname === l.href;
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
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
                    {l.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer — language + signout */}
        <div className="px-5 py-5 border-t border-[color:var(--color-border-subtle)] flex items-center justify-between gap-3">
          <LanguageToggle />
          {authed ? (
            <button
              type="button"
              onClick={() => {
                onSignOut?.();
                onClose();
              }}
              className={
                "inline-flex items-center gap-2 h-10 px-4 rounded-full " +
                "border border-[color:var(--color-border-subtle)] " +
                "bg-[color:var(--color-bg-surface)] " +
                "font-[family-name:var(--font-display)] text-[0.88rem] font-medium " +
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
              {t("nav.signOut")}
            </button>
          ) : (
            <Link
              href="/signup"
              onClick={onClose}
              className={
                "inline-flex items-center h-10 px-5 rounded-full " +
                "bg-[color:var(--color-bg-brand)] text-[color:var(--color-fg-inverse)] " +
                "font-[family-name:var(--font-display)] text-[0.88rem] font-medium " +
                "hover:bg-[color:var(--color-bg-brand-hover)] " +
                "transition-colors shadow-[var(--shadow-subtle)]"
              }
            >
              {t("nav.getStarted")}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
