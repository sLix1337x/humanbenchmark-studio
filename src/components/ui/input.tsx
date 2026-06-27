"use client";

import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string | null;
  containerClassName?: string;
};

export function Input({
  className,
  containerClassName,
  label,
  hint,
  error,
  id,
  ...props
}: InputProps) {
  const inputId = id ?? props.name ?? undefined;
  const hintId = hint && inputId ? `${inputId}-hint` : undefined;
  const errorId = error && inputId ? `${inputId}-error` : undefined;

  return (
    <label className={cn("block", containerClassName)} htmlFor={inputId}>
      {label ? <span className="mb-2 block text-sm font-medium text-[var(--heading)]">{label}</span> : null}
      <input
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
        className={cn(
          "w-full rounded-xl border border-[var(--border-strong)] bg-[var(--panel-soft)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition-colors",
          "placeholder:text-[var(--body-subtle)] focus:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]/30",
          error ? "border-[var(--danger)] focus:border-[var(--danger)]" : undefined,
          className,
        )}
        {...props}
      />
      {hint ? (
        <span id={hintId} className="mt-2 block text-xs text-[var(--body-subtle)]">
          {hint}
        </span>
      ) : null}
      {error ? (
        <span id={errorId} className="mt-2 block text-xs text-[var(--danger)]">
          {error}
        </span>
      ) : null}
    </label>
  );
}
