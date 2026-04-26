import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { AuthedRedirect } from "@/components/AuthedRedirect";

export default function Home() {
  return (
    <>
      <AuthedRedirect />
      <SiteHeader />

      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section className="relative">
        <div className="deck pt-20 pb-20 md:pt-28 md:pb-32">
          <p className="eyebrow mb-5 rise-1">
            وكيلك العقاري الذكي على واتساب
          </p>

          <h1 className="rise-2 max-w-[18ch] font-[family-name:var(--font-display)] text-[clamp(2.6rem,6vw,4.6rem)] leading-[0.96] text-[color:var(--color-ink)]">
            بوت يردّ على عملاءك،{" "}
            <em className="not-italic text-[color:var(--color-brick)]">
              ويسلّمك الفرص
            </em>{" "}
            وأنت في السيارة.
          </h1>

          <p className="rise-3 mt-7 max-w-[60ch] font-[family-name:var(--font-body)] text-[1.15rem] leading-[1.6] text-[color:var(--color-ink-soft)]">
            ربط بسيط بمخزونك من العقارات. محادثة عربية طبيعية بمستوى وسيط
            قاهري متمرّس. تنبيه فوري لك بكلّ عميل جاهز يطلب التواصل.
          </p>

          <div className="rise-3 mt-10 flex flex-wrap items-center gap-5">
            <Link
              href="/signup"
              className="inline-flex h-13 items-center px-7 rounded-[var(--radius-sm)] bg-[color:var(--color-ink)] text-[color:var(--color-paper-cream)] font-[family-name:var(--font-serif)] text-[1.05rem] tracking-[0.01em] hover:bg-[color:var(--color-brick-deep)] transition-colors shadow-[var(--shadow-leaf)]"
            >
              ابدأ مجاناً — 30 ثانية
            </Link>
            <Link
              href="/dashboard"
              className="font-[family-name:var(--font-serif)] text-[1rem] text-[color:var(--color-ink)] linkish"
            >
              عندك حساب؟ ادخل لوحتك ←
            </Link>
          </div>

          {/* The kicker line — like a paper's standfirst */}
          <div className="rise-4 mt-16 grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-4 border-t border-[color:var(--color-rule)] pt-7 max-w-4xl">
            <Stat label="مدة الإعداد" value="< 30 ث" />
            <Stat label="لغة الرد" value="عربي مصري" />
            <Stat label="قنوات التنبيه" value="إيميل · واتساب" />
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─────────────────────────────────────── */}
      <section className="border-t border-[color:var(--color-rule)] bg-[color:var(--color-paper-shade)]/40">
        <div className="deck py-20 md:py-28">
          <p className="eyebrow mb-3">كيف يشتغل</p>
          <h2 className="font-[family-name:var(--font-display)] text-[clamp(2rem,4.4vw,3.2rem)] leading-[1.05] text-[color:var(--color-ink)] max-w-[24ch] mb-14">
            ثلاث خطوات تفصلك عن أوّل عميل.
          </h2>

          <ol className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-14 md:gap-y-0">
            <Step
              n={1}
              title="سجّل ورفّع المخزون"
              body="املأ نموذج التسجيل، ارفع ملف العقارات (CSV)، واختار قناة التنبيه — إيميل أو واتساب."
              note="بنبعتلك مفتاح الوسيط ورابط واتساب جاهز للنشر."
            />
            <Step
              n={2}
              title="انشر رابط واتساب"
              body="رابط فيه كود وسيطك الخاص. حطه في إعلاناتك، الـ Stories، الكروت — كل عميل يفتحه يوصل لك مباشرة."
              note="بدون أي إعداد على واتساب من ناحيتك."
            />
            <Step
              n={3}
              title="استلم العملاء الجاهزين"
              body="البوت يفهم العميل، يرشحله من عقاراتك، ولما يكون جاهز يقولك بإيميل أو واتساب فيه رقمه وآخر رسالة منه."
              note="لوحة فيها كل العملاء، فلترة حسب الحالة، وأزرار سريعة."
            />
          </ol>

          <div className="mt-20 border-t border-[color:var(--color-rule)] pt-7 flex flex-wrap items-end justify-between gap-6">
            <p className="font-[family-name:var(--font-body)] italic text-[1.1rem] text-[color:var(--color-ink-soft)] max-w-[40ch]">
              «الفرق بين الوسيط الكويس والمتميّز هو السرعة في الرد. البوت بيرد
              في تانية وبيسلّمك الجاهزين بس.»
            </p>
            <Link
              href="/signup"
              className="font-[family-name:var(--font-serif)] text-[1rem] linkish"
            >
              ابدأ التسجيل ←
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ───────────────────────────────────────────── */}
      <footer className="border-t border-[color:var(--color-rule)]">
        <div className="deck py-10 flex flex-wrap items-center justify-between gap-4 text-[color:var(--color-ink-faint)]">
          <p className="text-[0.92rem]">
            Property-Agent · القاهرة
          </p>
          <p className="text-[0.85rem] tracking-[0.04em]" dir="ltr">
            v1 · {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="eyebrow mb-1.5">{label}</div>
      <div className="font-[family-name:var(--font-display)] text-[1.6rem] text-[color:var(--color-ink)] tracking-tight">
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
    <li className="relative md:border-s md:border-[color:var(--color-rule)] md:ps-8">
      <div className="font-[family-name:var(--font-display)] text-[3rem] leading-[0.85] text-[color:var(--color-brick)] tabular numerals lining mb-3">
        0{n}
      </div>
      <h3 className="font-[family-name:var(--font-display)] text-[1.4rem] text-[color:var(--color-ink)] mb-2.5 tracking-tight">
        {title}
      </h3>
      <p className="font-[family-name:var(--font-body)] text-[1.05rem] leading-[1.55] text-[color:var(--color-ink-soft)]">
        {body}
      </p>
      <p className="mt-3 font-[family-name:var(--font-serif)] italic text-[0.92rem] text-[color:var(--color-ink-faint)] border-t border-[color:var(--color-rule-soft)] pt-3">
        {note}
      </p>
    </li>
  );
}
