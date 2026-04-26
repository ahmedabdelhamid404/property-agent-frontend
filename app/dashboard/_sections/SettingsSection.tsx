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
      .catch(() => toast.error("ما قدرتش أحمّل الإعدادات"))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [reset]);

  async function onSubmit(values: FormData) {
    try {
      const updated = await apiBroker.updateSettings(values);
      setSettings(updated);
      reset(values);
      toast.success("الإعدادات اتحفظت");
    } catch {
      toast.error("ما قدرتش أحفظ الإعدادات");
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
        className="sheet p-8 md:p-10 self-start"
      >
        <div className="mb-7">
          <p className="eyebrow mb-1.5">الملف الشخصي</p>
          <h2 className="font-[family-name:var(--font-display)] text-[1.7rem] text-[color:var(--color-ink)] tracking-tight">
            بيانات المكتب
          </h2>
        </div>

        <div className="space-y-7">
          <Input
            label="اسم المكتب"
            error={errors.businessName?.message}
            {...register("businessName")}
          />
          <Input
            type="email"
            label="إيميل التنبيهات"
            dir="ltr"
            error={errors.contactEmail?.message}
            {...register("contactEmail")}
          />
          <Input
            label="رقم واتساب الوسيط"
            dir="ltr"
            error={errors.brokerPhone?.message}
            {...register("brokerPhone")}
          />
          <Select
            label="قناة التنبيه"
            options={[
              { value: "Email", label: "إيميل فقط" },
              { value: "WhatsApp", label: "واتساب فقط" },
              { value: "Both", label: "الاتنين" },
            ]}
            error={errors.notificationChannel?.message}
            {...register("notificationChannel")}
          />
        </div>

        <div className="mt-9 pt-6 border-t border-[color:var(--color-rule)] flex items-center justify-end">
          <Button
            type="submit"
            loading={isSubmitting}
            disabled={!isDirty || isSubmitting}
          >
            حفظ التعديلات
          </Button>
        </div>
      </form>

      {/* Read-only sidebar — magic link details, account meta */}
      <aside className="space-y-7">
        {(() => {
          const link = resolveWhatsappLink(
            settings?.whatsappLink,
            settings?.magicCode,
          );
          if (!link) return null;
          return (
            <div className="sheet-deed p-7">
              <p className="eyebrow mb-2">رابط الواتساب الخاص بيك</p>
              <p className="font-[family-name:var(--font-body)] italic text-[0.95rem] text-[color:var(--color-ink-soft)] mb-4">
                انشره في إعلاناتك. كل عميل يفتحه يوصل لمكتبك مباشرة.
              </p>
              <div className="border-y border-[color:var(--color-rule-strong)] py-4 my-4">
                <p
                  className="font-[family-name:var(--font-mono)] text-[0.92rem] text-[color:var(--color-ink)] break-all leading-relaxed"
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
                    if (ok) toast.success("الرابط اتنسخ");
                    else toast.error("ما اتنسخش");
                  }}
                  className="font-[family-name:var(--font-serif)] text-[0.85rem] tracking-[0.04em] uppercase text-[color:var(--color-ink-faint)] hover:text-[color:var(--color-brick)] transition-colors"
                >
                  نسخ الرابط
                </button>
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-[family-name:var(--font-serif)] text-[0.85rem] tracking-[0.04em] uppercase text-[color:var(--color-ink-faint)] hover:text-[color:var(--color-brick)] transition-colors"
                >
                  افتح في واتساب ↗
                </a>
              </div>
            </div>
          );
        })()}

        {settings ? (
          <div className="sheet p-7">
            <p className="eyebrow mb-3">معلومات الحساب</p>
            <dl className="divide-y divide-[color:var(--color-rule)] -mx-1">
              <MetaRow label="الباقة" value={settings.planTier ?? "starter"} />
              <MetaRow
                label="الحالة"
                value={settings.isActive ? "نشط" : "موقوف"}
              />
              {settings.id ? (
                <MetaRow label="رقم الوسيط" value={`#${settings.id}`} />
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
      <dd className="font-[family-name:var(--font-serif)] text-[0.95rem] text-[color:var(--color-ink)]">
        {value}
      </dd>
    </div>
  );
}
