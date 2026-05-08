import type { Metadata } from "next";
import { ContactPageExperience } from "@/components/sections/contact-page-experience";

export const metadata: Metadata = {
  title: "Contact Andishi - Hire Senior African Engineers",
  description:
    "Tell Andishi what engineering talent you need. Get matched with vetted senior African engineers for contract, team extension, or dedicated build teams.",
};

export default function ContactPage() {
  return <ContactPageExperience />;
}
