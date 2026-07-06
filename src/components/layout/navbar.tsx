"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { IconBrandWhatsapp, IconX, IconMenu2 } from "@tabler/icons-react";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { Logo } from "@/components/brand/logo";
import { siteConfig } from "@/config/site";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";
import { getSessionUserAction } from "@/app/(app)/actions";
import type { AuthUser } from "@/types/auth";

const menuVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: {
    opacity: 1,
    height: "auto",
    transition: {
      duration: 0.35,
      ease: [0.76, 0, 0.24, 1] as const,
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: {
      duration: 0.24,
      ease: "easeInOut" as const,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" as const } },
};

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [bannerOpen, setBannerOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasModalOpen, setHasModalOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const checkModal = () => {
      const modal = document.querySelector(
        '[role="dialog"]:not([aria-label="Command search"]), [aria-modal="true"]:not([aria-label="Command search"])',
      );
      setHasModalOpen(!!modal);
    };
    checkModal();
    const observer = new MutationObserver(checkModal);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getSessionUserAction();
        setCurrentUser(user);

        if (user && user.role === "admin") {
          localStorage.setItem("andishi_admin_sim_logged_in", "true");
          setIsAdmin(true);
          window.dispatchEvent(new Event("admin_sim_changed"));
        } else {
          localStorage.removeItem("andishi_admin_sim_logged_in");
          setIsAdmin(false);
          window.dispatchEvent(new Event("admin_sim_changed"));
        }
      } catch (err) {
        console.error("Failed to fetch session user in Navbar", err);
      }
    };
    fetchUser();

    const checkAdmin = () => {
      setIsAdmin(localStorage.getItem("andishi_admin_sim_logged_in") === "true");
    };
    window.addEventListener("storage", checkAdmin);
    window.addEventListener("admin_sim_changed", checkAdmin);
    return () => {
      window.removeEventListener("storage", checkAdmin);
      window.removeEventListener("admin_sim_changed", checkAdmin);
    };
  }, []);

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
      <div className="fixed left-0 right-0 top-0 z-[60] flex flex-col pointer-events-none">
        {/* Collapsible Location Banner */}
        <AnimatePresence>
          {bannerOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="pointer-events-auto w-full overflow-hidden border-b border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_90%,transparent)] backdrop-blur-xl text-[var(--on-surface-dim)] shadow-[0_4px_24px_color-mix(in_srgb,var(--bg-deep)_12%,transparent)]"
            >
              <div className="relative mx-auto flex max-w-[92rem] items-center justify-center px-5 py-2.5 sm:px-8 lg:px-10">
                <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-mono text-[0.72rem] tracking-tight text-[var(--on-surface-dim)] text-center">
                  <span className="inline-flex items-center gap-1.5 text-[var(--secondary)]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--secondary)] animate-pulse shadow-[0_0_8px_var(--secondary)]" />
                    FIND US:
                  </span>
                  <span>Bypass Business Arcade Ground Floor, Northern Bypass - Ruiru, Kenya</span>
                </div>
                <button
                  onClick={closeBanner}
                  className="absolute right-5 p-1 text-[var(--on-surface-dim)] hover:text-[var(--on-surface)] transition-all duration-300 hover:rotate-90 hover:scale-110 cursor-pointer sm:right-8 lg:right-10"
                  aria-label="Close location banner"
                >
                  <IconX size={15} stroke={2} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <header
          className={cn(
            "pointer-events-auto w-full px-5 transition-all duration-300 sm:px-8 lg:px-10 pt-3 sm:pt-4",
            hasModalOpen
              ? "opacity-0 pointer-events-none -translate-y-4"
              : "opacity-100 translate-y-0",
          )}
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
                    color: isActive(href) ? "var(--on-surface)" : "var(--on-surface-dim)",
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
              {currentUser || isAdmin ? (
                <Link
                  href={
                    currentUser?.role === "admin" || isAdmin
                      ? "/admin"
                      : currentUser?.role === "client"
                        ? "/dashboard"
                        : "/dev"
                  }
                  className="hidden min-h-10 items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--on-surface)_16%,transparent)] bg-[var(--glass-bg)] px-5 py-2.5 text-[0.84rem] font-medium text-[var(--on-surface)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-px hover:bg-[color-mix(in_srgb,var(--on-surface)_8%,transparent)] active:scale-[0.98] sm:inline-flex"
                >
                  {currentUser?.role === "admin" || isAdmin ? "Admin Console" : "Dashboard"}
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="hidden min-h-10 items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--on-surface)_16%,transparent)] bg-[var(--glass-bg)] px-5 py-2.5 text-[0.84rem] font-medium text-[var(--on-surface)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-px hover:bg-[color-mix(in_srgb,var(--on-surface)_8%,transparent)] active:scale-[0.98] sm:inline-flex"
                  >
                    Login
                  </Link>
                  <a
                    href={buildWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
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
                    <IconBrandWhatsapp size={15} stroke={1.8} />
                  </a>
                </>
              )}

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
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={menuVariants}
            className="fixed inset-x-0 top-0 z-40 bg-[color-mix(in_srgb,var(--bg-deep)_97%,transparent)] backdrop-blur-3xl px-6 pb-8 pt-28 border-b border-[var(--glass-border)] shadow-[0_24px_64px_color-mix(in_srgb,var(--bg-deep)_24%,transparent)]"
          >
            <div className="flex flex-col gap-4">
              {siteConfig.nav.map(({ label, href }, idx) => (
                <motion.div key={href} variants={itemVariants}>
                  <Link
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className="group flex items-baseline gap-4 py-2 border-b border-[color-mix(in_srgb,var(--on-surface)_5%,transparent)] transition-all duration-200"
                  >
                    <span className="font-mono text-[0.74rem] text-[var(--on-surface-dim)] opacity-40">
                      0{idx + 1}
                    </span>
                    <span
                      className={cn(
                        "text-[1.68rem] tracking-tight font-normal leading-none transition-colors duration-200 group-hover:text-[var(--primary)]",
                        isActive(href) ? "text-[var(--primary)]" : "text-[var(--on-surface)]",
                      )}
                    >
                      {label}
                    </span>
                    {isActive(href) && (
                      <span className="ml-2 h-1.5 w-1.5 rounded-full bg-[var(--primary)] shrink-0 self-center" />
                    )}
                  </Link>
                </motion.div>
              ))}

              {/* Side-by-Side Sleek Action Buttons */}
              <motion.div variants={itemVariants} className="mt-4 flex items-center gap-3 pt-4">
                {currentUser || isAdmin ? (
                  <Link
                    href={
                      currentUser?.role === "admin" || isAdmin
                        ? "/admin"
                        : currentUser?.role === "client"
                          ? "/dashboard"
                          : "/dev"
                    }
                    onClick={() => setMobileOpen(false)}
                    className="flex h-11 flex-1 items-center justify-center rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-5 text-[0.88rem] font-medium text-[var(--on-surface)] transition-all duration-300 hover:bg-[color-mix(in_srgb,var(--on-surface)_8%,transparent)] active:scale-[0.98]"
                  >
                    {currentUser?.role === "admin" || isAdmin ? "Admin Console" : "Dashboard"}
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setMobileOpen(false)}
                      className="flex h-11 flex-1 items-center justify-center rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-5 text-[0.88rem] font-medium text-[var(--on-surface)] transition-all duration-300 hover:bg-[color-mix(in_srgb,var(--on-surface)_8%,transparent)] active:scale-[0.98]"
                    >
                      Login
                    </Link>
                    <a
                      href={buildWhatsAppUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setMobileOpen(false)}
                      className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full bg-[var(--on-surface)] px-5 text-[0.88rem] font-medium text-[var(--bg)] transition-all duration-300 active:scale-[0.98]"
                    >
                      Start a Project
                      <IconBrandWhatsapp size={15} stroke={1.8} />
                    </a>
                  </>
                )}
              </motion.div>

              {/* Graceful Location Display in Mobile Nav */}
              <motion.div
                variants={itemVariants}
                className="mt-3 flex flex-col gap-1.5 border-t border-[var(--glass-border)] pt-5 font-mono text-[0.62rem] text-[var(--on-surface-dim)] opacity-70 tracking-wider"
              >
                <div className="flex items-center gap-2">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--secondary)] opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--secondary)]" />
                  </span>
                  <span className="text-[var(--secondary)] font-medium uppercase">
                    Studio Location:
                  </span>
                </div>
                <span>Bypass Business Arcade Ground Floor, Northern Bypass - Ruiru, Kenya</span>
                <span className="text-[var(--primary)] font-medium">
                  1°11&apos;37.1&quot;S 36°54&apos;18.9&quot;E
                </span>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
