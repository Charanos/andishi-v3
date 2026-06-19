import { IconChevronDown } from "@tabler/icons-react";

export function FaqList({
  items,
}: {
  items: readonly { q: string; a: string; category?: string }[];
}) {
  return (
    <div className="grid gap-3">
      {items.map((item, index) => (
        <details
          key={item.q}
          className="group rounded-[1.1rem] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_34%,transparent)] p-5 backdrop-blur-xl"
          open={index === 0}
        >
          <summary className="flex cursor-pointer list-none items-start justify-between gap-5 text-[1rem] font-medium leading-snug text-[var(--on-surface)]">
            <span>
              {item.category && (
                <span className="label-caps mb-2 block text-[0.62rem] text-[var(--secondary)]">
                  {item.category}
                </span>
              )}
              {item.q}
            </span>
            <IconChevronDown
              size={18}
              stroke={1.7}
              className="mt-1 shrink-0 text-[var(--on-surface-dim)] transition-transform duration-300 group-open:rotate-180"
            />
          </summary>
          <p className="mt-4 text-[0.98rem] leading-relaxed text-[var(--on-surface-dim)]">
            {item.a}
          </p>
        </details>
      ))}
    </div>
  );
}
