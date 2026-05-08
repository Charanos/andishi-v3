import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/marketing/json-ld";
import { PublicPageShell, RouteHero, SectionBlock } from "@/components/marketing/public-page";
import { PostCard } from "@/components/marketing/post-card";
import { blogPosts, categoryFromSlug, categorySlug } from "@/data/blog";
import { siteConfig } from "@/config/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return [...new Set(blogPosts.map((post) => categorySlug(post.category)))].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = categoryFromSlug(slug);
  if (!category) return {};
  return {
    title: `${category} Articles - Andishi Blog`,
    description: `Andishi writing on ${category.toLowerCase()} for startup teams and engineering leaders.`,
  };
}

export default async function BlogCategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = categoryFromSlug(slug);
  if (!category) notFound();

  const posts = blogPosts.filter((post) => post.category === category);
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${siteConfig.url}/blog` },
      { "@type": "ListItem", position: 3, name: category, item: `${siteConfig.url}/blog/category/${slug}` },
    ],
  };

  return (
    <>
      <PublicPageShell>
        <RouteHero
          eyebrow="Blog category"
          title={`${category} articles.`}
          body={`Andishi notes and guides in ${category.toLowerCase()} for founders, CTOs, and engineering leads.`}
          primary={{ href: "/blog", label: "All posts" }}
          secondary={{ href: "/hire", label: "How hiring works" }}
        />
        <SectionBlock title={`${posts.length} posts in ${category}.`}>
          <div className="grid gap-4 md:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </SectionBlock>
      </PublicPageShell>
      <JsonLd id="blog-category-breadcrumb-schema" data={breadcrumbSchema} />
    </>
  );
}
