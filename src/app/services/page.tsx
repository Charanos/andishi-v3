import type { Metadata } from "next";
import { ServicesPageExperience } from "@/components/sections/services-page-experience";

export const metadata: Metadata = {
  title: "Services - Andishi",
  description:
    "Web applications, payment systems, e-commerce, analytics, websites, and integrations built for Kenyan and East African businesses.",
};

export default function ServicesPage() {
  return <ServicesPageExperience />;
}
