"use client";

import { useId } from "react";
import {
  Area,
  AreaChart as RArea,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Datum {
  label: string;
  value: number;
}

// Recharts v3's exported tooltip types are inconsistent and shift
// across patch versions. Lightweight local shape covers what we read.
interface RawTooltipProps {
  active?: boolean;
  payload?: ReadonlyArray<{ value?: number | string }>;
  label?: string | number;
}

interface Props {
  data: Datum[];
  height?: number;
  color?: string;
  formatTooltipValue?: (v: number) => string;
  formatXTick?: (label: string, index: number) => string;
}

/**
 * Full-width filled area chart with subtle grid + axis. Smooth-curve
 * line, gradient fill, custom tooltip styled with our tokens.
 */
export function FilledAreaChart({
  data,
  height = 280,
  color,
  formatTooltipValue,
  formatXTick,
}: Props) {
  const id = useId().replace(/:/g, "");
  const stroke = color ?? "var(--color-fg-brand)";

  const TooltipBox = (rawProps: unknown) => {
    const props = rawProps as RawTooltipProps;
    const { active, payload, label } = props;
    if (!active || !payload || payload.length === 0) return null;
    const raw = payload[0]?.value;
    const v = typeof raw === "number" ? raw : Number(raw ?? 0);
    return (
      <div className="rounded-[var(--radius-sm)] bg-[color:var(--color-neutral-900)] text-[color:var(--color-fg-inverse)] px-3 py-2 shadow-[var(--shadow-card)]">
        <div
          className="font-[family-name:var(--font-mono)] text-[0.74rem] opacity-70 mb-0.5"
          dir="ltr"
        >
          {label}
        </div>
        <div
          className="font-[family-name:var(--font-display)] text-[1rem] font-semibold tabular-nums"
          dir="ltr"
        >
          {formatTooltipValue ? formatTooltipValue(v) : v}
        </div>
      </div>
    );
  };

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RArea
          data={data}
          margin={{ top: 12, right: 12, left: 0, bottom: 8 }}
        >
          <defs>
            <linearGradient id={`af-${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity={0.32} />
              <stop offset="100%" stopColor={stroke} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid
            stroke="var(--color-border-subtle)"
            strokeDasharray="3 3"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{
              fontSize: 11,
              fill: "var(--color-fg-tertiary)",
              fontFamily: "var(--font-mono)",
            }}
            tickFormatter={
              formatXTick
                ? (val: string, i: number) => formatXTick(val, i)
                : undefined
            }
            interval="preserveStartEnd"
            minTickGap={24}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{
              fontSize: 11,
              fill: "var(--color-fg-tertiary)",
              fontFamily: "var(--font-mono)",
            }}
            allowDecimals={false}
            width={32}
          />
          <Tooltip
            cursor={{
              stroke: "var(--color-border-default)",
              strokeWidth: 1,
              strokeDasharray: "3 3",
            }}
            content={TooltipBox}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={stroke}
            strokeWidth={2}
            fill={`url(#af-${id})`}
            isAnimationActive
            animationDuration={500}
            dot={false}
            activeDot={{
              r: 4,
              fill: stroke,
              stroke: "var(--color-bg-surface)",
              strokeWidth: 2,
            }}
          />
        </RArea>
      </ResponsiveContainer>
    </div>
  );
}
