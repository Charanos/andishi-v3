import type { Metadata } from "next";
import { ServicesPageExperience } from "@/components/sections/services-page-experience";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Software Development Services - Andishi",
  description:
    "Custom web applications, SaaS platforms, AI systems, mobile apps, enterprise software, and blockchain products. We scope, design, build, and ship - senior team, fixed timelines.",
  openGraph: {
    title: "Software Development Services - Andishi",
    description:
      "Eight service lines. One standard. We design, build, and ship complete software products - from greenfield SaaS to production-ready AI pipelines.",
    type: "website",
    url: `${siteConfig.url}/services`,
  },
  alternates: {
    canonical: `${siteConfig.url}/services`,
  },
};

export default function ServicesPage() {
  return <ServicesPageExperience />;
}
