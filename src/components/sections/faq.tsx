"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IconChevronDown } from "@tabler/icons-react";
import { faqItems } from "@/content/landing";
import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";

export function FAQSection() {
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className="mx-auto w-full max-w-5xl px-6 py-20 sm:px-8 lg:py-32">
      <div className="mb-8 text-center">
        <p className="label-caps mb-4 text-[var(--primary)]">Common questions</p>
        <h2 className="headline-lg">Questions before every project</h2>
      </div>
      <div className="space-y-3">
        {faqItems.map((item, index) => {
          const active = open === index;
          return (
            <GlassCard
              key={item.q}
              glow={active ? "violet" : "none"}
              className={cn("p-0", active && "border-[color-mix(in_srgb,var(--primary)_24%,transparent)]")}
            >
              <button
                type="button"
                className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--primary)_50%,transparent)] sm:px-6"
                onClick={() => setOpen(active ? -1 : index)}
              >
                <span className={cn("body-md text-[var(--on-surface)]", active && "text-[var(--primary)]")}>
                  {item.q}
                </span>
                <IconChevronDown
                  size={20}
                  stroke={1.5}
                  className={cn("shrink-0 transition-transform duration-300", active && "rotate-180")}
                />
              </button>
              <AnimatePresence initial={false}>
                {active ? (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ type: "spring", damping: 28, stiffness: 180 }}
                    className="overflow-hidden"
                  >
                    <p className="body-md px-5 pb-5 text-[var(--on-surface-dim)] sm:px-6">{item.a}</p>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </GlassCard>
          );
        })}
      </div>
    </section>
  );
}
