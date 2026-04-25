import { cn } from "@/lib/utils";

/**
 * Compact "PA" monogram in Amiri — used in the dashboard header. The
 * landing page has its own larger masthead treatment inline. This is
 * the everyday-utility version.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-2",
        "font-[family-name:var(--font-display)]",
        className,
      )}
    >
      <svg
        viewBox="0 0 32 32"
        fill="none"
        className="size-7 text-[color:var(--color-brick)]"
        aria-hidden
      >
        {/* Eight-point star — Cairo doorway lattice */}
        <g stroke="currentColor" strokeWidth="1.4" fill="none">
          <rect x="6" y="6" width="20" height="20" transform="rotate(0 16 16)" />
          <rect x="6" y="6" width="20" height="20" transform="rotate(45 16 16)" />
        </g>
        <circle cx="16" cy="16" r="2.4" fill="currentColor" />
      </svg>
      <span className="text-[1.15rem] tracking-tight text-[color:var(--color-ink)]">
        Property<span className="text-[color:var(--color-brick)]">·</span>Agent
      </span>
    </span>
  );
}
