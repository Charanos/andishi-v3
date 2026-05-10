import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  IconArrowLeft,
  IconArrowRight,
  IconCalendar,
  IconCheck,
  IconClock,
  IconFileText,
  IconMail,
  IconQuote,
  IconUserCircle,
} from "@tabler/icons-react";
import { JsonLd } from "@/components/marketing/json-ld";
import { PostCard } from "@/components/marketing/post-card";
import { FinalCtaArtwork } from "@/components/ui/final-cta-artwork";
import { blogPosts, categorySlug, getPost, type BlogPost } from "@/data/blog";
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

function PatternTexture({
  className = "",
  opacity = 0.16,
}: {
  className?: string;
  opacity?: number;
}) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{
        opacity,
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg width='28' height='28' viewBox='0 0 28 28' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M14 10.5v7M10.5 14h7' stroke='%23c5b8e8' stroke-width='0.7' stroke-linecap='round' opacity='0.24'/%3E%3C/svg%3E\"), radial-gradient(circle, color-mix(in srgb, var(--secondary) 18%, transparent) 0 1px, transparent 1.7px)",
        backgroundPosition: "0 0, 14px 14px",
        backgroundSize: "28px 28px, 28px 28px",
      }}
    />
  );
}

function GlassPanel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[1.35rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] shadow-[0_24px_70px_color-mix(in_srgb,var(--bg-deep)_24%,transparent)] backdrop-blur-xl ${className}`}
    >
      <PatternTexture opacity={0.07} />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(to_right,transparent,color-mix(in_srgb,var(--secondary)_36%,transparent),transparent)]"
      />
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}

function ArticleMeta({ post }: { post: BlogPost }) {
  return (
    <div className="flex flex-wrap gap-2" aria-label="Article details">
      {[
        [IconCalendar, post.datePublished],
        [IconClock, `${post.readTime} min read`],
        [IconUserCircle, post.author.name],
      ].map(([Icon, label]) => {
        const MetaIcon = Icon as typeof IconCalendar;

        return (
          <span
            key={label as string}
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--bg)_44%,transparent)] px-3 py-2 text-[0.8rem] text-[var(--on-surface-dim)] backdrop-blur-xl"
          >
            <MetaIcon size={14} stroke={1.5} className="text-[var(--secondary)]" />
            {label as string}
          </span>
        );
      })}
    </div>
  );
}

function AuthorPanel({ post }: { post: BlogPost }) {
  return (
    <GlassPanel className="p-5">
      <div className="flex items-center gap-4">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-[var(--surface-high)]">
          <Image
            src={post.author.avatarUrl}
            alt={post.author.name}
            fill
            sizes="64px"
            className="object-cover"
          />
        </div>
        <div className="min-w-0">
          <p className="text-[1rem] font-medium text-[var(--on-surface)]">
            {post.author.name}
          </p>
          <p className="mt-1 text-[0.82rem] leading-snug text-[var(--on-surface-dim)]">
            {post.author.role}
          </p>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_34%,transparent)]">
        <div className="border-r border-[var(--glass-border)] px-3 py-3">
          <p className="font-mono text-[1rem] text-[var(--secondary)]">
            {post.readTime}m
          </p>
          <p className="mt-1 text-[0.58rem] uppercase tracking-[0.08em] text-[var(--on-surface-dim)]">
            read time
          </p>
        </div>
        <div className="px-3 py-3">
          <p className="font-mono text-[1rem] text-[var(--secondary)]">
            {post.category}
          </p>
          <p className="mt-1 text-[0.58rem] uppercase tracking-[0.08em] text-[var(--on-surface-dim)]">
            category
          </p>
        </div>
      </div>
    </GlassPanel>
  );
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const related = blogPosts
    .filter((item) => item.slug !== post.slug)
    .slice(0, 3);

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
      <main className="relative isolate overflow-hidden bg-[var(--bg)]">
        <PatternTexture className="z-0" opacity={0.1} />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--surface-high)_8%,transparent),transparent_22rem),linear-gradient(90deg,color-mix(in_srgb,var(--bg)_88%,transparent),transparent_38%,color-mix(in_srgb,var(--bg)_72%,transparent))]"
        />

        <article className="relative z-[1] px-5 pb-16 pt-32 sm:px-8 lg:px-10 lg:pb-24 lg:pt-36">
          <div className="mx-auto max-w-[96rem]">
            <Link
              href="/blog"
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-2 text-[0.86rem] font-medium text-[var(--on-surface-dim)] backdrop-blur-xl transition-colors duration-300 hover:text-[var(--on-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--secondary)_36%,transparent)]"
            >
              <IconArrowLeft size={15} stroke={1.6} />
              Blog
            </Link>

            <section className="relative overflow-hidden rounded-[1.5rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] shadow-[0_28px_90px_color-mix(in_srgb,var(--bg-deep)_28%,transparent)] backdrop-blur-2xl">
              <div className="relative min-h-[34rem] overflow-hidden">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  sizes="(min-width: 1280px) 88rem, 100vw"
                  className="object-cover brightness-[0.72] saturate-[0.86]"
                  priority
                />
                <PatternTexture opacity={0.1} />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,color-mix(in_srgb,var(--bg)_90%,transparent),color-mix(in_srgb,var(--bg)_58%,transparent)_48%,transparent_100%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(to_top,var(--bg),transparent_62%)]" />

                <div className="relative z-[1] flex min-h-[34rem] max-w-4xl flex-col justify-end px-5 pb-8 pt-24 sm:px-8 lg:px-10 lg:pb-10">
                  <p className="label-caps mb-5 flex items-center gap-3 text-[var(--secondary)]">
                    <span className="h-px w-7 bg-[var(--secondary)]" aria-hidden="true" />
                    {post.category}
                  </p>
                  <h1 className="max-w-[14ch] text-[clamp(2.7rem,9vw,5.9rem)] font-normal leading-[0.96] tracking-tight text-[var(--on-surface)]">
                    {post.title}
                  </h1>
                  <p className="body-md mt-6 max-w-2xl text-[var(--on-surface-dim)]">
                    {post.excerpt}
                  </p>
                  <div className="mt-7">
                    <ArticleMeta post={post} />
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-8 grid gap-8 xl:grid-cols-[18rem_minmax(0,1fr)_18rem]">
              <aside className="grid gap-5 self-start xl:sticky xl:top-28">
                <AuthorPanel post={post} />
                <GlassPanel className="p-5">
                  <p className="label-caps mb-4 text-[color-mix(in_srgb,var(--on-surface-dim)_58%,transparent)]">
                    Article map
                  </p>
                  <div className="grid gap-2">
                    {post.body.map((paragraph, index) => (
                      <a
                        key={paragraph}
                        href={`#note-${index + 1}`}
                        className="group flex items-center justify-between gap-3 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-2 text-left transition-colors duration-300 hover:border-[color-mix(in_srgb,var(--secondary)_26%,transparent)]"
                      >
                        <span className="text-[0.8rem] text-[var(--on-surface-dim)]">
                          Field note {index + 1}
                        </span>
                        <span className="font-mono text-[0.68rem] text-[var(--secondary)]">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </a>
                    ))}
                  </div>
                </GlassPanel>
              </aside>

              <div className="grid gap-5">
                <GlassPanel className="p-5 sm:p-7 lg:p-9">
                  <div className="mb-8 flex items-start gap-4 border-b border-[var(--glass-border)] pb-7">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-[color-mix(in_srgb,var(--secondary)_24%,transparent)] bg-[color-mix(in_srgb,var(--secondary)_9%,transparent)] text-[var(--secondary)]">
                      <IconQuote size={22} stroke={1.5} />
                    </span>
                    <p className="text-[clamp(1.3rem,3vw,2rem)] font-normal leading-[1.25] tracking-tight text-[var(--on-surface)]">
                      {post.excerpt}
                    </p>
                  </div>

                  <div className="grid gap-8">
                    {post.body.map((paragraph, index) => (
                      <section
                        id={`note-${index + 1}`}
                        key={paragraph}
                        className="scroll-mt-28"
                      >
                        <p className="font-mono text-[0.72rem] text-[var(--secondary)]">
                          {String(index + 1).padStart(2, "0")}
                        </p>
                        <p className="mt-4 text-[clamp(1.08rem,2vw,1.22rem)] leading-[1.85] text-[var(--on-surface-dim)]">
                          {paragraph}
                        </p>
                      </section>
                    ))}
                  </div>
                </GlassPanel>

                <GlassPanel className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-center">
                  <div>
                    <p className="label-caps mb-3 text-[var(--secondary)]">
                      Apply this
                    </p>
                    <h2 className="text-[clamp(1.7rem,4vw,2.6rem)] font-normal leading-[1.03] tracking-tight text-[var(--on-surface)]">
                      Turn the insight into a better hiring brief.
                    </h2>
                    <p className="body-md mt-4 text-[var(--on-surface-dim)]">
                      The fastest way to use this guidance is to describe the
                      ownership gap, stack, timeline, and team context before
                      matching begins.
                    </p>
                  </div>
                  <Link
                    href="/start-project"
                    className="inline-flex min-h-[2.35rem] items-center justify-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--on-surface)_16%,transparent)] bg-[var(--on-surface)] px-6 py-2.5 text-[0.98rem] font-medium text-[var(--bg)] shadow-[0_16px_36px_color-mix(in_srgb,var(--bg-deep)_36%,transparent)] transition-all duration-300 hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--on-surface)_35%,transparent)]"
                  >
                    Start hiring
                    <IconArrowRight size={15} stroke={2} />
                  </Link>
                </GlassPanel>
              </div>

              <aside className="grid gap-5 self-start xl:sticky xl:top-28">
                <GlassPanel className="p-5">
                  <p className="label-caps mb-4 text-[var(--secondary)]">
                    Reading signals
                  </p>
                  <ul className="space-y-3">
                    {[
                      "Specific problem framing",
                      "Production context over buzzwords",
                      "Clear ownership and next action",
                    ].map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-[0.86rem] leading-relaxed text-[var(--on-surface-dim)]"
                      >
                        <span className="mt-1 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-[color-mix(in_srgb,var(--tertiary)_16%,transparent)] text-[var(--tertiary)]">
                          <IconCheck size={10} stroke={2.5} />
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </GlassPanel>

                <GlassPanel className="p-5">
                  <p className="label-caps mb-4 text-[color-mix(in_srgb,var(--on-surface-dim)_58%,transparent)]">
                    More in {post.category}
                  </p>
                  <Link
                    href={`/blog/category/${categorySlug(post.category)}`}
                    className="inline-flex items-center gap-2 text-[0.92rem] font-medium text-[var(--secondary)]"
                  >
                    Category archive
                    <IconArrowRight size={15} stroke={1.8} />
                  </Link>
                </GlassPanel>
              </aside>
            </section>
          </div>
        </article>

        <section className="relative z-[1] px-5 py-14 sm:px-8 lg:px-10 lg:py-20">
          <div className="mx-auto max-w-[96rem]">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="label-caps mb-4 flex items-center gap-3 text-[var(--secondary)]">
                  <span className="h-px w-7 bg-[var(--secondary)]" aria-hidden="true" />
                  Related notes
                </p>
                <h2 className="text-[clamp(2rem,6vw,3.6rem)] font-normal leading-[1.02] tracking-tight text-[var(--on-surface)]">
                  Keep reading.
                </h2>
              </div>
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-[0.95rem] font-medium text-[var(--secondary)]"
              >
                All posts
                <IconArrowRight size={15} stroke={1.8} />
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {related.map((item) => (
                <PostCard key={item.slug} post={item} />
              ))}
            </div>
          </div>
        </section>

        <section className="relative z-[1] px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
          <div className="mx-auto max-w-[96rem]">
            <div className="relative overflow-hidden rounded-[1.5rem] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_42%,transparent)] px-6 py-12 text-center shadow-[0_24px_80px_color-mix(in_srgb,var(--bg-deep)_24%,transparent)] backdrop-blur-2xl sm:px-10 lg:px-16 lg:py-16">
              <FinalCtaArtwork />
              <PatternTexture opacity={0.12} />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(to_right,transparent,color-mix(in_srgb,var(--on-surface)_22%,transparent),transparent)]"
              />
              <div className="relative z-[1] mx-auto max-w-2xl">
                <p className="label-caps mb-4 text-[var(--secondary)]">
                  Need senior signal?
                </p>
                <h2 className="text-[clamp(2rem,6vw,3.8rem)] font-normal leading-[1.02] tracking-tight text-[var(--on-surface)]">
                  Convert what you learned into a sharper match.
                </h2>
                <p className="body-md mx-auto mt-5 max-w-lg text-[var(--on-surface-dim)]">
                  Send the problem, stack, ownership gap, and timeline. Andishi
                  will translate it into a shortlist of vetted senior engineers.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <Link
                    href="/start-project"
                    className="inline-flex min-h-[2.35rem] items-center justify-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--on-surface)_16%,transparent)] bg-[var(--on-surface)] px-6 py-2.5 text-[0.98rem] font-medium text-[var(--bg)] shadow-[0_16px_36px_color-mix(in_srgb,var(--bg-deep)_36%,transparent)] transition-all duration-300 hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--on-surface)_35%,transparent)]"
                  >
                    Start hiring
                    <IconArrowRight size={15} stroke={2} />
                  </Link>
                  <a
                    href={`mailto:${siteConfig.email}`}
                    className="inline-flex min-h-[2.35rem] items-center justify-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--on-surface)_16%,transparent)] bg-[var(--glass-bg)] px-6 py-2.5 text-[0.98rem] font-medium text-[var(--on-surface)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-px hover:border-[color-mix(in_srgb,var(--on-surface)_34%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--on-surface)_35%,transparent)]"
                  >
                    <IconMail size={15} stroke={1.8} />
                    Email Andishi
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <JsonLd id="blog-post-schema" data={postSchema} />
      <JsonLd id="blog-post-breadcrumb-schema" data={breadcrumbSchema} />
    </>
  );
}
