import type { HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: "neutral" | "info" | "success" | "warning" | "error";
};

const toneClasses = {
  neutral: "border-[var(--border-strong)] bg-[var(--panel-soft)] text-[var(--body)]",
  info: "border-[var(--info-border)] bg-[var(--info-soft)] text-[var(--heading)]",
  success: "border-[var(--success-border)] bg-[var(--success-soft)] text-[var(--success)]",
  warning: "border-[var(--warning-border)] bg-[var(--warning-soft)] text-[var(--warning)]",
  error: "border-[var(--danger-border)] bg-[var(--danger-soft)] text-[var(--danger)]",
};

export function Badge({ className, tone = "neutral", children, ...props }: BadgeProps) {
  return (
    <span
      {...props}
      className={cn(
        "inline-flex items-center rounded-lg border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
