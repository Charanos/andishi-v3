"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  IconArrowLeft,
  IconArrowRight,
  IconBookmark,
  IconBrandWhatsapp,
  IconCalendar,
  IconClock,
  IconExternalLink,
  IconHash,
  IconMail,
  IconQuote,
  IconShare,
  IconUserCircle,
} from "@tabler/icons-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { JsonLd } from "@/components/marketing/json-ld";
import { PostCard } from "@/components/marketing/post-card";
import { FinalCtaArtwork } from "@/components/ui/final-cta-artwork";
import { categorySlug, type BlogPost } from "@/data/blog";
import { mapBlogPostRow } from "@/lib/blog-mapper";
import { siteConfig } from "@/config/site";

export function BlogPostDetailExperience({
  slug,
  initialPost,
}: {
  slug: string;
  initialPost: BlogPost | null;
}) {
  const [post, setPost] = useState<BlogPost | null>(initialPost);
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    const loadPost = async () => {
      try {
        const [postRes, allRes] = await Promise.all([
          fetch(`/api/blog/${slug}`),
          fetch("/api/blog"),
        ]);
        if (postRes.ok) {
          const data = await postRes.json();
          setPost(data.post ? mapBlogPostRow(data.post) : null);
        }
        if (allRes.ok) {
          const data = await allRes.json();
          setAllPosts((data.posts ?? []).map(mapBlogPostRow));
        }
      } catch {
        // Keep initialPost if fetch fails
      }
    };
    loadPost();
  }, [slug]);

  if (!post) {
    return (
      <div className="min-h-[60vh] grid place-items-center bg-[var(--bg)] px-5 py-24 text-center">
        <div>
          <h1 className="title-serif text-[clamp(2rem,5vw,3.5rem)] text-[var(--on-surface)]">
            Article not found
          </h1>
          <p className="mt-4 text-[var(--on-surface-dim)] max-w-md mx-auto">
            This article does not exist or has been deleted from your database.
          </p>
          <Link
            href="/blog"
            className="mt-8 inline-flex h-11 items-center justify-center rounded-full bg-[var(--on-surface)] px-6 text-[0.88rem] font-medium text-[var(--bg)]"
          >
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  const related = allPosts.filter((item) => item.slug !== post.slug).slice(0, 3);

  const postSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: `${siteConfig.url}${post.coverImage}`,
    author: { "@type": "Person", name: post.author.name },
    datePublished: post.datePublished,
    dateModified: post.dateModified,
    publisher: {
      "@type": "Organization",
      name: "Andishi",
      url: siteConfig.url,
    },
    mainEntityOfPage: `${siteConfig.url}/blog/${post.slug}`,
    wordCount: wordCount(post.body),
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
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: `${siteConfig.url}/blog/${post.slug}`,
      },
    ],
  };

  return (
    <>
      <main className="relative isolate overflow-hidden bg-[var(--bg)]">
        <PatternTexture className="z-0" opacity={0.065} />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background: [
              "linear-gradient(180deg,color-mix(in srgb,var(--surface-high) 8%,transparent),transparent 26rem)",
              "linear-gradient(to right,color-mix(in srgb,var(--bg) 90%,transparent),transparent 42%,color-mix(in srgb,var(--bg) 72%,transparent))",
            ].join(","),
          }}
        />

        <article className="relative z-[1] px-5 pb-14 pt-28 sm:px-8 lg:px-10 lg:pb-20 lg:pt-36">
          <div className="mx-auto max-w-[92rem]">
            <Link
              href="/blog"
              className="mb-10 inline-flex items-center gap-2 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-2 text-[0.84rem] font-medium text-[var(--on-surface-dim)] backdrop-blur-xl transition-all duration-300 hover:-translate-x-0.5 hover:text-[var(--on-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--tertiary)_36%,transparent)]"
            >
              <IconArrowLeft size={14} stroke={1.6} aria-hidden="true" />
              Back to blog
            </Link>

            <section className="border-b border-[var(--glass-border)] pb-12 lg:grid lg:min-h-[calc(100svh-9rem)] lg:grid-cols-[0.9fr_1fr] lg:gap-10 lg:pb-16">
              <div className="border-b border-[var(--glass-border)] pb-10 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-10">
                <SectionEyebrow>{post.category}</SectionEyebrow>
                <HeroCoverArtifact post={post} />
              </div>

              <div className="pt-10 lg:flex lg:flex-col lg:justify-between lg:pt-0">
                <div>
                  <p className="label-caps mb-4 text-[var(--primary)]">Field note</p>
                  <h1 className="title-serif max-w-[18ch] text-[clamp(3.12rem,7vw,5.05rem)] font-normal leading-[0.94] tracking-tight text-[var(--on-surface)]">
                    {post.title}
                  </h1>
                  <div className="mt-7 max-w-2xl space-y-5">
                    <p className="text-[clamp(1.15rem,2.5vw,1.55rem)] font-normal leading-[1.4] tracking-tight text-[var(--on-surface)]">
                      {post.excerpt}
                    </p>
                  </div>
                  <div className="mt-8">
                    <ArticleMeta post={post} />
                  </div>
                </div>

                <div className="mt-8 grid overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] sm:grid-cols-3">
                  {[
                    [`${post.readTime}m`, "Read time"],
                    [`~${Math.max(150, Math.round(wordCount(post.body) / 50) * 50)}`, "Words"],
                    [String(new Date(post.datePublished).getFullYear()), "Published"],
                  ].map(([value, label]) => (
                    <div
                      key={label}
                      className="border-b border-[var(--glass-border)] px-4 py-4 sm:border-b-0 sm:border-r sm:last:border-r-0"
                    >
                      <p className="font-mono text-[1.45rem] leading-none tracking-tight text-[var(--on-surface)]">
                        {value}
                      </p>
                      <p className="label-caps mt-2 text-[0.58rem] leading-tight text-[color-mix(in_srgb,var(--on-surface-dim)_58%,transparent)]">
                        {label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <div className="mt-16 grid gap-10 lg:grid-cols-[17rem_minmax(0,1fr)_17rem]">
              <aside
                className="grid gap-5 self-start lg:sticky lg:top-28"
                aria-label="Article author"
              >
                <AuthorPanel post={post} />
              </aside>

              <div className="grid min-w-0 gap-6">
                <div className="max-w-[70ch] mx-auto w-full">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ node, ...props }) => (
                        <p
                          className="mb-6 text-[clamp(1.04rem,2vw,1.15rem)] leading-[1.88] text-[var(--on-surface-dim)]"
                          {...props}
                        />
                      ),
                      h2: ({ node, ...props }) => (
                        <h2
                          className="title-serif mt-12 mb-6 text-[clamp(2.1rem,4vw,2.8rem)] font-normal leading-tight tracking-tight text-[var(--on-surface)]"
                          {...props}
                        />
                      ),
                      h3: ({ node, ...props }) => (
                        <h3
                          className="title-serif mt-10 mb-4 text-[clamp(1.6rem,3vw,2rem)] font-normal leading-snug tracking-tight text-[var(--on-surface)]"
                          {...props}
                        />
                      ),
                      ul: ({ node, ...props }) => (
                        <ul
                          className="mb-6 ml-6 list-disc space-y-2 text-[clamp(1.04rem,2vw,1.15rem)] text-[var(--on-surface-dim)] marker:text-[var(--tertiary)]"
                          {...props}
                        />
                      ),
                      ol: ({ node, ...props }) => (
                        <ol
                          className="mb-6 ml-6 list-decimal space-y-2 text-[clamp(1.04rem,2vw,1.15rem)] text-[var(--on-surface-dim)] marker:text-[var(--tertiary)]"
                          {...props}
                        />
                      ),
                      li: ({ node, ...props }) => <li className="leading-[1.88]" {...props} />,
                      blockquote: ({ node, children, ...props }) => (
                        <blockquote
                          className="relative my-8 overflow-hidden rounded-[1.1rem] border border-[color-mix(in_srgb,var(--tertiary)_20%,transparent)] bg-[color-mix(in_srgb,var(--tertiary)_5%,transparent)] px-6 py-5 sm:px-8"
                          {...props}
                        >
                          <IconQuote
                            size={28}
                            stroke={1.2}
                            className="absolute right-4 top-4 text-[var(--tertiary)] opacity-20"
                            aria-hidden="true"
                          />
                          <span
                            aria-hidden="true"
                            className="absolute bottom-3 left-0 top-3 w-[3px] rounded-r-full bg-[linear-gradient(to_bottom,var(--tertiary),var(--primary))]"
                          />
                          <div className="relative text-[clamp(1.05rem,2vw,1.18rem)] font-normal italic leading-[1.65] tracking-tight text-[var(--on-surface)]">
                            {children}
                          </div>
                        </blockquote>
                      ),
                      img: ({ node, ...props }) => (
                        <div className="my-10 w-full overflow-hidden rounded-2xl border border-[var(--glass-border)] shadow-[0_24px_70px_color-mix(in_srgb,var(--bg-deep)_28%,transparent)]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img className="w-full h-auto object-cover" {...props} />
                        </div>
                      ),
                      strong: ({ node, ...props }) => (
                        <strong className="font-medium text-[var(--on-surface)]" {...props} />
                      ),
                      a: ({ node, ...props }) => (
                        <a
                          className="text-[var(--tertiary)] underline decoration-[color-mix(in_srgb,var(--tertiary)_40%,transparent)] underline-offset-4 transition-colors hover:text-[var(--primary)] hover:decoration-[var(--primary)]"
                          {...props}
                        />
                      ),
                      em: ({ node, ...props }) => (
                        <em className="italic text-[var(--on-surface)]" {...props} />
                      ),
                    }}
                  >
                    {post.body}
                  </ReactMarkdown>
                </div>

                <div className="mt-12 border-t border-[var(--glass-border)] pt-8">
                  <InlineCta />
                </div>
              </div>

              <aside
                className="grid gap-5 self-start lg:sticky lg:top-28"
                aria-label="Supplementary article info"
              >
                <ReadingSignals post={post} />
                <CategoryCard post={post} allPosts={allPosts} />
              </aside>
            </div>
          </div>
        </article>

        <section
          className="relative z-[1] px-5 py-14 sm:px-8 lg:px-10 lg:py-20"
          aria-label="Related posts"
        >
          <div className="mx-auto max-w-[92rem]">
            <div className="mb-10 border-b border-[var(--glass-border)] pb-8">
              <div className="flex items-end justify-between gap-6">
                <div>
                  <SectionEyebrow>Keep reading</SectionEyebrow>
                  <h2 className="title-serif text-[clamp(2.16rem,4.4vw,3.35rem)] font-normal leading-[1.02] tracking-tight text-[var(--on-surface)]">
                    Related field notes.
                  </h2>
                </div>
                <Link
                  href="/blog"
                  className="hidden shrink-0 items-center gap-2 text-[0.92rem] font-medium text-[var(--tertiary)] transition-all duration-200 hover:gap-3 sm:inline-flex"
                  aria-label="View all blog posts"
                >
                  All posts
                  <IconArrowRight size={14} stroke={1.8} aria-hidden="true" />
                </Link>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {related.map((item) => (
                <PostCard key={item.slug} post={item} />
              ))}
            </div>

            <div className="mt-8 flex justify-center sm:hidden">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-6 py-2.5 text-[0.88rem] font-medium text-[var(--on-surface-dim)] backdrop-blur-xl transition-all duration-300 hover:text-[var(--on-surface)]"
              >
                View all posts
                <IconArrowRight size={13} stroke={1.8} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        <section
          className="relative z-[1] px-5 py-14 sm:px-8 lg:px-10 lg:py-24"
          aria-label="Start a project"
        >
          <div className="mx-auto max-w-[72rem]">
            <div className="relative overflow-hidden rounded-[1.5rem] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_40%,transparent)] px-6 py-14 text-center shadow-[0_28px_90px_color-mix(in_srgb,var(--bg-deep)_26%,transparent)] backdrop-blur-2xl sm:px-10 lg:px-20 lg:py-20">
              <FinalCtaArtwork />
              <PatternTexture opacity={0.08} />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(to_right,transparent,color-mix(in_srgb,var(--on-surface)_22%,transparent),transparent)]"
              />
              <div className="relative z-[1] mx-auto max-w-2xl">
                <p className="label-caps mb-5 text-[var(--tertiary)]">Ready to build?</p>
                <h2 className="title-serif text-[clamp(2.18rem,4.5vw,3.45rem)] font-normal leading-[1.02] tracking-tight text-[var(--on-surface)]">
                  Let&apos;s design, build, and ship your next product.
                </h2>
                <p className="body-md mx-auto my-8 max-w-lg text-[var(--on-surface-dim)]">
                  Tell us what you&apos;re building. We return a clear brief, fixed timeline, and
                  direct pricing within 48 hours - or match you with a vetted specialist.
                </p>
                <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                  <a
                    href={buildWhatsAppUrl(undefined, { context: `Blog: ${post.title}` })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[2.75rem] items-center justify-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--on-surface)_16%,transparent)] bg-[var(--on-surface)] px-8 py-3 text-[0.92rem] font-medium text-[var(--bg)] shadow-[0_16px_36px_color-mix(in_srgb,var(--bg-deep)_40%,transparent)] transition-all duration-300 hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--tertiary)_40%,transparent)]"
                  >
                    Start a project
                    <IconBrandWhatsapp size={15} stroke={1.8} aria-hidden="true" />
                  </a>
                  <a
                    href={`mailto:${siteConfig.email}`}
                    className="inline-flex min-h-[2.75rem] items-center justify-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--on-surface)_16%,transparent)] bg-[var(--glass-bg)] px-7 py-3 text-[0.92rem] font-medium text-[var(--on-surface)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-px hover:border-[color-mix(in_srgb,var(--on-surface)_36%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--tertiary)_40%,transparent)]"
                  >
                    <IconMail size={14} stroke={1.8} aria-hidden="true" />
                    Email Andishi
                  </a>
                </div>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
                  {[
                    "32+ products shipped",
                    "48h scoping proposal",
                    "30-day post-launch support",
                  ].map((item) => (
                    <span
                      key={item}
                      className="flex items-center gap-1.5 text-[0.74rem] text-[var(--on-surface-dim)]"
                    >
                      <span
                        className="h-1 w-1 rounded-full bg-[var(--tertiary)]"
                        aria-hidden="true"
                      />
                      {item}
                    </span>
                  ))}
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function wordCount(text: string) {
  return text.split(/\s+/).filter(Boolean).length;
}

function PatternTexture({
  className = "",
  opacity = 0.1,
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
          "url(\"data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M16 11.5v9M11.5 16h9' stroke='%23c5b8e8' stroke-width='0.7' stroke-linecap='round' opacity='0.32'/%3E%3C/svg%3E\")",
        backgroundSize: "32px 32px",
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
      className={`relative overflow-hidden rounded-[1.35rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] shadow-[0_24px_70px_color-mix(in_srgb,var(--bg-deep)_22%,transparent)] backdrop-blur-xl ${className}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(to_right,transparent,color-mix(in_srgb,var(--tertiary)_36%,transparent),transparent)]"
      />
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="label-caps mb-5 flex items-center gap-3 text-[var(--tertiary)]">
      <span className="h-px w-6 bg-[var(--tertiary)] opacity-70" aria-hidden="true" />
      {children}
    </p>
  );
}

function ArticleMeta({ post }: { post: BlogPost }) {
  const chips = [
    { icon: IconCalendar, label: formatDate(post.datePublished) },
    { icon: IconClock, label: `${post.readTime} min read` },
    { icon: IconUserCircle, label: post.author.name },
  ] as const;

  return (
    <div className="flex flex-wrap gap-2" role="list" aria-label="Article details">
      {chips.map(({ icon: Icon, label }) => (
        <span
          key={label}
          role="listitem"
          className="inline-flex items-center gap-2 rounded-xl border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--bg)_44%,transparent)] px-3 py-2 text-[0.8rem] text-[var(--on-surface-dim)] backdrop-blur-xl"
        >
          <Icon
            size={13}
            stroke={1.5}
            className="shrink-0 text-[var(--tertiary)]"
            aria-hidden="true"
          />
          {label}
        </span>
      ))}
    </div>
  );
}

function HeroCoverArtifact({ post }: { post: BlogPost }) {
  return (
    <div className="relative aspect-[4/5] max-h-[35rem] overflow-hidden rounded-[1.5rem] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_34%,transparent)] p-4 shadow-[0_24px_70px_color-mix(in_srgb,var(--bg-deep)_28%,transparent)]">
      <PatternTexture opacity={0.08} />
      <div className="relative h-full overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-[var(--surface-high)]">
        <Image
          src={post.coverImage}
          alt={`Cover image for ${post.title}`}
          fill
          priority
          sizes="(min-width: 1280px) 28rem, (min-width: 1024px) 38vw, 100vw"
          className="object-cover brightness-[0.82] saturate-[0.9] transition duration-700 hover:scale-[1.03] hover:brightness-[0.92]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_36%,color-mix(in_srgb,var(--bg-deep)_86%,transparent)_100%)]" />
      </div>

      <div className="absolute left-4 right-4 top-4 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-2 rounded-xl border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--bg)_56%,transparent)] px-3 py-2 text-[0.76rem] font-medium text-[var(--on-surface-dim)] backdrop-blur-xl">
          <IconHash size={14} stroke={1.6} className="text-[var(--tertiary)]" aria-hidden="true" />
          {post.category}
        </span>
        <span className="inline-flex items-center gap-2 rounded-xl border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--bg)_56%,transparent)] px-3 py-2 text-[0.76rem] font-medium text-[var(--on-surface-dim)] backdrop-blur-xl">
          <IconClock size={14} stroke={1.6} className="text-[var(--tertiary)]" aria-hidden="true" />
          {post.readTime} min read
        </span>
      </div>
    </div>
  );
}

function AuthorPanel({ post }: { post: BlogPost }) {
  const shareSubject = encodeURIComponent(post.title);
  const shareBody = encodeURIComponent(`${siteConfig.url}/blog/${post.slug}`);

  return (
    <GlassPanel className="p-5">
      <div className="flex items-center gap-4">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[0.9rem] border border-[var(--glass-border)] bg-[var(--surface-high)]">
          <Image
            src={post.author.avatarUrl}
            alt={post.author.name}
            fill
            sizes="56px"
            className="object-cover"
          />
        </div>
        <div className="min-w-0">
          <p className="text-[0.98rem] font-medium text-[var(--on-surface)]">{post.author.name}</p>
          <p className="mt-1 text-[0.8rem] leading-snug text-[var(--on-surface-dim)]">
            {post.author.role}
          </p>
        </div>
      </div>

      <div className="mt-4 flex gap-2 border-t border-[var(--glass-border)] pt-4">
        <Link
          href="/login"
          className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_32%,transparent)] text-[0.76rem] font-medium text-[var(--on-surface-dim)] transition-all duration-300 hover:border-[color-mix(in_srgb,var(--tertiary)_28%,transparent)] hover:text-[var(--on-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--tertiary)_36%,transparent)]"
        >
          <IconBookmark size={13} stroke={1.6} aria-hidden="true" />
          Save
        </Link>
        <a
          href={`mailto:?subject=${shareSubject}&body=${shareBody}`}
          className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_32%,transparent)] text-[0.76rem] font-medium text-[var(--on-surface-dim)] transition-all duration-300 hover:border-[color-mix(in_srgb,var(--tertiary)_28%,transparent)] hover:text-[var(--on-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--tertiary)_36%,transparent)]"
        >
          <IconShare size={13} stroke={1.6} aria-hidden="true" />
          Share
        </a>
      </div>
    </GlassPanel>
  );
}

function ReadingSignals({ post }: { post: BlogPost }) {
  const words = wordCount(post.body);
  const hasTechnicalSignal = /stack|API|code|latency|production|system|engineer/i.test(post.body);
  const density = words > 650 ? "Deep dive" : words > 320 ? "Medium" : "Quick read";

  return (
    <GlassPanel className="p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--tertiary)]" aria-hidden="true" />
        <p className="label-caps text-[color-mix(in_srgb,var(--on-surface-dim)_58%,transparent)]">
          Reading signals
        </p>
      </div>
      <ul className="grid gap-2.5">
        {[
          { label: "Depth", value: density },
          {
            label: "Words",
            value: `~${Math.max(150, Math.round(words / 50) * 50)}`,
          },
          {
            label: "Signal",
            value: hasTechnicalSignal ? "Technical" : "Strategic",
          },
        ].map((item) => (
          <li
            key={item.label}
            className="flex items-center justify-between rounded-xl border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_30%,transparent)] px-3 py-2.5"
          >
            <span className="text-[0.78rem] text-[var(--on-surface-dim)]">{item.label}</span>
            <span className="font-mono text-[0.74rem] text-[var(--tertiary)]">{item.value}</span>
          </li>
        ))}
      </ul>
    </GlassPanel>
  );
}

function CategoryCard({ post, allPosts }: { post: BlogPost; allPosts: BlogPost[] }) {
  const related = allPosts
    .filter((item) => item.slug !== post.slug && item.category === post.category)
    .slice(0, 2);

  return (
    <GlassPanel className="p-5">
      <p className="label-caps mb-4 text-[color-mix(in_srgb,var(--on-surface-dim)_55%,transparent)]">
        More in {post.category}
      </p>
      <div className="grid gap-2">
        {related.length > 0 ? (
          related.map((item) => (
            <Link
              key={item.slug}
              href={`/blog/${item.slug}`}
              className="group flex items-center gap-3 rounded-xl border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_30%,transparent)] px-3 py-3 text-[0.8rem] text-[var(--on-surface-dim)] transition-all duration-300 hover:border-[color-mix(in_srgb,var(--tertiary)_26%,transparent)] hover:text-[var(--on-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--tertiary)_36%,transparent)]"
            >
              <span className="line-clamp-2 flex-1 leading-snug">{item.title}</span>
              <IconArrowRight
                size={12}
                stroke={1.8}
                className="shrink-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                aria-hidden="true"
              />
            </Link>
          ))
        ) : (
          <Link
            href={`/blog/category/${categorySlug(post.category)}`}
            className="inline-flex items-center gap-2 text-[0.9rem] font-medium text-[var(--tertiary)] transition-all duration-200 hover:gap-3 focus-visible:outline-none"
          >
            Category archive
            <IconArrowRight size={13} stroke={1.8} aria-hidden="true" />
          </Link>
        )}
      </div>
      {related.length > 0 && (
        <Link
          href={`/blog/category/${categorySlug(post.category)}`}
          className="mt-4 flex items-center gap-1.5 border-t border-[var(--glass-border)] pt-4 text-[0.8rem] font-medium text-[var(--tertiary)] transition-all duration-200 hover:gap-2.5 focus-visible:outline-none"
        >
          All in {post.category}
          <IconExternalLink size={12} stroke={1.8} aria-hidden="true" />
        </Link>
      )}
    </GlassPanel>
  );
}

function InlineCta() {
  return (
    <GlassPanel className="overflow-hidden">
      <div
        aria-hidden="true"
        className="h-[2px] w-full bg-[linear-gradient(to_right,transparent,var(--tertiary),var(--primary),transparent)]"
      />
      <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div>
          <SectionEyebrow>Apply this</SectionEyebrow>
          <h2 className="title-serif text-[clamp(1.72rem,3vw,2.15rem)] font-normal leading-[1.1] tracking-tight text-[var(--on-surface)]">
            Turn the insight into your next product.
          </h2>
          <p className="mt-3 text-[0.94rem] leading-relaxed text-[var(--on-surface-dim)]">
            We design, build, and ship - or place a specialist engineer on your team. Share what you
            need.
          </p>
        </div>
        <a
          href={buildWhatsAppUrl(undefined, { context: "Blog" })}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[2.75rem] shrink-0 items-center justify-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--on-surface)_16%,transparent)] bg-[var(--on-surface)] px-7 py-3 text-[0.92rem] font-medium text-[var(--bg)] shadow-[0_16px_36px_color-mix(in_srgb,var(--bg-deep)_38%,transparent)] transition-all duration-300 hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--tertiary)_40%,transparent)]"
        >
          Start a project
          <IconBrandWhatsapp size={14} stroke={1.8} aria-hidden="true" />
        </a>
      </div>
    </GlassPanel>
  );
}
