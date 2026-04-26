import { cn } from "@/lib/utils";

/**
 * Wordmark + tiny sage glyph. Two stacked rounded squares offset
 * slightly — calm, geometric, no cultural pastiche.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2.5",
        "font-[family-name:var(--font-display)]",
        className,
      )}
    >
      <svg
        viewBox="0 0 32 32"
        fill="none"
        className="size-7"
        aria-hidden
      >
        <rect
          x="5"
          y="5"
          width="16"
          height="16"
          rx="3.5"
          fill="var(--color-brick)"
          opacity="0.85"
        />
        <rect
          x="11"
          y="11"
          width="16"
          height="16"
          rx="3.5"
          fill="var(--color-teal)"
          opacity="0.9"
        />
      </svg>
      <span className="text-[1.05rem] font-semibold tracking-[-0.01em] text-[color:var(--color-ink)]">
        Property<span className="text-[color:var(--color-brick)]">·</span>Agent
      </span>
    </span>
  );
}
