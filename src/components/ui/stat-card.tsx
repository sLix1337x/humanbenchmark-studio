import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";

type StatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  loading?: boolean;
  className?: string;
};

export function StatCard({ label, value, hint, loading = false, className }: StatCardProps) {
  return (
    <Card className={cn("p-5", className)}>
      <p className="text-xs uppercase tracking-[0.25em] text-[var(--body-subtle)]">{label}</p>
      {loading ? (
        <div className="mt-3 h-9 w-24 animate-pulse rounded bg-[var(--panel-strong)]" aria-hidden="true" />
      ) : (
        <p className="mt-2 text-3xl font-medium tracking-[-0.03em] text-[var(--heading)]">{value}</p>
      )}
      {hint ? <p className="mt-2 text-sm text-[var(--body)]">{hint}</p> : null}
    </Card>
  );
}
