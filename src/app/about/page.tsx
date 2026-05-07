import type { Metadata } from "next";
import { AboutPageExperience } from "@/components/sections/about-page-experience";

export const metadata: Metadata = {
  title: "About Andishi - Nairobi-Led Software Delivery",
  description:
    "Andishi is a Nairobi-led software delivery company assembling in-house and contract developers to build products for local and international clients.",
};

export default function AboutPage() {
  return <AboutPageExperience />;
}
