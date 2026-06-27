import type { ElementType, HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";

type CardProps<T extends ElementType = "section"> = {
  as?: T;
  inset?: boolean;
  interactive?: boolean;
  children: ReactNode;
  className?: string;
} & Omit<HTMLAttributes<HTMLElement>, "className" | "children">;

export function Card<T extends ElementType = "section">({
  as,
  inset = false,
  interactive = false,
  className,
  children,
  ...props
}: CardProps<T>) {
  const Component = (as ?? "section") as ElementType;

  return (
    <Component
      {...props}
      className={cn(
        "panel rounded-xl p-6",
        inset ? "bg-[var(--panel-soft)]" : "bg-[var(--panel)]",
        interactive ? "transition-colors hover:border-[var(--accent-soft)] hover:bg-[var(--panel-soft)]" : undefined,
        className,
      )}
    >
      {children}
    </Component>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props} className={cn("flex flex-wrap items-start justify-between gap-4", className)}>
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 {...props} className={cn("text-2xl font-medium tracking-[-0.03em] text-[var(--heading)]", className)}>
      {children}
    </h2>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p {...props} className={cn("text-sm leading-6 text-[var(--body)]", className)}>
      {children}
    </p>
  );
}
