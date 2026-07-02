"use client";

import React from "react";
import { IconCircleCheck, IconX, IconArrowRight } from "@tabler/icons-react";
import Link from "next/link";
import { comparisonRows } from "@/content/landing";

export function WhyAndishiSection() {
  return (
    <section
      id="why-andishi"
      className="relative isolate bg-[color-mix(in_srgb,var(--bg-deep)_46%,var(--bg))] px-5 py-24 sm:px-8 lg:px-10 lg:py-32"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='34' height='34' viewBox='0 0 34 34' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M17 11v12M11 17h12' stroke='%23c5b8e8' stroke-width='0.65' stroke-linecap='round' opacity='0.22'/%3E%3C/svg%3E\")",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-px bg-[linear-gradient(to_right,transparent,color-mix(in_srgb,var(--on-surface)_16%,transparent),transparent)]"
      />

      <div className="relative z-[1] mx-auto max-w-[84rem]">
        <div className="mb-14 flex flex-col items-center text-center">
          <p className="label-caps mb-4 flex items-center justify-center gap-3 text-[var(--tertiary)] font-medium">
            <span className="h-px w-7 bg-[var(--tertiary)]" />
            WHY ANDISHI
            <span className="h-px w-7 bg-[var(--tertiary)]" />
          </p>
          <h2 className="title-serif max-w-3xl text-[clamp(2.5rem,5.2vw,4.25rem)] font-normal leading-[0.96] tracking-tight text-[var(--on-surface)]">
            Why teams choose Andishi
          </h2>
          <p className="body-md mt-6 max-w-2xl text-[var(--on-surface-dim)]">
            How we compare against the traditional options when you need to ship a complex digital
            product.
          </p>
        </div>

        {/* Desktop Feature Matrix (md and up) */}
        <div className="hidden md:block relative z-10 max-w-6xl mx-auto mt-16">
          <div className="grid grid-cols-[minmax(200px,1.5fr)_1fr_1fr_1.15fr] gap-x-2">
            {/* Headers */}
            <div className="pb-6 pl-6 flex items-end border-b border-[color-mix(in_srgb,var(--on-surface)_6%,transparent)]">
              <span className="label-caps text-[color-mix(in_srgb,var(--on-surface-dim)_70%,transparent)] tracking-[0.1em]">
                Evaluation Criteria
              </span>
            </div>
            <div className="pb-6 text-center flex items-end justify-center border-b border-[color-mix(in_srgb,var(--on-surface)_6%,transparent)]">
              <span className="label-caps text-[color-mix(in_srgb,var(--on-surface-dim)_70%,transparent)] tracking-[0.1em]">
                Freelancer
              </span>
            </div>
            <div className="pb-6 text-center flex items-end justify-center border-b border-[color-mix(in_srgb,var(--on-surface)_6%,transparent)]">
              <span className="label-caps text-[color-mix(in_srgb,var(--on-surface-dim)_70%,transparent)] tracking-[0.1em]">
                Large Agency
              </span>
            </div>
            <div className="pb-6 pt-4 pl-10 flex flex-col justify-end relative">
              {/* Subtle Glass Highlight Plate Top Cap */}
              <div className="absolute inset-x-0 bottom-0 top-0 rounded-t-[1.5rem] border-x border-t border-[color-mix(in_srgb,var(--on-surface)_8%,transparent)] bg-[color-mix(in_srgb,var(--on-surface)_3%,transparent)] backdrop-blur-md -z-10" />
              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[color-mix(in_srgb,var(--tertiary)_40%,transparent)] to-transparent opacity-40" />
              <span className="label-caps text-[var(--on-surface)] font-medium text-[0.85rem] tracking-[0.1em] mb-1">
                Andishi
              </span>
            </div>

            {/* Rows */}
            {comparisonRows.map((row, index) => {
              const isLast = index === comparisonRows.length - 1;

              return (
                <React.Fragment key={row[0]}>
                  {/* Criteria */}
                  <div
                    className={`py-5 pl-6 flex items-center ${!isLast ? "border-b border-[color-mix(in_srgb,var(--on-surface)_6%,transparent)]" : ""}`}
                  >
                    <span className="font-medium text-[0.98rem] text-[var(--on-surface)]">
                      {row[0]}
                    </span>
                  </div>
                  {/* Freelancer */}
                  <div
                    className={`py-5 px-4 flex items-center justify-center text-center ${!isLast ? "border-b border-[color-mix(in_srgb,var(--on-surface)_6%,transparent)]" : ""}`}
                  >
                    <span className="text-[0.92rem] text-[var(--on-surface-dim)] opacity-70">
                      {row[1] === "No" ? (
                        <IconX size={16} stroke={2} className="text-[var(--outline)]" />
                      ) : (
                        row[1]
                      )}
                    </span>
                  </div>
                  {/* Agency */}
                  <div
                    className={`py-5 px-4 flex items-center justify-center text-center ${!isLast ? "border-b border-[color-mix(in_srgb,var(--on-surface)_6%,transparent)]" : ""}`}
                  >
                    <span className="text-[0.92rem] text-[var(--on-surface-dim)] opacity-70">
                      {row[2] === "No" ? (
                        <IconX size={16} stroke={2} className="text-[var(--outline)]" />
                      ) : (
                        row[2]
                      )}
                    </span>
                  </div>
                  {/* Andishi (Aligned left with Checkmarks) */}
                  <div className="py-5 pl-10 pr-5 relative flex items-center justify-start">
                    <div
                      className={`absolute inset-x-0 inset-y-0 border-x border-[color-mix(in_srgb,var(--on-surface)_8%,transparent)] bg-[color-mix(in_srgb,var(--on-surface)_3%,transparent)] backdrop-blur-md -z-10 ${isLast ? "rounded-b-[1.5rem] border-b pb-2" : "border-b border-[color-mix(in_srgb,var(--on-surface)_6%,transparent)]"}`}
                    />
                    <span className="text-[0.96rem] font-medium text-[var(--on-surface)] flex items-center gap-3">
                      <IconCircleCheck
                        size={18}
                        stroke={2}
                        className="text-[var(--tertiary)] shrink-0"
                      />
                      {row[3]}
                    </span>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Mobile Card Layout (max-md) */}
        <div className="md:hidden mt-12 flex flex-col gap-6">
          {comparisonRows.map((row) => (
            <div
              key={row[0]}
              className="rounded-2xl border border-[var(--glass-border)] bg-[var(--surface-low)] shadow-sm overflow-hidden"
            >
              {/* Card Header: Criteria Name */}
              <div className="bg-[color-mix(in_srgb,var(--on-surface)_3%,transparent)] px-5 py-3.5 border-b border-[color-mix(in_srgb,var(--on-surface)_5%,transparent)]">
                <span className="font-medium text-[0.98rem] text-[var(--on-surface)]">
                  {row[0]}
                </span>
              </div>

              <div className="px-5 py-5 flex flex-col gap-4.5">
                {/* Freelancer Row */}
                <div className="flex items-start justify-between gap-4">
                  <span className="text-[0.7rem] uppercase tracking-[0.1em] font-medium text-[var(--on-surface-dim)] opacity-60 w-1/3">
                    Freelancer
                  </span>
                  <span className="text-[0.9rem] text-[var(--on-surface-dim)] opacity-80 text-right w-2/3">
                    {row[1] === "No" ? (
                      <IconX size={15} stroke={2} className="ml-auto opacity-50" />
                    ) : (
                      row[1]
                    )}
                  </span>
                </div>

                {/* Large Agency Row */}
                <div className="flex items-start justify-between gap-4">
                  <span className="text-[0.7rem] uppercase tracking-[0.1em] font-medium text-[var(--on-surface-dim)] opacity-60 w-1/3">
                    Agency
                  </span>
                  <span className="text-[0.9rem] text-[var(--on-surface-dim)] opacity-80 text-right w-2/3">
                    {row[2] === "No" ? (
                      <IconX size={15} stroke={2} className="ml-auto opacity-50" />
                    ) : (
                      row[2]
                    )}
                  </span>
                </div>

                {/* Andishi Highlight Row */}
                <div className="flex items-start justify-between gap-4 pt-4 border-t border-[color-mix(in_srgb,var(--tertiary)_12%,transparent)]">
                  <span className="text-[0.75rem] uppercase tracking-[0.1em] font-medium text-[var(--on-surface)] w-1/3 mt-0.5">
                    Andishi
                  </span>
                  <span className="text-[0.95rem] font-medium text-[var(--on-surface)] flex flex-wrap justify-end items-center gap-2 text-right w-2/3">
                    <IconCircleCheck
                      size={16}
                      stroke={2}
                      className="text-[var(--tertiary)] shrink-0"
                    />
                    {row[3]}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 flex flex-col items-center text-center gap-6">
          <p className="body-md max-w-xl text-[var(--on-surface-dim)]">
            Ready to experience a different approach to product engineering?
          </p>
          <Link
            href="/start-project"
            className="inline-flex min-h-[2.8rem] items-center justify-center gap-2 rounded-full border border-transparent bg-[var(--on-surface)] px-8 py-3 text-[15px] font-medium text-[var(--bg)] no-underline shadow-lg transition-all duration-300 hover:-translate-y-px hover:shadow-xl"
          >
            Start a Project
            <IconArrowRight size={16} stroke={2} />
          </Link>
        </div>
      </div>
    </section>
  );
}
