"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Select } from "@/components/Select";
import { TableSkeleton } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { useI18n } from "@/components/I18nProvider";
import {
  apiBroker,
  type MarketKnowledgeEntry,
  type MarketKnowledgePage,
  type MarketKnowledgeUpsert,
} from "@/lib/api";
import { cn, relativeTime, truncate } from "@/lib/utils";

const TOPICS = [
  "Mortgage", "Tax", "Documentation", "PaymentPlan",
  "Compound", "NorthCoast", "ForeignOwnership",
  "Brokerage", "Pricing", "Process", "Other",
];

/**
 * T2 — MarketKnowledge editor.
 *
 * Read mode: lists global defaults (read-only) + tenant overrides.
 * Edit mode: tenant rows are editable inline; global rows can be "Forked"
 * which creates a tenant copy the broker can then customize.
 *
 * Embedding regeneration is async (≤30s after save) — UI reflects this with
 * a small "indexing…" badge so the broker doesn't expect instant retrieval.
 */
export function KnowledgeSection() {
  const { t } = useI18n();
  const [data, setData] = useState<MarketKnowledgePage | null>(null);
  const [loading, setLoading] = useState(true);
  const [topic, setTopic] = useState<string>("");
  const [editing, setEditing] = useState<MarketKnowledgeEntry | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await apiBroker.knowledgeList({
        topic: topic || undefined,
        activeOnly: false,
        pageSize: 200,
      });
      setData(r);
    } catch {
      toast.error(t("dashboard.knowledge.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [topic, t]);

  useEffect(() => {
    load();
  }, [load]);

  async function fork(entry: MarketKnowledgeEntry) {
    try {
      await apiBroker.knowledgeCreate({
        topic: entry.topic,
        question: entry.question,
        answer: entry.answer,
        aliases: entry.aliases ?? undefined,
        region: entry.region,
        confidence: entry.confidence,
        sourceUrl: entry.sourceUrl,
        lastVerifiedAt: new Date().toISOString(),
        isActive: true,
      });
      toast.success(t("dashboard.knowledge.forkSuccess"));
      load();
    } catch {
      toast.error(t("dashboard.knowledge.forkFailed"));
    }
  }

  async function remove(entry: MarketKnowledgeEntry) {
    if (!confirm(t("dashboard.knowledge.confirmDelete"))) return;
    try {
      await apiBroker.knowledgeDelete(entry.id);
      toast.success(t("dashboard.knowledge.deleteSuccess"));
      load();
    } catch {
      toast.error(t("dashboard.knowledge.deleteFailed"));
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-[1.4rem] font-semibold tracking-[-0.015em] text-[color:var(--color-fg-primary)]">
            {t("dashboard.knowledge.title")}
          </h2>
          <p className="mt-1 font-[family-name:var(--font-body)] text-[0.88rem] text-[color:var(--color-fg-tertiary)]">
            {t("dashboard.knowledge.subtitle")}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-[200px]">
            <Select
              label={t("dashboard.knowledge.topicFilter")}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              options={[
                { value: "", label: t("dashboard.knowledge.topicAll") },
                ...TOPICS.map((tp) => ({
                  value: tp,
                  label: t(`dashboard.knowledge.topicValue.${tp}`),
                })),
              ]}
            />
          </div>
          <Button onClick={() => setCreating(true)}>
            {t("dashboard.knowledge.add")}
          </Button>
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={6} />
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          title={t("dashboard.knowledge.emptyTitle")}
          hint={t("dashboard.knowledge.emptyHint")}
        />
      ) : (
        <div className="sheet overflow-hidden">
          <table className="w-full text-start">
            <thead>
              <tr className="border-b border-[color:var(--color-border-default)] bg-[color:var(--color-bg-canvas)]">
                <Th>{t("dashboard.knowledge.col.topic")}</Th>
                <Th>{t("dashboard.knowledge.col.question")}</Th>
                <Th>{t("dashboard.knowledge.col.answer")}</Th>
                <Th>{t("dashboard.knowledge.col.scope")}</Th>
                <Th>{t("dashboard.knowledge.col.verified")}</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--color-border-subtle)]">
              {data.items.map((entry) => (
                <KnowledgeRow
                  key={entry.id}
                  entry={entry}
                  onEdit={() => setEditing(entry)}
                  onFork={() => fork(entry)}
                  onDelete={() => remove(entry)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(editing || creating) ? (
        <KnowledgeEditDialog
          entry={editing}
          onClose={() => {
            setEditing(null);
            setCreating(false);
          }}
          onSaved={() => {
            setEditing(null);
            setCreating(false);
            load();
          }}
        />
      ) : null}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────
   Row
   ────────────────────────────────────────────────────────────────── */

function KnowledgeRow({
  entry,
  onEdit,
  onFork,
  onDelete,
}: {
  entry: MarketKnowledgeEntry;
  onEdit: () => void;
  onFork: () => void;
  onDelete: () => void;
}) {
  const { t } = useI18n();
  const stale =
    !!entry.lastVerifiedAt &&
    Date.now() - new Date(entry.lastVerifiedAt).getTime() > 180 * 24 * 3600 * 1000;

  return (
    <tr className="row-hover">
      <Td>
        <span className="px-2 py-0.5 rounded-full bg-[color:var(--color-bg-brand-soft)] text-[color:var(--color-fg-brand)] text-[0.78rem] font-medium">
          {t(`dashboard.knowledge.topicValue.${entry.topic}`)}
        </span>
      </Td>
      <Td>
        <span className="font-[family-name:var(--font-body)] text-[0.92rem] text-[color:var(--color-fg-primary)]">
          {truncate(entry.question, 80)}
        </span>
      </Td>
      <Td>
        <span className="font-[family-name:var(--font-body)] text-[0.86rem] text-[color:var(--color-fg-secondary)]">
          {truncate(entry.answer, 110)}
        </span>
      </Td>
      <Td>
        {entry.isGlobal ? (
          <span className="text-[0.78rem] text-[color:var(--color-fg-tertiary)]">
            {t("dashboard.knowledge.scopeGlobal")}
          </span>
        ) : (
          <span className="text-[0.78rem] text-[color:var(--color-fg-brand)]">
            {t("dashboard.knowledge.scopeMine")}
          </span>
        )}
        {!entry.isActive ? (
          <span className="ms-2 text-[0.7rem] text-[color:var(--color-fg-disabled)]">
            ({t("dashboard.knowledge.inactive")})
          </span>
        ) : null}
      </Td>
      <Td>
        <span className={cn(
          "text-[0.78rem]",
          stale ? "text-[color:var(--color-warning)]" : "text-[color:var(--color-fg-tertiary)]",
        )}>
          {entry.lastVerifiedAt ? relativeTime(entry.lastVerifiedAt) : "—"}
          {stale ? " ⚠" : ""}
        </span>
      </Td>
      <Td>
        <div className="flex items-center gap-2 justify-end">
          {entry.isGlobal ? (
            <Button variant="ghost" size="sm" onClick={onFork}>
              {t("dashboard.knowledge.fork")}
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={onEdit}>
                {t("dashboard.knowledge.edit")}
              </Button>
              <Button variant="ghost" size="sm" onClick={onDelete}>
                {t("dashboard.knowledge.delete")}
              </Button>
            </>
          )}
        </div>
      </Td>
    </tr>
  );
}

/* ──────────────────────────────────────────────────────────────────
   Edit / Create dialog (modal)
   ────────────────────────────────────────────────────────────────── */

function KnowledgeEditDialog({
  entry,
  onClose,
  onSaved,
}: {
  entry: MarketKnowledgeEntry | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { t } = useI18n();
  const [form, setForm] = useState<MarketKnowledgeUpsert>(() => ({
    topic: entry?.topic ?? "Other",
    question: entry?.question ?? "",
    answer: entry?.answer ?? "",
    aliases: entry?.aliases ?? [],
    region: entry?.region ?? null,
    confidence: entry?.confidence ?? 0.85,
    sourceUrl: entry?.sourceUrl ?? null,
    isActive: entry?.isActive ?? true,
  }));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function save() {
    if (!form.question?.trim() || !form.answer?.trim()) {
      toast.error(t("dashboard.knowledge.requiredFields"));
      return;
    }
    setSaving(true);
    try {
      if (entry) {
        await apiBroker.knowledgeUpdate(entry.id, {
          ...form,
          lastVerifiedAt: new Date().toISOString(),
        });
        toast.success(t("dashboard.knowledge.updateSuccess"));
      } else {
        await apiBroker.knowledgeCreate({
          ...form,
          lastVerifiedAt: new Date().toISOString(),
        });
        toast.success(t("dashboard.knowledge.createSuccess"));
      }
      onSaved();
    } catch {
      toast.error(t("dashboard.knowledge.saveFailed"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label={t("common.cancel")}
        onClick={onClose}
        className="absolute inset-0 bg-[rgba(13,74,74,0.4)] backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative w-full max-w-[640px] max-h-[90vh] overflow-y-auto",
          "bg-[color:var(--color-bg-surface)] rounded-[var(--radius-md)]",
          "border border-[color:var(--color-border-subtle)] shadow-[var(--shadow-card)]",
          "p-6 space-y-4",
        )}
      >
        <h3 className="font-[family-name:var(--font-display)] text-[1.15rem] font-semibold">
          {entry ? t("dashboard.knowledge.editTitle") : t("dashboard.knowledge.addTitle")}
        </h3>

        <Select
          label={t("dashboard.knowledge.col.topic")}
          value={form.topic}
          onChange={(e) => setForm({ ...form, topic: e.target.value })}
          options={TOPICS.map((tp) => ({
            value: tp,
            label: t(`dashboard.knowledge.topicValue.${tp}`),
          }))}
        />
        <Input
          label={t("dashboard.knowledge.col.question")}
          value={form.question}
          onChange={(e) => setForm({ ...form, question: e.target.value })}
        />
        <label className="block">
          <span className="mb-1.5 block font-[family-name:var(--font-display)] text-[0.88rem] font-medium text-[color:var(--color-fg-secondary)]">
            {t("dashboard.knowledge.col.answer")}
          </span>
          <textarea
            rows={5}
            value={form.answer}
            onChange={(e) => setForm({ ...form, answer: e.target.value })}
            className={cn(
              "block w-full px-3.5 py-3 text-[0.95rem]",
              "bg-[color:var(--color-bg-surface)]",
              "border border-[color:var(--color-border-subtle)] rounded-[var(--radius-sm)]",
              "font-[family-name:var(--font-body)] text-[color:var(--color-fg-primary)]",
              "outline-none focus:border-[color:var(--color-fg-brand)]",
              "focus:shadow-[0_0_0_3px_rgba(13,74,74,0.10)]",
            )}
          />
        </label>
        <Input
          label={t("dashboard.knowledge.col.region")}
          value={form.region ?? ""}
          onChange={(e) => setForm({ ...form, region: e.target.value || null })}
          helper={t("dashboard.knowledge.regionHelper")}
        />
        <Input
          label={t("dashboard.knowledge.sourceUrl")}
          value={form.sourceUrl ?? ""}
          onChange={(e) => setForm({ ...form, sourceUrl: e.target.value || null })}
          helper={t("dashboard.knowledge.sourceHelper")}
        />
        <Input
          label={t("dashboard.knowledge.confidence")}
          type="number"
          min={0}
          max={1}
          step={0.05}
          value={form.confidence ?? 0.85}
          onChange={(e) =>
            setForm({ ...form, confidence: Number(e.target.value) || 0.85 })
          }
          helper={t("dashboard.knowledge.confidenceHelper")}
        />

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[color:var(--color-border-subtle)]">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            {t("common.cancel")}
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? t("common.loading") : t("common.save")}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────
   tiny inline cell components
   ────────────────────────────────────────────────────────────────── */

function Th({ children }: { children?: React.ReactNode }) {
  return (
    <th className="text-start px-4 py-3 font-[family-name:var(--font-display)] text-[0.78rem] font-semibold uppercase tracking-wider text-[color:var(--color-fg-tertiary)]">
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return (
    <td className="px-4 py-3 align-middle font-[family-name:var(--font-body)] text-[0.92rem] text-[color:var(--color-fg-primary)]">
      {children}
    </td>
  );
}
