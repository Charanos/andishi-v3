"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { IconArrowRight, IconX, IconMenu2 } from "@tabler/icons-react";
import { Logo } from "@/components/brand/logo";
import { siteConfig } from "@/config/site";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [bannerOpen, setBannerOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll(); // set initial state
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const isClosed = localStorage.getItem("andishi_address_banner_closed");
    if (!isClosed) {
      const timer = setTimeout(() => setBannerOpen(true), 0);
      return () => clearTimeout(timer);
    }
  }, []);

  const closeBanner = () => {
    localStorage.setItem("andishi_address_banner_closed", "true");
    setBannerOpen(false);
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href.replace("/#", "/"));
  };

  return (
    <>
      {/* Collapsible Location Banner */}
      <AnimatePresence>
        {bannerOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed left-0 right-0 top-0 z-[60] overflow-hidden border-b border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--bg-deep)_85%,transparent)] backdrop-blur-md text-[var(--on-surface-dim)]"
          >
            <div className="relative mx-auto flex max-w-[92rem] items-center justify-center px-5 py-2.5 sm:px-8 lg:px-10">
              <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[0.74rem] tracking-wider uppercase font-mono text-center">
                <span className="inline-flex items-center gap-1.5 text-[var(--secondary)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--secondary)] animate-pulse" />
                  Find Us:
                </span>
                <span>Bypass Business Arcade Ground Floor, Northern Bypass - Ruiru, Kenya</span>
                <span className="opacity-45 max-sm:hidden">|</span>
                <span className="text-[var(--primary)] font-medium">1°11&apos;37.1&quot;S 36°54&apos;18.9&quot;E</span>
              </div>
              <button
                onClick={closeBanner}
                className="absolute right-5 p-1 text-[var(--on-surface-dim)] hover:text-[var(--on-surface)] transition-colors duration-200 cursor-pointer sm:right-8 lg:right-10"
                aria-label="Close location banner"
              >
                <IconX size={14} stroke={2} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header
        className={`fixed left-0 right-0 z-50 px-5 transition-all duration-300 sm:px-8 lg:px-10 ${
          bannerOpen ? "top-10 sm:top-11 pt-2" : "top-0 pt-4"
        }`}
      >
        <motion.nav
          className="mx-auto flex h-16 w-full max-w-[92rem] items-center justify-between rounded-2xl px-3 lg:px-4"
          animate={{
            backdropFilter: scrolled ? "blur(28px)" : "blur(0px)",
          }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          style={{
            backgroundColor: scrolled
              ? "color-mix(in srgb, var(--bg-deep) 90%, transparent)"
              : "transparent",
            border: scrolled
              ? "1px solid color-mix(in srgb, var(--on-surface) 12%, transparent)"
              : "1px solid transparent",
            boxShadow: scrolled
              ? "0 16px 48px color-mix(in srgb, var(--bg-deep) 62%, transparent), 0 1px 0 color-mix(in srgb, var(--on-surface) 7%, transparent) inset"
              : "none",
            transition:
              "background-color 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease",
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg focus-visible:outline-none"
          >
            <Logo />
          </Link>

          {/* Desktop nav links */}
          <div className="hidden items-center gap-0.5 md:flex">
            {siteConfig.nav.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="relative px-3.5 py-2 label-caps rounded-lg transition-colors duration-200"
                style={{
                  color: isActive(href)
                    ? "var(--on-surface)"
                    : "var(--on-surface-dim)",
                }}
              >
                {isActive(href) && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-lg"
                    style={{
                      backgroundColor: scrolled
                        ? "color-mix(in srgb, var(--on-surface) 10%, transparent)"
                        : "rgba(255,255,255,0.08)",
                    }}
                    transition={{ type: "spring", damping: 28, stiffness: 280 }}
                  />
                )}
                <span className="relative">{label}</span>
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/start-project"
              className="hidden min-h-10 items-center gap-2 rounded-full px-5 py-2.5
                         text-[0.84rem] font-medium text-white transition-all duration-300
                         hover:-translate-y-px active:scale-[0.98] sm:inline-flex"
              style={{
                background: "var(--on-surface)",
                boxShadow: scrolled
                  ? "0 16px 36px color-mix(in srgb, var(--bg-deep) 42%, transparent)"
                  : "0 10px 24px color-mix(in srgb, var(--bg-deep) 28%, transparent)",
                color: "var(--bg)",
              }}
            >
              Start a Project
              <IconArrowRight size={14} stroke={2.2} />
            </Link>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
              className="flex md:hidden items-center justify-center h-9 w-9 rounded-xl border
                         transition-colors duration-200"
              style={{
                backgroundColor: scrolled
                  ? "color-mix(in srgb, var(--bg-deep) 72%, transparent)"
                  : "rgba(255,255,255,0.06)",
                borderColor: scrolled
                  ? "color-mix(in srgb, var(--on-surface) 14%, transparent)"
                  : "rgba(255,255,255,0.10)",
                color: "var(--on-surface)",
              }}
            >
              {mobileOpen ? (
                <IconX size={18} stroke={1.8} />
              ) : (
                <IconMenu2 size={18} stroke={1.8} />
              )}
            </button>
          </div>
        </motion.nav>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed left-4 right-4 top-24 z-40 rounded-2xl p-5 shadow-2xl"
            style={{
              backgroundColor:
                "color-mix(in srgb, var(--bg-deep) 94%, transparent)",
              border:
                "1px solid color-mix(in srgb, var(--on-surface) 12%, transparent)",
              backdropFilter: "blur(32px)",
            }}
          >
            <div className="flex flex-col gap-1">
              {siteConfig.nav.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between px-4 py-3 rounded-xl label-caps transition-all duration-200"
                  style={{
                    color: isActive(href)
                      ? "var(--on-surface)"
                      : "var(--on-surface-dim)",
                    backgroundColor: isActive(href)
                      ? "color-mix(in srgb, var(--on-surface) 10%, transparent)"
                      : "transparent",
                  }}
                >
                  {label}
                  {isActive(href) && (
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--on-surface)]" />
                  )}
                </Link>
              ))}

              <div
                className="mt-3 pt-3"
                style={{ borderTop: "1px solid var(--glass-border)" }}
              >
                <Link
                  href="/start-project"
                  onClick={() => setMobileOpen(false)}
                  className="flex min-h-[3.4rem] w-full items-center justify-center gap-2 rounded-xl px-5 py-4
                             text-[0.98rem] font-medium transition-all duration-200 hover:-translate-y-px"
                  style={{
                    background: "var(--on-surface)",
                    color: "var(--bg)",
                  }}
                >
                  Start a Project
                  <IconArrowRight size={18} stroke={2} />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
