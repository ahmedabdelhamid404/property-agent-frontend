"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { apiBroker, ApiError } from "@/lib/api";
import { broker } from "@/lib/storage";

const schema = z.object({
  apiKey: z
    .string()
    .min(8, "المفتاح قصير جداً")
    .regex(/^pa_[A-Za-z0-9]+$/, "المفتاح يبدأ بـ pa_ متبوعاً بحروف وأرقام"),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  // Already authenticated → straight to dashboard.
  useEffect(() => {
    if (broker.getKey()) router.replace("/dashboard");
  }, [router]);

  async function onSubmit(values: FormData) {
    const trimmed = values.apiKey.trim();
    // Tentatively store the key so apiBroker.settings() picks it up. If
    // the call fails we wipe it back out so the user isn't stuck "logged in"
    // with a bad key.
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
    <>
      <SiteHeader />

      <div className="deck grid grid-cols-1 md:grid-cols-[1fr_minmax(0,460px)] gap-12 md:gap-20 py-14 md:py-20">
        {/* ─── Left rail — soft pitch, sets the tone ──────────── */}
        <aside className="md:pe-8 md:border-e md:border-[color:var(--color-rule)] rise-1">
          <p className="eyebrow mb-4">تسجيل الدخول</p>
          <h1 className="font-[family-name:var(--font-display)] text-[clamp(2.2rem,4.6vw,3.4rem)] leading-[1.05] text-[color:var(--color-ink)] mb-6 max-w-[14ch]">
            ارجع{" "}
            <em className="not-italic text-[color:var(--color-brick)]">
              للوحة وسيطك
            </em>
          </h1>
          <p className="font-[family-name:var(--font-body)] text-[1.1rem] leading-[1.6] text-[color:var(--color-ink-soft)] mb-7">
            استخدم نفس الـ API Key اللي وصلك بعد التسجيل. هنتأكد منه ونرجّعك على
            لوحتك في ثواني.
          </p>

          <div className="border-t border-[color:var(--color-rule)] pt-6 space-y-4">
            <p className="font-[family-name:var(--font-body)] text-[0.95rem] text-[color:var(--color-ink-soft)]">
              <strong className="text-[color:var(--color-ink)]">
                ضايع منك المفتاح؟
              </strong>{" "}
              اتواصل معانا وهنبعتلك بديل بعد التحقق من هويتك.
            </p>
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
        <div className="rise-2">
          <form
            noValidate
            onSubmit={handleSubmit(onSubmit)}
            className="sheet p-8 md:p-10"
          >
            <div className="mb-7">
              <p className="eyebrow mb-1.5">المفتاح</p>
              <h2 className="font-[family-name:var(--font-display)] text-[1.7rem] text-[color:var(--color-ink)] tracking-tight">
                ادخل API Key
              </h2>
            </div>

            <Input
              label="API Key"
              placeholder="pa_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              dir="ltr"
              autoComplete="off"
              spellCheck={false}
              helper="نفس المفتاح اللي ظهر بعد التسجيل أو في إعداداتك السابقة."
              error={errors.apiKey?.message}
              {...register("apiKey")}
              className="font-[family-name:var(--font-mono)] tracking-tight"
            />

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
        </div>
      </div>
    </>
  );
}
