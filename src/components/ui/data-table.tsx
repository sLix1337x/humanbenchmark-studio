import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export type DataTableColumn<T> = {
  key: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  className?: string;
  headerClassName?: string;
};

type DataTableProps<T> = {
  caption?: string;
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T, index: number) => string;
  emptyMessage: string;
  loading?: boolean;
  loadingRows?: number;
};

export function DataTable<T>({
  caption,
  columns,
  rows,
  rowKey,
  emptyMessage,
  loading = false,
  loadingRows = 3,
}: DataTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--panel)]">
      <table className="w-full border-collapse text-left text-sm">
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <thead className="bg-[var(--panel-soft)] text-[var(--body-subtle)]">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn("px-4 py-3 font-medium", column.headerClassName)}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: loadingRows }, (_, index) => (
                <tr key={`loading-${index}`} className="border-t border-[var(--border)] text-[var(--foreground)]">
                  {columns.map((column) => (
                    <td key={column.key} className={cn("px-4 py-3", column.className)}>
                      <div className="h-4 w-20 animate-pulse rounded bg-[var(--panel-strong)]" aria-hidden="true" />
                    </td>
                  ))}
                </tr>
              ))
            : null}
          {!loading && rows.length === 0 ? (
            <tr className="border-t border-[var(--border)] text-[var(--body)]">
              <td colSpan={columns.length} className="px-4 py-6 text-center">
                {emptyMessage}
              </td>
            </tr>
          ) : null}
          {!loading
            ? rows.map((row, index) => (
                <tr key={rowKey(row, index)} className="border-t border-[var(--border)] text-[var(--foreground)]">
                  {columns.map((column) => (
                    <td key={column.key} className={cn("px-4 py-3", column.className)}>
                      {column.cell(row)}
                    </td>
                  ))}
                </tr>
              ))
            : null}
        </tbody>
      </table>
    </div>
  );
}
