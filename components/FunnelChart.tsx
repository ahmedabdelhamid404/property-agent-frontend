"use client";

import { useI18n } from "./I18nProvider";

interface Stage {
  key: string;
  label: string;
  count: number;
  color: string;
}

interface Props {
  stages: Stage[];
}

/**
 * Horizontal stacked funnel — each stage is a bar whose width is the
 * fraction of the FIRST stage. Drop counts are shown between bars.
 * Pure CSS (no recharts dep) — keeps bundle small and gives us full
 * control over RTL.
 */
export function FunnelChart({ stages }: Props) {
  const { t } = useI18n();
  if (stages.length === 0) return null;
  const first = stages[0].count || 1;
  const total = stages.reduce((s, x) => s + x.count, 0);
  if (total === 0) {
    return (
      <div className="rounded-[var(--radius-md)] border border-dashed border-[color:var(--color-border-subtle)] p-10 text-center">
        <p className="font-[family-name:var(--font-body)] text-[0.95rem] text-[color:var(--color-fg-tertiary)]">
          {t("dashboard.funnel.empty")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {stages.map((stage, i) => {
        const widthPct = stages[0].count === 0
          ? 0
          : Math.max(2, (stage.count / first) * 100);
        const conversion = stages[0].count === 0
          ? 0
          : Math.round((stage.count / first) * 100);
        const drop = i > 0 ? stages[i - 1].count - stage.count : 0;
        return (
          <div key={stage.key}>
            {i > 0 && drop > 0 ? (
              <div className="flex items-center gap-2 ms-1 mb-1.5">
                <span className="size-1 rounded-full bg-[color:var(--color-fg-disabled)]" />
                <span
                  className="font-[family-name:var(--font-mono)] text-[0.74rem] text-[color:var(--color-fg-tertiary)]"
                  dir="ltr"
                >
                  −{drop}
                </span>
              </div>
            ) : null}
            <div className="flex items-center gap-3">
              <div className="w-32 shrink-0">
                <div className="font-[family-name:var(--font-display)] text-[0.88rem] font-medium text-[color:var(--color-fg-primary)] truncate">
                  {stage.label}
                </div>
                <div
                  className="font-[family-name:var(--font-mono)] text-[0.74rem] text-[color:var(--color-fg-tertiary)] tabular-nums"
                  dir="ltr"
                >
                  {conversion}%
                </div>
              </div>
              <div className="flex-1 h-10 rounded-[var(--radius-sm)] bg-[color:var(--color-bg-sunken)] relative overflow-hidden">
                <div
                  className="absolute inset-y-0 start-0 rounded-[var(--radius-sm)] flex items-center px-3 transition-all duration-500"
                  style={{
                    width: `${widthPct}%`,
                    background: stage.color,
                    color: "var(--color-fg-inverse)",
                  }}
                >
                  <span
                    className="font-[family-name:var(--font-display)] text-[0.95rem] font-semibold tabular-nums"
                    dir="ltr"
                  >
                    {stage.count}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
