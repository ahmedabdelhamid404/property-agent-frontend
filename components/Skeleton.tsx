import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  lines?: number;
}

export function Skeleton({ className, lines = 1 }: Props) {
  if (lines === 1) {
    return <div className={cn("skeleton h-4 w-full", className)} aria-hidden />;
  }
  return (
    <div className={cn("space-y-2", className)} aria-hidden>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton h-4"
          style={{ width: `${85 - i * 8}%` }}
        />
      ))}
    </div>
  );
}

export function StatSkeleton() {
  return (
    <div className="sheet p-6">
      <div className="skeleton h-3 w-24 mb-3" />
      <div className="skeleton h-12 w-32 mb-2" />
      <div className="skeleton h-3 w-40" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="sheet overflow-hidden">
      <div className="border-b border-[color:var(--color-rule)] p-4">
        <div className="skeleton h-3 w-32" />
      </div>
      <div className="divide-y divide-[color:var(--color-rule)]">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="grid grid-cols-6 gap-4 p-4">
            <div className="skeleton h-4 col-span-1" />
            <div className="skeleton h-4 col-span-1" />
            <div className="skeleton h-4 col-span-2" />
            <div className="skeleton h-4 col-span-1" />
            <div className="skeleton h-4 col-span-1" />
          </div>
        ))}
      </div>
    </div>
  );
}
