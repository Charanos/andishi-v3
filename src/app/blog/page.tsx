import type { Metadata } from "next";
import { JsonLd } from "@/components/marketing/json-ld";
import { BlogPageExperience } from "@/components/marketing/blog-page-experience";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Andishi Blog - Hiring and Engineering Notes",
  description:
    "Guides and notes on hiring senior African engineers, remote engineering teams, AI product work, and startup delivery.",
};

const blogSchema = {
  "@context": "https://schema.org",
  "@type": "Blog",
  name: "Andishi Blog",
  url: `${siteConfig.url}/blog`,
  description: metadata.description,
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
    {
      "@type": "ListItem",
      position: 2,
      name: "Blog",
      item: `${siteConfig.url}/blog`,
    },
  ],
};

export default function BlogPage() {
  return (
    <>
      <BlogPageExperience />
      <JsonLd id="blog-schema" data={blogSchema} />
      <JsonLd id="blog-breadcrumb-schema" data={breadcrumbSchema} />
    </>
  );
}
