"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Select } from "@/components/Select";
import { useI18n } from "@/components/I18nProvider";
import { apiPublic, ApiError, type SignupResponse } from "@/lib/api";
import { broker } from "@/lib/storage";
import { copyToClipboard } from "@/lib/utils";
import { resolveWhatsappLink } from "@/lib/whatsapp";

type Step = 1 | 2 | 3;

interface FormData {
  businessName: string;
  brokerEmail: string;
  brokerPhone: string;
  password: string;
  confirmPassword: string;
  notificationChannel: "Email" | "WhatsApp" | "Both";
}

const STEP_FIELDS: Record<Step, ReadonlyArray<keyof FormData>> = {
  1: ["brokerEmail", "password", "confirmPassword"],
  2: ["businessName", "brokerPhone"],
  3: ["notificationChannel"],
};

export default function SignupPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [result, setResult] = useState<SignupResponse | null>(null);
  const [step, setStep] = useState<Step>(1);

  const schema = useMemo(
    () =>
      z
        .object({
          businessName: z
            .string()
            .min(2, t("auth.signupEyebrow"))
            .max(120),
          brokerEmail: z.string().email("invalid email"),
          brokerPhone: z
            .string()
            .regex(/^\+?\d{8,15}$/, "+201xxxxxxxxx"),
          password: z.string().min(8, t("auth.passwordTooShort")),
          confirmPassword: z.string(),
          notificationChannel: z.enum(["Email", "WhatsApp", "Both"]),
        })
        .refine((d) => d.password === d.confirmPassword, {
          path: ["confirmPassword"],
          message: t("auth.passwordsMustMatch"),
        }),
    [t],
  );

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: { notificationChannel: "Email" },
  });

  useEffect(() => {
    if (broker.getKey()) router.replace("/dashboard");
  }, [router]);

  async function next() {
    const valid = await trigger(STEP_FIELDS[step] as (keyof FormData)[]);
    if (!valid) return;
    setStep((s) => Math.min(3, s + 1) as Step);
  }

  function back() {
    setStep((s) => Math.max(1, s - 1) as Step);
  }

  async function onSubmit(values: FormData) {
    try {
      const { confirmPassword: _confirm, ...payload } = values;
      void _confirm;
      const r = await apiPublic.signup(payload);
      broker.setKey(r.apiKey);
      broker.setProfile(r.tenantId, values.businessName);
      toast.success(t("auth.signupSuccess"));
      setResult(r);
    } catch (err) {
      const apiErr = err as ApiError;
      const status = apiErr?.status;
      const body = apiErr?.body as { error?: string } | null;
      const msg =
        status === 409
          ? t("auth.emailTaken")
          : (body?.error ?? apiErr?.message ?? t("auth.genericError"));
      toast.error(msg);
      // Bounce back to step 1 if email is taken so they can fix it
      if (status === 409) setStep(1);
    }
  }

  return (
    <>
      <SiteHeader />

      <div className="deck grid grid-cols-1 md:grid-cols-[1fr_minmax(0,500px)] gap-12 md:gap-16 py-12 md:py-20">
        <aside className="md:pe-8 rise-1">
          <span className="eyebrow mb-4 block">{t("auth.signupEyebrow")}</span>
          <h1 className="font-[family-name:var(--font-display)] text-[clamp(2rem,4.6vw,3.4rem)] leading-[1.05] tracking-[-0.022em] text-[color:var(--color-fg-primary)] mb-6 max-w-[16ch]">
            {t("auth.signupTitlePart")}{" "}
            <span className="text-[color:var(--color-fg-brand)]">
              {t("auth.signupTitleAccent")}
            </span>{" "}
            {t("auth.signupTitleEnd")}
          </h1>
          <p className="font-[family-name:var(--font-body)] text-[1.05rem] leading-[1.6] text-[color:var(--color-fg-secondary)] mb-8 max-w-[44ch]">
            {t("auth.signupBody")}
          </p>

          <ul className="space-y-3.5 border-t border-[color:var(--color-border-subtle)] pt-7">
            <FeatureLine>{t("how.step3Body")}</FeatureLine>
            <FeatureLine>{t("how.step2Body")}</FeatureLine>
            <FeatureLine>{t("how.step1Note")}</FeatureLine>
          </ul>
        </aside>

        <div className="rise-2">
          {!result ? (
            <form
              noValidate
              onSubmit={handleSubmit(onSubmit)}
              className="sheet p-6 md:p-9"
            >
              <StepProgress step={step} />

              <div className="mt-7 mb-6">
                <span className="eyebrow mb-1.5 block">
                  {t(`auth.step${step}`)}
                </span>
                <h2 className="font-[family-name:var(--font-display)] text-[1.5rem] font-semibold tracking-[-0.015em] text-[color:var(--color-fg-primary)] mb-1.5">
                  {t(`auth.step${stepKey(step)}Title`)}
                </h2>
                <p className="font-[family-name:var(--font-body)] text-[0.92rem] text-[color:var(--color-fg-secondary)] leading-relaxed">
                  {t(`auth.step${stepKey(step)}Body`)}
                </p>
              </div>

              {step === 1 ? (
                <div className="space-y-5">
                  <Input
                    type="email"
                    label={t("auth.brokerEmail")}
                    placeholder="ahmed@office.com"
                    error={errors.brokerEmail?.message}
                    dir="ltr"
                    autoComplete="email"
                    {...register("brokerEmail")}
                  />
                  <Input
                    type="password"
                    label={t("auth.passwordLabel")}
                    placeholder={t("auth.passwordPlaceholder")}
                    autoComplete="new-password"
                    dir="ltr"
                    error={errors.password?.message}
                    {...register("password")}
                  />
                  <Input
                    type="password"
                    label={t("auth.confirmPassword")}
                    autoComplete="new-password"
                    dir="ltr"
                    error={errors.confirmPassword?.message}
                    {...register("confirmPassword")}
                  />
                </div>
              ) : null}

              {step === 2 ? (
                <div className="space-y-5">
                  <Input
                    label={t("auth.businessName")}
                    placeholder="Ahmed Real Estate"
                    error={errors.businessName?.message}
                    {...register("businessName")}
                  />
                  <Input
                    label={t("auth.brokerPhone")}
                    placeholder="+201012345678"
                    error={errors.brokerPhone?.message}
                    dir="ltr"
                    {...register("brokerPhone")}
                  />
                </div>
              ) : null}

              {step === 3 ? (
                <div className="space-y-5">
                  <Select
                    label={t("auth.channel")}
                    options={[
                      { value: "Email", label: t("auth.channelEmail") },
                      { value: "WhatsApp", label: t("auth.channelWhatsApp") },
                      { value: "Both", label: t("auth.channelBoth") },
                    ]}
                    error={errors.notificationChannel?.message}
                    {...register("notificationChannel")}
                  />
                </div>
              ) : null}

              <div className="mt-8 pt-6 border-t border-[color:var(--color-border-subtle)] flex items-center justify-between gap-4">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={back}
                    className="font-[family-name:var(--font-display)] text-[0.92rem] text-[color:var(--color-fg-tertiary)] hover:text-[color:var(--color-fg-primary)] transition-colors"
                  >
                    {t("auth.previous")}
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="font-[family-name:var(--font-display)] text-[0.92rem] text-[color:var(--color-fg-tertiary)] hover:text-[color:var(--color-fg-brand)] transition-colors"
                  >
                    {t("auth.noAccountQuestion")} {t("nav.login")}
                  </Link>
                )}
                {step < 3 ? (
                  <Button type="button" onClick={next} size="lg">
                    {t("auth.next")}
                  </Button>
                ) : (
                  <Button type="submit" loading={isSubmitting} size="lg">
                    {t("auth.submitSignup")}
                  </Button>
                )}
              </div>
            </form>
          ) : (
            <SuccessDeed data={result} />
          )}
        </div>
      </div>
    </>
  );
}

function stepKey(s: Step): "Account" | "Business" | "Channel" {
  return s === 1 ? "Account" : s === 2 ? "Business" : "Channel";
}

/* ──────────────────────────────────────────────────────────────────
   Step progress indicator
   ────────────────────────────────────────────────────────────────── */

function StepProgress({ step }: { step: Step }) {
  const { t } = useI18n();
  const labels = [t("auth.step1"), t("auth.step2"), t("auth.step3")];
  return (
    <div className="flex items-center gap-2">
      {labels.map((label, i) => {
        const idx = (i + 1) as Step;
        const completed = step > idx;
        const active = step === idx;
        return (
          <div
            key={label}
            className="flex items-center gap-2 flex-1 last:flex-none"
          >
            <div
              className={
                "size-7 shrink-0 rounded-full inline-flex items-center justify-center " +
                "font-[family-name:var(--font-display)] text-[0.78rem] font-semibold " +
                "transition-colors duration-200 " +
                (completed
                  ? "bg-[color:var(--color-bg-brand)] text-[color:var(--color-fg-inverse)]"
                  : active
                    ? "bg-[color:var(--color-bg-brand-soft)] text-[color:var(--color-fg-brand)] ring-2 ring-[color:var(--color-bg-brand)]"
                    : "bg-[color:var(--color-bg-sunken)] text-[color:var(--color-fg-tertiary)]")
              }
              aria-current={active ? "step" : undefined}
            >
              {completed ? (
                <svg
                  viewBox="0 0 12 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-3"
                  aria-hidden
                >
                  <polyline points="2 6 5 9 10 3" />
                </svg>
              ) : (
                <span dir="ltr">{idx}</span>
              )}
            </div>
            <span
              className={
                "font-[family-name:var(--font-display)] text-[0.82rem] hidden sm:block " +
                (active
                  ? "text-[color:var(--color-fg-primary)] font-semibold"
                  : completed
                    ? "text-[color:var(--color-fg-secondary)] font-medium"
                    : "text-[color:var(--color-fg-tertiary)]")
              }
            >
              {label}
            </span>
            {i < labels.length - 1 ? (
              <div
                className={
                  "h-px flex-1 transition-colors duration-200 " +
                  (completed
                    ? "bg-[color:var(--color-bg-brand)]"
                    : "bg-[color:var(--color-border-subtle)]")
                }
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────
   Existing components
   ────────────────────────────────────────────────────────────────── */

function FeatureLine({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3 font-[family-name:var(--font-body)] text-[0.98rem] text-[color:var(--color-fg-secondary)] leading-[1.55]">
      <span className="mt-1 size-5 rounded-full bg-[color:var(--color-mint-200)] inline-flex items-center justify-center shrink-0">
        <svg
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-3 text-[color:var(--color-mint-500)]"
          aria-hidden
        >
          <polyline points="2 6 5 9 10 3" />
        </svg>
      </span>
      <span>{children}</span>
    </li>
  );
}

function SuccessDeed({ data }: { data: SignupResponse }) {
  const router = useRouter();
  const { t } = useI18n();
  const whatsappLink = resolveWhatsappLink(data.whatsappLink, data.magicCode);
  return (
    <div className="sheet-deed p-7 md:p-9">
      <div className="flex items-baseline justify-between gap-4 mb-6">
        <span className="eyebrow">{t("auth.signupSuccess")}</span>
        <p
          className="font-[family-name:var(--font-mono)] text-[0.78rem] text-[color:var(--color-fg-tertiary)]"
          dir="ltr"
        >
          #{data.tenantId.toString().padStart(4, "0")}
        </p>
      </div>

      <h2 className="font-[family-name:var(--font-display)] text-[1.7rem] font-semibold tracking-[-0.018em] leading-[1.1] text-[color:var(--color-fg-primary)] mb-2">
        {t("auth.successTitle")}
      </h2>
      <p className="font-[family-name:var(--font-body)] text-[0.98rem] text-[color:var(--color-fg-secondary)] mb-7 leading-relaxed">
        {t("auth.successBody")}
      </p>

      <div className="space-y-4">
        <KeyValueRow label="API Key" value={data.apiKey} monospace />
        <KeyValueRow label="Magic code" value={data.magicCode} monospace />
        {whatsappLink ? (
          <KeyValueRow label="WhatsApp link" value={whatsappLink} monospace />
        ) : null}
      </div>

      <div className="mt-8 pt-6 border-t border-[color:var(--color-border-subtle)] flex items-center justify-end gap-3">
        {whatsappLink ? (
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center px-5 rounded-full bg-[color:var(--color-bg-accent)] text-[color:var(--color-neutral-900)] font-[family-name:var(--font-display)] font-medium text-[0.92rem] hover:brightness-95 transition-all shadow-[var(--shadow-subtle)]"
          >
            {t("auth.whatsappCta")}
          </a>
        ) : null}
        <button
          type="button"
          onClick={() => router.replace("/dashboard")}
          className="inline-flex h-11 items-center px-5 rounded-full bg-[color:var(--color-bg-brand)] text-[color:var(--color-fg-inverse)] font-[family-name:var(--font-display)] font-medium text-[0.92rem] hover:bg-[color:var(--color-bg-brand-hover)] transition-colors shadow-[var(--shadow-subtle)]"
        >
          {t("auth.goToDashboard")} →
        </button>
      </div>
    </div>
  );
}

function KeyValueRow({
  label,
  value,
  monospace,
}: {
  label: string;
  value: string;
  monospace?: boolean;
}) {
  const { t } = useI18n();
  async function copy() {
    const ok = await copyToClipboard(value);
    if (ok) toast.success(t("common.copied"));
    else toast.error(t("common.retry"));
  }
  return (
    <div className="rounded-[var(--radius-sm)] border border-[color:var(--color-border-subtle)] bg-[color:var(--color-bg-canvas)] p-3.5">
      <div className="flex items-baseline justify-between gap-3 mb-1">
        <span className="font-[family-name:var(--font-display)] text-[0.74rem] font-semibold uppercase tracking-[0.06em] text-[color:var(--color-fg-tertiary)]">
          {label}
        </span>
        <button
          type="button"
          onClick={copy}
          className="font-[family-name:var(--font-display)] text-[0.74rem] uppercase tracking-[0.05em] text-[color:var(--color-fg-tertiary)] hover:text-[color:var(--color-fg-brand)] transition-colors"
        >
          {t("common.copy")}
        </button>
      </div>
      <p
        className={
          (monospace
            ? "font-[family-name:var(--font-mono)] text-[0.92rem]"
            : "font-[family-name:var(--font-body)] text-[0.95rem]") +
          " text-[color:var(--color-fg-primary)] break-all leading-[1.45]"
        }
        dir="ltr"
      >
        {value}
      </p>
    </div>
  );
}
