import { StatusBadge } from "@/components/dashboard/shared/status-badge";

export function DataTable({
  columns,
  empty,
  rows,
}: {
  columns?: string[];
  empty?: string;
  rows: Array<Record<string, string>>;
}) {
  const headers = columns ?? Object.keys(rows[0] ?? {});

  return (
    <div className="overflow-hidden rounded-[1.15rem] border border-[var(--glass-border)] bg-[var(--surface)]">
      <div className="grid gap-2 p-3 md:hidden">
        {rows.length ? (
          rows.map((row, index) => (
            <article
              key={index}
              className="rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-3.5"
            >
              <div className="grid gap-2">
                {headers.map((header) => (
                  <div
                    key={header}
                    className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-3 text-[0.9rem]"
                  >
                    <span className="text-[var(--on-surface-dim)]">{header}</span>
                    <span className="min-w-0 break-words text-[var(--on-surface)]">
                      {header.toLowerCase() === "status" ? (
                        <StatusBadge label={row[header] ?? "Pending"} tone={statusTone(row[header])} />
                      ) : (
                        row[header] ?? "-"
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </article>
          ))
        ) : (
          <div className="px-4 py-8 text-center text-[var(--on-surface-dim)]">
            {empty ?? "No records yet."}
          </div>
        )}
      </div>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[42rem] text-left text-[0.96rem]">
          <thead className="border-b border-[var(--glass-border)] text-[0.8rem] uppercase tracking-[0.08em] text-[var(--on-surface-dim)]">
            <tr>
              {headers.map((header) => (
                <th key={header} className="px-4 py-3.5 font-medium">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((row, index) => (
                <tr key={index} className="border-b border-[var(--glass-border)] last:border-b-0">
                  {headers.map((header) => (
                    <td key={header} className="px-4 py-3.5 leading-relaxed text-[var(--on-surface-dim)]">
                      {header.toLowerCase() === "status" ? (
                        <StatusBadge label={row[header] ?? "Pending"} tone={statusTone(row[header])} />
                      ) : (
                        row[header] ?? "-"
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-4 py-8 text-center text-[var(--on-surface-dim)]" colSpan={Math.max(headers.length, 1)}>
                  {empty ?? "No records yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function statusTone(status: string | undefined) {
  const value = status?.toLowerCase();

  if (value === "active" || value === "paid" || value === "approved" || value === "available") {
    return "active";
  }

  if (value === "overdue" || value === "rejected" || value === "disabled") {
    return "overdue";
  }

  return "pending";
}
