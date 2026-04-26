"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/Button";
import { useI18n } from "@/components/I18nProvider";
import {
  apiBroker,
  ApiError,
  type CsvTemplate,
  type InventoryUploadResult,
} from "@/lib/api";
import { formatNumber } from "@/lib/utils";

type Phase = "idle" | "uploading" | "done";

export function InventorySection() {
  const { t } = useI18n();
  const [file, setFile] = useState<File | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<InventoryUploadResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function pickFile(f: File | null) {
    if (!f) return;
    if (!f.name.toLowerCase().endsWith(".csv")) {
      toast.error(t("dashboard.inventory.mustBeCsv"));
      return;
    }
    if (f.size > 20 * 1024 * 1024) {
      toast.error(t("dashboard.inventory.maxSize"));
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
      toast.success(t("dashboard.inventory.downloadOk"));
    } catch {
      toast.error(t("dashboard.inventory.downloadFailed"));
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
      const ok = formatNumber(r.succeeded);
      const bad = formatNumber(r.failed + r.skipped);
      if (r.failed === 0 && r.skipped === 0) {
        toast.success(`${t("dashboard.inventory.col.succeeded")}: ${ok}`);
      } else {
        toast.success(
          `${t("dashboard.inventory.col.succeeded")}: ${ok} · ${t("dashboard.inventory.col.failed")}: ${bad}`,
        );
      }
    } catch (err) {
      const apiErr = err as ApiError;
      const msg =
        (apiErr?.body as { error?: string } | null)?.error ??
        apiErr?.message ??
        t("dashboard.inventory.uploadFailed");
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
      <section className="space-y-7">
        <div>
          <span className="eyebrow mb-1.5 block">
            {t("dashboard.inventory.eyebrow")}
          </span>
          <h2 className="font-[family-name:var(--font-display)] text-[1.5rem] font-semibold tracking-[-0.015em] text-[color:var(--color-fg-primary)]">
            {t("dashboard.inventory.title")}
          </h2>
          <p className="mt-2 font-[family-name:var(--font-body)] text-[0.95rem] text-[color:var(--color-fg-secondary)] max-w-prose leading-relaxed">
            {t("dashboard.inventory.body")}
          </p>
        </div>

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
              ? "!border-[color:var(--color-fg-brand)] bg-[color:var(--color-bg-brand-soft)]"
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
          <span className="eyebrow mb-2 block">
            {file
              ? t("dashboard.inventory.fileReady")
              : t("dashboard.inventory.dropPrompt")}
          </span>
          <p className="font-[family-name:var(--font-display)] text-[1.25rem] font-semibold text-[color:var(--color-fg-primary)] mb-1.5 break-all">
            {file ? file.name : t("dashboard.inventory.orPick")}
          </p>
          <p
            className="font-[family-name:var(--font-mono)] text-[0.82rem] text-[color:var(--color-fg-tertiary)]"
            dir="ltr"
          >
            {file
              ? `${(file.size / 1024).toFixed(1)} KB`
              : t("dashboard.inventory.sizeMaxHint")}
          </p>
        </label>

        <div className="flex items-center justify-between gap-4">
          {file ? (
            <button
              type="button"
              onClick={reset}
              className="font-[family-name:var(--font-display)] text-[0.88rem] text-[color:var(--color-fg-tertiary)] hover:text-[color:var(--color-fg-brand)] transition-colors"
            >
              {t("dashboard.inventory.switchFile")}
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
            {t("dashboard.inventory.uploadCta")}
          </Button>
        </div>

        {result ? (
          <div className="sheet-deed p-7 mt-2">
            <div className="flex items-baseline justify-between gap-4 mb-5">
              <span className="eyebrow">
                {t("dashboard.inventory.resultEyebrow")}
              </span>
              <p
                className="font-[family-name:var(--font-mono)] text-[0.82rem] text-[color:var(--color-fg-tertiary)]"
                dir="ltr"
              >
                {result.duration_ms}ms
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-5 gap-x-4 mb-6">
              <Stat
                label={t("dashboard.inventory.col.total")}
                value={result.total_rows}
              />
              <Stat
                label={t("dashboard.inventory.col.succeeded")}
                value={result.succeeded}
                accent="ok"
              />
              <Stat
                label={t("dashboard.inventory.col.skipped")}
                value={result.skipped}
                accent="warn"
              />
              <Stat
                label={t("dashboard.inventory.col.failed")}
                value={result.failed}
                accent="err"
              />
            </div>

            {result.errors_sample.length > 0 ? (
              <div className="border-t border-[color:var(--color-border-subtle)] pt-5">
                <span className="eyebrow mb-3 block">
                  {`${result.errors_sample.length} ${t("dashboard.inventory.errorsHeader")}`}
                  {result.errors_total > result.errors_sample.length
                    ? ` / ${result.errors_total}`
                    : ""}
                </span>
                <ul className="space-y-2 max-h-64 overflow-auto pe-2">
                  {result.errors_sample.map((e, i) => (
                    <li
                      key={i}
                      className="font-[family-name:var(--font-mono)] text-[0.82rem] text-[color:var(--color-fg-secondary)] leading-snug"
                      dir="ltr"
                    >
                      <span className="text-[color:var(--color-error)]">
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

      <aside className="space-y-7">
        <div className="sheet-deed p-7">
          <span className="eyebrow mb-2 block">
            {t("dashboard.inventory.templateEyebrow")}
          </span>
          <p className="font-[family-name:var(--font-body)] text-[0.92rem] text-[color:var(--color-fg-secondary)] mb-5 leading-relaxed">
            {t("dashboard.inventory.templateBody")}
          </p>
          <Button
            type="button"
            variant="secondary"
            onClick={downloadTemplate}
            loading={downloading}
            className="w-full"
          >
            {t("dashboard.inventory.downloadTemplate")}
          </Button>
        </div>

        <div className="sheet p-7">
          <span className="eyebrow mb-3 block">
            {t("dashboard.inventory.columnsEyebrow")}
          </span>
          <ul
            className="space-y-2 font-[family-name:var(--font-mono)] text-[0.85rem] text-[color:var(--color-fg-primary)]"
            dir="ltr"
          >
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
                className="flex items-center gap-2 before:content-['▸'] before:text-[color:var(--color-fg-brand)] before:text-[0.9em]"
              >
                {c}
              </li>
            ))}
          </ul>
          <p className="mt-4 font-[family-name:var(--font-body)] text-[0.85rem] text-[color:var(--color-fg-tertiary)]">
            {t("dashboard.inventory.columnsTip")}
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
      ? "text-[color:var(--color-success)]"
      : accent === "warn"
        ? "text-[color:var(--color-warn)]"
        : accent === "err"
          ? "text-[color:var(--color-error)]"
          : "text-[color:var(--color-fg-primary)]";
  return (
    <div>
      <span className="eyebrow mb-1 block">{label}</span>
      <p
        className={
          "font-[family-name:var(--font-display)] text-[1.6rem] font-semibold tabular-nums " +
          color
        }
        dir="ltr"
      >
        {formatNumber(value)}
      </p>
    </div>
  );
}
