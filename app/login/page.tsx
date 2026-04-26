"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { apiBroker, apiPublic, ApiError } from "@/lib/api";
import { broker } from "@/lib/storage";

const credsSchema = z.object({
  email: z.string().email("الإيميل غير صحيح"),
  password: z.string().min(1, "ادخل كلمة المرور"),
});
type CredsValues = z.infer<typeof credsSchema>;

const apiKeySchema = z.object({
  apiKey: z
    .string()
    .min(8, "المفتاح قصير جداً")
    .regex(/^pa_[A-Za-z0-9]+$/, "المفتاح يبدأ بـ pa_ متبوعاً بحروف وأرقام"),
});
type ApiKeyValues = z.infer<typeof apiKeySchema>;

export default function LoginPage() {
  const router = useRouter();
  const [showApiKey, setShowApiKey] = useState(false);

  // Already authed → straight to dashboard.
  useEffect(() => {
    if (broker.getKey()) router.replace("/dashboard");
  }, [router]);

  return (
    <>
      <SiteHeader />

      <div className="deck grid grid-cols-1 md:grid-cols-[1fr_minmax(0,460px)] gap-12 md:gap-20 py-14 md:py-20">
        {/* ─── Left rail — soft pitch ───────────────────────── */}
        <aside className="md:pe-8 md:border-e md:border-[color:var(--color-rule)] rise-1">
          <p className="eyebrow mb-4">تسجيل الدخول</p>
          <h1 className="font-[family-name:var(--font-display)] text-[clamp(2.2rem,4.6vw,3.4rem)] leading-[1.05] text-[color:var(--color-ink)] mb-6 max-w-[14ch]">
            ارجع{" "}
            <em className="not-italic text-[color:var(--color-brick)]">
              للوحة وسيطك
            </em>
          </h1>
          <p className="font-[family-name:var(--font-body)] text-[1.1rem] leading-[1.6] text-[color:var(--color-ink-soft)] mb-7">
            ادخل بالإيميل وكلمة المرور اللي اخترتهم وقت التسجيل. هنرجّعك على
            لوحتك في ثواني.
          </p>

          <div className="border-t border-[color:var(--color-rule)] pt-6 space-y-4">
            <p className="font-[family-name:var(--font-body)] text-[0.95rem] text-[color:var(--color-ink-soft)]">
              لسه ما عندكش حساب؟{" "}
              <Link
                href="/signup"
                className="text-[color:var(--color-brick)] linkish"
              >
                سجل وسيط جديد
              </Link>
            </p>
          </div>
        </aside>

        {/* ─── Form column ─────────────────────────────────── */}
        <div className="rise-2 space-y-7">
          <CredsForm onSwitchToApiKey={() => setShowApiKey(true)} />

          {showApiKey ? (
            <ApiKeyForm onCancel={() => setShowApiKey(false)} />
          ) : (
            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowApiKey(true)}
                className="font-[family-name:var(--font-serif)] text-[0.9rem] text-[color:var(--color-ink-faint)] hover:text-[color:var(--color-brick)] transition-colors"
              >
                دخول بمفتاح API بدلاً عن ذلك ←
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
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CredsValues>({ resolver: zodResolver(credsSchema) });

  async function onSubmit(values: CredsValues) {
    try {
      const r = await apiPublic.login(values);
      broker.setKey(r.apiKey);
      broker.setProfile(r.tenantId, r.businessName);
      toast.success("أهلاً بيك من جديد");
      router.replace("/dashboard");
    } catch (err) {
      const apiErr = err as ApiError;
      const body = apiErr?.body as
        | { error?: string; passwordNotSet?: boolean }
        | null;
      // 401 with passwordNotSet=true → legacy account, suggest API-key route
      if (apiErr?.status === 401 && body?.passwordNotSet) {
        toast.error(body.error ?? "الحساب قديم — استعمل مفتاح API.");
        onSwitchToApiKey();
        return;
      }
      const msg =
        body?.error ??
        (apiErr?.status === 401
          ? "الإيميل أو كلمة المرور غير صحيحة"
          : (apiErr?.message ?? "حصلت مشكلة، حاول تاني"));
      toast.error(msg);
    }
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="sheet p-8 md:p-10"
    >
      <div className="mb-7">
        <p className="eyebrow mb-1.5">بياناتك</p>
        <h2 className="font-[family-name:var(--font-display)] text-[1.7rem] text-[color:var(--color-ink)] tracking-tight">
          الإيميل وكلمة المرور
        </h2>
      </div>

      <div className="space-y-7">
        <Input
          type="email"
          label="الإيميل"
          placeholder="ahmed@office.com"
          dir="ltr"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <Input
          type="password"
          label="كلمة المرور"
          dir="ltr"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
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
          ادخل
        </Button>
      </div>
    </form>
  );
}

function ApiKeyForm({ onCancel }: { onCancel: () => void }) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ApiKeyValues>({ resolver: zodResolver(apiKeySchema) });

  async function onSubmit(values: ApiKeyValues) {
    const trimmed = values.apiKey.trim();
    broker.setKey(trimmed);
    try {
      const settings = await apiBroker.settings();
      broker.setProfile(settings.id ?? 0, settings.businessName ?? "وسيط");
      toast.success("أهلاً بيك من جديد");
      router.replace("/dashboard");
    } catch (err) {
      broker.clear();
      const apiErr = err as ApiError;
      const status = apiErr?.status;
      const msg =
        status === 401 || status === 403
          ? "المفتاح غير صحيح أو لم يعد ساري"
          : ((apiErr?.body as { error?: string } | null)?.error ??
            "ما قدرتش أتأكد من المفتاح، حاول تاني");
      toast.error(msg);
    }
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="sheet-deed p-8"
    >
      <div className="mb-6">
        <p className="eyebrow mb-1.5">طريقة بديلة</p>
        <h3 className="font-[family-name:var(--font-display)] text-[1.4rem] text-[color:var(--color-ink)] tracking-tight">
          دخول بمفتاح API
        </h3>
        <p className="mt-2 font-[family-name:var(--font-body)] text-[0.92rem] text-[color:var(--color-ink-soft)] leading-relaxed">
          للحسابات القديمة اللي ماعندهاش كلمة مرور بعد. استخدم نفس المفتاح اللي
          ظهر بعد التسجيل.
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
          className="font-[family-name:var(--font-serif)] text-[0.9rem] text-[color:var(--color-ink-faint)] hover:text-[color:var(--color-ink)] transition-colors"
        >
          إلغاء
        </button>
        <Button type="submit" loading={isSubmitting} variant="secondary">
          ادخل بالمفتاح
        </Button>
      </div>
    </form>
  );
}
