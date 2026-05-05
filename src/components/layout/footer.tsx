import { Logo } from "@/components/brand/logo";

const columns = [
  ["Work", "Case Studies", "Portfolio", "Process"],
  ["Company", "About", "Founder", "Careers"],
  ["Contact", "hello@andishi.dev", "LinkedIn", "Twitter/X"],
];

export function Footer() {
  return (
    <footer className="border-t border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-low)_60%,transparent)] px-6 py-12 backdrop-blur-2xl sm:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.3fr_2fr]">
        <div>
          <Logo className="mb-4" />
          <p className="body-md max-w-sm text-[var(--on-surface-dim)]">
            Building what comes next, from Nairobi.
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-3">
          {columns.map(([title, ...items]) => (
            <div key={title}>
              <p className="label-caps mb-4 text-[var(--primary)]">{title}</p>
              <div className="space-y-3">
                {items.map((item) => (
                  <a key={item} href="#" className="block text-sm text-[var(--on-surface-dim)] transition-all duration-300 hover:text-[var(--on-surface)]">
                    {item}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mx-auto mt-10 flex max-w-7xl flex-col gap-3 border-t border-[var(--glass-border)] pt-6 text-xs text-[var(--outline)] sm:flex-row sm:items-center sm:justify-between">
        <p>(c) 2026 Andishi. Registered in Kenya.</p>
        <p>Last updated: April 29, 2026</p>
      </div>
    </footer>
  );
}
