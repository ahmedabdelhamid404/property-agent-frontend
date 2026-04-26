"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import Link from "next/link";
import { z } from "zod";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Select } from "@/components/Select";
import { apiPublic, ApiError, type SignupResponse } from "@/lib/api";
import { broker } from "@/lib/storage";
import { copyToClipboard } from "@/lib/utils";

const schema = z.object({
  businessName: z
    .string()
    .min(2, "الاسم قصير جداً")
    .max(120, "الاسم طويل جداً"),
  brokerEmail: z.string().email("الإيميل غير صحيح"),
  brokerPhone: z
    .string()
    .regex(/^\+?\d{8,15}$/, "رقم بصيغة E.164 (+201xxxxxxxxx)"),
  notificationChannel: z.enum(["Email", "WhatsApp", "Both"]),
});

type FormData = z.infer<typeof schema>;

export default function SignupPage() {
  const [result, setResult] = useState<SignupResponse | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { notificationChannel: "Email" },
  });

  async function onSubmit(values: FormData) {
    try {
      const r = await apiPublic.signup(values);
      broker.setKey(r.apiKey);
      broker.setProfile(r.tenantId, values.businessName);
      setResult(r);
    } catch (err) {
      const apiErr = err as ApiError;
      const msg =
        (apiErr?.body as { error?: string } | null)?.error ??
        apiErr?.message ??
        "حصلت مشكلة، حاول تاني";
      toast.error(msg);
    }
  }

  return (
    <>
      <SiteHeader />

      {/* Single-column on mobile, two-column on md+ — pull-quote left, form right.
          Visual: a counter at the registry of brokers. */}
      <div className="deck grid grid-cols-1 md:grid-cols-[1fr_minmax(0,460px)] gap-12 md:gap-20 py-14 md:py-20">
        {/* ─── Pull-quote / pitch column ───────────────────── */}
        <aside className="md:pe-8 md:border-e md:border-[color:var(--color-rule)] rise-1">
          <p className="eyebrow mb-4">قيد التسجيل</p>
          <h1 className="font-[family-name:var(--font-display)] text-[clamp(2.2rem,4.6vw,3.4rem)] leading-[1] text-[color:var(--color-ink)] mb-6 max-w-[14ch]">
            دفترك في{" "}
            <em className="not-italic text-[color:var(--color-brick)]">
              مكتب الوسطاء
            </em>{" "}
            بيتسجّل دلوقتي.
          </h1>
          <p className="font-[family-name:var(--font-body)] text-[1.15rem] leading-[1.55] text-[color:var(--color-ink-soft)] mb-7">
            كل البيانات اللي بنطلبها بس عشان نعرف نوصّل لك العميل لما يطلبك.
            مفيش خطوات إضافية، مفيش بطاقة ائتمان، مفيش تحقق.
          </p>

          <ul className="space-y-3.5 border-t border-[color:var(--color-rule)] pt-6">
            <FeatureLine>
              <strong>تنبيه فوري</strong> بإيميل أو واتساب لما العميل يطلبك
            </FeatureLine>
            <FeatureLine>
              <strong>رابط واتساب</strong> خاص بيك تنشره في إعلاناتك
            </FeatureLine>
            <FeatureLine>
              <strong>لوحة وسيط</strong> فيها العملاء، الفلترة، والإعدادات
            </FeatureLine>
            <FeatureLine>
              <strong>API Key</strong> لو حابب تربط أنظمتك الخاصة
            </FeatureLine>
          </ul>

          <p className="mt-8 font-[family-name:var(--font-serif)] italic text-[0.95rem] text-[color:var(--color-ink-faint)]">
            المفتاح يصلك في الشاشة بعد التسجيل مباشرة.
          </p>
        </aside>

        {/* ─── Form / Deed column ─────────────────────────── */}
        <div className="rise-2">
          {!result ? (
            <form
              noValidate
              onSubmit={handleSubmit(onSubmit)}
              className="sheet p-8 md:p-10"
            >
              <div className="mb-7">
                <p className="eyebrow mb-1.5">نموذج التسجيل</p>
                <h2 className="font-[family-name:var(--font-display)] text-[1.7rem] text-[color:var(--color-ink)] tracking-tight">
                  بياناتك الأساسية
                </h2>
              </div>

              <div className="space-y-7">
                <Input
                  label="اسم المكتب أو الشركة"
                  placeholder="مكتب أحمد للعقارات"
                  error={errors.businessName?.message}
                  {...register("businessName")}
                />
                <Input
                  type="email"
                  label="الإيميل"
                  placeholder="ahmed@office.com"
                  helper="هنبعت تنبيهات العملاء على الإيميل ده."
                  error={errors.brokerEmail?.message}
                  dir="ltr"
                  {...register("brokerEmail")}
                />
                <Input
                  label="رقم الواتساب الشخصي"
                  placeholder="+201012345678"
                  helper="بصيغة E.164 — للتنبيهات على الواتساب."
                  error={errors.brokerPhone?.message}
                  dir="ltr"
                  {...register("brokerPhone")}
                />
                <Select
                  label="قناة التنبيه المفضلة"
                  options={[
                    { value: "Email", label: "إيميل فقط" },
                    { value: "WhatsApp", label: "واتساب فقط" },
                    { value: "Both", label: "الاتنين" },
                  ]}
                  helper="تقدر تغيرها في أي وقت من الإعدادات."
                  error={errors.notificationChannel?.message}
                  {...register("notificationChannel")}
                />
              </div>

              <div className="mt-9 pt-6 border-t border-[color:var(--color-rule)] flex items-center justify-between gap-4">
                <Link
                  href="/"
                  className="font-[family-name:var(--font-serif)] text-[0.95rem] text-[color:var(--color-ink-faint)] hover:text-[color:var(--color-ink)] transition-colors"
                >
                  ← الرجوع
                </Link>
                <Button type="submit" loading={isSubmitting} size="lg">
                  سجّل واستلم المفتاح
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
    <li className="flex items-start gap-3 font-[family-name:var(--font-body)] text-[1.05rem] text-[color:var(--color-ink-soft)] leading-[1.5]">
      <span
        aria-hidden
        className="mt-2 size-1.5 rounded-full bg-[color:var(--color-brick)] shrink-0"
      />
      <span>{children}</span>
    </li>
  );
}

function SuccessDeed({ data }: { data: SignupResponse }) {
  return (
    <div className="sheet-deed p-8 md:p-10">
      <div className="flex items-baseline justify-between gap-4 mb-6">
        <p className="eyebrow">سند تسجيل</p>
        <p
          className="font-[family-name:var(--font-serif)] italic text-[0.85rem] text-[color:var(--color-ink-faint)] tabular numerals"
          dir="ltr"
        >
          #{data.tenantId.toString().padStart(4, "0")}
        </p>
      </div>

      <h2 className="font-[family-name:var(--font-display)] text-[2rem] leading-[1.05] text-[color:var(--color-ink)] mb-2 max-w-[16ch]">
        تم التسجيل.{" "}
        <em className="not-italic text-[color:var(--color-brick)]">
          أهلاً بيك.
        </em>
      </h2>
      <p className="font-[family-name:var(--font-body)] italic text-[1rem] text-[color:var(--color-ink-soft)] mb-7">
        احفظ المفتاح ده في مكان آمن — هتدخل بيه لوحتك في كل مرة.
      </p>

      <div className="space-y-5">
        <KeyValueRow
          label="API Key"
          value={data.apiKey}
          monospace
          helper="X-Tenant-Key header"
        />
        <KeyValueRow
          label="رمز الإحالة"
          value={data.magicCode}
          monospace
          helper="استخدمه في رابط الواتساب: BR-{code}"
        />
        {data.whatsappLink ? (
          <KeyValueRow
            label="رابط الواتساب"
            value={data.whatsappLink}
            monospace
            helper="Share with customers — they tap and arrive tagged to your office"
          />
        ) : null}
      </div>

      <div className="mt-8 pt-6 border-t border-[color:var(--color-rule-strong)]">
        <p className="eyebrow mb-2">تعليمات النشر</p>
        <p
          className="font-[family-name:var(--font-body)] text-[0.95rem] leading-[1.55] text-[color:var(--color-ink-soft)] break-words"
        >
          {data.whatsappLink
            ? "انشر الرابط ده على الإعلانات والصفحات الرسمية. لما العميل يضغط عليه، يفتح واتساب على رقمنا، وبيوصلك مربوط باسمك تلقائياً."
            : data.magicLinkInstructions}
        </p>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/"
          className="font-[family-name:var(--font-serif)] text-[0.95rem] text-[color:var(--color-ink-faint)] hover:text-[color:var(--color-ink)]"
        >
          ← الرئيسية
        </Link>
        <Link
          href="/dashboard"
          className="inline-flex h-11 items-center px-5 rounded-[var(--radius-sm)] bg-[color:var(--color-ink)] text-[color:var(--color-paper-cream)] font-[family-name:var(--font-serif)] text-[0.95rem] hover:bg-[color:var(--color-brick-deep)] transition-colors"
        >
          ادخل لوحة الوسيط ←
        </Link>
      </div>
    </div>
  );
}

function KeyValueRow({
  label,
  value,
  monospace,
  helper,
}: {
  label: string;
  value: string;
  monospace?: boolean;
  helper?: string;
}) {
  async function copy() {
    const ok = await copyToClipboard(value);
    if (ok) toast.success("اتنسخ");
    else toast.error("ما اتنسخش");
  }
  return (
    <div className="border-b border-[color:var(--color-rule)] pb-4">
      <div className="flex items-baseline justify-between gap-3 mb-1.5">
        <span className="eyebrow">{label}</span>
        <button
          type="button"
          onClick={copy}
          className="font-[family-name:var(--font-serif)] text-[0.78rem] tracking-[0.04em] uppercase text-[color:var(--color-ink-faint)] hover:text-[color:var(--color-brick)] transition-colors"
        >
          نسخ
        </button>
      </div>
      <p
        className={
          (monospace
            ? "font-[family-name:var(--font-mono)] tracking-[-0.01em]"
            : "font-[family-name:var(--font-body)]") +
          " text-[1rem] text-[color:var(--color-ink)] break-all leading-[1.45]"
        }
        dir="ltr"
      >
        {value}
      </p>
      {helper ? (
        <p
          className="mt-1 font-[family-name:var(--font-serif)] italic text-[0.78rem] text-[color:var(--color-ink-faint)]"
          dir="ltr"
          lang="en"
        >
          {helper}
        </p>
      ) : null}
    </div>
  );
}
