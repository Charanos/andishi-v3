import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { IconArrowRight } from "@tabler/icons-react";
import { JsonLd } from "@/components/marketing/json-ld";
import { PublicPageShell, RouteHero, SectionBlock } from "@/components/marketing/public-page";
import { PostCard } from "@/components/marketing/post-card";
import { blogCategories, blogPosts, categorySlug } from "@/data/blog";
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
    { "@type": "ListItem", position: 2, name: "Blog", item: `${siteConfig.url}/blog` },
  ],
};

export default function BlogPage() {
  const featured = blogPosts.find((post) => post.featured) ?? blogPosts[0];
  const rest = blogPosts.filter((post) => post.slug !== featured.slug);

  return (
    <>
      <PublicPageShell>
        <RouteHero
          eyebrow="Blog"
          title="Hiring and engineering notes from Andishi."
          body="Practical writing for startup teams hiring senior engineers, building remote teams, and moving from technical ambiguity to shipped product."
          primary={{ href: "/hire", label: "How hiring works" }}
          secondary={{ href: "/engineers", label: "Browse engineers" }}
        />
        <SectionBlock title="Featured post.">
          <Link href={`/blog/${featured.slug}`} className="group grid overflow-hidden rounded-[1.4rem] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_38%,transparent)] shadow-[0_24px_80px_color-mix(in_srgb,var(--bg-deep)_24%,transparent)] backdrop-blur-2xl lg:grid-cols-[1.05fr_0.95fr]">
            <div className="relative min-h-72">
              <Image src={featured.coverImage} alt={featured.title} fill sizes="(min-width: 1024px) 48rem, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" priority />
            </div>
            <div className="p-6 sm:p-8 lg:p-10">
              <p className="label-caps text-[var(--secondary)]">{featured.category}</p>
              <h2 className="mt-5 text-[clamp(1.8rem,5vw,3.3rem)] font-normal leading-[1] tracking-tight text-[var(--on-surface)]">
                {featured.title}
              </h2>
              <p className="body-md mt-5 text-[var(--on-surface-dim)]">{featured.excerpt}</p>
              <p className="mt-7 inline-flex items-center gap-2 text-[0.95rem] font-medium text-[var(--secondary)]">
                Read
                <IconArrowRight size={16} stroke={1.8} />
              </p>
            </div>
          </Link>
        </SectionBlock>
        <SectionBlock title="Latest writing.">
          <div className="mb-8 flex gap-2 overflow-x-auto pb-1">
            {blogCategories.map((category) => (
              <Link
                key={category}
                href={category === "All" ? "/blog" : `/blog/category/${categorySlug(category)}`}
                className="shrink-0 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-2 text-[0.78rem] font-medium text-[var(--on-surface-dim)] transition-colors duration-300 hover:text-[var(--on-surface)]"
              >
                {category}
              </Link>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {rest.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </SectionBlock>
      </PublicPageShell>
      <JsonLd id="blog-schema" data={blogSchema} />
      <JsonLd id="blog-breadcrumb-schema" data={breadcrumbSchema} />
    </>
  );
}
