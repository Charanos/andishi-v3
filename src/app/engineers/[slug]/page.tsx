import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/marketing/json-ld";
import { EngineerProfileExperience } from "@/components/marketing/engineer-profile-experience";
import { engineers, getEngineer } from "@/data/engineers";
import { siteConfig } from "@/config/site";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return engineers.map((engineer) => ({ slug: engineer.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const engineer = getEngineer(slug);
  if (!engineer) return {};

  return {
    title: `${engineer.name} - ${engineer.role} | Andishi`,
    description: engineer.bio,
  };
}

export default async function EngineerProfilePage({ params }: Props) {
  const { slug } = await params;
  const engineer = getEngineer(slug);
  if (!engineer) notFound();

  const similar = engineers
    .filter((item) => item.slug !== engineer.slug && item.domains.some((domain) => engineer.domains.includes(domain)))
    .slice(0, 3);

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: engineer.name,
    jobTitle: engineer.role,
    image: `${siteConfig.url}${engineer.avatar}`,
    description: engineer.bio,
    knowsAbout: engineer.skills,
    memberOf: { "@type": "Organization", name: "Andishi", url: siteConfig.url },
    sameAs: [engineer.githubUrl, engineer.portfolioUrl?.startsWith("http") ? engineer.portfolioUrl : undefined].filter(Boolean),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
      { "@type": "ListItem", position: 2, name: "Engineers", item: `${siteConfig.url}/engineers` },
      { "@type": "ListItem", position: 3, name: engineer.name, item: `${siteConfig.url}/engineers/${engineer.slug}` },
    ],
  };

  return (
    <>
      <EngineerProfileExperience engineer={engineer} similar={similar} />
      <JsonLd id="engineer-person-schema" data={personSchema} />
      <JsonLd id="engineer-breadcrumb-schema" data={breadcrumbSchema} />
    </>
  );
}
