import { Logo } from "@/components/brand/logo";

export default function Loading() {
  return (
    <main className="grid min-h-screen place-items-center bg-[var(--bg)] px-6 text-[var(--on-surface)]">
      <div className="text-center">
        <Logo className="justify-center" markClassName="mx-auto" />
        <p className="label-caps mt-6 text-[var(--outline)]">Aligning signal</p>
      </div>
    </main>
  );
}
