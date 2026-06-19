import type { Metadata } from "next";
import { ServicesPageExperience } from "@/components/sections/services-page-experience";

export const metadata: Metadata = {
  title: "Engineering Talent Services - Andishi",
  description:
    "Hire vetted senior African engineers across full-stack web, AI integration, AWS, Web3, backend API systems, and mobile development.",
};

export default function ServicesPage() {
  return <ServicesPageExperience />;
}
