"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { IconArrowLeft } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export function BackButton() {
  const pathname = usePathname();
  const router = useRouter();

  // Check if WhatsApp button is present on current page to stack cleanly above it
  const hasWhatsapp = pathname !== "/contact";

  // Calculate target back URL deterministically
  const getBackTarget = (): string => {
    if (typeof window !== "undefined" && typeof document !== "undefined" && document.referrer) {
      try {
        const refUrl = new URL(document.referrer);
        if (refUrl.origin === window.location.origin && refUrl.pathname !== pathname) {
          return refUrl.pathname + refUrl.search;
        }
      } catch {
        // ignore invalid URL
      }
    }

    const segments = pathname.split("/").filter(Boolean);
    if (segments.length > 1) {
      // Sub-page (e.g. /blog/some-article -> /blog)
      return "/" + segments.slice(0, segments.length - 1).join("/");
    }

    // Top-level section page (e.g. /blog, /work, /about, /careers) -> / (Home)
    return "/";
  };

  const targetUrl = getBackTarget();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(targetUrl);
  };

  const labelText = targetUrl === "/" ? "Home" : targetUrl.replace("/", "");

  return (
    <div
      className={cn(
        "fixed right-6 z-50 flex flex-col items-end transition-all duration-300",
        hasWhatsapp ? "bottom-28" : "bottom-12",
      )}
    >
      <Link href={targetUrl} onClick={handleClick} aria-label={`Back to ${labelText}`}>
        <motion.button
          type="button"
          aria-label={`Back to ${labelText}`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="group relative flex h-13 w-13 items-center justify-center rounded-full bg-[#0284C7] text-white shadow-[0_12px_32px_rgba(2,132,199,0.36)] transition-all duration-300 hover:shadow-[0_16px_40px_rgba(2,132,199,0.48)] cursor-pointer border border-[#0284C7]/20"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative flex items-center justify-center"
          >
            <IconArrowLeft size={26} stroke={1.8} />
            {/* Subtle outer pulsing ring matching WhatsApp button */}
            <span className="absolute -inset-2 -z-10 rounded-full border border-[#0284C7]/40 animate-pulse" />
          </motion.div>

          {/* Hover Tooltip Label */}
          <span className="absolute right-15 top-1/2 -translate-y-1/2 pointer-events-none opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 whitespace-nowrap rounded-lg border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_90%,transparent)] px-2.5 py-1 text-[0.75rem] font-medium text-[var(--on-surface)] shadow-lg backdrop-blur-md">
            Back to {labelText}
          </span>
        </motion.button>
      </Link>
    </div>
  );
}
