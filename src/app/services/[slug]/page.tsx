import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import type { ComponentType } from "react";
import * as Icons from "@tabler/icons-react";
import {
  getServiceBySlug,
  getAllServiceSlugs,
} from "@/data/services";
import { LinkButton } from "@/components/ui/button";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllServiceSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) return {};

  return {
    title: `${service.title} - Andishi`,
    description: service.tagline,
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) notFound();

  const IconComponent = (Icons as unknown as Record<string, ComponentType<{ size?: number; stroke?: number }>>)[service.icon] || Icons.IconCode;

  // JSON-LD schemas
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": service.title,
    "provider": { "@type": "Organization", "name": "Andishi" },
    "serviceType": service.title,
    "description": service.scope,
    "areaServed": ["Kenya", "East Africa", "United States", "United Kingdom", "European Union"],
    "url": `https://andishi.dev/services/${service.slug}`,
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": service.faq.map((f) => ({
      "@type": "Question",
      "name": f.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.answer,
      },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://andishi.dev",
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Services",
        "item": "https://andishi.dev/services",
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": service.title,
        "item": `https://andishi.dev/services/${service.slug}`,
      },
    ],
  };

  return (
    <>
      <main className="relative isolate overflow-visible bg-[var(--bg)] px-5 sm:px-8 lg:px-10 pb-24 pt-32 lg:pt-36">
        {/* Background texture and glow orbs */}
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
          className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--surface-high)_8%,transparent),transparent_22rem)]"
        />

        <div className="relative z-[1] mx-auto w-full max-w-[92rem]">
          {/* Breadcrumb nav link */}
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-[0.82rem] font-medium uppercase tracking-[0.1em] text-[var(--on-surface-dim)] hover:text-[var(--on-surface)] transition-colors duration-200 mb-8"
          >
            <Icons.IconArrowLeft size={14} stroke={1.8} />
            Back to services
          </Link>

          {/* Header */}
          <header className="border-b border-[var(--glass-border)] pb-8 mb-12 lg:grid lg:grid-cols-[1fr_auto] lg:items-end lg:gap-12">
            <div className="max-w-3xl">
              <p className="label-caps mb-4 flex items-center gap-3 text-[var(--secondary)]">
                <span className="font-mono tracking-tight">{service.timeline}</span>
                service delivery
              </p>
              <h1 className="title-serif m-0 text-[clamp(2.8rem,6vw,4.5rem)] font-normal leading-[0.96] tracking-tight text-[var(--on-surface)]">
                {service.title}
              </h1>
              <p className="body-lg mt-4 text-[var(--on-surface-dim)] font-light">
                {service.tagline}
              </p>
            </div>
            <div className="mt-6 lg:mt-0">
              <span className="grid h-16 w-16 place-items-center rounded-2xl border border-[color-mix(in_srgb,var(--secondary)_24%,transparent)] bg-[color-mix(in_srgb,var(--secondary)_8%,transparent)] text-[var(--secondary)]">
                <IconComponent size={32} stroke={1.5} />
              </span>
            </div>
          </header>

          <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr]">
            {/* Left Column (Details) */}
            <div className="space-y-12">
              {/* Scope Description */}
              <section className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-8 backdrop-blur-xl">
                <h2 className="label-caps text-[var(--on-surface)] mb-4">Service Scope</h2>
                <p className="body-md leading-[1.75] text-[var(--on-surface-dim)]">
                  {service.scope}
                </p>
              </section>

              {/* Engagement Options */}
              <section>
                <h2 className="label-caps text-[var(--on-surface)] mb-6">Engagement Options</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {service.engagementOptions.map((opt) => (
                    <div
                      key={opt.label}
                      className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 transition-all duration-300 hover:bg-white/[0.05]"
                    >
                      <h3 className="text-[1.05rem] font-medium text-[var(--on-surface)] mb-2">
                        {opt.label}
                      </h3>
                      <p className="text-[0.88rem] leading-relaxed text-[var(--on-surface-dim)]">
                        {opt.description}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Service FAQ */}
              <section>
                <h2 className="label-caps text-[var(--on-surface)] mb-6">Frequently Asked Questions</h2>
                <div className="space-y-4">
                  {service.faq.map((item, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-6"
                    >
                      <h3 className="text-[0.98rem] font-medium text-[var(--on-surface)] mb-2">
                        {item.question}
                      </h3>
                      <p className="text-[0.88rem] leading-relaxed text-[var(--on-surface-dim)]">
                        {item.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Right Column (Sidebar) */}
            <aside className="lg:sticky lg:top-28 lg:self-start space-y-6">
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-8 shadow-xl backdrop-blur-xl">
                <h2 className="label-caps text-[var(--secondary)] mb-4">Technology Stack</h2>
                <div className="flex flex-wrap gap-2 mb-8">
                  {service.stackHighlights.map((tech) => (
                    <span
                      key={tech}
                      className="inline-block px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] text-sm text-[var(--on-surface-dim)]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="border-t border-white/[0.08] pt-6 space-y-4">
                  <h3 className="text-[1rem] font-medium text-[var(--on-surface)]">
                    Ready to scope this build?
                  </h3>
                  <p className="text-[0.88rem] leading-relaxed text-[var(--on-surface-dim)]">
                    Schedule a scoping call. We&apos;ll produce a clear project brief containing the exact deliverables, pricing, and timeline within one business day.
                  </p>
                  <LinkButton
                    href={`/start-project?service=${service.slug}`}
                    variant="primary"
                    className="w-full text-center"
                  >
                    Start a Project
                    <Icons.IconArrowRight size={16} stroke={1.8} />
                  </LinkButton>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      {/* SEO JSON-LD Tags */}
      <Script
        id="service-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <Script
        id="faq-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Script
        id="breadcrumb-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
}
