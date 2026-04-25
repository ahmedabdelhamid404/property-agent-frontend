"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface Props {
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
  trailing?: ReactNode;
}

export function Tabs({ tabs, active, onChange, className, trailing }: Props) {
  return (
    <div
      className={cn(
        "flex items-end justify-between gap-6 border-b border-[color:var(--color-rule-strong)]",
        className,
      )}
    >
      <div role="tablist" className="flex items-end gap-1.5">
        {tabs.map((t) => {
          const isActive = active === t.id;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(t.id)}
              className={cn(
                "relative inline-flex items-baseline gap-2 px-4 py-3",
                "font-[family-name:var(--font-display)] text-[1.05rem] tracking-tight",
                "transition-colors duration-200",
                isActive
                  ? "text-[color:var(--color-ink)]"
                  : "text-[color:var(--color-ink-faint)] hover:text-[color:var(--color-ink-soft)]",
              )}
            >
              {t.label}
              {typeof t.count === "number" ? (
                <span
                  className={cn(
                    "lining tabular text-[0.78rem]",
                    isActive
                      ? "text-[color:var(--color-brick)]"
                      : "text-[color:var(--color-ink-faint)]",
                  )}
                  dir="ltr"
                >
                  {t.count}
                </span>
              ) : null}
              {isActive ? (
                <span
                  aria-hidden
                  className="absolute inset-x-2 bottom-[-1px] h-[2px] bg-[color:var(--color-brick)]"
                />
              ) : null}
            </button>
          );
        })}
      </div>
      {trailing ? <div className="pb-2">{trailing}</div> : null}
    </div>
  );
}
