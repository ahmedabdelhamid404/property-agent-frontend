import { cn } from "@/lib/utils";

/**
 * Wordmark + brand mark.
 * Two stacked rounded squares — teal primary + gold accent.
 * Geometric, calm, no cultural pastiche.
 */
export function Logo({
  className,
  showWordmark = true,
}: {
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2.5",
        "font-[family-name:var(--font-display)]",
        className,
      )}
    >
      <svg viewBox="0 0 32 32" fill="none" className="size-8" aria-hidden>
        <rect
          x="4"
          y="4"
          width="17"
          height="17"
          rx="4.5"
          fill="var(--color-bg-brand)"
        />
        <rect
          x="11"
          y="11"
          width="17"
          height="17"
          rx="4.5"
          fill="var(--color-bg-accent)"
          transform="rotate(-6 19.5 19.5)"
        />
      </svg>
      {showWordmark ? (
        <span className="text-[1.05rem] font-semibold tracking-[-0.015em] text-[color:var(--color-fg-primary)]">
          Property
          <span className="text-[color:var(--color-fg-brand)]">·</span>Agent
        </span>
      ) : null}
    </span>
  );
}
