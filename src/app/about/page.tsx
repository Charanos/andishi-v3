import type { Metadata } from "next";
import { AboutPageExperience } from "@/components/sections/about-page-experience";

export const metadata: Metadata = {
  title: "About Andishi - Software Development Studio",
  description:
    "Andishi is a software development studio that designs, builds, and ships high-quality custom software, SaaS platforms, AI systems, and mobile apps.",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  return <AboutPageExperience />;
}
