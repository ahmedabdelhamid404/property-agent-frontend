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

export default function SignupPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [result, setResult] = useState<SignupResponse | null>(null);

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

  type FormData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { notificationChannel: "Email" },
  });

  useEffect(() => {
    if (broker.getKey()) router.replace("/dashboard");
  }, [router]);

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
            <form noValidate onSubmit={handleSubmit(onSubmit)} className="sheet p-7 md:p-9">
              <div className="mb-7">
                <span className="eyebrow mb-1.5 block">{t("nav.signup")}</span>
                <h2 className="font-[family-name:var(--font-display)] text-[1.5rem] font-semibold tracking-[-0.015em] text-[color:var(--color-fg-primary)]">
                  {t("auth.credsTitle")}
                </h2>
              </div>

              <div className="space-y-5">
                <Input
                  label={t("auth.businessName")}
                  placeholder="Ahmed Real Estate"
                  error={errors.businessName?.message}
                  {...register("businessName")}
                />
                <Input
                  type="email"
                  label={t("auth.brokerEmail")}
                  placeholder="ahmed@office.com"
                  error={errors.brokerEmail?.message}
                  dir="ltr"
                  {...register("brokerEmail")}
                />
                <Input
                  label={t("auth.brokerPhone")}
                  placeholder="+201012345678"
                  error={errors.brokerPhone?.message}
                  dir="ltr"
                  {...register("brokerPhone")}
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

              <div className="mt-8 pt-6 border-t border-[color:var(--color-border-subtle)] flex items-center justify-between gap-4">
                <Link
                  href="/login"
                  className="font-[family-name:var(--font-display)] text-[0.92rem] text-[color:var(--color-fg-tertiary)] hover:text-[color:var(--color-fg-brand)] transition-colors"
                >
                  {t("auth.noAccountQuestion")} {t("nav.login")}
                </Link>
                <Button type="submit" loading={isSubmitting} size="lg">
                  {t("auth.submitSignup")}
                </Button>
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
