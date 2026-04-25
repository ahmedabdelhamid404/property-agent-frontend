"use client";

import { cn } from "@/lib/utils";
import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helper?: string;
  error?: string;
  leadingIcon?: ReactNode;
  trailing?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { label, helper, error, leadingIcon, trailing, className, id, ...rest },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return (
    <label htmlFor={inputId} className="block">
      {label ? (
        <span
          className="block mb-1.5 font-[family-name:var(--font-serif)] text-[0.92rem] text-[color:var(--color-ink)] tracking-[-0.005em]"
        >
          {label}
        </span>
      ) : null}
      <div
        className={cn(
          "group relative flex items-center gap-2 bg-[color:var(--color-paper-cream)]",
          "border-b border-[color:var(--color-rule-strong)]",
          "transition-colors duration-200",
          "focus-within:border-[color:var(--color-ink)]",
          error && "border-[color:var(--color-err)]",
        )}
      >
        {leadingIcon ? (
          <span className="ps-1 text-[color:var(--color-ink-faint)] [&>svg]:size-4">
            {leadingIcon}
          </span>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "block w-full bg-transparent py-2.5 text-[1rem]",
            "font-[family-name:var(--font-body)] text-[color:var(--color-ink)]",
            "placeholder:text-[color:var(--color-ink-mute)]",
            "outline-none",
            className,
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-err` : helper ? `${inputId}-help` : undefined}
          {...rest}
        />
        {trailing ? <span className="pe-1 [&>svg]:size-4">{trailing}</span> : null}
      </div>
      {error ? (
        <span
          id={`${inputId}-err`}
          className="mt-1.5 block text-[0.82rem] text-[color:var(--color-err)] font-[family-name:var(--font-serif)]"
        >
          {error}
        </span>
      ) : helper ? (
        <span
          id={`${inputId}-help`}
          className="mt-1.5 block text-[0.82rem] text-[color:var(--color-ink-faint)] font-[family-name:var(--font-serif)] italic"
        >
          {helper}
        </span>
      ) : null}
    </label>
  );
});
