"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { broker } from "@/lib/storage";

interface Props {
  /** When true, show a "Sign out" affordance and the broker's business name. */
  showBrokerSession?: boolean;
}

export function SiteHeader({ showBrokerSession }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    if (showBrokerSession) {
      const p = broker.getProfile();
      setName(p.name);
    }
  }, [showBrokerSession]);

  const links = [
    { href: "/", label: "الرئيسية", labelEn: "Home" },
    { href: "/signup", label: "سجّل", labelEn: "Sign up" },
    { href: "/dashboard", label: "لوحة الوسيط", labelEn: "Dashboard" },
  ];

  function signOut() {
    broker.clear();
    router.push("/");
  }

  return (
    <header className="border-b border-[color:var(--color-rule)] bg-[color:var(--color-vellum)]/70 backdrop-blur-[2px]">
      <div className="deck flex items-center justify-between gap-6 py-4">
        <Link href="/" className="shrink-0" aria-label="Property-Agent home">
          <Logo />
        </Link>
        <nav className="hidden md:flex items-center gap-7" aria-label="Primary">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className="group flex flex-col items-center gap-0.5 leading-tight"
              >
                <span
                  className={
                    "font-[family-name:var(--font-display)] text-[1rem] " +
                    (active
                      ? "text-[color:var(--color-brick)]"
                      : "text-[color:var(--color-ink)] group-hover:text-[color:var(--color-brick)]")
                  }
                >
                  {l.label}
                </span>
                <span
                  className={
                    "h-px w-full transition-colors duration-200 " +
                    (active
                      ? "bg-[color:var(--color-brick)]"
                      : "bg-transparent group-hover:bg-[color:var(--color-rule-strong)]")
                  }
                />
              </Link>
            );
          })}
        </nav>
        {showBrokerSession ? (
          <div className="flex items-center gap-3 ms-auto md:ms-0">
            {name ? (
              <span className="hidden sm:block font-[family-name:var(--font-serif)] italic text-[0.92rem] text-[color:var(--color-ink-soft)] truncate max-w-[200px]">
                {name}
              </span>
            ) : null}
            <button
              type="button"
              onClick={signOut}
              className="font-[family-name:var(--font-serif)] text-[0.85rem] tracking-[0.02em] uppercase text-[color:var(--color-ink-faint)] hover:text-[color:var(--color-brick)] transition-colors"
            >
              تسجيل الخروج
            </button>
          </div>
        ) : (
          <Link
            href="/signup"
            className="hidden md:inline-flex items-center gap-2 font-[family-name:var(--font-serif)] text-[0.92rem] text-[color:var(--color-ink)] linkish"
          >
            ابدأ مجاناً
          </Link>
        )}
      </div>
    </header>
  );
}
