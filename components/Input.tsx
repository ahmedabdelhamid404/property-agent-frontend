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
        <span className="mb-1.5 block font-[family-name:var(--font-display)] text-[0.88rem] font-medium text-[color:var(--color-fg-secondary)]">
          {label}
        </span>
      ) : null}
      <div
        className={cn(
          "group relative flex items-center gap-2",
          "bg-[color:var(--color-bg-surface)]",
          "border border-[color:var(--color-border-subtle)]",
          "rounded-[var(--radius-sm)]",
          "transition-[border-color,box-shadow] duration-200",
          "focus-within:border-[color:var(--color-fg-brand)]",
          "focus-within:shadow-[0_0_0_3px_rgba(13,74,74,0.10)]",
          "hover:border-[color:var(--color-border-default)]",
          error && "!border-[color:var(--color-error)] focus-within:!shadow-[0_0_0_3px_rgba(194,85,76,0.15)]",
        )}
      >
        {leadingIcon ? (
          <span className="ps-3 text-[color:var(--color-fg-tertiary)] [&>svg]:size-4">
            {leadingIcon}
          </span>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "block w-full bg-transparent",
            "py-3 px-3.5 text-[0.95rem]",
            "font-[family-name:var(--font-body)] text-[color:var(--color-fg-primary)]",
            "placeholder:text-[color:var(--color-fg-disabled)]",
            "outline-none",
            leadingIcon && "ps-1",
            trailing && "pe-1",
            className,
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-err` : helper ? `${inputId}-help` : undefined}
          {...rest}
        />
        {trailing ? <span className="pe-3 [&>svg]:size-4">{trailing}</span> : null}
      </div>
      {error ? (
        <span
          id={`${inputId}-err`}
          className="mt-1.5 block font-[family-name:var(--font-body)] text-[0.82rem] text-[color:var(--color-error)]"
        >
          {error}
        </span>
      ) : helper ? (
        <span
          id={`${inputId}-help`}
          className="mt-1.5 block font-[family-name:var(--font-body)] text-[0.82rem] text-[color:var(--color-fg-tertiary)]"
        >
          {helper}
        </span>
      ) : null}
    </label>
  );
});
