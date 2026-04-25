"use client";

import { cn } from "@/lib/utils";
import { forwardRef, useId, type SelectHTMLAttributes } from "react";

interface Option {
  value: string;
  label: string;
}

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helper?: string;
  error?: string;
  options: Option[];
}

export const Select = forwardRef<HTMLSelectElement, Props>(function Select(
  { label, helper, error, options, className, id, ...rest },
  ref,
) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  return (
    <label htmlFor={selectId} className="block">
      {label ? (
        <span className="block mb-1.5 font-[family-name:var(--font-serif)] text-[0.92rem] text-[color:var(--color-ink)] tracking-[-0.005em]">
          {label}
        </span>
      ) : null}
      <div
        className={cn(
          "relative bg-[color:var(--color-paper-cream)]",
          "border-b border-[color:var(--color-rule-strong)]",
          "transition-colors duration-200",
          "focus-within:border-[color:var(--color-ink)]",
          error && "border-[color:var(--color-err)]",
        )}
      >
        <select
          ref={ref}
          id={selectId}
          className={cn(
            "block w-full appearance-none bg-transparent py-2.5 ps-1 pe-8 text-[1rem]",
            "font-[family-name:var(--font-body)] text-[color:var(--color-ink)]",
            "outline-none",
            className,
          )}
          aria-invalid={!!error}
          {...rest}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 end-1 flex items-center text-[color:var(--color-ink-faint)]"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
      {error ? (
        <span className="mt-1.5 block text-[0.82rem] text-[color:var(--color-err)] font-[family-name:var(--font-serif)]">
          {error}
        </span>
      ) : helper ? (
        <span className="mt-1.5 block text-[0.82rem] text-[color:var(--color-ink-faint)] font-[family-name:var(--font-serif)] italic">
          {helper}
        </span>
      ) : null}
    </label>
  );
});
