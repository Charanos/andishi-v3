import { Logo } from "@/components/brand/logo";

export function PageLoader({ label: _label }: { label?: string }) {
  void _label;

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-[var(--bg)]">
      <div className="animate-pulse">
        <Logo showWordmark={false} markClassName="h-12 w-12" />
      </div>
    </div>
  );
}
