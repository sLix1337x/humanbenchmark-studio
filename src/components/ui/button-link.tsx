import type { ReactNode } from "react";

import Link from "next/link";

import { cn } from "@/lib/cn";

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "md" | "lg";
  className?: string;
};

const variantClasses = {
  primary:
    "border-[var(--accent)] bg-[var(--accent)] text-[var(--foreground-strong)] hover:border-[var(--accent-soft)] hover:bg-[var(--accent-soft)]",
  secondary:
    "border-[var(--border-strong)] bg-[var(--panel-soft)] text-[var(--foreground)] hover:border-[var(--accent-soft)] hover:bg-[var(--panel-strong)] hover:text-[var(--foreground-strong)]",
  ghost: "border-transparent bg-transparent text-[var(--body)] hover:bg-[var(--panel-soft)] hover:text-[var(--foreground-strong)]",
};

const sizeClasses = {
  md: "min-h-10 px-4 py-2 text-sm",
  lg: "min-h-11 px-5 py-2.5 text-[15px]",
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  size = "md",
  className,
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl border font-medium tracking-[-0.02em] transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
    >
      {children}
    </Link>
  );
}
