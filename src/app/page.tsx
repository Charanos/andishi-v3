import Script from "next/script";
import { BlogAndFaqNewsletter } from "@/components/sections/blog-faq-newsletter";
import { HeroSection } from "@/components/sections/hero-section";
import { ProjectShowcase } from "@/components/sections/project-showcase";
import { WhyAndishiSection } from "@/components/sections/why-andishi-section";
import { ServicesBentoGrid } from "@/components/sections/services-bento";
import { ProcessSection } from "@/components/sections/process-section";
import { TalentTrack, Founder, FinalCTA } from "@/components/sections/home-extra-sections";
import {
  fetchPublicBlogPosts,
  fetchPublicProjects,
  fetchPublicTestimonials,
} from "@/lib/api/public-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What kinds of products do you build?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Web applications, SaaS platforms, AI-powered tools, mobile apps (iOS and Android), enterprise internal tools, blockchain and Web3 products, APIs, and data integrations.",
      },
    },
    {
      "@type": "Question",
      name: "How long does a typical project take?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A scoped web app takes 4–10 weeks. A full SaaS product is typically 6–14 weeks from scoping to initial launch. Mobile apps run 6–12 weeks.",
      },
    },
  ],
};

export default async function Home() {
  const [testimonials, blogPosts, projects] = await Promise.all([
    fetchPublicTestimonials(),
    fetchPublicBlogPosts(),
    fetchPublicProjects(),
  ]);

  return (
    <>
      <main className="relative overflow-hidden bg-[var(--bg)]">
        <HeroSection />
        <ServicesBentoGrid />
        <ProcessSection />
        <ProjectShowcase initialProjects={projects} />
        <WhyAndishiSection />
        <TalentTrack />
        <Founder />
        <BlogAndFaqNewsletter initialPosts={blogPosts} initialTestimonials={testimonials} />
        <FinalCTA />
      </main>
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}
