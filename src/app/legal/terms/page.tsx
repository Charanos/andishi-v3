import type { Metadata } from "next";
import { PublicPageShell, RouteHero, SectionBlock, GlassPanel } from "@/components/marketing/public-page";

export const metadata: Metadata = {
  title: "Terms - Andishi",
  description: "General terms for using Andishi public pages, hiring workflows, and talent introduction services.",
};

export default function TermsPage() {
  return (
    <PublicPageShell>
      <RouteHero
        eyebrow="Legal"
        title="Terms of service."
        body="General terms for using Andishi public pages, hiring workflows, and talent introduction services."
        primary={{ href: "/start-project", label: "Submit a brief" }}
        secondary={{ href: "/legal/privacy", label: "Privacy" }}
      />
      <SectionBlock title="General terms.">
        <div className="grid gap-4">
          {[
            ["Use of the site", "The Andishi site provides information about engineering talent, studio services, and ways to contact or submit a hiring brief. Content is provided for general information and may change as the service evolves."],
            ["Introductions and engagements", "Submitting a brief does not create a binding engagement. Specific pricing, scope, availability, start date, cancellation, and replacement terms are confirmed separately before work begins."],
            ["Profiles and content", "Engineer profiles, case studies, and blog content are provided to help buyers evaluate fit. Andishi may update, remove, or revise content as availability and service coverage changes."],
            ["No guarantee of availability", "Engineer availability can change. Andishi confirms current availability during the matching process before scheduling intro calls or proposing an engagement."],
            ["Contact", "Questions about these terms can be sent to hire@andishi.dev."],
          ].map(([title, body]) => (
            <GlassPanel key={title}>
              <h2 className="text-[1.1rem] font-medium text-[var(--on-surface)]">{title}</h2>
              <p className="mt-3 text-[0.96rem] leading-relaxed text-[var(--on-surface-dim)]">{body}</p>
            </GlassPanel>
          ))}
        </div>
      </SectionBlock>
    </PublicPageShell>
  );
}
