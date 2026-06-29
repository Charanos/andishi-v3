import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceDetailExperience } from "@/components/marketing/service-detail-experience";
import { getServiceBySlug, getAllServiceSlugs } from "@/data/services";
import { siteConfig } from "@/config/site";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllServiceSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) return {};

  return {
    title: `${service.title} — Software Development | Andishi`,
    description: service.tagline,
    openGraph: {
      title: `${service.title} — Software Development | Andishi`,
      description: service.scope,
      type: "website",
    },
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) notFound();

  const schemas = {
    service: {
      "@context": "https://schema.org",
      "@type": "Service",
      name: service.title,
      provider: { "@type": "Organization", name: "Andishi", url: siteConfig.url },
      serviceType: service.title,
      description: service.scope,
      areaServed: ["Kenya", "East Africa", "United States", "United Kingdom", "European Union"],
      url: `${siteConfig.url}/services/${service.slug}`,
    },
    faq: {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: service.faq.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    },
    breadcrumb: {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
        { "@type": "ListItem", position: 2, name: "Services", item: `${siteConfig.url}/services` },
        { "@type": "ListItem", position: 3, name: service.title, item: `${siteConfig.url}/services/${service.slug}` },
      ],
    },
  };

  return <ServiceDetailExperience service={service} schemas={schemas} />;
}
