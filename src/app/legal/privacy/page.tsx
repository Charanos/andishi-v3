import type { Metadata } from "next";
import { PublicPageShell, RouteHero, SectionBlock, GlassPanel } from "@/components/marketing/public-page";

export const metadata: Metadata = {
  title: "Privacy Policy - Andishi",
  description: "How Andishi handles hiring briefs, contact details, and profile information.",
};

export default function PrivacyPage() {
  return (
    <PublicPageShell>
      <RouteHero
        eyebrow="Legal"
        title="Privacy policy."
        body="A practical summary of how Andishi handles information shared by clients, engineers, and site visitors."
        primary={{ href: "/contact", label: "Contact Andishi" }}
        secondary={{ href: "/legal/terms", label: "Terms" }}
      />
      <SectionBlock title="How we handle information.">
        <div className="grid gap-4">
          {[
            ["Information we collect", "We collect details you submit through hiring briefs, contact forms, email, and engineer profile workflows. This may include names, email addresses, company details, role requirements, stack context, availability, portfolio links, and communication history."],
            ["How we use it", "We use information to respond to enquiries, match clients with engineers, manage introductions, improve the Andishi service, and maintain operational records for active engagements."],
            ["Sharing", "We share relevant brief and profile details only where needed to evaluate a match, coordinate an introduction, or support an engagement. Andishi does not sell personal information."],
            ["Retention", "We keep information for as long as needed to operate the service, maintain legitimate business records, and support future matching unless deletion is requested and retention is not legally required."],
            ["Contact", "Questions or deletion requests can be sent to hire@andishi.dev."],
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
