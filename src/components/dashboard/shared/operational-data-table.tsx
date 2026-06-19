"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { IconArrowRight, IconArrowUp, IconArrowDown, IconTable, IconDatabaseOff } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export type OperationalTableColumn<T> = {
  key: keyof T | string;
  label: string;
  align?: "left" | "right";
  hideOnMobile?: boolean;
  mono?: boolean;
  priority?: boolean;
  sortable?: boolean;
  render?: (row: T) => ReactNode;
};

export function OperationalDataTable<T extends { id: string }>({
  columns,
  description,
  empty = "No records available.",
  onRowSelect,
  rows,
  title,
  toolbar,
}: {
  columns: Array<OperationalTableColumn<T>>;
  description?: string;
  empty?: string;
  onRowSelect?: (row: T) => void;
  rows: T[];
  title: string;
  toolbar?: ReactNode;
}) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const mobileColumns = columns.filter((column) => !column.hideOnMobile);

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sortedRows = [...rows].sort((a, b) => {
    if (!sortKey) return 0;
    const col = columns.find((c) => String(c.key) === sortKey);
    if (!col || col.render) return 0;
    const aVal = a[col.key as keyof T];
    const bVal = b[col.key as keyof T];
    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortDir === "asc" ? aVal - bVal : bVal - aVal;
    }
    if (typeof aVal === "string" && typeof bVal === "string") {
      return sortDir === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }
    return 0;
  });

  return (
    <section className="group/table min-w-0 overflow-hidden rounded-[1.35rem] border border-[var(--glass-border)] bg-gradient-to-br from-[color-mix(in_srgb,var(--surface-high)_30%,transparent)] to-[color-mix(in_srgb,var(--surface-high)_6%,transparent)] shadow-[0_18px_48px_color-mix(in_srgb,var(--bg-deep)_6%,transparent),inset_0_1px_0_color-mix(in_srgb,white_10%,transparent)] backdrop-blur-2xl">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_40%,transparent)] px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[color-mix(in_srgb,var(--secondary)_24%,transparent)] bg-[color-mix(in_srgb,var(--secondary)_10%,transparent)] text-[var(--secondary)] shadow-[inset_0_1px_0_color-mix(in_srgb,white_10%,transparent)]">
              <IconTable size={18} stroke={1.6} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[1.02rem] font-medium text-[var(--on-surface)]">
                {title}
              </p>
              {description && (
                <p className="mt-0.5 max-w-2xl truncate text-[0.8rem] text-[var(--on-surface-dim)]">
                  {description}
                </p>
              )}
            </div>
          </div>
        </div>
        {toolbar && (
          <div className="flex shrink-0 flex-wrap items-center gap-2">{toolbar}</div>
        )}
      </div>

      {/* Mobile card layout */}
      <div className="grid gap-3 p-3 md:hidden">
        {sortedRows.length ? (
          sortedRows.map((row) => (
            <article
              key={row.id}
              className="group/card relative overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_16%,transparent)] p-4 transition-all duration-300 hover:border-[color-mix(in_srgb,var(--secondary)_26%,var(--glass-border))] hover:bg-[color-mix(in_srgb,var(--surface-high)_24%,transparent)]"
            >
              <div className="absolute inset-y-0 left-0 w-[3px] rounded-r-full bg-[var(--secondary)] opacity-0 transition-opacity duration-300 group-hover/card:opacity-100" />
              <div className="grid gap-3">
                {mobileColumns.map((column) => (
                  <div
                    key={`${row.id}-${String(column.key)}`}
                    className="grid grid-cols-[6.75rem_minmax(0,1fr)] gap-3 text-[0.86rem]"
                  >
                    <span className="text-[var(--on-surface-dim)] font-medium">{column.label}</span>
                    <span
                      className={cn(
                        "min-w-0 break-words text-[var(--on-surface)]",
                        column.mono && "font-mono text-[0.82rem]",
                      )}
                    >
                      {renderCell(row, column)}
                    </span>
                  </div>
                ))}
              </div>
              {onRowSelect && (
                <button
                  type="button"
                  onClick={() => onRowSelect(row)}
                  className="mt-4 inline-flex min-h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[0.86rem] font-medium text-[var(--on-surface)] transition-colors duration-200 hover:bg-[color-mix(in_srgb,var(--secondary)_8%,transparent)] hover:text-[var(--secondary)] hover:border-[color-mix(in_srgb,var(--secondary)_30%,var(--glass-border))]"
                >
                  Inspect record
                  <IconArrowRight size={16} stroke={1.6} />
                </button>
              )}
            </article>
          ))
        ) : (
          <EmptyTableState empty={empty} />
        )}
      </div>

      {/* Desktop table layout */}
      <div className="hidden overflow-x-auto md:block pb-1">
        <table className="w-full min-w-[54rem] text-left text-[0.88rem]">
          <thead className="sticky top-0 z-10 border-b border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_90%,transparent)] backdrop-blur-xl">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={cn(
                    "px-5 py-3.5 text-[0.68rem] uppercase tracking-[0.1em] text-[var(--on-surface-dim)] font-medium select-none",
                    column.align === "right" && "text-right",
                    column.sortable && "cursor-pointer hover:text-[var(--on-surface)] transition-colors duration-200",
                  )}
                  onClick={column.sortable ? () => toggleSort(String(column.key)) : undefined}
                >
                  <span className="inline-flex items-center gap-1.5">
                    {column.label}
                    {column.sortable && (
                      <span className="opacity-40">
                        {sortKey === String(column.key) ? (
                          sortDir === "asc" ? (
                            <IconArrowUp size={11} stroke={2} />
                          ) : (
                            <IconArrowDown size={11} stroke={2} />
                          )
                        ) : (
                          <IconArrowUp size={11} stroke={1.5} className="opacity-40" />
                        )}
                      </span>
                    )}
                  </span>
                </th>
              ))}
              {onRowSelect && (
                <th className="px-5 py-3.5 text-right text-[0.68rem] uppercase tracking-[0.1em] text-[var(--on-surface-dim)] font-medium">
                  Action
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-[color-mix(in_srgb,var(--glass-border)_50%,transparent)]">
            {sortedRows.length ? (
              sortedRows.map((row, rowIndex) => (
                <tr
                  key={row.id}
                  className={cn(
                    "group/row relative transition-all duration-200",
                    "hover:bg-[color-mix(in_srgb,var(--secondary)_5%,transparent)]",
                    rowIndex % 2 === 0
                      ? "bg-transparent"
                      : "bg-[color-mix(in_srgb,var(--surface)_12%,transparent)]",
                  )}
                >
                  {/* Left accent bar on hover */}
                  <td
                    className="relative p-0"
                    style={{ width: 0, padding: 0, border: "none" }}
                    aria-hidden
                  >
                    <div className="absolute inset-y-0 left-0 w-[3px] rounded-r-full bg-[var(--secondary)] opacity-0 transition-opacity duration-200 group-hover/row:opacity-100 pointer-events-none" />
                  </td>

                  {columns.map((column, colIndex) => (
                    <td
                      key={`${row.id}-${String(column.key)}`}
                      className={cn(
                        "px-5 py-3.5",
                        column.priority
                          ? "text-[var(--on-surface)] font-medium"
                          : "text-[var(--on-surface-dim)]",
                        column.mono && "font-mono text-[0.84rem]",
                        column.align === "right" && "text-right",
                        colIndex === 0 && "pl-5",
                      )}
                    >
                      {renderCell(row, column)}
                    </td>
                  ))}
                  {onRowSelect && (
                    <td className="px-5 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => onRowSelect(row)}
                        className="inline-flex min-h-9 cursor-pointer items-center justify-center gap-1.5 rounded-full border border-[var(--glass-border)] px-3.5 text-[0.78rem] font-medium text-[var(--on-surface-dim)] transition-all duration-200 hover:border-[color-mix(in_srgb,var(--secondary)_35%,var(--glass-border))] hover:bg-[color-mix(in_srgb,var(--secondary)_8%,transparent)] hover:text-[var(--secondary)]"
                      >
                        View
                        <IconArrowRight size={13} stroke={1.7} />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + (onRowSelect ? 2 : 1)}>
                  <EmptyTableState empty={empty} />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Row count footer */}
      {sortedRows.length > 0 && (
        <div className="border-t border-[color-mix(in_srgb,var(--glass-border)_50%,transparent)] px-5 py-2.5 flex items-center justify-between">
          <span className="font-mono text-[0.7rem] text-[var(--on-surface-dim)]">
            {sortedRows.length} record{sortedRows.length !== 1 ? "s" : ""}
          </span>
          {sortKey && (
            <button
              type="button"
              onClick={() => { setSortKey(null); setSortDir("asc"); }}
              className="font-mono text-[0.68rem] text-[var(--on-surface-dim)] hover:text-[var(--secondary)] transition-colors duration-200"
            >
              Clear sort ×
            </button>
          )}
        </div>
      )}
    </section>
  );
}

function renderCell<T>(row: T, column: OperationalTableColumn<T>) {
  if (column.render) return column.render(row);
  const value = row[column.key as keyof T];
  if (Array.isArray(value)) return value.join(", ");
  if (value === null || value === undefined || value === "") return (
    <span className="text-[var(--on-surface-dim)] opacity-40">-</span>
  );
  return String(value);
}

function EmptyTableState({ empty }: { empty: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-14 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_30%,transparent)] text-[var(--on-surface-dim)] mb-4">
        <IconDatabaseOff size={24} stroke={1.4} />
      </span>
      <p className="text-[0.95rem] font-medium text-[var(--on-surface)]">Nothing to show yet</p>
      <p className="mt-2 max-w-sm text-[0.84rem] leading-relaxed text-[var(--on-surface-dim)]">{empty}</p>
    </div>
  );
}
