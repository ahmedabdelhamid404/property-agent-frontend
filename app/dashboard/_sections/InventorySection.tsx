"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/Button";
import {
  apiBroker,
  ApiError,
  type CsvTemplate,
  type InventoryUploadResult,
} from "@/lib/api";
import { formatNumber } from "@/lib/utils";

type Phase = "idle" | "uploading" | "done";

export function InventorySection() {
  const [file, setFile] = useState<File | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<InventoryUploadResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function pickFile(f: File | null) {
    if (!f) return;
    if (!f.name.toLowerCase().endsWith(".csv")) {
      toast.error("الملف لازم يكون CSV");
      return;
    }
    if (f.size > 20 * 1024 * 1024) {
      toast.error("الحد الأقصى 20 ميجا");
      return;
    }
    setFile(f);
    setResult(null);
    setPhase("idle");
  }

  async function downloadTemplate() {
    try {
      setDownloading(true);
      const tpl: CsvTemplate = await apiBroker.csvTemplate();
      const blob = new Blob([tpl.header_csv_line + "\n"], {
        type: "text/csv;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "property-agent-inventory-template.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("النموذج اتنزّل");
    } catch {
      toast.error("ما قدرتش أنزّل النموذج");
    } finally {
      setDownloading(false);
    }
  }

  async function upload() {
    if (!file) return;
    setPhase("uploading");
    setResult(null);
    try {
      const r = await apiBroker.uploadInventory(file);
      setResult(r);
      setPhase("done");
      if (r.failed === 0 && r.skipped === 0) {
        toast.success(`اتسجّل ${formatNumber(r.succeeded)} عقار`);
      } else {
        toast.success(`تم. نجح ${r.succeeded} و فشل ${r.failed + r.skipped}`);
      }
    } catch (err) {
      const apiErr = err as ApiError;
      const msg =
        (apiErr?.body as { error?: string } | null)?.error ??
        apiErr?.message ??
        "حصلت مشكلة في الرفع";
      toast.error(msg);
      setPhase("idle");
    }
  }

  function reset() {
    setFile(null);
    setResult(null);
    setPhase("idle");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,360px)] gap-12">
      {/* ─── Upload column ─────────────────────────────────────── */}
      <section className="space-y-7">
        <div>
          <p className="eyebrow mb-1.5">رفع المخزون</p>
          <h2 className="font-[family-name:var(--font-display)] text-[1.7rem] text-[color:var(--color-ink)] tracking-tight">
            ضمّ عقاراتك للذكاء
          </h2>
          <p className="mt-2 font-[family-name:var(--font-body)] italic text-[0.98rem] text-[color:var(--color-ink-soft)] max-w-prose">
            ارفع ملف CSV فيه عقاراتك. كل صف يدخل في خزينة مكتبك ويبدأ يظهر
            للعملاء على الواتساب فوراً.
          </p>
        </div>

        {/* Dropzone */}
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const f = e.dataTransfer.files?.[0];
            if (f) pickFile(f);
          }}
          className={
            "block sheet p-9 cursor-pointer text-center transition-colors " +
            (dragOver
              ? "border-[color:var(--color-brick)] bg-[color:var(--color-brick-tint)]"
              : "")
          }
        >
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="sr-only"
            onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
          />
          <p className="eyebrow mb-2">
            {file ? "ملف جاهز" : "اسحب الملف هنا"}
          </p>
          <p className="font-[family-name:var(--font-display)] text-[1.4rem] text-[color:var(--color-ink)] mb-1.5 break-all">
            {file ? file.name : "أو اضغط للاختيار"}
          </p>
          <p
            className="font-[family-name:var(--font-serif)] text-[0.85rem] text-[color:var(--color-ink-faint)]"
            dir="ltr"
          >
            {file ? `${(file.size / 1024).toFixed(1)} KB` : "CSV · max 20 MB"}
          </p>
        </label>

        <div className="flex items-center justify-between gap-4">
          {file ? (
            <button
              type="button"
              onClick={reset}
              className="font-[family-name:var(--font-serif)] text-[0.9rem] text-[color:var(--color-ink-faint)] hover:text-[color:var(--color-brick)] transition-colors"
            >
              ← اختار ملف تاني
            </button>
          ) : (
            <span />
          )}
          <Button
            type="button"
            onClick={upload}
            loading={phase === "uploading"}
            disabled={!file || phase === "uploading"}
            size="lg"
          >
            ارفع للذكاء
          </Button>
        </div>

        {/* Result */}
        {result ? (
          <div className="sheet-deed p-7 mt-2">
            <div className="flex items-baseline justify-between gap-4 mb-5">
              <p className="eyebrow">سند الرفع</p>
              <p
                className="font-[family-name:var(--font-serif)] italic text-[0.85rem] text-[color:var(--color-ink-faint)]"
                dir="ltr"
              >
                {result.duration_ms}ms
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-5 gap-x-4 mb-6">
              <Stat label="إجمالي" value={result.total_rows} />
              <Stat label="نجح" value={result.succeeded} accent="ok" />
              <Stat label="مكرر/مهمل" value={result.skipped} accent="warn" />
              <Stat label="فشل" value={result.failed} accent="err" />
            </div>

            {result.errors_sample.length > 0 ? (
              <div className="border-t border-[color:var(--color-rule-strong)] pt-5">
                <p className="eyebrow mb-3">
                  أول {result.errors_sample.length} خطأ
                  {result.errors_total > result.errors_sample.length
                    ? ` (من إجمالي ${result.errors_total})`
                    : ""}
                </p>
                <ul className="space-y-2 max-h-64 overflow-auto pe-2">
                  {result.errors_sample.map((e, i) => (
                    <li
                      key={i}
                      className="font-[family-name:var(--font-mono)] text-[0.82rem] text-[color:var(--color-ink-soft)] leading-snug"
                      dir="ltr"
                    >
                      <span className="text-[color:var(--color-err)]">
                        row {e.row}:
                      </span>{" "}
                      {e.reason}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}
      </section>

      {/* ─── Side rail — template + tips ───────────────────────── */}
      <aside className="space-y-7">
        <div className="sheet-deed p-7">
          <p className="eyebrow mb-2">نموذج CSV</p>
          <p className="font-[family-name:var(--font-body)] italic text-[0.95rem] text-[color:var(--color-ink-soft)] mb-5">
            نزّل ملف فاضي بكل الأعمدة المطلوبة، املاه بعقاراتك، وارفعه.
          </p>
          <Button
            type="button"
            variant="secondary"
            onClick={downloadTemplate}
            loading={downloading}
            className="w-full"
          >
            ↓ تحميل النموذج
          </Button>
        </div>

        <div className="sheet p-7">
          <p className="eyebrow mb-3">الأعمدة الأساسية</p>
          <ul className="space-y-2 font-[family-name:var(--font-mono)] text-[0.85rem] text-[color:var(--color-ink)]" dir="ltr">
            {[
              "title",
              "city",
              "price",
              "area",
              "property_type",
              "transaction_type",
            ].map((c) => (
              <li
                key={c}
                className="flex items-center gap-2 before:content-['▸'] before:text-[color:var(--color-brick)] before:text-[0.9em]"
              >
                {c}
              </li>
            ))}
          </ul>
          <p className="mt-4 font-[family-name:var(--font-serif)] italic text-[0.85rem] text-[color:var(--color-ink-faint)]">
            في النموذج فيه أعمدة اختيارية كتير لو حابب تدّيها للذكاء.
          </p>
        </div>
      </aside>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: "ok" | "warn" | "err";
}) {
  const color =
    accent === "ok"
      ? "text-[color:var(--color-ok)]"
      : accent === "warn"
        ? "text-[color:var(--color-warn)]"
        : accent === "err"
          ? "text-[color:var(--color-err)]"
          : "text-[color:var(--color-ink)]";
  return (
    <div>
      <p className="eyebrow mb-1">{label}</p>
      <p
        className={
          "font-[family-name:var(--font-display)] text-[1.7rem] tabular-nums " +
          color
        }
        dir="ltr"
      >
        {formatNumber(value)}
      </p>
    </div>
  );
}
