"use client";

import Link from "next/link";
import { useI18n } from "./I18nProvider";

const VILLA_PHOTO =
  "https://plus.unsplash.com/premium_photo-1682377521753-58d1fd9fa5ce?w=1400&auto=format&fit=crop&q=80";

export function HeroSection() {
  const { t, locale } = useI18n();
  return (
    <section className="relative overflow-hidden">
      {/* Mint canvas wash sits on the WHOLE hero — gives the photo something to bleed into */}
      <div
        aria-hidden
        className="absolute inset-0 -z-20"
        style={{
          background:
            "radial-gradient(ellipse 70% 70% at 28% 30%, rgba(168,230,197,0.28), transparent 75%), " +
            "radial-gradient(ellipse 60% 60% at 92% 92%, rgba(200,163,90,0.10), transparent 75%), " +
            "var(--color-bg-canvas)",
        }}
      />

      {/* Photographic cover — only on lg+, fades into canvas on the start side */}
      <PhotoCover />

      {/* Decorative leaves */}
      <Leaves />

      <div className="deck pt-12 md:pt-16 lg:pt-20 pb-20 md:pb-28 relative">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,540px)] gap-12 lg:gap-12 items-start">
          {/* ─── Copy column ─────────────────────────────────────── */}
          <div className="order-2 lg:order-1 lg:pt-10">
            <span className="pill rise-1 mb-6">
              <span className="size-1.5 rounded-full bg-[color:var(--color-fg-brand)]" />
              {t("hero.eyebrow")}
            </span>

            <h1 className="rise-2 max-w-[18ch] font-[family-name:var(--font-display)] text-[clamp(2.6rem,6vw,4.8rem)] leading-[0.96] tracking-[-0.028em] text-[color:var(--color-fg-primary)] font-semibold">
              {t("hero.titlePart1")}{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-[color:var(--color-fg-brand)]">
                  {t("hero.titleAccent")}
                </span>
                <span
                  aria-hidden
                  className="absolute inset-x-[-2%] bottom-[8%] h-[24%] -z-0 rounded-full bg-[color:var(--color-bg-highlight)]"
                />
              </span>{" "}
              {t("hero.titlePart2")}
            </h1>

            <p className="rise-3 mt-7 max-w-[56ch] font-[family-name:var(--font-body)] text-[1.08rem] md:text-[1.18rem] leading-[1.6] text-[color:var(--color-fg-secondary)]">
              {t("hero.body")}
            </p>

            <div className="rise-3 mt-9 flex flex-wrap items-center gap-4">
              <Link
                href="/signup"
                className="group inline-flex h-13 items-center px-7 rounded-full bg-[color:var(--color-bg-brand)] text-[color:var(--color-fg-inverse)] font-[family-name:var(--font-display)] font-semibold text-[1.02rem] hover:bg-[color:var(--color-bg-brand-hover)] transition-all shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-raised)] hover:-translate-y-0.5"
              >
                {t("hero.ctaPrimary")}
                <BoltIcon className="ms-2" />
              </Link>
              <Link
                href="/login"
                className="inline-flex h-13 items-center px-5 rounded-full text-[color:var(--color-fg-primary)] font-[family-name:var(--font-display)] font-medium text-[0.95rem] hover:bg-[color:var(--color-bg-canvas)]/60 transition-colors"
              >
                {t("hero.ctaSecondary")}
              </Link>
            </div>

            <div className="rise-4 mt-10 flex flex-wrap gap-x-6 gap-y-3">
              <TrustBadge label={t("hero.badge1")} />
              <TrustBadge label={t("hero.badge2")} />
              <TrustBadge label={t("hero.badge3")} />
            </div>
          </div>

          {/* ─── Visual column ───────────────────────────────────── */}
          <div className="order-1 lg:order-2 rise-2 relative flex justify-center lg:justify-end">
            <PhoneMockup />
          </div>
        </div>

        {/* ─── 3-pill benefit strip ────────────────────────────────── */}
        <div className="rise-4 mt-16 md:mt-24 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <BenefitCard
            icon={<TrendIcon />}
            title={t("hero.pill1Title")}
            body={t("hero.pill1Body")}
          />
          <BenefitCard
            icon={<HeadphonesIcon />}
            title={t("hero.pill2Title")}
            body={t("hero.pill2Body")}
          />
          <BenefitCard
            icon={<WhatsAppIcon />}
            title={t("hero.pill3Title")}
            body={t("hero.pill3Body")}
          />
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────
   Photographic cover — full-bleed on the visual side, fades into canvas
   ────────────────────────────────────────────────────────────────── */

function PhotoCover() {
  // Property photo on the LEFT half of the hero, full height. Image is
  // shifted to focus on the villa (background-position biased left).
  // A subtle dark overlay deepens the photo for contrast against the
  // whitening fade toward the center.
  const mask =
    "linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 35%, rgba(0,0,0,0.5) 70%, rgba(0,0,0,0) 100%)";
  return (
    <div
      aria-hidden
      className="absolute inset-y-0 left-0 hidden md:block w-[50%]"
      style={{
        zIndex: 0,
        backgroundImage: `url('${VILLA_PHOTO}')`,
        backgroundSize: "cover",
        backgroundPosition: "8% 50%",
        backgroundRepeat: "no-repeat",
        WebkitMaskImage: mask,
        maskImage: mask,
      }}
    >
      {/* Dark overlay — gives the photo more depth and richer tones,
          especially under the highlights. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, rgba(13,28,28,0.34) 0%, rgba(13,28,28,0.18) 50%, rgba(13,28,28,0.05) 100%)",
        }}
      />
      {/* Whitening fade toward the center — bleeds the photo into the
          canvas as it approaches the right side. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, rgba(250,251,250,0) 0%, rgba(250,251,250,0.1) 45%, rgba(250,251,250,0.55) 80%, var(--color-bg-canvas) 100%)",
        }}
      />
      {/* Whitening fade toward the bottom — same dissolve effect as the
          right edge so the photo bleeds into the canvas downward too. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(250,251,250,0) 0%, rgba(250,251,250,0.1) 45%, rgba(250,251,250,0.55) 80%, var(--color-bg-canvas) 100%)",
        }}
      />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────
   Phone mockup — tall, with extended chat + booking CTA
   ────────────────────────────────────────────────────────────────── */

function PhoneMockup() {
  const { t, locale } = useI18n();
  return (
    <div className="relative">
      {/* Phone frame — taller than before */}
      <div
        className="relative w-[300px] sm:w-[330px] lg:w-[360px] rounded-[44px] bg-[#0a1414] p-[10px] shadow-[var(--shadow-hero)]"
        style={{ aspectRatio: "9 / 19" }}
      >
        {/* Notch */}
        <div
          aria-hidden
          className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-6 rounded-full bg-[#0a1414] z-20"
        />

        <div className="rounded-[36px] bg-[#e6f0ea] overflow-hidden h-full flex flex-col">
          {/* Status bar */}
          <div className="flex items-center justify-between px-5 pt-3 pb-1.5 text-[#0a1414] text-[0.74rem] font-medium shrink-0" dir="ltr">
            <span>9:41</span>
            <div className="flex items-center gap-1.5">
              <SignalIcon />
              <WifiIcon />
              <BatteryIcon />
            </div>
          </div>

          {/* WhatsApp header */}
          <div
            className="flex items-center gap-3 px-3.5 py-2.5 shrink-0"
            style={{ background: "#075e54" }}
          >
            <ArrowBackIcon className={locale === "ar" ? "rotate-180" : ""} />
            <div className="size-9 rounded-full bg-[color:var(--color-bg-accent)] flex items-center justify-center text-[#0a1414] font-bold text-[0.92rem]">
              P
            </div>
            <div className="text-white grow min-w-0">
              <div className="text-[0.85rem] font-semibold flex items-center gap-1">
                {t("hero.mockup.contact")}
                <CheckBadge />
              </div>
              <div className="text-[0.66rem] opacity-80">
                {t("hero.mockup.contactStatus")}
              </div>
            </div>
            <VideoIcon />
            <DotsIcon />
          </div>

          {/* Chat — fills the phone vertically. Faithful WhatsApp
              cosmetics: TODAY date pill at top, message bubbles with
              corner tails, blue ✓✓ read receipts on bot replies. */}
          <div
            className="grow overflow-hidden relative flex flex-col px-3 py-2.5 gap-1.5"
            style={{
              background:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23e6f0ea'/%3E%3Cg opacity='0.06'%3E%3Cpath d='M0 50h100M50 0v100' stroke='%230d4a4a' stroke-width='1'/%3E%3C/g%3E%3C/svg%3E\")",
            }}
            dir="rtl"
          >
            <DateChip label={t("hero.mockup.today")} />
            <Bubble side="me" time={t("hero.mockup.greetingTime")} read>
              {t("hero.mockup.greeting")}
            </Bubble>
            <Bubble side="them" time={t("hero.mockup.msg1Time")}>
              {t("hero.mockup.msg1Customer")}
            </Bubble>
            <Bubble side="me" time={t("hero.mockup.msg2Time")} read>
              {t("hero.mockup.msg2Bot")}
            </Bubble>
            <Bubble side="them" time={t("hero.mockup.msg3Time")}>
              {t("hero.mockup.msg3Customer")}
            </Bubble>
            <ListingCard
              title={t("hero.mockup.msg4ListingTitle")}
              area={t("hero.mockup.msg4ListingArea")}
              rooms={t("hero.mockup.msg4ListingRooms")}
              price={t("hero.mockup.msg4ListingPrice")}
              tag={t("hero.mockup.msg4ListingTag")}
            />
            <Bubble side="me" time={t("hero.mockup.msg5Time")} read>
              {t("hero.mockup.msg5Bot")}
            </Bubble>
            <Bubble side="them" time={t("hero.mockup.msg6Time")}>
              {t("hero.mockup.msg6Customer")}
            </Bubble>
            <Bubble side="me" time={t("hero.mockup.msg7Time")} read>
              {t("hero.mockup.msg7Bot")}
            </Bubble>
            <Bubble side="them" time={t("hero.mockup.msg8Time")}>
              {t("hero.mockup.msg8Customer")}
            </Bubble>
            <CtaBubble
              text={t("hero.mockup.msg9Bot")}
              cta={t("hero.mockup.ctaButton")}
              time={t("hero.mockup.msg9Time")}
            />
            <Bubble side="me" time={t("hero.mockup.msg11Time")} read>
              {t("hero.mockup.msg11Bot")}
            </Bubble>
          </div>

          {/* Composer */}
          <div className="flex items-center gap-2 px-2.5 py-2 bg-[#f0f2f0] shrink-0" dir="rtl">
            <div className="flex-1 flex items-center gap-2 bg-white rounded-full px-3 py-1.5">
              <span className="text-[#9aa6a6] text-[0.78rem]">
                {t("hero.mockup.composerHint")}
              </span>
            </div>
            <button
              type="button"
              tabIndex={-1}
              aria-hidden
              className="size-9 rounded-full flex items-center justify-center"
              style={{ background: "#075e54" }}
            >
              <MicIcon />
            </button>
          </div>
        </div>
      </div>

      {/* Floating "Viewing booked" success card.
          Desktop: sits in the negative space just to the start side of
          the phone, anchored near the phone's bottom. Bottom-aligned with
          the phone so they share a baseline visually. Tiny 8px gap.
          Mobile: renders below the phone in normal flow, centered. */}
      <div
        className={
          "z-10 w-[230px] rounded-[var(--radius-md)] " +
          "bg-[color:var(--color-bg-surface)] border border-[color:var(--color-border-subtle)] " +
          "shadow-[var(--shadow-hero)] p-4 " +
          "mt-6 mx-auto lg:mt-0 lg:mx-0 lg:absolute lg:bottom-2 " +
          "bounce-in"
        }
        style={{
          insetInlineEnd: "calc(100% + 8px)",
        }}
      >
        <div className="flex items-center gap-2.5 mb-2">
          <span className="size-7 rounded-full bg-[color:var(--color-mint-200)] flex items-center justify-center shrink-0">
            <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="size-4 text-[color:var(--color-mint-500)]" aria-hidden>
              <polyline points="2 6 5 9 10 3" />
            </svg>
          </span>
          <span className="font-[family-name:var(--font-display)] text-[0.92rem] font-semibold text-[color:var(--color-fg-primary)]">
            {t("hero.mockup.successTitle")}
          </span>
        </div>
        <div className="space-y-1 text-[0.78rem]">
          <div className="flex items-center gap-2 text-[color:var(--color-fg-secondary)]">
            <CalendarMiniIcon />
            <span>{t("hero.mockup.successWhen")}</span>
          </div>
          <div className="flex items-center gap-2 text-[color:var(--color-fg-secondary)]" dir="ltr">
            <PhoneMiniIcon />
            <span className="font-[family-name:var(--font-mono)]">
              {t("hero.mockup.successPhone")}
            </span>
          </div>
        </div>
        <div className="mt-2.5 pt-2.5 border-t border-[color:var(--color-border-subtle)]">
          <p className="text-[0.74rem] text-[color:var(--color-fg-tertiary)] font-[family-name:var(--font-body)]">
            ✓ {t("hero.mockup.successFooter")}
          </p>
        </div>
      </div>

      {/* Floating "online" badge top corner */}
      <div className="hidden sm:flex absolute -top-3 -start-4 lg:-start-8 items-center gap-2 px-3 py-1.5 rounded-full bg-[color:var(--color-bg-surface)] shadow-[var(--shadow-card)] border border-[color:var(--color-border-subtle)] z-10">
        <span className="relative flex size-2">
          <span className="absolute inset-0 rounded-full bg-[color:var(--color-mint-400)] animate-ping opacity-60" />
          <span className="relative rounded-full size-2 bg-[color:var(--color-mint-400)]" />
        </span>
        <span className="font-[family-name:var(--font-display)] text-[0.74rem] font-medium text-[color:var(--color-fg-primary)]">
          24/7
        </span>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────
   Chat bubbles + cards + CTA bubble
   ────────────────────────────────────────────────────────────────── */

function Bubble({
  children,
  side,
  time,
  read,
}: {
  children: React.ReactNode;
  side: "me" | "them";
  time: string;
  read?: boolean;
}) {
  const isMe = side === "me";
  return (
    <div className={"flex " + (isMe ? "justify-end" : "justify-start")}>
      <div
        className={
          "max-w-[82%] px-2.5 pt-1.5 pb-1 text-[0.82rem] leading-snug shadow-sm relative " +
          (isMe
            ? "bg-[#dcf8c6] text-[#0a1414] rounded-[10px] rounded-br-[2px]"
            : "bg-white text-[#0a1414] rounded-[10px] rounded-bl-[2px]")
        }
      >
        <div>{children}</div>
        <div
          className="flex items-center justify-end gap-1 mt-0.5"
          dir="ltr"
        >
          <span className="text-[0.62rem] text-[#7a7a7a] font-[family-name:var(--font-mono)]">
            {time}
          </span>
          {isMe && read ? <ReadReceipt /> : null}
        </div>
      </div>
    </div>
  );
}

function ReadReceipt() {
  // WhatsApp blue double-check (✓✓) — read receipt indicator.
  return (
    <svg viewBox="0 0 18 12" fill="none" className="size-[14px]" aria-hidden>
      <path
        d="M1 6.5L4.5 10L11 2"
        stroke="#34a4ff"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 6.5L9.5 10L17 2"
        stroke="#34a4ff"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DateChip({ label }: { label: string }) {
  return (
    <div className="flex justify-center my-1">
      <span className="px-2.5 py-0.5 rounded-md bg-white/95 text-[#5a5a5a] text-[0.62rem] font-semibold uppercase tracking-[0.06em] shadow-sm font-[family-name:var(--font-display)]">
        {label}
      </span>
    </div>
  );
}

function CtaBubble({
  text,
  cta,
  time,
}: {
  text: string;
  cta: string;
  time: string;
}) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[88%] bg-[#dcf8c6] text-[#0a1414] rounded-[10px] rounded-br-[2px] shadow-sm overflow-hidden">
        <div className="px-2.5 py-1.5 text-[0.82rem] leading-snug">
          {text}
          <span className="block text-[0.62rem] text-[#7a7a7a] mt-0.5 text-end font-[family-name:var(--font-mono)]">
            {time}
          </span>
        </div>
        {/* WhatsApp-style interactive reply button */}
        <div
          className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white border-t border-[#dcf8c6] text-[#075e54] font-semibold text-[0.78rem]"
        >
          <CalendarPlusIcon />
          {cta}
        </div>
      </div>
    </div>
  );
}

function ListingCard({
  title,
  area,
  rooms,
  price,
  tag,
}: {
  title: string;
  area: string;
  rooms: string;
  price: string;
  tag: string;
}) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[86%] bg-white rounded-[10px] rounded-br-[2px] overflow-hidden shadow-sm">
        <div
          className="h-16 w-full relative"
          style={{
            background:
              "linear-gradient(135deg, #b5d8c5 0%, #8bc1a3 50%, #5fa987 100%)",
          }}
        >
          <div className="size-full flex items-center justify-center">
            <BuildingIcon className="size-7 text-white opacity-85" />
          </div>
          <span className="absolute top-1.5 end-1.5 px-1.5 py-0.5 rounded-full bg-white/95 text-[#075e54] text-[0.58rem] font-semibold">
            {tag}
          </span>
        </div>
        <div className="px-2.5 py-2">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="size-3 rounded-full bg-[color:var(--color-bg-brand)] flex items-center justify-center shrink-0">
              <PinIcon className="size-2 text-white" />
            </span>
            <span className="font-[family-name:var(--font-display)] text-[0.78rem] font-semibold text-[#0a1414] truncate">
              {title}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[0.66rem] text-[#5a5a5a] mb-1" dir="rtl">
            <span>{area}</span>
            <span>·</span>
            <span>{rooms}</span>
          </div>
          <div
            className="font-[family-name:var(--font-display)] text-[0.85rem] font-bold text-[#0a1414]"
            dir="ltr"
          >
            {price}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────
   Trust badge + benefit card
   ────────────────────────────────────────────────────────────────── */

function TrustBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-[0.85rem] font-[family-name:var(--font-display)] font-medium text-[color:var(--color-fg-secondary)]">
      <span className="size-5 rounded-full bg-[color:var(--color-mint-200)] flex items-center justify-center">
        <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="size-3 text-[color:var(--color-mint-500)]" aria-hidden>
          <polyline points="2 6 5 9 10 3" />
        </svg>
      </span>
      {label}
    </span>
  );
}

function BenefitCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[color:var(--color-border-subtle)] bg-[color:var(--color-bg-surface)]/85 backdrop-blur-sm p-5 hover:shadow-[var(--shadow-card)] hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-start gap-3.5">
        <div className="size-10 rounded-full bg-[color:var(--color-bg-brand-soft)] flex items-center justify-center text-[color:var(--color-fg-brand)] shrink-0">
          {icon}
        </div>
        <div className="min-w-0">
          <h3 className="font-[family-name:var(--font-display)] text-[1rem] font-semibold tracking-[-0.01em] text-[color:var(--color-fg-primary)] mb-1">
            {title}
          </h3>
          <p className="font-[family-name:var(--font-body)] text-[0.88rem] leading-snug text-[color:var(--color-fg-secondary)]">
            {body}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────
   Decorative SVG leaves
   ────────────────────────────────────────────────────────────────── */

function Leaves() {
  return (
    <>
      <svg
        aria-hidden
        className="absolute -top-12 -start-16 w-72 h-72 -z-10 opacity-50 hidden md:block"
        viewBox="0 0 200 200"
        fill="none"
      >
        <defs>
          <linearGradient id="leafA" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--color-mint-300)" />
            <stop offset="100%" stopColor="var(--color-mint-100)" />
          </linearGradient>
        </defs>
        <path
          d="M30,150 Q20,80 80,40 Q140,10 170,60 Q150,120 100,160 Q70,180 30,150 Z"
          fill="url(#leafA)"
          opacity="0.6"
        />
      </svg>
      <svg
        aria-hidden
        className="absolute bottom-12 start-0 w-44 h-44 -z-10 opacity-50 hidden lg:block"
        viewBox="0 0 200 200"
        fill="none"
      >
        <defs>
          <linearGradient id="leafC" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--color-mint-200)" />
            <stop offset="100%" stopColor="var(--color-teal-200)" />
          </linearGradient>
        </defs>
        <path
          d="M40,160 Q20,100 70,50 Q130,20 170,80 Q160,140 110,170 Q70,180 40,160 Z"
          fill="url(#leafC)"
          opacity="0.55"
        />
      </svg>
    </>
  );
}

/* ──────────────────────────────────────────────────────────────────
   Inline icons
   ────────────────────────────────────────────────────────────────── */

function BoltIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={`size-4 ${className}`} aria-hidden>
      <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
    </svg>
  );
}
function TrendIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-5">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}
function HeadphonesIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-5">
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
    </svg>
  );
}
function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0 0 20.464 3.488" />
    </svg>
  );
}
function SignalIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-3"><path d="M2 17l4-4 4 4 5-5 5 5 4-4v8H2z" /></svg>
  );
}
function WifiIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3">
      <path d="M5 12.55a11 11 0 0 1 14 0M8 16.05a6 6 0 0 1 8 0M11 19.55a1.5 1.5 0 0 1 2 0" />
      <line x1="12" y1="20" x2="12" y2="20" />
    </svg>
  );
}
function BatteryIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
      <rect x="2" y="7" width="18" height="10" rx="2" />
      <rect x="3" y="8" width="14" height="8" rx="1" fill="currentColor" />
      <line x1="22" y1="11" x2="22" y2="13" />
    </svg>
  );
}
function ArrowBackIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`size-5 ${className}`}>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}
function CheckBadge() {
  return (
    <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden>
      <circle cx="8" cy="8" r="8" fill="#34a4ff" />
      <polyline points="4.5 8.5 7 11 12 5.5" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function VideoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="size-5">
      <path d="M23 7l-7 5 7 5V7z" />
      <rect x="1" y="5" width="15" height="14" rx="2" />
    </svg>
  );
}
function DotsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="white" className="size-5">
      <circle cx="12" cy="5" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="12" cy="19" r="1.5" />
    </svg>
  );
}
function CalendarMiniIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3.5 shrink-0">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
function CalendarPlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-4">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="12" y1="14" x2="12" y2="18" />
      <line x1="10" y1="16" x2="14" y2="16" />
    </svg>
  );
}
function PhoneMiniIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3.5 shrink-0">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}
function BuildingIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M3 21V8l9-5 9 5v13h-6v-7h-6v7H3z" />
    </svg>
  );
}
function PinIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2c-3.87 0-7 3.13-7 7 0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
    </svg>
  );
}
function MicIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}
