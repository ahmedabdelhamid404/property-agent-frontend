"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Select } from "@/components/Select";
import { Skeleton } from "@/components/Skeleton";
import { useI18n } from "@/components/I18nProvider";
import { apiBroker, type BrokerSettings } from "@/lib/api";
import { copyToClipboard } from "@/lib/utils";
import { resolveWhatsappLink } from "@/lib/whatsapp";

const schema = z.object({
  businessName: z.string().min(2).max(120),
  contactEmail: z.string().email(),
  brokerPhone: z.string().regex(/^\+?\d{8,15}$/),
  notificationChannel: z.enum(["Email", "WhatsApp", "Both"]),
});
type FormData = z.infer<typeof schema>;

export function SettingsSection() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<BrokerSettings | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    let cancelled = false;
    apiBroker
      .settings()
      .then((s) => {
        if (cancelled) return;
        setSettings(s);
        reset({
          businessName: s.businessName ?? "",
          contactEmail: s.contactEmail ?? "",
          brokerPhone: s.brokerPhone ?? "",
          notificationChannel: s.notificationChannel ?? "Email",
        });
      })
      .catch(() => toast.error(t("dashboard.settings.loadFailed")))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [reset, t]);

  async function onSubmit(values: FormData) {
    try {
      const updated = await apiBroker.updateSettings(values);
      setSettings(updated);
      reset(values);
      toast.success(t("dashboard.settings.saved"));
    } catch {
      toast.error(t("dashboard.settings.saveFailed"));
    }
  }

  if (loading) {
    return (
      <div className="sheet p-8 max-w-2xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[minmax(0,560px)_minmax(0,1fr)] gap-12">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="sheet p-7 md:p-9 self-start"
      >
        <div className="mb-7">
          <span className="eyebrow mb-1.5 block">
            {t("dashboard.settings.profileEyebrow")}
          </span>
          <h2 className="font-[family-name:var(--font-display)] text-[1.4rem] font-semibold tracking-[-0.015em] text-[color:var(--color-fg-primary)]">
            {t("dashboard.settings.profileTitle")}
          </h2>
        </div>

        <div className="space-y-5">
          <Input
            label={t("dashboard.settings.businessName")}
            error={errors.businessName?.message}
            {...register("businessName")}
          />
          <Input
            type="email"
            label={t("dashboard.settings.notifEmail")}
            dir="ltr"
            error={errors.contactEmail?.message}
            {...register("contactEmail")}
          />
          <Input
            label={t("dashboard.settings.brokerPhone")}
            dir="ltr"
            error={errors.brokerPhone?.message}
            {...register("brokerPhone")}
          />
          <Select
            label={t("dashboard.settings.channel")}
            options={[
              { value: "Email", label: t("auth.channelEmail") },
              { value: "WhatsApp", label: t("auth.channelWhatsApp") },
              { value: "Both", label: t("auth.channelBoth") },
            ]}
            error={errors.notificationChannel?.message}
            {...register("notificationChannel")}
          />
        </div>

        <div className="mt-8 pt-6 border-t border-[color:var(--color-border-subtle)] flex items-center justify-end">
          <Button
            type="submit"
            loading={isSubmitting}
            disabled={!isDirty || isSubmitting}
          >
            {t("dashboard.settings.save")}
          </Button>
        </div>
      </form>

      <aside className="space-y-7">
        {(() => {
          const link = resolveWhatsappLink(
            settings?.whatsappLink,
            settings?.magicCode,
          );
          if (!link) return null;
          return (
            <div className="sheet-deed p-7">
              <span className="eyebrow mb-2 block">
                {t("dashboard.settings.magicLinkEyebrow")}
              </span>
              <p className="font-[family-name:var(--font-body)] text-[0.92rem] text-[color:var(--color-fg-secondary)] mb-4 leading-relaxed">
                {t("dashboard.settings.magicLinkBody")}
              </p>
              <div className="rounded-[var(--radius-sm)] border border-[color:var(--color-border-subtle)] bg-[color:var(--color-bg-canvas)] p-3.5 my-4">
                <p
                  className="font-[family-name:var(--font-mono)] text-[0.88rem] text-[color:var(--color-fg-primary)] break-all leading-relaxed"
                  dir="ltr"
                >
                  {link}
                </p>
              </div>
              <div className="flex items-center gap-5">
                <button
                  type="button"
                  onClick={async () => {
                    const ok = await copyToClipboard(link);
                    if (ok) toast.success(t("dashboard.settings.copyOk"));
                    else toast.error(t("dashboard.settings.copyFailed"));
                  }}
                  className="font-[family-name:var(--font-display)] text-[0.82rem] uppercase tracking-[0.05em] text-[color:var(--color-fg-tertiary)] hover:text-[color:var(--color-fg-brand)] transition-colors"
                >
                  {t("dashboard.settings.copyLink")}
                </button>
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-[family-name:var(--font-display)] text-[0.82rem] uppercase tracking-[0.05em] text-[color:var(--color-fg-tertiary)] hover:text-[color:var(--color-fg-brand)] transition-colors"
                >
                  {t("dashboard.settings.openWhatsapp")}
                </a>
              </div>
            </div>
          );
        })()}

        {settings ? (
          <div className="sheet p-7">
            <span className="eyebrow mb-3 block">
              {t("dashboard.settings.accountInfo")}
            </span>
            <dl className="divide-y divide-[color:var(--color-border-subtle)] -mx-1">
              <MetaRow
                label={t("dashboard.settings.plan")}
                value={settings.planTier ?? "starter"}
              />
              <MetaRow
                label={t("dashboard.settings.status")}
                value={
                  settings.isActive
                    ? t("dashboard.settings.active")
                    : t("dashboard.settings.suspended")
                }
              />
              {settings.id ? (
                <MetaRow
                  label={t("dashboard.settings.brokerId")}
                  value={`#${settings.id}`}
                />
              ) : null}
            </dl>
          </div>
        ) : null}
      </aside>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 px-1 py-3">
      <dt className="eyebrow">{label}</dt>
      <dd className="font-[family-name:var(--font-body)] text-[0.92rem] text-[color:var(--color-fg-primary)]">
        {value}
      </dd>
    </div>
  );
}
