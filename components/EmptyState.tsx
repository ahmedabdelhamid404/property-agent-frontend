import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface Props {
  title: string;
  hint?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ title, hint, icon, action, className }: Props) {
  return (
    <div
      className={cn(
        "sheet flex flex-col items-center justify-center text-center",
        "px-8 py-16 gap-3",
        className,
      )}
    >
      {icon ? (
        <div
          aria-hidden
          className="flex size-14 items-center justify-center rounded-full border border-[color:var(--color-rule-strong)] bg-[color:var(--color-vellum)] text-[color:var(--color-ink-faint)]"
        >
          {icon}
        </div>
      ) : null}
      <h3 className="font-[family-name:var(--font-display)] text-[1.5rem] text-[color:var(--color-ink)]">
        {title}
      </h3>
      {hint ? (
        <p className="max-w-md font-[family-name:var(--font-body)] text-[1rem] text-[color:var(--color-ink-soft)] italic">
          {hint}
        </p>
      ) : null}
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}
