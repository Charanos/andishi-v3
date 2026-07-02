"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { IconArrowRight } from "@tabler/icons-react";
import { PublicPageShell, RouteHero, SectionBlock } from "@/components/marketing/public-page";
import { PostCard } from "@/components/marketing/post-card";
import { BlogPost, getBlogPosts, blogCategories, categorySlug } from "@/data/blog";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function BlogPageExperience() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;

  useEffect(() => {
    // Client-side initialization to avoid hydration mismatch (deferred asynchronously to prevent cascading renders)
    const frameId = requestAnimationFrame(() => {
      setPosts(getBlogPosts().filter((p) => p.status === "published"));
      setMounted(true);
    });

    const loadPosts = () => {
      setPosts(getBlogPosts().filter((p) => p.status === "published"));
    };

    window.addEventListener("blog_posts_updated", loadPosts);
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("blog_posts_updated", loadPosts);
    };
  }, []);

  useGSAP(
    () => {
      if (!mounted) return;

      // Animate featured card
      gsap.fromTo(
        ".featured-post-anim",
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.65,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".featured-post-anim",
            start: "top 88%",
            once: true,
          },
        }
      );

      // Animate grid cards
      const cards = gsap.utils.toArray(".blog-post-card-anim");
      if (cards.length > 0) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 16 },
          {
            opacity: 1,
            y: 0,
            duration: 0.55,
            stagger: 0.08,
            ease: "power2.out",
            scrollTrigger: {
              trigger: ".blog-grid-container",
              start: "top 88%",
              once: true,
            },
          }
        );
      }
    },
    { dependencies: [posts, mounted], scope: containerRef }
  );

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
      <div ref={containerRef}>
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
              className="featured-post-anim group grid overflow-hidden rounded-[1.4rem] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_38%,transparent)] shadow-[0_24px_80px_color-mix(in_srgb,var(--bg-deep)_24%,transparent)] backdrop-blur-2xl lg:grid-cols-[1.05fr_0.95fr] transition-all duration-300 hover:border-[var(--primary-dim)]"
              style={{ willChange: "transform, opacity" }}
            >
              <div className="relative min-h-72 overflow-hidden">
                <Image
                  src={featured.coverImage}
                  alt={featured.title}
                  fill
                  sizes="(min-width: 1024px) 48rem, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  priority
                />
                {/* Elegant overlapping glass outlines */}
                <div
                  aria-hidden="true"
                  className="absolute -left-6 -top-6 h-24 w-36 rotate-[-8deg] rounded-[1.8rem] border border-white/20 opacity-50 pointer-events-none z-10 hidden sm:block"
                />
                <div
                  aria-hidden="true"
                  className="absolute -left-10 -top-2 h-28 w-44 rotate-[10deg] rounded-[2rem] border border-white/10 opacity-40 pointer-events-none z-10 hidden sm:block"
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
          {!mounted ? (
            <div className="grid gap-6 md:grid-cols-3">
              {[1, 2, 3].map((id) => (
                <div key={id} className="relative flex flex-col overflow-hidden rounded-[1.2rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-6 shadow-sm animate-pulse">
                  <div className="h-44 w-full rounded-xl bg-[color-mix(in_srgb,var(--on-surface)_10%,transparent)] mb-4" />
                  <div className="h-4 w-16 rounded bg-[color-mix(in_srgb,var(--on-surface)_8%,transparent)] mb-3" />
                  <div className="h-6 w-3/4 rounded bg-[color-mix(in_srgb,var(--on-surface)_12%,transparent)] mb-2" />
                  <div className="h-4 w-full rounded bg-[color-mix(in_srgb,var(--on-surface)_8%,transparent)] mb-2" />
                  <div className="h-4 w-4/6 rounded bg-[color-mix(in_srgb,var(--on-surface)_8%,transparent)]" />
                </div>
              ))}
            </div>
          ) : rest.length === 0 ? (
            <div className="py-12 text-center rounded-[1.2rem] border border-dashed border-[var(--glass-border)] bg-[var(--glass-bg)]">
              <p className="text-[var(--on-surface-dim)] opacity-70">
                No other articles published yet.
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-3 blog-grid-container">
                {paginatedRest.map((post) => (
                  <div key={post.slug} className="blog-post-card-anim" style={{ willChange: "transform, opacity" }}>
                    <PostCard post={post} />
                  </div>
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
      </div>
    </PublicPageShell>
  );
}
