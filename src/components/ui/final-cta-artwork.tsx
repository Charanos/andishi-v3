import { cn } from "@/lib/utils";

type FinalCtaArtworkProps = {
  className?: string;
  imageClassName?: string;
  veilClassName?: string;
};

export function FinalCtaArtwork({
  className,
  imageClassName,
  veilClassName,
}: FinalCtaArtworkProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 z-0 overflow-hidden",
        className,
      )}
    >
      <img
        src="/final-cta.svg"
        alt=""
        loading="lazy"
        decoding="async"
        className={cn(
          "absolute left-1/2 top-1/2 h-auto w-[min(980px,138%)] max-w-none -translate-x-1/2 -translate-y-1/2 object-contain opacity-[0.2] dark:opacity-[0.28]",
          imageClassName,
        )}
        style={{
          maskImage:
            "linear-gradient(to right, transparent 0%, black 16%, black 84%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 16%, black 84%, transparent 100%)",
        }}
      />
      <div
        className={cn(
          "absolute inset-0 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--surface)_62%,transparent)_0%,color-mix(in_srgb,var(--bg)_78%,transparent)_100%)]",
          veilClassName,
        )}
      />
    </div>
  );
}
