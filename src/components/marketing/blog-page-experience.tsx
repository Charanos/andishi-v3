"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { IconArrowRight } from "@tabler/icons-react";
import { PublicPageShell, RouteHero, SectionBlock } from "@/components/marketing/public-page";
import { PostCard } from "@/components/marketing/post-card";
import { BlogPost, getBlogPosts, blogCategories, categorySlug } from "@/data/blog";

export function BlogPageExperience() {
  const [posts, setPosts] = useState<BlogPost[]>(() => {
    if (typeof window === "undefined") return [];
    return getBlogPosts().filter((p) => p.status === "published");
  });

  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;

  const loadPosts = () => {
    setPosts(getBlogPosts().filter((p) => p.status === "published"));
  };

  useEffect(() => {
    window.addEventListener("blog_posts_updated", loadPosts);
    return () => {
      window.removeEventListener("blog_posts_updated", loadPosts);
    };
  }, []);

  const featured = posts.find((post) => post.featured) ?? posts[0];
  const rest = posts.filter((post) => featured && post.slug !== featured.slug);
  const totalPages = Math.ceil(rest.length / postsPerPage);

  // Reset to page 1 whenever the post list changes size (e.g. after a
  // create/delete) - adjusted during render rather than via an Effect,
  // since this is following posts.length changing, not synchronizing
  // with an external system.
  const [syncedPostsLength, setSyncedPostsLength] = useState(posts.length);
  if (posts.length !== syncedPostsLength) {
    setSyncedPostsLength(posts.length);
    setCurrentPage(1);
  }

  const paginatedRest = rest.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage);

  return (
    <PublicPageShell>
      <RouteHero
        eyebrow="Blog"
        title="Hiring and engineering notes from Andishi."
        body="Practical writing for startup teams hiring senior engineers, building remote teams, and moving from technical ambiguity to shipped product."
        primary={{ href: "/hire", label: "How hiring works" }}
        secondary={{ href: "/engineers", label: "Browse engineers" }}
      />

      {featured && (
        <SectionBlock title="Featured post.">
          <Link
            href={`/blog/${featured.slug}`}
            className="group grid overflow-hidden rounded-[1.4rem] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_38%,transparent)] shadow-[0_24px_80px_color-mix(in_srgb,var(--bg-deep)_24%,transparent)] backdrop-blur-2xl lg:grid-cols-[1.05fr_0.95fr] transition-all duration-300 hover:border-[var(--primary-dim)]"
          >
            <div className="relative min-h-72">
              <Image
                src={featured.coverImage}
                alt={featured.title}
                fill
                sizes="(min-width: 1024px) 48rem, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                priority
                unoptimized
              />
            </div>
            <div className="p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
              <p className="label-caps text-[var(--secondary)]">{featured.category}</p>
              <h2 className="title-serif my-8 text-[clamp(1.95rem,4vw,3rem)] font-normal leading-[1.1] tracking-tight text-[var(--on-surface)]">
                {featured.title}
              </h2>
              <p className="body-md my-8 text-[var(--on-surface-dim)] font-light leading-relaxed">
                {featured.excerpt}
              </p>
              <p className="mt-7 inline-flex items-center gap-2 text-[0.95rem] font-medium text-[var(--secondary)]">
                Read
                <IconArrowRight size={16} stroke={1.8} />
              </p>
            </div>
          </Link>
        </SectionBlock>
      )}

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
        {rest.length === 0 ? (
          <div className="py-12 text-center rounded-[1.2rem] border border-dashed border-[var(--glass-border)] bg-[var(--glass-bg)]">
            <p className="text-[var(--on-surface-dim)] opacity-70">
              No other articles published yet.
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-3">
              {paginatedRest.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-12 flex justify-center items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--on-surface)] transition-all hover:bg-[color-mix(in_srgb,var(--on-surface)_5%,transparent)] disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
                >
                  <span className="sr-only">Previous page</span>
                  &larr;
                </button>
                <span className="font-mono text-[0.8rem] text-[var(--on-surface-dim)] font-medium">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--on-surface)] transition-all hover:bg-[color-mix(in_srgb,var(--on-surface)_5%,transparent)] disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
                >
                  <span className="sr-only">Next page</span>
                  &rarr;
                </button>
              </div>
            )}
          </>
        )}
      </SectionBlock>
    </PublicPageShell>
  );
}
