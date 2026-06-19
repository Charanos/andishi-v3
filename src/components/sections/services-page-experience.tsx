"use client";

import type { ComponentType } from "react";
import { motion } from "framer-motion";
import * as Icons from "@tabler/icons-react";
import { ServiceCard } from "@/components/marketing/service-card";
import { services } from "@/data/services";
import { fadeUp, stagger } from "@/lib/motion";
import { FinalCtaArtwork } from "@/components/ui/final-cta-artwork";
import { LinkButton } from "@/components/ui/button";

const textureStyle = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg width='34' height='34' viewBox='0 0 34 34' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M17 11v12M11 17h12' stroke='%23c5b8e8' stroke-width='0.65' stroke-linecap='round' opacity='0.22'/%3E%3C/svg%3E\")",
};

export function ServicesPageExperience() {
  return (
    <main className="relative isolate overflow-visible bg-[var(--bg)] px-5 sm:px-8 lg:px-10 pb-24 pt-32 lg:pt-36">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.08]"
        style={textureStyle}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--surface-high)_8%,transparent),transparent_22rem)]"
      />

      <div className="relative z-[1] mx-auto w-full max-w-[92rem]">
        {/* Header */}
        <header className="mb-16 border-b border-[var(--glass-border)] pb-8 lg:flex lg:items-end lg:justify-between lg:gap-12">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="max-w-3xl"
          >
            <motion.p variants={fadeUp} className="label-caps mb-5 flex items-center gap-3 text-[var(--secondary)]">
              <span className="h-px w-7 bg-[var(--secondary)]" />
              OUR CAPABILITIES
            </motion.p>
            <motion.h1 variants={fadeUp} className="title-serif m-0 text-[clamp(3.15rem,7.4vw,5.25rem)] font-normal leading-[0.94] tracking-tight text-[var(--on-surface)]">
              Eight service lines. One standard.
            </motion.h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 180, delay: 0.1 }}
            className="mt-6 max-w-md lg:mt-0 lg:text-right"
          >
            <p className="body-md text-[var(--on-surface-dim)]">
              We design, build, and ship complete software products. From greenfield SaaS architectures and custom business tools to production-ready AI pipelines.
            </p>
          </motion.div>
        </header>

        {/* Services Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => {
            const IconComponent = (Icons as unknown as Record<string, ComponentType<{ size?: number; stroke?: number }>>)[service.icon] || Icons.IconCode;
            return (
              <ServiceCard
                key={service.slug}
                title={service.title}
                description={service.description}
                icon={<IconComponent size={20} stroke={1.5} />}
                timeline={service.timeline}
                href={`/services/${service.slug}`}
                glow={service.glow}
              />
            );
          })}
        </div>

        {/* Final CTA Section */}
        <section className="relative mt-24 overflow-hidden rounded-[1.5rem] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_42%,transparent)] px-6 py-16 text-center shadow-[0_24px_80px_color-mix(in_srgb,var(--bg-deep)_24%,transparent)] backdrop-blur-2xl sm:px-10 lg:px-16 lg:py-20">
          <FinalCtaArtwork />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 opacity-[0.12]"
            style={textureStyle}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(to_right,transparent,color-mix(in_srgb,var(--on-surface)_22%,transparent),transparent)]"
          />
          <div className="relative z-[1] mx-auto max-w-2xl">
            <p className="label-caps mb-4 text-[var(--secondary)]">
              Start a project
            </p>
            <h2 className="title-serif text-[clamp(2.16rem,4.4vw,3.35rem)] font-normal leading-[1.04] tracking-tight text-[var(--on-surface)]">
              Ready to build your next product?
            </h2>
            <p className="body-md mx-auto my-8 max-w-lg text-[var(--on-surface-dim)]">
              We scope in a single call. We write the brief. You get a fixed timeline, clear deliverables, and weekly sprints.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <LinkButton href="/start-project" variant="primary">
                Start a Project
                <Icons.IconArrowRight size={16} stroke={1.8} />
              </LinkButton>
              <LinkButton href="mailto:hire@andishi.dev" variant="glass">
                hire@andishi.dev
              </LinkButton>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
