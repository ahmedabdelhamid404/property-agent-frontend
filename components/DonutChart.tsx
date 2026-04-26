"use client";

import { useMemo } from "react";

interface Slice {
  key: string;
  label: string;
  value: number;
  color: string;
}

interface Props {
  data: Slice[];
  centerLabel?: string;
  centerValue?: string | number;
  size?: number;
  thickness?: number;
}

/**
 * Pure-SVG donut chart. No recharts overhead, full control over RTL.
 * Shows slices proportional to value with hover-pop. A center label
 * + total is rendered in the middle.
 */
export function DonutChart({
  data,
  centerLabel,
  centerValue,
  size = 180,
  thickness = 22,
}: Props) {
  const total = useMemo(() => data.reduce((s, d) => s + d.value, 0), [data]);
  const r = size / 2 - thickness / 2;
  const c = 2 * Math.PI * r;

  if (total === 0) {
    return (
      <div
        className="rounded-full border-[20px] border-[color:var(--color-bg-sunken)] flex items-center justify-center text-[color:var(--color-fg-tertiary)] font-[family-name:var(--font-display)] text-[0.85rem]"
        style={{ width: size, height: size }}
      >
        —
      </div>
    );
  }

  let cumulative = 0;
  return (
    <div className="flex items-center gap-6">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="shrink-0"
      >
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-bg-sunken)"
          strokeWidth={thickness}
        />
        {/* Slices */}
        {data.map((s) => {
          if (s.value === 0) return null;
          const fraction = s.value / total;
          const dash = c * fraction;
          const gap = c - dash;
          const offset = c * 0.25 - cumulative * c; // start at 12 o'clock
          cumulative += fraction;
          return (
            <circle
              key={s.key}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={thickness}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={offset}
              strokeLinecap="butt"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              style={{ transition: "stroke-dasharray 600ms ease" }}
            />
          );
        })}
        {/* Center label */}
        {centerValue !== undefined ? (
          <text
            x={size / 2}
            y={size / 2 - 4}
            textAnchor="middle"
            className="font-[family-name:var(--font-display)]"
            style={{
              fontSize: size * 0.22,
              fontWeight: 600,
              fill: "var(--color-fg-primary)",
              letterSpacing: "-0.02em",
            }}
          >
            {centerValue}
          </text>
        ) : null}
        {centerLabel ? (
          <text
            x={size / 2}
            y={size / 2 + size * 0.14}
            textAnchor="middle"
            className="font-[family-name:var(--font-display)]"
            style={{
              fontSize: size * 0.072,
              fontWeight: 500,
              fill: "var(--color-fg-tertiary)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            {centerLabel}
          </text>
        ) : null}
      </svg>

      {/* Legend */}
      <ul className="space-y-2 min-w-0 flex-1">
        {data.map((s) => {
          const pct = total === 0 ? 0 : Math.round((s.value / total) * 100);
          return (
            <li key={s.key} className="flex items-center gap-2.5">
              <span
                className="size-3 rounded-full shrink-0"
                style={{ background: s.color }}
              />
              <span className="font-[family-name:var(--font-display)] text-[0.88rem] font-medium text-[color:var(--color-fg-primary)] grow truncate">
                {s.label}
              </span>
              <span
                className="font-[family-name:var(--font-mono)] text-[0.82rem] text-[color:var(--color-fg-secondary)] tabular-nums"
                dir="ltr"
              >
                {s.value}{" "}
                <span className="text-[color:var(--color-fg-tertiary)]">
                  ({pct}%)
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
