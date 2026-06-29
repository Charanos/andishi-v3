"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconBrandWhatsapp, IconX } from "@tabler/icons-react";
import { floatSpring } from "@/lib/motion";

export function FloatingWhatsappButton() {
  const [open, setOpen] = useState(false);

  const whatsappUrl = "https://wa.me/25474882157?text=Hi%20Andishi%20team,%20I%27d%20like%20to%20discuss%20a%20project%20or%20ask%20a%20question...";

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* WhatsApp Dialog Popover */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            transition={floatSpring}
            className="mb-4 w-[20rem] sm:w-[22rem] overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] p-5 shadow-[0_20px_50px_color-mix(in_srgb,var(--bg-deep)_28%,transparent)] backdrop-blur-2xl"
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#25D366] text-white shadow-[0_4px_12px_rgba(37,211,102,0.25)]">
                  <IconBrandWhatsapp size={22} stroke={1.8} />
                  <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                  </span>
                </div>
                <div>
                  <h4 className="font-sans text-[0.94rem] font-medium tracking-tight text-[var(--on-surface)]">
                    Andishi Studio
                  </h4>
                  <p className="font-mono text-[0.68rem] uppercase tracking-wider text-[var(--secondary)]">
                    Typically responds within 4h
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="grid h-7 w-7 place-items-center rounded-full border border-[var(--glass-border)] text-[var(--on-surface-dim)] hover:text-[var(--on-surface)] transition-colors duration-200 cursor-pointer"
                aria-label="Close chat dialog"
              >
                <IconX size={13} stroke={2} />
              </button>
            </div>

            {/* Body message */}
            <p className="mt-4 font-sans text-[0.84rem] leading-relaxed text-[var(--on-surface-dim)]">
              Hi! Have a general inquiry or want to build a digital product with Andishi Studio? Let&apos;s chat on WhatsApp.
            </p>

            {/* CTA Button */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 text-[0.88rem] font-medium text-white shadow-[0_12px_28px_rgba(37,211,102,0.25)] transition-all duration-300 hover:-translate-y-px hover:shadow-[0_16px_36px_rgba(37,211,102,0.35)] cursor-pointer"
            >
              <IconBrandWhatsapp size={17} stroke={1.8} />
              Start Chat on WhatsApp
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trigger Button */}
      <motion.button
        type="button"
        aria-label="Open WhatsApp Chat"
        onClick={() => setOpen((prev) => !prev)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative flex h-13 w-13 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_12px_32px_rgba(37,211,102,0.36)] transition-all duration-300 hover:shadow-[0_16px_40px_rgba(37,211,102,0.48)] cursor-pointer border border-[#25D366]/20"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div
              key="close-icon"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <IconX size={22} stroke={1.8} />
            </motion.div>
          ) : (
            <motion.div
              key="chat-icon"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative flex items-center justify-center"
            >
              <IconBrandWhatsapp size={26} stroke={1.8} />
              {/* Subtle outer pulsing ring */}
              <span className="absolute -inset-2 -z-10 rounded-full border border-[#25D366]/40 animate-pulse" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
