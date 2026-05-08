import { Logo } from "@/components/brand/logo";

const columns = [
  ["Talent", "Engineers", "How to Hire", "Skill Coverage"],
  ["Proof", "Case Studies", "Studio", "Founder"],
  ["Contact", "hire@andishi.dev", "LinkedIn", "Twitter/X"],
];

export function Footer() {
  return (
    <footer className="border-t border-[color-mix(in_srgb,var(--on-surface)_12%,transparent)] bg-[color-mix(in_srgb,var(--bg-deep)_94%,transparent)] px-6 py-12 backdrop-blur-2xl sm:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.3fr_2fr]">
        <div>
          <Logo className="mb-4" />
          <p className="body-md max-w-sm text-[var(--on-surface-dim)]">
            African engineering talent for global startups.
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-3">
          {columns.map(([title, ...items]) => (
            <div key={title}>
              <p className="label-caps mb-4 text-[var(--on-surface)]">{title}</p>
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
      <div className="mx-auto mt-10 flex max-w-7xl flex-col gap-3 border-t border-[color-mix(in_srgb,var(--on-surface)_10%,transparent)] pt-6 text-xs text-[color-mix(in_srgb,var(--on-surface-dim)_72%,transparent)] sm:flex-row sm:items-center sm:justify-between">
        <p>(c) 2026 Andishi. Operating across Africa.</p>
        <p>Last updated: May 8, 2026</p>
      </div>
    </footer>
  );
}
