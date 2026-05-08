import { StatusBadge } from "@/components/dashboard/status-badge";

export function DataTable({
  rows,
}: {
  rows: Array<Record<string, string>>;
}) {
  const headers = Object.keys(rows[0] ?? {});

  return (
    <div className="overflow-hidden rounded-[1.15rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-2xl">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[42rem] text-left text-[0.9rem]">
          <thead className="border-b border-[var(--glass-border)] text-[0.72rem] uppercase tracking-[0.08em] text-[var(--on-surface-dim)]">
            <tr>
              {headers.map((header) => (
                <th key={header} className="px-4 py-3 font-medium">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="border-b border-[var(--glass-border)] last:border-b-0">
                {headers.map((header) => (
                  <td key={header} className="px-4 py-3 text-[var(--on-surface-dim)]">
                    {header.toLowerCase() === "status" ? <StatusBadge label={row[header]} tone={row[header].toLowerCase() as "active"} /> : row[header]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
