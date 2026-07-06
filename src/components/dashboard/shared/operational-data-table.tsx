"use client";

import type { ReactNode } from "react";
import { useState, useMemo } from "react";
import { IconArrowRight, IconArrowUp, IconArrowDown, IconTable, IconDatabaseOff, IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
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
  selectable,
  onSelectionChange,
  pageSize,
  bulkActions,
}: {
  columns: Array<OperationalTableColumn<T>>;
  description?: string;
  empty?: string;
  onRowSelect?: (row: T) => void;
  rows: T[];
  title: string;
  toolbar?: ReactNode;
  selectable?: boolean;
  onSelectionChange?: (selectedIds: string[]) => void;
  pageSize?: number;
  bulkActions?: (selectedIds: string[], clearSelection: () => void) => ReactNode;
}) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);

  const mobileColumns = columns.filter((column) => !column.hideOnMobile);

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => {
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
  }, [rows, sortKey, sortDir, columns]);

  const totalPages = pageSize ? Math.max(1, Math.ceil(sortedRows.length / pageSize)) : 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const currentRows = pageSize 
    ? sortedRows.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize)
    : sortedRows;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const newSelected = new Set(currentRows.map((r) => r.id));
      setSelectedIds(newSelected);
      onSelectionChange?.(Array.from(newSelected));
    } else {
      setSelectedIds(new Set());
      onSelectionChange?.([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
    onSelectionChange?.(Array.from(newSelected));
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
    onSelectionChange?.([]);
  };

  const isAllCurrentSelected = currentRows.length > 0 && currentRows.every(r => selectedIds.has(r.id));
  const isSomeSelected = selectedIds.size > 0 && !isAllCurrentSelected;

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
        
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {selectedIds.size > 0 && bulkActions && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
               {bulkActions(Array.from(selectedIds), clearSelection)}
            </div>
          )}
          {toolbar && <div className="flex items-center gap-2">{toolbar}</div>}
        </div>
      </div>

      {/* Mobile card layout */}
      <div className="grid gap-3 p-3 md:hidden">
        {currentRows.length ? (
          currentRows.map((row) => (
            <article
              key={row.id}
              className="group/card relative overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_16%,transparent)] p-4 transition-all duration-300 hover:border-[color-mix(in_srgb,var(--secondary)_26%,var(--glass-border))] hover:bg-[color-mix(in_srgb,var(--surface-high)_24%,transparent)]"
            >
              <div className="absolute inset-y-0 left-0 w-[3px] rounded-r-full bg-[var(--secondary)] opacity-0 transition-opacity duration-300 group-hover/card:opacity-100" />
              <div className="mb-3 flex items-center justify-between">
                {selectable && (
                   <input 
                     type="checkbox"
                     checked={selectedIds.has(row.id)}
                     onChange={(e) => handleSelectRow(row.id, e.target.checked)}
                     className="h-4 w-4 rounded border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--primary)] focus:ring-[var(--primary)] focus:ring-offset-[var(--surface)] transition-all cursor-pointer"
                   />
                )}
              </div>
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
              {selectable && (
                 <th className="px-5 py-3.5 w-[3.5rem]">
                    <div className="flex items-center justify-center">
                      <input 
                        type="checkbox"
                        checked={isAllCurrentSelected}
                        ref={input => { if (input) input.indeterminate = isSomeSelected }}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="h-4 w-4 rounded border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--primary)] focus:ring-[var(--primary)] focus:ring-offset-[var(--surface)] transition-all cursor-pointer"
                      />
                    </div>
                 </th>
              )}
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={cn(
                    "px-5 py-3.5 text-[0.68rem] uppercase tracking-[0.1em] text-[var(--on-surface-dim)] font-medium select-none",
                    column.align === "right" && "text-right",
                    column.sortable && "cursor-pointer hover:text-[var(--on-surface)] transition-colors duration-200",
                    !selectable && columns.indexOf(column) === 0 && "pl-5"
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
            {currentRows.length ? (
              currentRows.map((row, rowIndex) => {
                const isSelected = selectedIds.has(row.id);
                return (
                <tr
                  key={row.id}
                  className={cn(
                    "group/row relative transition-all duration-200",
                    isSelected
                      ? "bg-[color-mix(in_srgb,var(--primary)_10%,transparent)]"
                      : hoverClasses(rowIndex)
                  )}
                >
                  {selectable && (
                    <td className="relative px-5 py-3.5 w-[3.5rem]">
                       <RowAccentBar isSelected={isSelected} />
                       <div className="flex items-center justify-center">
                         <input
                           type="checkbox"
                           checked={isSelected}
                           onChange={(e) => handleSelectRow(row.id, e.target.checked)}
                           className="h-4 w-4 rounded border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--primary)] focus:ring-[var(--primary)] focus:ring-offset-[var(--surface)] transition-all cursor-pointer"
                         />
                       </div>
                    </td>
                  )}

                  {columns.map((column, colIndex) => (
                    <td
                      key={`${row.id}-${String(column.key)}`}
                      className={cn(
                        "px-5 py-3.5",
                        !selectable && colIndex === 0 && "relative",
                        column.priority
                          ? "text-[var(--on-surface)] font-medium"
                          : "text-[var(--on-surface-dim)]",
                        column.mono && "font-mono text-[0.84rem]",
                        column.align === "right" && "text-right",
                        !selectable && colIndex === 0 && "pl-5",
                      )}
                    >
                      {!selectable && colIndex === 0 && <RowAccentBar isSelected={isSelected} />}
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
              )})
            ) : (
              <tr>
                <td colSpan={columns.length + (onRowSelect ? (selectable ? 2 : 1) : (selectable ? 1 : 0))}>
                  <EmptyTableState empty={empty} />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer with Row count and Pagination */}
      {sortedRows.length > 0 && (
        <div className="border-t border-[color-mix(in_srgb,var(--glass-border)_50%,transparent)] px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <span className="font-mono text-[0.7rem] text-[var(--on-surface-dim)]">
               {sortedRows.length} record{sortedRows.length !== 1 ? "s" : ""}
               {selectedIds.size > 0 && ` (${selectedIds.size} selected)`}
             </span>
             {sortKey && (
               <button
                 type="button"
                 onClick={() => { setSortKey(null); setSortDir("asc"); }}
                 className="font-mono text-[0.68rem] text-[var(--on-surface-dim)] hover:text-[var(--secondary)] transition-colors duration-200 border-l border-[var(--glass-border)] pl-3"
               >
                 Clear sort ×
               </button>
             )}
          </div>
          
          {/* Pagination Controls */}
          {pageSize && totalPages > 1 && (
            <div className="flex items-center gap-4">
               <span className="font-mono text-[0.7rem] text-[var(--on-surface-dim)]">
                 Page {safeCurrentPage} of {totalPages}
               </span>
               <div className="flex items-center gap-1">
                 <button 
                   onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                   disabled={safeCurrentPage === 1}
                   className="grid h-7 w-7 place-items-center rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--on-surface)] transition-colors hover:bg-[color-mix(in_srgb,var(--on-surface)_10%,transparent)] disabled:opacity-30 disabled:cursor-not-allowed"
                 >
                   <IconChevronLeft size={14} />
                 </button>
                 <button 
                   onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                   disabled={safeCurrentPage === totalPages}
                   className="grid h-7 w-7 place-items-center rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--on-surface)] transition-colors hover:bg-[color-mix(in_srgb,var(--on-surface)_10%,transparent)] disabled:opacity-30 disabled:cursor-not-allowed"
                 >
                   <IconChevronRight size={14} />
                 </button>
               </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

/**
 * Lives inside the row's first real cell (not a standalone <td>) - an extra
 * decorative cell with no matching <th> desyncs the header/body column
 * count, which visually shifts every subsequent cell's data left by one
 * header. Absolutely positioned against that cell instead.
 */
function RowAccentBar({ isSelected }: { isSelected: boolean }) {
  return (
    <div
      aria-hidden
      className={cn(
        "absolute inset-y-0 left-0 w-[3px] rounded-r-full bg-[var(--secondary)] transition-opacity duration-200 pointer-events-none",
        isSelected ? "opacity-100" : "opacity-0 group-hover/row:opacity-100"
      )}
    />
  );
}

function hoverClasses(rowIndex: number) {
  return rowIndex % 2 === 0
    ? "bg-transparent hover:bg-[color-mix(in_srgb,var(--secondary)_5%,transparent)]"
    : "bg-[color-mix(in_srgb,var(--surface)_12%,transparent)] hover:bg-[color-mix(in_srgb,var(--secondary)_5%,transparent)]";
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
