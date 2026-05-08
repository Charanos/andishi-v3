import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { JsonLd } from "@/components/marketing/json-ld";
import { FinalRouteCta, GlassPanel, PublicPageShell, RouteHero, SectionBlock } from "@/components/marketing/public-page";
import { PostCard } from "@/components/marketing/post-card";
import { blogPosts, categorySlug, getPost } from "@/data/blog";
import { siteConfig } from "@/config/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: `${post.title} - Andishi Blog`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const related = blogPosts.filter((item) => item.slug !== post.slug).slice(0, 3);

  const postSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: `${siteConfig.url}${post.coverImage}`,
    author: { "@type": "Person", name: post.author.name },
    datePublished: post.datePublished,
    dateModified: post.dateModified,
    publisher: { "@type": "Organization", name: "Andishi", url: siteConfig.url },
    mainEntityOfPage: `${siteConfig.url}/blog/${post.slug}`,
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${siteConfig.url}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: `${siteConfig.url}/blog/${post.slug}` },
    ],
  };

  return (
    <>
      <PublicPageShell>
        <RouteHero
          eyebrow={post.category}
          title={post.title}
          body={post.excerpt}
          primary={{ href: "/start-project", label: "Submit a hiring brief" }}
          secondary={{ href: `/blog/category/${categorySlug(post.category)}`, label: `More ${post.category}` }}
          meta={<p className="font-mono text-[0.85rem] text-[var(--on-surface-dim)]">{post.datePublished} · {post.readTime} min read · {post.author.name}</p>}
        />
        <section className="px-5 pb-12 sm:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="relative aspect-[16/9] overflow-hidden rounded-[1.4rem] border border-[var(--glass-border)]">
              <Image src={post.coverImage} alt={post.title} fill sizes="(min-width: 1024px) 64rem, 100vw" className="object-cover" priority />
            </div>
          </div>
        </section>
        <article className="px-5 py-8 sm:px-8 lg:py-14">
          <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="grid gap-6 text-[1.08rem] leading-relaxed text-[var(--on-surface-dim)]">
              {post.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              <GlassPanel>
                <p className="label-caps text-[var(--secondary)]">Hiring note</p>
                <p className="body-md mt-3 text-[var(--on-surface-dim)]">
                  The fastest way to use this guidance is to submit a brief with the ownership gap, stack, timeline, and team context already included.
                </p>
                <Link href="/start-project" className="mt-5 inline-flex text-[0.95rem] font-medium text-[var(--secondary)]">
                  Start a hiring brief
                </Link>
              </GlassPanel>
            </div>
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <GlassPanel>
                <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-[var(--glass-border)]">
                  <Image src={post.author.avatarUrl} alt={post.author.name} fill sizes="64px" className="object-cover" />
                </div>
                <p className="mt-4 text-[1rem] font-medium text-[var(--on-surface)]">{post.author.name}</p>
                <p className="mt-1 text-[0.88rem] text-[var(--on-surface-dim)]">{post.author.role}</p>
              </GlassPanel>
            </aside>
          </div>
        </article>
        <SectionBlock eyebrow="Related" title="Keep reading.">
          <div className="grid gap-4 md:grid-cols-3">
            {related.map((item) => (
              <PostCard key={item.slug} post={item} />
            ))}
          </div>
        </SectionBlock>
        <FinalRouteCta title="Ready to hire with clearer signal?" body="Turn your current bottleneck into a brief Andishi can match against." />
      </PublicPageShell>
      <JsonLd id="blog-post-schema" data={postSchema} />
      <JsonLd id="blog-post-breadcrumb-schema" data={breadcrumbSchema} />
    </>
  );
}
