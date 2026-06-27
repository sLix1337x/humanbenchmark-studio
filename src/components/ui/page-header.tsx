import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("mb-8 flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border-strong)] pb-6", className)}>
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--body-subtle)]">
            {eyebrow}
          </p>
        ) : null}
        <h1
          className={cn(
            "font-medium tracking-[-0.04em] text-[var(--heading)]",
            eyebrow ? "mt-2 text-4xl sm:text-5xl" : "text-4xl sm:text-5xl",
          )}
        >
          {title}
        </h1>
        {description ? <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--body)]">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </header>
  );
}
