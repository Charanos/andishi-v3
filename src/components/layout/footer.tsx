"use client";

import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { useEffect, useState } from "react";

const columns = [
  {
    title: "Services",
    items: [
      ["Web Apps", "/services/custom-software"],
      ["SaaS Products", "/services/saas-development"],
      ["Mobile Apps", "/services/mobile-apps"],
      ["AI Systems", "/services/ai-systems"],
      ["Enterprise Tools", "/services/enterprise-software"],
    ],
  },
  {
    title: "Capabilities",
    items: [
      ["Full-stack Web", "/skills/fullstack"],
      ["AI Engineers", "/skills/ai"],
      ["Web3 / Blockchain", "/skills/web3"],
      ["Cloud / AWS", "/skills/aws"],
    ],
  },
  {
    title: "Proof",
    items: [
      ["Case Studies", "/work"],
      ["Studio", "/studio"],
      ["Blog", "/blog"],
      ["About Us", "/about"],
    ],
  },
  {
    title: "Engagement",
    items: [
      ["Start a Project", "/start-project"],
      ["Hire an Engineer", "/hire"],
      ["Hiring FAQ", "/hire/faq"],
    ],
  },
  {
    title: "Contact",
    items: [
      ["hire@andishi.dev", "mailto:hire@andishi.dev"],
      ["Privacy Policy", "/legal/privacy"],
      ["Terms of Service", "/legal/terms"],
    ],
  },
];

function Clock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: "Africa/Nairobi",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      setTime(formatter.format(new Date()) + " EAT");
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2.5 rounded-full border border-[color-mix(in_srgb,var(--on-surface)_10%,transparent)] bg-[color-mix(in_srgb,var(--on-surface)_20%,transparent)] px-4 py-2 backdrop-blur-md transition-colors hover:bg-[color-mix(in_srgb,var(--on-surface)_5%,transparent)]">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
      </span>
      <span className="font-mono text-[0.75rem] font-medium tracking-tight text-[var(--on-surface)]">
        NBI {time || "..."}
      </span>
    </div>
  );
}

export function Footer() {
  return (
    <footer
      className="relative z-0 w-full overflow-hidden bg-[var(--footer-bg)] border-t border-[color-mix(in_srgb,var(--on-surface)_8%,transparent)] pt-20 sm:pt-32 pb-16 flex flex-col"
    >
      {/* Background Artwork - Massive subtle "Andishi" text */}
      <div className="absolute inset-x-0 bottom-0 flex justify-center items-end select-none pointer-events-none z-0 overflow-hidden h-[30vh] sm:h-[40vh] translate-y-[20%]">
        <h1 className="title-serif text-[24vw] leading-[0.7] tracking-[-0.04em] text-[color-mix(in_srgb,var(--on-surface)_3.5%,transparent)]">
          Andishi
        </h1>
      </div>

      {/* General Footer Content */}
      <div className="relative z-10 mx-auto max-w-[92rem] px-5 sm:px-8 lg:px-10 w-full">

        {/* Top Section: Studio Philosophy & Status Board */}
        <div className="flex flex-col gap-10 border-b border-[color-mix(in_srgb,var(--on-surface)_8%,transparent)] pb-16 lg:flex-row lg:items-end lg:justify-between lg:pb-20">
          <div className="max-w-2xl">
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-[var(--on-surface-dim)] mb-4 opacity-80">
              Studio Philosophy
            </p>
            <h2 className="title-serif text-[clamp(2rem,4vw,3.2rem)] font-normal leading-[1.1] tracking-tight text-[var(--on-surface)]">
              Engineering high-fidelity software products with senior discipline.
            </h2>
          </div>
          <div className="flex flex-col gap-6 lg:items-end">
            <div className="flex flex-col items-start gap-4 lg:items-end">
              <Clock />

              <div className="font-mono text-[0.65rem] text-[var(--on-surface-dim)] tracking-wider text-left lg:text-right opacity-70 leading-[1.6]">
                <p>LOCATION: NAIROBI, KENYA</p>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Section: Architectural Grid */}
        <div className="grid gap-x-8 gap-y-12 py-16 lg:grid-cols-6 lg:py-20">
          {/* Brand Column */}
          <div className="lg:col-span-2 flex flex-col justify-between">
            <div>
              <Logo className="mb-6 scale-110 origin-left" />
              <p className="body-md max-w-sm text-[0.95rem] leading-[1.8] text-[var(--on-surface-dim)]">
                Operating globally from Nairobi, Kenya. We design, engineer, and scale software products that demand precision.
              </p>
            </div>
          </div>

          {/* Links Columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-4 lg:grid-cols-5 lg:gap-6">
            {columns.map((column) => (
              <div key={column.title} className="flex flex-col">
                <p className="font-mono text-[0.7rem] font-medium uppercase tracking-[0.1em] text-[var(--on-surface)] mb-6 opacity-80">
                  {column.title}
                </p>
                <ul className="flex flex-col gap-3.5">
                  {column.items.map(([item, href]) => (
                    <li key={item}>
                      {href.startsWith("mailto:") ? (
                        <a
                          href={href}
                          className="group relative inline-flex items-center text-[0.85rem] text-[var(--on-surface-dim)] transition-colors hover:text-[var(--on-surface)]"
                        >
                          <span className="relative z-10">{item}</span>
                          <span className="absolute -bottom-0.5 left-0 h-[1px] w-0 bg-[var(--on-surface)] transition-all duration-300 group-hover:w-full" />
                        </a>
                      ) : (
                        <Link
                          href={href}
                          className="group relative inline-flex items-center text-[0.85rem] text-[var(--on-surface-dim)] transition-colors hover:text-[var(--on-surface)]"
                        >
                          <span className="relative z-10">{item}</span>
                          <span className="absolute -bottom-0.5 left-0 h-[1px] w-0 bg-[var(--on-surface)] transition-all duration-300 group-hover:w-full" />
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Section: Copyright & Info */}
        <div className="mt-8 border-t border-[color-mix(in_srgb,var(--on-surface)_8%,transparent)] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[0.75rem] uppercase tracking-wider text-[color-mix(in_srgb,var(--on-surface-dim)_40%,transparent)]">
          <p>&copy; {new Date().getFullYear()} Andishi. All Rights Reserved.</p>
          <p className="font-mono text-[0.7rem] opacity-80">Designed & Engineered in Nairobi</p>
        </div>
      </div>
    </footer>
  );
}
