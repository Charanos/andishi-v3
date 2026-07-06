import type { Metadata } from "next";
import { CareersPageExperience } from "@/components/marketing/careers-page-experience";
import { fetchPublicOpenings } from "@/lib/api/public-client";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Careers & Talent Network - Andishi",
  description:
    "Join Andishi as a freelance product engineer, core studio teammate, or client placement. Explore our open roles and apply to build world-class software.",
  openGraph: {
    title: "Careers & Talent Network - Andishi",
    description:
      "Join the orbit of senior builders. Explore freelance projects, core studio hires, and outsourced client engineering placements.",
    type: "website",
    url: `${siteConfig.url}/careers`,
  },
  alternates: {
    canonical: `${siteConfig.url}/careers`,
  },
};

export default async function CareersPage() {
  const openings = await fetchPublicOpenings();
  return <CareersPageExperience initialOpenings={openings} />;
}
