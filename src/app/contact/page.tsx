import type { Metadata } from "next";
import { ContactPageExperience } from "@/components/sections/contact-page-experience";

export const metadata: Metadata = {
  title: "Contact Andishi - Start Your Project Brief",
  description:
    "Send a project brief to Andishi. Nairobi-led software delivery for local and international teams, with clear scoping and response within 24 hours.",
};

export default function ContactPage() {
  return <ContactPageExperience />;
}
