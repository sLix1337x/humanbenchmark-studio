"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  size?: "md" | "lg";
  loading?: boolean;
  leadingIcon?: ReactNode;
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

export function Button({
  className,
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  leadingIcon,
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      {...props}
      disabled={isDisabled}
      aria-busy={loading}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl border font-medium tracking-[-0.02em] transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
    >
      {loading ? <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : leadingIcon}
      <span>{children}</span>
    </button>
  );
}
