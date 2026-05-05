import { Logo } from "@/components/brand/logo";
import { LinkButton } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-6 py-24 text-center">
      <div className="absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[color-mix(in_srgb,var(--primary)_18%,transparent)] blur-[130px]" />
      <div className="relative mx-auto max-w-xl">
        <Logo className="mb-8 justify-center" />
        <p className="label-caps mb-4 text-[var(--secondary)]">404</p>
        <h1 className="headline-lg">This orbit does not exist.</h1>
        <p className="body-lg mt-5 text-[var(--on-surface-dim)]">
          The page may have moved, or the signal was never published.
        </p>
        <div className="mt-8">
          <LinkButton href="/" variant="primary">Return home</LinkButton>
        </div>
      </div>
    </main>
  );
}
