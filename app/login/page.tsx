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
import { useI18n } from "@/components/I18nProvider";
import { apiBroker, apiPublic, ApiError } from "@/lib/api";
import { broker } from "@/lib/storage";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    if (broker.getKey()) router.replace("/dashboard");
  }, [router]);

  return (
    <>
      <SiteHeader />

      <div className="deck grid grid-cols-1 md:grid-cols-[1fr_minmax(0,460px)] gap-12 md:gap-16 py-12 md:py-20">
        <aside className="md:pe-8 rise-1">
          <span className="eyebrow mb-4 block">{t("auth.loginEyebrow")}</span>
          <h1 className="font-[family-name:var(--font-display)] text-[clamp(2rem,4.4vw,3.2rem)] leading-[1.05] tracking-[-0.022em] text-[color:var(--color-fg-primary)] mb-6 max-w-[14ch]">
            {t("auth.loginTitlePart")}{" "}
            <span className="text-[color:var(--color-fg-brand)]">
              {t("auth.loginTitleAccent")}
            </span>
          </h1>
          <p className="font-[family-name:var(--font-body)] text-[1.05rem] leading-[1.6] text-[color:var(--color-fg-secondary)] mb-8 max-w-[42ch]">
            {t("auth.loginBody")}
          </p>
          <div className="border-t border-[color:var(--color-border-subtle)] pt-6">
            <p className="font-[family-name:var(--font-body)] text-[0.95rem] text-[color:var(--color-fg-secondary)]">
              {t("auth.noAccountQuestion")}{" "}
              <Link href="/signup" className="text-[color:var(--color-fg-brand)] linkish font-medium">
                {t("auth.noAccountCta")}
              </Link>
            </p>
          </div>
        </aside>

        <div className="rise-2 space-y-6">
          <CredsForm onSwitchToApiKey={() => setShowApiKey(true)} />

          {showApiKey ? (
            <ApiKeyForm onCancel={() => setShowApiKey(false)} />
          ) : (
            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowApiKey(true)}
                className="font-[family-name:var(--font-display)] text-[0.88rem] text-[color:var(--color-fg-tertiary)] hover:text-[color:var(--color-fg-brand)] transition-colors"
              >
                {t("auth.apiKeySwitch")}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function CredsForm({ onSwitchToApiKey }: { onSwitchToApiKey: () => void }) {
  const router = useRouter();
  const { t } = useI18n();

  const schema = useMemo(
    () =>
      z.object({
        email: z.string().email(t("auth.wrongCreds")),
        password: z.string().min(1, t("auth.passwordTooShort")),
      }),
    [t],
  );
  type Values = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  async function onSubmit(values: Values) {
    try {
      const r = await apiPublic.login(values);
      broker.setKey(r.apiKey);
      broker.setProfile(r.tenantId, r.businessName);
      toast.success(t("auth.signinSuccess"));
      router.replace("/dashboard");
    } catch (err) {
      const apiErr = err as ApiError;
      const body = apiErr?.body as
        | { error?: string; passwordNotSet?: boolean }
        | null;
      if (apiErr?.status === 401 && body?.passwordNotSet) {
        toast.error(body.error ?? t("auth.wrongCreds"));
        onSwitchToApiKey();
        return;
      }
      const msg =
        body?.error ??
        (apiErr?.status === 401
          ? t("auth.wrongCreds")
          : (apiErr?.message ?? t("auth.genericError")));
      toast.error(msg);
    }
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="sheet p-7 md:p-9"
    >
      <div className="mb-7">
        <span className="eyebrow mb-1.5 block">{t("auth.credsEyebrow")}</span>
        <h2 className="font-[family-name:var(--font-display)] text-[1.5rem] font-semibold tracking-[-0.015em] text-[color:var(--color-fg-primary)]">
          {t("auth.credsTitle")}
        </h2>
      </div>

      <div className="space-y-5">
        <Input
          type="email"
          label={t("auth.emailLabel")}
          placeholder="ahmed@office.com"
          dir="ltr"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <Input
          type="password"
          label={t("auth.passwordLabel")}
          dir="ltr"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />
      </div>

      <div className="mt-8 pt-6 border-t border-[color:var(--color-border-subtle)] flex items-center justify-between gap-4">
        <Link
          href="/"
          className="font-[family-name:var(--font-display)] text-[0.92rem] text-[color:var(--color-fg-tertiary)] hover:text-[color:var(--color-fg-primary)] transition-colors"
        >
          ← {t("common.back")}
        </Link>
        <Button type="submit" loading={isSubmitting} size="lg">
          {t("auth.loginSubmit")}
        </Button>
      </div>
    </form>
  );
}

function ApiKeyForm({ onCancel }: { onCancel: () => void }) {
  const router = useRouter();
  const { t } = useI18n();

  const schema = useMemo(
    () =>
      z.object({
        apiKey: z
          .string()
          .min(8, "Key too short")
          .regex(/^pa_[A-Za-z0-9]+$/, "Key starts with pa_"),
      }),
    [],
  );
  type Values = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  async function onSubmit(values: Values) {
    const trimmed = values.apiKey.trim();
    broker.setKey(trimmed);
    try {
      const settings = await apiBroker.settings();
      broker.setProfile(settings.id ?? 0, settings.businessName ?? "Broker");
      toast.success(t("auth.signinSuccess"));
      router.replace("/dashboard");
    } catch (err) {
      broker.clear();
      const apiErr = err as ApiError;
      const status = apiErr?.status;
      const msg =
        status === 401 || status === 403
          ? t("auth.apiKeyInvalid")
          : ((apiErr?.body as { error?: string } | null)?.error ??
            t("auth.genericError"));
      toast.error(msg);
    }
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="sheet-deed p-7"
    >
      <div className="mb-6">
        <span className="eyebrow mb-1.5 block">{t("auth.apiKeyEyebrow")}</span>
        <h3 className="font-[family-name:var(--font-display)] text-[1.25rem] font-semibold tracking-[-0.015em] text-[color:var(--color-fg-primary)]">
          {t("auth.apiKeyTitle")}
        </h3>
        <p className="mt-2 font-[family-name:var(--font-body)] text-[0.9rem] text-[color:var(--color-fg-secondary)] leading-relaxed">
          {t("auth.apiKeyBody")}
        </p>
      </div>

      <Input
        label="API Key"
        placeholder="pa_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
        dir="ltr"
        autoComplete="off"
        spellCheck={false}
        error={errors.apiKey?.message}
        {...register("apiKey")}
        className="font-[family-name:var(--font-mono)] tracking-tight"
      />

      <div className="mt-6 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="font-[family-name:var(--font-display)] text-[0.88rem] text-[color:var(--color-fg-tertiary)] hover:text-[color:var(--color-fg-primary)] transition-colors"
        >
          {t("common.cancel")}
        </button>
        <Button type="submit" loading={isSubmitting} variant="secondary">
          {t("auth.apiKeySubmit")}
        </Button>
      </div>
    </form>
  );
}
