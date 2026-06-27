import type { HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type NoticeProps = HTMLAttributes<HTMLDivElement> & {
  tone?: "info" | "success" | "warning" | "error";
};

const toneClasses = {
  info: "border-[var(--info-border)] bg-[var(--info-soft)] text-[var(--heading)]",
  success: "border-[var(--success-border)] bg-[var(--success-soft)] text-[var(--success)]",
  warning: "border-[var(--warning-border)] bg-[var(--warning-soft)] text-[var(--warning)]",
  error: "border-[var(--danger-border)] bg-[var(--danger-soft)] text-[var(--danger)]",
};

export function Notice({
  className,
  tone = "info",
  role,
  children,
  ...props
}: NoticeProps) {
  return (
    <div
      {...props}
      role={role ?? (tone === "error" ? "alert" : "status")}
      className={cn("rounded-xl border px-4 py-3 text-sm", toneClasses[tone], className)}
    >
      {children}
    </div>
  );
}
