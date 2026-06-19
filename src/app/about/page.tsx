import type { Metadata } from "next";
import { AboutPageExperience } from "@/components/sections/about-page-experience";

export const metadata: Metadata = {
  title: "About Andishi - African Engineering Talent for Global Startups",
  description:
    "Andishi sources, vets, and places senior African engineers with global startups that need serious software talent.",
};

export default function AboutPage() {
  return <AboutPageExperience />;
}
