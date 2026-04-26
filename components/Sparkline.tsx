"use client";

import { useId } from "react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

interface Props {
  data: { v: number }[];
  color?: string;
  height?: number;
}

/**
 * Tiny inline trend chart for stat cards. Filled area under a smooth
 * line, no axes, no grid. Color defaults to the brand teal.
 */
export function Sparkline({ data, color, height = 36 }: Props) {
  const id = useId().replace(/:/g, "");
  // Filter out NaN/Infinity to avoid recharts bailing
  const safe = data
    .map((d) => ({ v: Number.isFinite(d.v) ? d.v : 0 }))
    .map((d) => ({ v: Math.max(0, d.v) }));
  const stroke = color ?? "var(--color-fg-brand)";
  const allZero = safe.every((d) => d.v === 0);

  if (safe.length === 0) {
    return <div style={{ height }} />;
  }

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={safe}
          margin={{ top: 2, right: 0, bottom: 0, left: 0 }}
        >
          <defs>
            <linearGradient id={`sg-${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity={0.32} />
              <stop offset="100%" stopColor={stroke} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="v"
            stroke={stroke}
            strokeWidth={1.6}
            fill={allZero ? "transparent" : `url(#sg-${id})`}
            isAnimationActive={false}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
