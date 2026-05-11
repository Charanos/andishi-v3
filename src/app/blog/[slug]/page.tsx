import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  IconArrowLeft,
  IconArrowRight,
  IconBookmark,
  IconCalendar,
  IconCheck,
  IconClock,
  IconExternalLink,
  IconHash,
  IconMail,
  IconQuote,
  IconShare,
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
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [{ url: post.coverImage, width: 1200, height: 630 }],
      type: "article",
    },
  };
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function wordCount(post: BlogPost) {
  return post.body.join(" ").split(/\s+/).filter(Boolean).length;
}

function shortLabel(paragraph: string) {
  const words = paragraph.trim().split(/\s+/).slice(0, 6).join(" ");
  return words.length < paragraph.trim().length ? `${words}...` : words;
}

function firstSentence(text: string) {
  return text.split(/[.!?]/)[0]?.trim() || text.slice(0, 120);
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
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(to_right,transparent,color-mix(in_srgb,var(--secondary)_36%,transparent),transparent)]"
      />
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="label-caps mb-5 flex items-center gap-3 text-[var(--secondary)]">
      <span
        className="h-px w-6 bg-[var(--secondary)] opacity-70"
        aria-hidden="true"
      />
      {children}
    </p>
  );
}

function ScrollProgressBar() {
  return (
    <>
      <div
        id="scroll-progress"
        aria-hidden="true"
        className="fixed inset-x-0 top-0 z-[200] h-[2px] origin-left scale-x-0 bg-[linear-gradient(to_right,var(--secondary),var(--primary))] will-change-transform"
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
(function(){
  var bar = document.getElementById('scroll-progress');
  if (!bar) return;
  function update() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - doc.clientHeight;
    var pct = max > 0 ? doc.scrollTop / max : 0;
    bar.style.transform = 'scaleX(' + Math.min(Math.max(pct, 0), 1) + ')';
  }
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();
          `.trim(),
        }}
      />
    </>
  );
}

function TocScrollScript({ count }: { count: number }) {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
(function(){
  var links = Array.prototype.slice.call(document.querySelectorAll('[data-toc-link]'));
  var sections = [];
  for (var i = 0; i < ${count}; i++) {
    var el = document.getElementById('section-' + (i + 1));
    if (el) sections.push(el);
  }
  function onScroll() {
    var mid = window.scrollY + window.innerHeight * 0.38;
    var active = 0;
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].offsetTop <= mid) active = i;
    }
    links.forEach(function(link, index) {
      var selected = index === active;
      link.setAttribute('data-active', selected ? 'true' : 'false');
      link.style.color = selected ? 'var(--secondary)' : 'var(--on-surface-dim)';
      var bar = link.querySelector('[data-toc-bar]');
      if (bar) bar.style.transform = selected ? 'scaleY(1)' : 'scaleY(0)';
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();
})();
        `.trim(),
      }}
    />
  );
}

function ArticleMeta({ post }: { post: BlogPost }) {
  const chips = [
    { icon: IconCalendar, label: formatDate(post.datePublished) },
    { icon: IconClock, label: `${post.readTime} min read` },
    { icon: IconUserCircle, label: post.author.name },
  ] as const;

  return (
    <div
      className="flex flex-wrap gap-2"
      role="list"
      aria-label="Article details"
    >
      {chips.map(({ icon: Icon, label }) => (
        <span
          key={label}
          role="listitem"
          className="inline-flex items-center gap-2 rounded-xl border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--bg)_44%,transparent)] px-3 py-2 text-[0.8rem] text-[var(--on-surface-dim)] backdrop-blur-xl"
        >
          <Icon
            size={13}
            stroke={1.5}
            className="shrink-0 text-[var(--secondary)]"
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
          <IconHash
            size={14}
            stroke={1.6}
            className="text-[var(--secondary)]"
            aria-hidden="true"
          />
          {post.category}
        </span>
        <span className="inline-flex items-center gap-2 rounded-xl border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--bg)_56%,transparent)] px-3 py-2 text-[0.76rem] font-medium text-[var(--on-surface-dim)] backdrop-blur-xl">
          <IconClock
            size={14}
            stroke={1.6}
            className="text-[var(--secondary)]"
            aria-hidden="true"
          />
          {post.readTime} min read
        </span>
      </div>

      <div className="absolute inset-x-4 bottom-4 grid gap-3">
        <div className="rounded-2xl border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--bg)_60%,transparent)] p-4 backdrop-blur-xl">
          <p className="label-caps mb-3 text-[color-mix(in_srgb,var(--on-surface-dim)_66%,transparent)]">
            Editorial signal
          </p>
          <div className="grid gap-2">
            {["Problem framing", "Production context", "Next action"].map(
              (item, index) => (
                <div
                  key={item}
                  className="grid grid-cols-[1fr_4rem] items-center gap-3"
                >
                  <p className="text-[0.78rem] text-[var(--on-surface-dim)]">
                    {item}
                  </p>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--on-surface)_10%,transparent)]">
                    <div
                      className="h-full rounded-full bg-[var(--secondary)]"
                      style={{ width: `${78 + index * 8}%` }}
                    />
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
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
          <p className="text-[0.98rem] font-medium text-[var(--on-surface)]">
            {post.author.name}
          </p>
          <p className="mt-1 text-[0.8rem] leading-snug text-[var(--on-surface-dim)]">
            {post.author.role}
          </p>
        </div>
      </div>

      <div className="mt-4 flex gap-2 border-t border-[var(--glass-border)] pt-4">
        <Link
          href="/login"
          className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_32%,transparent)] text-[0.76rem] font-medium text-[var(--on-surface-dim)] transition-all duration-300 hover:border-[color-mix(in_srgb,var(--secondary)_28%,transparent)] hover:text-[var(--on-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--secondary)_36%,transparent)]"
        >
          <IconBookmark size={13} stroke={1.6} aria-hidden="true" />
          Save
        </Link>
        <a
          href={`mailto:?subject=${shareSubject}&body=${shareBody}`}
          className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_32%,transparent)] text-[0.76rem] font-medium text-[var(--on-surface-dim)] transition-all duration-300 hover:border-[color-mix(in_srgb,var(--secondary)_28%,transparent)] hover:text-[var(--on-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--secondary)_36%,transparent)]"
        >
          <IconShare size={13} stroke={1.6} aria-hidden="true" />
          Share
        </a>
      </div>
    </GlassPanel>
  );
}

function TocPanel({ post }: { post: BlogPost }) {
  return (
    <GlassPanel className="p-5">
      <div className="mb-4 flex items-center gap-2">
        <IconHash
          size={14}
          stroke={1.6}
          className="text-[var(--secondary)]"
          aria-hidden="true"
        />
        <p className="label-caps text-[color-mix(in_srgb,var(--on-surface-dim)_64%,transparent)]">
          In this article
        </p>
      </div>
      <nav aria-label="Table of contents">
        <ol className="grid gap-1">
          {post.body.map((paragraph, index) => (
            <li key={`${index}-${paragraph.slice(0, 16)}`} className="relative">
              <a
                data-toc-link
                data-active="false"
                href={`#section-${index + 1}`}
                className="relative flex items-center justify-between gap-3 rounded-xl px-3 py-2 pl-4 text-left text-[0.8rem] leading-snug text-[var(--on-surface-dim)] transition-all duration-300 hover:bg-[color-mix(in_srgb,var(--secondary)_6%,transparent)] hover:text-[var(--on-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--secondary)_36%,transparent)]"
              >
                <span
                  data-toc-bar
                  aria-hidden="true"
                  className="absolute bottom-1 left-0 top-1 w-[2px] origin-top scale-y-0 rounded-full bg-[var(--secondary)] transition-transform duration-300"
                />
                <span className="line-clamp-2 flex-1">
                  {shortLabel(paragraph)}
                </span>
                <span className="shrink-0 font-mono text-[0.62rem] text-[color-mix(in_srgb,var(--secondary)_50%,transparent)]">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </GlassPanel>
  );
}

function PullQuote({ text }: { text: string }) {
  return (
    <blockquote className="relative my-1 overflow-hidden rounded-[1.1rem] border border-[color-mix(in_srgb,var(--secondary)_20%,transparent)] bg-[color-mix(in_srgb,var(--secondary)_5%,transparent)] px-5 py-5 sm:px-6">
      <IconQuote
        size={28}
        stroke={1.2}
        className="absolute right-4 top-4 text-[var(--secondary)] opacity-20"
        aria-hidden="true"
      />
      <span
        aria-hidden="true"
        className="absolute bottom-3 left-0 top-3 w-[3px] rounded-r-full bg-[linear-gradient(to_bottom,var(--secondary),var(--primary))]"
      />
      <p className="relative text-[clamp(1.05rem,2vw,1.18rem)] font-normal italic leading-[1.65] tracking-tight text-[var(--on-surface)]">
        &quot;{firstSentence(text)}.&quot;
      </p>
    </blockquote>
  );
}

function TakeawayStrip({ text }: { text: string }) {
  const points = text
    .split(/[.!?]/)
    .map((item) => item.trim())
    .filter((item) => item.length > 20)
    .slice(0, 3);

  return (
    <div className="my-1 overflow-hidden rounded-[1.1rem] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_32%,transparent)] backdrop-blur-xl">
      <div className="flex items-center gap-2 border-b border-[var(--glass-border)] px-5 py-3">
        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[color-mix(in_srgb,var(--tertiary)_14%,transparent)] text-[var(--tertiary)]">
          <IconCheck size={11} stroke={2.5} aria-hidden="true" />
        </span>
        <p className="label-caps text-[color-mix(in_srgb,var(--on-surface-dim)_58%,transparent)]">
          Key takeaways
        </p>
      </div>
      <ul className="grid divide-y divide-[var(--glass-border)]">
        {points.map((point, index) => (
          <li
            key={`${index}-${point.slice(0, 14)}`}
            className="flex items-start gap-3 px-5 py-3.5"
          >
            <span className="mt-1 shrink-0 font-mono text-[0.65rem] text-[var(--tertiary)]">
              {String(index + 1).padStart(2, "0")}
            </span>
            <p className="text-[0.9rem] leading-relaxed text-[var(--on-surface-dim)]">
              {point}.
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ArticleBody({ post }: { post: BlogPost }) {
  const mid = Math.floor(post.body.length / 2);

  return (
    <div className="grid gap-8">
      {post.body.map((paragraph, index) => (
        <section
          key={`${index}-${paragraph.slice(0, 16)}`}
          id={`section-${index + 1}`}
          className="scroll-mt-32"
          aria-label={`Section ${index + 1}`}
        >
          <div className="mb-4 flex items-center gap-3">
            <span
              className="h-px flex-1 bg-[var(--glass-border)]"
              aria-hidden="true"
            />
            <span className="font-mono text-[0.68rem] text-[color-mix(in_srgb,var(--secondary)_58%,transparent)]">
              {String(index + 1).padStart(2, "0")}
            </span>
          </div>
          <p className="text-[clamp(1.04rem,2vw,1.15rem)] font-medium leading-[1.88] text-[var(--on-surface-dim)]">
            {paragraph}
          </p>
          {index > 0 && index < post.body.length - 1 && index % 2 === 0 && (
            <div className="mt-6">
              <PullQuote text={paragraph} />
            </div>
          )}
          {index === mid && (
            <div className="mt-6">
              <TakeawayStrip text={paragraph} />
            </div>
          )}
        </section>
      ))}
    </div>
  );
}

function ReadingSignals({ post }: { post: BlogPost }) {
  const words = wordCount(post);
  const hasTechnicalSignal = post.body.some((paragraph) =>
    /stack|API|code|latency|production|system|engineer/i.test(paragraph),
  );
  const density =
    words > 650 ? "Deep dive" : words > 320 ? "Medium" : "Quick read";

  return (
    <GlassPanel className="p-5">
      <div className="mb-4 flex items-center gap-2">
        <span
          className="h-1.5 w-1.5 rounded-full bg-[var(--tertiary)]"
          aria-hidden="true"
        />
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
            <span className="text-[0.78rem] text-[var(--on-surface-dim)]">
              {item.label}
            </span>
            <span className="font-mono text-[0.74rem] text-[var(--secondary)]">
              {item.value}
            </span>
          </li>
        ))}
      </ul>
    </GlassPanel>
  );
}

function CategoryCard({ post }: { post: BlogPost }) {
  const related = blogPosts
    .filter(
      (item) => item.slug !== post.slug && item.category === post.category,
    )
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
              className="group flex items-center gap-3 rounded-xl border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_30%,transparent)] px-3 py-3 text-[0.8rem] text-[var(--on-surface-dim)] transition-all duration-300 hover:border-[color-mix(in_srgb,var(--secondary)_26%,transparent)] hover:text-[var(--on-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--secondary)_36%,transparent)]"
            >
              <span className="line-clamp-2 flex-1 leading-snug">
                {item.title}
              </span>
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
            className="inline-flex items-center gap-2 text-[0.9rem] font-medium text-[var(--secondary)] transition-all duration-200 hover:gap-3 focus-visible:outline-none"
          >
            Category archive
            <IconArrowRight size={13} stroke={1.8} aria-hidden="true" />
          </Link>
        )}
      </div>
      {related.length > 0 && (
        <Link
          href={`/blog/category/${categorySlug(post.category)}`}
          className="mt-4 flex items-center gap-1.5 border-t border-[var(--glass-border)] pt-4 text-[0.8rem] font-medium text-[var(--secondary)] transition-all duration-200 hover:gap-2.5 focus-visible:outline-none"
        >
          All in {post.category}
          <IconExternalLink size={12} stroke={1.8} aria-hidden="true" />
        </Link>
      )}
    </GlassPanel>
  );
}

function EditorialNotes() {
  return (
    <GlassPanel className="p-5">
      <p className="label-caps mb-4 text-[color-mix(in_srgb,var(--on-surface-dim)_55%,transparent)]">
        Editorial notes
      </p>
      <ul className="grid gap-2">
        {[
          "Specific problem framing over buzzwords",
          "Production context, not whiteboard theory",
          "Clear ownership and next action",
        ].map((item) => (
          <li
            key={item}
            className="flex items-start gap-2.5 text-[0.82rem] leading-relaxed text-[var(--on-surface-dim)]"
          >
            <span className="mt-1 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-[color-mix(in_srgb,var(--tertiary)_14%,transparent)] text-[var(--tertiary)]">
              <IconCheck size={9} stroke={2.8} aria-hidden="true" />
            </span>
            {item}
          </li>
        ))}
      </ul>
    </GlassPanel>
  );
}

function InlineCta() {
  return (
    <GlassPanel className="overflow-hidden">
      <div
        aria-hidden="true"
        className="h-[2px] w-full bg-[linear-gradient(to_right,var(--secondary),var(--primary),var(--tertiary))]"
      />
      <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div>
          <SectionEyebrow>Apply this</SectionEyebrow>
          <h2 className="text-[clamp(1.55rem,3.5vw,2.25rem)] font-normal leading-[1.1] tracking-tight text-[var(--on-surface)]">
            Turn the insight into a sharper brief.
          </h2>
          <p className="mt-3 text-[0.94rem] leading-relaxed text-[var(--on-surface-dim)]">
            The fastest path from this guidance to a matched engineer is a brief
            that names ownership, stack, timezone, and timeline.
          </p>
        </div>
        <Link
          href="/start-project"
          className="inline-flex min-h-[2.75rem] shrink-0 items-center justify-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--on-surface)_16%,transparent)] bg-[var(--on-surface)] px-7 py-3 text-[0.92rem] font-medium text-[var(--bg)] shadow-[0_16px_36px_color-mix(in_srgb,var(--bg-deep)_38%,transparent)] transition-all duration-300 hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--secondary)_40%,transparent)]"
        >
          Start hiring
          <IconArrowRight size={14} stroke={2} aria-hidden="true" />
        </Link>
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
    publisher: {
      "@type": "Organization",
      name: "Andishi",
      url: siteConfig.url,
    },
    mainEntityOfPage: `${siteConfig.url}/blog/${post.slug}`,
    wordCount: wordCount(post),
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
      <ScrollProgressBar />

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
          <div className="mx-auto max-w-[96rem]">
            <Link
              href="/blog"
              className="mb-10 inline-flex items-center gap-2 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-2 text-[0.84rem] font-medium text-[var(--on-surface-dim)] backdrop-blur-xl transition-all duration-300 hover:-translate-x-0.5 hover:text-[var(--on-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--secondary)_36%,transparent)]"
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
                  <p className="label-caps mb-4 text-[var(--primary)]">
                    Field note
                  </p>
                  <h1 className="max-w-[12ch] text-[clamp(3rem,9vw,5.8rem)] font-normal leading-[0.94] tracking-tight text-[var(--on-surface)]">
                    {post.title}
                  </h1>
                  <div className="mt-7 max-w-2xl space-y-5">
                    <p className="body-md text-[var(--on-surface-dim)]">
                      {post.excerpt}
                    </p>
                    <blockquote className="border-l border-[color-mix(in_srgb,var(--secondary)_44%,transparent)] pl-5 text-[clamp(1.18rem,2.4vw,1.55rem)] font-normal leading-snug text-[var(--on-surface)]">
                      {firstSentence(post.body[0])}.
                    </blockquote>
                  </div>
                  <div className="mt-8">
                    <ArticleMeta post={post} />
                  </div>
                </div>

                <div className="mt-8 grid overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] sm:grid-cols-3">
                  {[
                    [`${post.readTime}m`, "Read time"],
                    [
                      `~${Math.max(150, Math.round(wordCount(post) / 50) * 50)}`,
                      "Words",
                    ],
                    [
                      String(new Date(post.datePublished).getFullYear()),
                      "Published",
                    ],
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

            <div className="mt-10 grid gap-7 xl:grid-cols-[17rem_minmax(0,1fr)_17rem]">
              <aside
                className="grid gap-5 self-start xl:sticky xl:top-28"
                aria-label="Article sidebar"
              >
                <AuthorPanel post={post} />
                <TocPanel post={post} />
              </aside>

              <div className="grid min-w-0 gap-6">
                <GlassPanel className="p-6 sm:p-8">
                  <div className="mb-7 flex items-start gap-4 border-b border-[var(--glass-border)] pb-7">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-[color-mix(in_srgb,var(--secondary)_24%,transparent)] bg-[color-mix(in_srgb,var(--secondary)_9%,transparent)] text-[var(--secondary)]">
                      <IconQuote size={20} stroke={1.5} aria-hidden="true" />
                    </span>
                    <p className="text-[clamp(1.15rem,2.5vw,1.55rem)] font-normal leading-[1.3] tracking-tight text-[var(--on-surface)]">
                      {post.excerpt}
                    </p>
                  </div>
                  <ArticleBody post={post} />
                </GlassPanel>

                <InlineCta />
              </div>

              <aside
                className="grid gap-5 self-start xl:sticky xl:top-28"
                aria-label="Supplementary article info"
              >
                <ReadingSignals post={post} />
                <CategoryCard post={post} />
                {/* <EditorialNotes /> */}
              </aside>
            </div>
          </div>
        </article>

        <TocScrollScript count={post.body.length} />

        <section
          className="relative z-[1] px-5 py-14 sm:px-8 lg:px-10 lg:py-20"
          aria-label="Related posts"
        >
          <div className="mx-auto max-w-[96rem]">
            <div className="mb-10 border-b border-[var(--glass-border)] pb-8">
              <div className="flex items-end justify-between gap-6">
                <div>
                  <SectionEyebrow>Keep reading</SectionEyebrow>
                  <h2 className="text-[clamp(2rem,6vw,3.6rem)] font-normal leading-[1.02] tracking-tight text-[var(--on-surface)]">
                    Related field notes.
                  </h2>
                </div>
                <Link
                  href="/blog"
                  className="hidden shrink-0 items-center gap-2 text-[0.92rem] font-medium text-[var(--secondary)] transition-all duration-200 hover:gap-3 sm:inline-flex"
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
          aria-label="Start hiring call to action"
        >
          <div className="mx-auto max-w-[96rem]">
            <div className="relative overflow-hidden rounded-[1.5rem] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_40%,transparent)] px-6 py-14 text-center shadow-[0_28px_90px_color-mix(in_srgb,var(--bg-deep)_26%,transparent)] backdrop-blur-2xl sm:px-10 lg:px-20 lg:py-20">
              <FinalCtaArtwork />
              <PatternTexture opacity={0.08} />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(to_right,transparent,color-mix(in_srgb,var(--on-surface)_22%,transparent),transparent)]"
              />
              <div className="relative z-[1] mx-auto max-w-2xl">
                <p className="label-caps mb-5 text-[var(--secondary)]">
                  Need senior signal?
                </p>
                <h2 className="text-[clamp(2rem,6vw,3.8rem)] font-normal leading-[1.02] tracking-tight text-[var(--on-surface)]">
                  Convert what you learned into a sharper match.
                </h2>
                <p className="body-md mx-auto mt-5 max-w-lg text-[var(--on-surface-dim)]">
                  Send the problem, stack, ownership gap, and timeline. Andishi
                  translates it into a shortlist of vetted senior engineers in
                  eight days.
                </p>
                <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                  <Link
                    href="/start-project"
                    className="inline-flex min-h-[2.75rem] items-center justify-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--on-surface)_16%,transparent)] bg-[var(--on-surface)] px-8 py-3 text-[0.92rem] font-medium text-[var(--bg)] shadow-[0_16px_36px_color-mix(in_srgb,var(--bg-deep)_40%,transparent)] transition-all duration-300 hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--secondary)_40%,transparent)]"
                  >
                    Start hiring
                    <IconArrowRight size={15} stroke={2} aria-hidden="true" />
                  </Link>
                  <a
                    href={`mailto:${siteConfig.email}`}
                    className="inline-flex min-h-[2.75rem] items-center justify-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--on-surface)_16%,transparent)] bg-[var(--glass-bg)] px-7 py-3 text-[0.92rem] font-medium text-[var(--on-surface)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-px hover:border-[color-mix(in_srgb,var(--on-surface)_36%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--secondary)_40%,transparent)]"
                  >
                    <IconMail size={14} stroke={1.8} aria-hidden="true" />
                    Email Andishi
                  </a>
                </div>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
                  {[
                    "Senior-only talent",
                    "8-day first profiles",
                    "30-day guarantee",
                  ].map((item) => (
                    <span
                      key={item}
                      className="flex items-center gap-1.5 text-[0.74rem] text-[var(--on-surface-dim)]"
                    >
                      <span
                        className="h-1 w-1 rounded-full bg-[var(--secondary)]"
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
