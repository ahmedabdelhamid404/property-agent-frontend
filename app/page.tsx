"use client";

import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { AuthedRedirect } from "@/components/AuthedRedirect";
import { useI18n } from "@/components/I18nProvider";

export default function Home() {
  const { t, locale } = useI18n();

  return (
    <>
      <AuthedRedirect />
      <SiteHeader />

      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden gradient-mesh">
        <div className="deck pt-16 md:pt-24 pb-20 md:pb-32 relative">
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-16 items-center">
            {/* Copy */}
            <div>
              <span className="pill rise-1 mb-6">
                <span className="size-1.5 rounded-full bg-[color:var(--color-fg-brand)]" />
                {t("hero.eyebrow")}
              </span>

              <h1 className="rise-2 max-w-[20ch] font-[family-name:var(--font-display)] text-[clamp(2.4rem,5.4vw,4.4rem)] leading-[0.98] tracking-[-0.025em] text-[color:var(--color-fg-primary)]">
                {t("hero.titlePart1")}{" "}
                <span className="relative inline-block">
                  <span className="relative z-10 text-[color:var(--color-fg-brand)]">
                    {t("hero.titleAccent")}
                  </span>
                  <span
                    aria-hidden
                    className="absolute inset-x-[-4%] bottom-[6%] h-[26%] -z-0 rounded-full bg-[color:var(--color-bg-highlight)]"
                  />
                </span>{" "}
                {t("hero.titlePart2")}
              </h1>

              <p className="rise-3 mt-7 max-w-[58ch] font-[family-name:var(--font-body)] text-[1.1rem] md:text-[1.18rem] leading-[1.6] text-[color:var(--color-fg-secondary)]">
                {t("hero.body")}
              </p>

              <div className="rise-3 mt-10 flex flex-wrap items-center gap-4">
                <Link
                  href="/signup"
                  className="inline-flex h-13 items-center px-7 rounded-full bg-[color:var(--color-bg-brand)] text-[color:var(--color-fg-inverse)] font-[family-name:var(--font-display)] font-medium text-[1.02rem] hover:bg-[color:var(--color-bg-brand-hover)] transition-colors shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-raised)]"
                >
                  {t("hero.ctaPrimary")}
                  <ArrowIcon dir={locale === "ar" ? "rtl" : "ltr"} />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex h-13 items-center px-5 rounded-full text-[color:var(--color-fg-primary)] font-[family-name:var(--font-display)] font-medium text-[0.95rem] hover:bg-[color:var(--color-bg-sunken)] transition-colors"
                >
                  {t("hero.ctaSecondary")}
                </Link>
              </div>

              <div className="rise-4 mt-12 grid grid-cols-3 gap-4 sm:gap-8 max-w-2xl">
                <Stat label={t("hero.stat1Label")} value={t("hero.stat1Value")} />
                <Stat label={t("hero.stat2Label")} value={t("hero.stat2Value")} />
                <Stat label={t("hero.stat3Label")} value={t("hero.stat3Value")} />
              </div>
            </div>

            {/* Visual — phone mockup with chat preview */}
            <div className="rise-2 hidden lg:block">
              <ChatMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─────────────────────────────────────── */}
      <section className="border-t border-[color:var(--color-border-subtle)] bg-[color:var(--color-bg-surface)]">
        <div className="deck py-20 md:py-28">
          <div className="max-w-3xl mb-14 md:mb-16">
            <span className="eyebrow mb-3 block">{t("how.eyebrow")}</span>
            <h2 className="font-[family-name:var(--font-display)] text-[clamp(1.8rem,4vw,2.8rem)] leading-[1.08] tracking-[-0.02em] text-[color:var(--color-fg-primary)]">
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-[family-name:var(--font-display)] text-[0.78rem] font-semibold uppercase tracking-[0.06em] text-[color:var(--color-fg-tertiary)] mb-1.5">
        {label}
      </div>
      <div className="font-[family-name:var(--font-display)] text-[1.2rem] sm:text-[1.4rem] font-semibold text-[color:var(--color-fg-primary)] tracking-[-0.015em]">
        {value}
      </div>
    </div>
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

function ArrowIcon({ dir }: { dir: "ltr" | "rtl" }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={"size-4 " + (dir === "rtl" ? "rotate-180" : "")}
      aria-hidden
    >
      <path d="M4 10h12" />
      <path d="M11 5l5 5-5 5" />
    </svg>
  );
}

function ChatMockup() {
  return (
    <div className="relative max-w-md mx-auto">
      {/* Phone frame */}
      <div className="relative rounded-[36px] bg-[color:var(--color-neutral-900)] p-3 shadow-[var(--shadow-hero)]">
        <div className="rounded-[28px] bg-[color:var(--color-neutral-50)] overflow-hidden">
          {/* WhatsApp-ish header */}
          <div className="bg-[color:var(--color-bg-brand)] px-4 py-3 flex items-center gap-3">
            <div className="size-9 rounded-full bg-[color:var(--color-bg-accent)] flex items-center justify-center text-[color:var(--color-neutral-900)] font-bold">
              P
            </div>
            <div className="text-[color:var(--color-fg-inverse)]">
              <div className="text-[0.92rem] font-semibold">Property-Agent</div>
              <div className="text-[0.72rem] opacity-80">online</div>
            </div>
          </div>

          {/* Chat area */}
          <div className="p-4 space-y-3 min-h-[420px] bg-[color:var(--color-mint-50)]/40">
            <ChatBubble side="them">
              أهلاً! 👋 أنا وكيلك العقاري الذكي. تحب أساعدك في إيه؟
            </ChatBubble>
            <ChatBubble side="me">
              عايز شقة 3 غرف في التجمع، حدود 4م
            </ChatBubble>
            <ChatBubble side="them">
              تمام، عندي 4 خيارات تناسبك:
              <span className="block mt-2 px-3 py-2 rounded-lg bg-[color:var(--color-bg-canvas)] border border-[color:var(--color-border-subtle)] text-[color:var(--color-fg-primary)] text-[0.85rem]">
                🏢 ميڤيدا · 3 غرف · 3.8م
              </span>
            </ChatBubble>
            <ChatBubble side="me">حلوة دي عايز اعمل معاينة</ChatBubble>
          </div>

          {/* Lead alert overlay */}
          <div className="absolute bottom-7 inset-x-7 rounded-[var(--radius-md)] bg-[color:var(--color-bg-surface)] border border-[color:var(--color-border-subtle)] shadow-[var(--shadow-raised)] p-3.5 flex items-center gap-3">
            <div className="size-9 rounded-full bg-[color:var(--color-mint-200)] flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-4 text-[color:var(--color-mint-500)]"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[0.8rem] font-semibold text-[color:var(--color-fg-primary)]">
                Lead captured
              </div>
              <div className="text-[0.72rem] text-[color:var(--color-fg-tertiary)] truncate">
                +20 121 158 3210 · ready to view
              </div>
            </div>
            <div className="text-[0.7rem] font-[family-name:var(--font-mono)] text-[color:var(--color-fg-tertiary)]">
              just now
            </div>
          </div>
        </div>
      </div>

      {/* Floating gold accent */}
      <div
        aria-hidden
        className="absolute -top-6 -end-6 size-24 rounded-full bg-[color:var(--color-bg-accent-soft)] blur-2xl -z-10"
      />
      <div
        aria-hidden
        className="absolute -bottom-8 -start-8 size-32 rounded-full bg-[color:var(--color-bg-brand-soft)] blur-2xl -z-10"
      />
    </div>
  );
}

function ChatBubble({
  children,
  side,
}: {
  children: React.ReactNode;
  side: "me" | "them";
}) {
  const isMe = side === "me";
  return (
    <div className={"flex " + (isMe ? "justify-end" : "justify-start")}>
      <div
        className={
          "max-w-[80%] px-3.5 py-2 text-[0.86rem] leading-snug rounded-2xl " +
          (isMe
            ? "bg-[color:var(--color-mint-200)] text-[color:var(--color-neutral-900)] rounded-br-md"
            : "bg-[color:var(--color-bg-surface)] border border-[color:var(--color-border-subtle)] text-[color:var(--color-fg-primary)] rounded-bl-md")
        }
        dir="rtl"
      >
        {children}
      </div>
    </div>
  );
}
