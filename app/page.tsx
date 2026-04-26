"use client";

import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { AuthedRedirect } from "@/components/AuthedRedirect";
import { HeroSection } from "@/components/HeroSection";
import { useI18n } from "@/components/I18nProvider";

export default function Home() {
  const { t } = useI18n();

  return (
    <>
      <AuthedRedirect />
      <SiteHeader />

      <HeroSection />

      {/* ─── HOW IT WORKS ─────────────────────────────────────── */}
      <section className="border-t border-[color:var(--color-border-subtle)] bg-[color:var(--color-bg-surface)]">
        <div className="deck py-20 md:py-28">
          <div className="max-w-3xl mb-14 md:mb-16">
            <span className="eyebrow mb-3 block">{t("how.eyebrow")}</span>
            <h2 className="font-[family-name:var(--font-display)] text-[clamp(1.8rem,4vw,2.8rem)] font-semibold leading-[1.08] tracking-[-0.02em] text-[color:var(--color-fg-primary)]">
              {t("how.title")}
            </h2>
          </div>

          <ol className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-5">
            <Step
              n={1}
              title={t("how.step1Title")}
              body={t("how.step1Body")}
              note={t("how.step1Note")}
            />
            <Step
              n={2}
              title={t("how.step2Title")}
              body={t("how.step2Body")}
              note={t("how.step2Note")}
            />
            <Step
              n={3}
              title={t("how.step3Title")}
              body={t("how.step3Body")}
              note={t("how.step3Note")}
            />
          </ol>

          <div className="mt-16 md:mt-20 grid md:grid-cols-[1fr_auto] gap-6 items-end border-t border-[color:var(--color-border-subtle)] pt-10">
            <p className="font-[family-name:var(--font-quote)] italic text-[1.15rem] md:text-[1.25rem] leading-relaxed text-[color:var(--color-fg-secondary)] max-w-[44ch]">
              {t("how.quote")}
            </p>
            <Link
              href="/signup"
              className="self-start md:self-end inline-flex h-11 items-center px-5 rounded-full bg-[color:var(--color-bg-brand)] text-[color:var(--color-fg-inverse)] font-[family-name:var(--font-display)] font-medium text-[0.95rem] hover:bg-[color:var(--color-bg-brand-hover)] transition-colors shadow-[var(--shadow-subtle)]"
            >
              {t("how.ctaStart")}
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ───────────────────────────────────────────── */}
      <footer className="border-t border-[color:var(--color-border-subtle)] bg-[color:var(--color-bg-canvas)]">
        <div className="deck py-10 flex flex-wrap items-center justify-between gap-4 text-[color:var(--color-fg-tertiary)]">
          <p className="text-[0.92rem] font-[family-name:var(--font-body)]">
            {t("footer.city")}
          </p>
          <p
            className="text-[0.85rem] tracking-[0.04em] font-[family-name:var(--font-mono)]"
            dir="ltr"
          >
            {t("footer.version")} · {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </>
  );
}

function Step({
  n,
  title,
  body,
  note,
}: {
  n: number;
  title: string;
  body: string;
  note: string;
}) {
  return (
    <li className="relative p-6 md:p-7 rounded-[var(--radius-lg)] bg-[color:var(--color-bg-canvas)] border border-[color:var(--color-border-subtle)] hover:shadow-[var(--shadow-card)] hover:-translate-y-0.5 transition-all duration-200">
      <div className="size-11 rounded-full bg-[color:var(--color-bg-brand-soft)] text-[color:var(--color-fg-brand)] inline-flex items-center justify-center font-[family-name:var(--font-display)] font-semibold text-[1.05rem] mb-5">
        0{n}
      </div>
      <h3 className="font-[family-name:var(--font-display)] text-[1.25rem] font-semibold text-[color:var(--color-fg-primary)] mb-2.5 tracking-[-0.015em]">
        {title}
      </h3>
      <p className="font-[family-name:var(--font-body)] text-[0.98rem] leading-[1.6] text-[color:var(--color-fg-secondary)]">
        {body}
      </p>
      <p className="mt-4 pt-4 border-t border-[color:var(--color-border-subtle)] font-[family-name:var(--font-body)] text-[0.88rem] text-[color:var(--color-fg-tertiary)]">
        {note}
      </p>
    </li>
  );
}
