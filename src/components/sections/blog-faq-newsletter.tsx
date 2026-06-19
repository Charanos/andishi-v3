"use client";

import {
  IconArrowRight,
  IconCheck,
  IconExternalLink,
  IconPlus,
} from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState, useRef } from "react";
import { faqItems } from "@/content/landing";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const textureStyle = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg width='34' height='34' viewBox='0 0 34 34' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M17 11v12M11 17h12' stroke='%23c5b8e8' stroke-width='0.65' stroke-linecap='round' opacity='0.22'/%3E%3Cpath d='M4 4h4M26 30h4' stroke='%23c5b8e8' stroke-width='0.55' stroke-linecap='round' opacity='0.16'/%3E%3C/svg%3E\"), radial-gradient(circle, color-mix(in srgb, var(--on-surface) 16%, transparent) 0 1px, transparent 1.8px)",
  backgroundPosition: "0 0, 17px 17px",
  backgroundSize: "34px 34px, 34px 34px",
};

const tickerItems = [
  "African Tech Talent",
  "Senior Engineers",
  "AI Integration",
  "AWS Engineers",
  "Web3 Talent",
  "Startup Hiring",
  "Team Extension",
  "Vetting Notes",
  "Engineer Spotlights",
  "Backend Systems",
  "Remote Engineering",
  "Production Proof",
];

const articles = [
  {
    title: "How to vet senior African engineers for startup teams",
    excerpt:
      "What to check beyond the CV: production ownership, references, code depth, communication habits, and timezone fit.",
    tag: "Hiring",
    date: "May 2026",
    read: "8 min",
    image: "/images/blog-image-1.jpg",
    hero: true,
    slug: "what-vetting-should-prove",
  },
  {
    title: "Why African engineers are underpriced in global hiring",
    excerpt:
      "The arbitrage global startups miss: senior production talent, English fluency, and strong Europe overlap.",
    tag: "Point of View",
    date: "Apr 2026",
    read: "5 min",
    image: "/images/blog-image-2.jpg",
    slug: "why-africa-is-a-strong-timezone-for-startups",
  },
  {
    title: "What a strong AI integration engineer actually does",
    excerpt:
      "LLM APIs are the easy part. Retrieval, evaluation, cost control, security, and product fit are where seniority shows.",
    tag: "AI Talent",
    date: "Mar 2026",
    read: "6 min",
    image: "/images/blog-image-6.jpeg",
    slug: "production-ai-needs-product-engineers",
  },
];

const topics = [
  "Senior Engineers",
  "AI Integration",
  "AWS Talent",
  "Web3 Engineers",
  "Team Extension",
  "Vetting",
  "African Tech Talent",
];

function BlogTicker() {
  const items = [...tickerItems, ...tickerItems];
  const container = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!track.current) return;
    
    gsap.to(track.current, {
      xPercent: -50,
      ease: "none",
      duration: 20,
      repeat: -1,
    });
  }, { scope: container });

  return (
    <div ref={container} className="relative overflow-hidden border-y border-[color-mix(in_srgb,var(--on-surface)_10%,transparent)] py-3">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-24 bg-[linear-gradient(to_right,var(--bg),transparent)]" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-24 bg-[linear-gradient(to_left,var(--bg),transparent)]" />
      <div ref={track} className="blog-ticker-track flex w-max">
        {items.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="inline-flex items-center gap-2 whitespace-nowrap px-5 text-[0.74rem] font-medium uppercase tracking-[0.08em] text-[color-mix(in_srgb,var(--on-surface-dim)_62%,transparent)]"
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{
                backgroundColor:
                  index % 2 === 0
                    ? "color-mix(in srgb, var(--on-surface) 30%, transparent)"
                    : "color-mix(in srgb, var(--on-surface) 10%, transparent)",
              }}
            />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function ArticleCard({
  article,
}: {
  article: (typeof articles)[number];
}) {
  return (
    <Link
      href={`/blog/${article.slug}`}
      className={`article-card-anim group relative flex overflow-hidden rounded-[1.75rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] shadow-[var(--glass-inner-shadow)] backdrop-blur-md transition-all duration-500 hover:-translate-y-1.5 hover:border-[color-mix(in_srgb,var(--on-surface)_15%,transparent)] hover:shadow-[0_24px_50px_rgba(0,0,0,0.08)] ${
        article.hero ? "flex-col lg:flex-row col-span-full" : "flex-col"
      }`}
    >
      <div
        className={`relative overflow-hidden shrink-0 ${
          article.hero ? "h-64 lg:h-auto lg:w-[50%]" : "h-56"
        }`}
      >
        <Image
          src={article.image}
          alt=""
          fill
          sizes={article.hero ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 33vw, 100vw"}
          className="object-cover saturate-[0.8] transition-transform duration-700 ease-out group-hover:scale-[1.03] group-hover:saturate-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)]/60 via-transparent to-transparent opacity-80" />
      </div>

      <div className={`relative flex flex-col ${article.hero ? "p-8 lg:p-14 lg:w-[50%] justify-center" : "p-6 lg:p-8 flex-1"}`}>
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <span className="rounded-lg border border-[color-mix(in_srgb,var(--on-surface)_12%,transparent)] bg-[color-mix(in_srgb,var(--on-surface)_4%,transparent)] px-3 py-1.5 text-[0.68rem] font-medium uppercase tracking-[0.1em] text-[var(--on-surface)] shadow-sm">
            {article.tag}
          </span>
          <span className="font-mono text-[0.7rem] tracking-tight text-[var(--on-surface-dim)]">
            {article.date}
          </span>
          <span className="ml-auto text-[0.7rem] text-[var(--on-surface-dim)]">
            {article.read}
          </span>
        </div>

        <h3
          className={`font-medium leading-tight text-[var(--on-surface)] transition-opacity duration-300 group-hover:opacity-75 ${
            article.hero
              ? "text-[1.8rem] sm:text-[2.2rem] lg:text-[2.4rem] tracking-tight mb-4"
              : "text-[1.35rem] mb-3"
          }`}
        >
          {article.title}
        </h3>
        <p className={`leading-[1.75] text-[var(--on-surface-dim)] ${article.hero ? "text-[1.05rem]" : "text-[0.95rem] line-clamp-3"}`}>
          {article.excerpt}
        </p>

        {article.hero && (
          <div className="mt-8 border-t border-[color-mix(in_srgb,var(--on-surface)_10%,transparent)] pt-6 hidden sm:block">
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ["01", "Production ownership"],
                ["02", "Reference checks"],
                ["03", "Timezone fit"],
              ].map(([num, item]) => (
                <div key={item}>
                  <p className="font-mono text-[0.66rem] tracking-tight text-[color-mix(in_srgb,var(--on-surface-dim)_54%,transparent)] mb-1">
                    {num}
                  </p>
                  <p className="text-[0.88rem] font-medium leading-snug text-[var(--on-surface)]">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={`mt-auto pt-8 flex items-center gap-3 ${article.hero ? "mt-10" : ""}`}>
          <span className="grid h-9 w-9 place-items-center rounded-[0.6rem] bg-[color-mix(in_srgb,var(--on-surface)_8%,transparent)] border border-[color-mix(in_srgb,var(--on-surface)_12%,transparent)] font-mono text-[0.75rem] font-bold text-[var(--on-surface)]">
            A
          </span>
          <span className="text-[0.88rem] font-medium text-[var(--on-surface-dim)]">
            Andishi Talent
          </span>
          <span className="ml-auto grid h-9 w-9 place-items-center rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--on-surface-dim)] transition-transform duration-300 group-hover:rotate-45 group-hover:text-[var(--on-surface)] group-hover:bg-[color-mix(in_srgb,var(--on-surface)_8%,transparent)]">
            <IconExternalLink size={15} stroke={1.6} />
          </span>
        </div>
      </div>
    </Link>
  );
}

function BlogSection() {
  const container = useRef<HTMLElement>(null);

  useGSAP(() => {
    const cards = gsap.utils.toArray(".article-card-anim");
    
    if (cards.length > 0) {
      gsap.fromTo(
        cards,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: cards[0] as Element,
            start: "top 85%",
          },
        }
      );
    }
  }, { scope: container });

  return (
    <section ref={container} className="relative isolate overflow-hidden bg-[var(--bg)] pb-16 sm:pb-24 lg:pb-32 pt-10">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.08]" style={textureStyle} />
      <BlogTicker />

      <div className="relative z-[1] mt-16 px-5 sm:mt-24 sm:px-8 lg:mt-28 lg:px-10">
        <div className="mx-auto max-w-[92rem]">
          <div className="mb-14 flex flex-col items-center text-center">
            <p className="label-caps mb-5 flex items-center gap-3 text-[var(--tertiary)]">
              <span className="h-px w-7 bg-[var(--tertiary)]" />
              From the talent desk
              <span className="h-px w-7 bg-[var(--tertiary)]" />
            </p>
            <h2 className="title-serif max-w-[20ch] text-[clamp(2.75rem,5vw,4.5rem)] font-normal leading-[0.96] tracking-tight text-[var(--on-surface)]">
              Hiring notes. Talent proof. Startup context.
            </h2>
          </div>

          <div className="grid gap-6 lg:gap-8 lg:grid-cols-2">
            <ArticleCard article={articles[0]} />
            {articles.slice(1).map((article) => (
              <ArticleCard
                key={article.title}
                article={article}
              />
            ))}
          </div>

          <div className="mt-16 flex justify-center">
            <Link
              href="/work"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--on-surface)_15%,transparent)] bg-[color-mix(in_srgb,var(--surface)_50%,transparent)] px-8 py-3.5 text-[0.92rem] font-medium text-[var(--on-surface)] shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-[color-mix(in_srgb,var(--on-surface)_30%,transparent)] hover:shadow-md"
            >
              Browse all articles
              <IconArrowRight size={16} stroke={1.7} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function FaqNewsletterSection() {
  const [openIndex, setOpenIndex] = useState(0);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const container = useRef<HTMLElement>(null);

  useGSAP(() => {
    const faqItems = gsap.utils.toArray(".faq-item-anim");
    if (faqItems.length > 0) {
      gsap.fromTo(
        faqItems,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: faqItems[0] as Element,
            start: "top 85%",
          },
        }
      );
    }

    const newsletter = document.querySelector(".newsletter-anim");
    if (newsletter) {
      gsap.fromTo(
        newsletter,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: newsletter,
            start: "top 85%",
          },
        }
      );
    }
  }, { scope: container });

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.includes("@")) {
      setError("Invalid email address. Try again.");
      return;
    }

    setError("");
    setSubscribed(true);
  };

  return (
    <section
      ref={container}
      id="faq"
      className="relative isolate border-t border-[color-mix(in_srgb,var(--on-surface)_10%,transparent)] bg-[color-mix(in_srgb,var(--bg-deep)_42%,var(--bg))]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={textureStyle}
      />
      <div className="relative z-[1] px-5 sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-[92rem] lg:grid-cols-2">
          {/* FAQ Column */}
          <div className="border-[color-mix(in_srgb,var(--on-surface)_10%,transparent)] py-16 sm:py-20 lg:border-r lg:py-24 lg:pr-14">
            <p className="label-caps mb-5 flex items-center gap-3 text-[var(--tertiary)]">
              <span className="h-px w-7 bg-[var(--tertiary)]" />
              Common questions
            </p>
            <h2 className="title-serif max-w-full text-[clamp(2.3rem,4.3vw,3.35rem)] font-normal leading-[0.98] tracking-tight text-[var(--on-surface)]">
              Everything you want to ask.
            </h2>
            <p className="body-md my-8 text-[0.98rem] leading-[1.75] text-[var(--on-surface-dim)]">
              Honest answers before we ever match profiles.
            </p>

            <div className="mt-10 divide-y divide-[color-mix(in_srgb,var(--on-surface)_10%,transparent)] border-y border-[color-mix(in_srgb,var(--on-surface)_10%,transparent)]">
              {faqItems.slice(0, 5).map((item, index) => {
                const isOpen = openIndex === index;

                return (
                  <article key={item.q} className="faq-item-anim relative group">
                    <button
                      type="button"
                      onClick={() => setOpenIndex(isOpen ? -1 : index)}
                      className="flex w-full items-center gap-4 py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--on-surface)_40%,transparent)] sm:py-6"
                      aria-expanded={isOpen}
                    >
                      <span
                        className="font-mono text-[0.72rem] tracking-tight transition-colors duration-300"
                        style={{
                          color: isOpen
                            ? "var(--on-surface)"
                            : "color-mix(in srgb, var(--on-surface-dim) 52%, transparent)",
                        }}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span
                        className="flex-1 text-[1.02rem] font-medium leading-snug transition-colors duration-300 sm:text-[1.08rem]"
                        style={{
                          color: isOpen
                            ? "var(--on-surface)"
                            : "var(--on-surface-dim)",
                        }}
                      >
                        {item.q}
                      </span>
                      <span
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-all duration-300"
                        style={{
                          borderColor: isOpen
                            ? "color-mix(in srgb, var(--on-surface) 28%, transparent)"
                            : "var(--glass-border)",
                          backgroundColor: isOpen
                            ? "color-mix(in srgb, var(--on-surface) 6%, transparent)"
                            : "var(--glass-bg)",
                          color: isOpen
                            ? "var(--on-surface)"
                            : "color-mix(in srgb, var(--on-surface-dim) 62%, transparent)",
                          transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                        }}
                      >
                        <IconPlus size={15} stroke={1.7} />
                      </span>
                    </button>
                    <div
                      className="overflow-hidden pl-10 transition-all duration-500"
                      style={{
                        maxHeight: isOpen ? 260 : 0,
                        opacity: isOpen ? 1 : 0,
                      }}
                    >
                      <p className="pb-5 text-[0.94rem] leading-[1.8] text-[var(--on-surface-dim)] sm:pb-6">
                        {item.a}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          {/* Newsletter Column */}
          <div className="border-t border-[color-mix(in_srgb,var(--on-surface)_10%,transparent)] py-16 sm:py-20 lg:border-t-0 lg:py-24 lg:pl-14">
            <p className="label-caps mb-5 flex items-center gap-3 text-[var(--tertiary)]">
              <span className="h-px w-7 bg-[var(--tertiary)]" />
              Stay in the loop
            </p>
            <h2 className="title-serif max-w-full text-[clamp(2.3rem,4.3vw,3.35rem)] font-normal leading-[0.98] tracking-tight text-[var(--on-surface)]">
              The African engineering talent dispatch.
            </h2>
            <p className="body-md my-8 max-w-xl text-[0.98rem] leading-[1.75] text-[var(--on-surface-dim)]">
              Bi-weekly. No fluff. Notes on hiring senior engineers, evaluating
              production skill, and building with African technical talent.
            </p>

            <div className="mt-8 flex flex-wrap gap-5">
              {[
                ["1.2k", "Subscribers"],
                ["68%", "Open rate"],
                ["2x", "Per month"],
              ].map(([value, label], index) => (
                <div
                  key={label}
                  className={
                    index > 0
                      ? "border-l border-[color-mix(in_srgb,var(--on-surface)_10%,transparent)] pl-5"
                      : ""
                  }
                >
                  <p className="font-mono text-[1.35rem] leading-none tracking-tight text-[var(--on-surface)]">
                    {value}
                  </p>
                  <p className="mt-2 text-[0.68rem] font-medium uppercase tracking-[0.09em] text-[color-mix(in_srgb,var(--on-surface-dim)_62%,transparent)]">
                    {label}
                  </p>
                </div>
              ))}
            </div>

            <form
              onSubmit={onSubmit}
              className="newsletter-anim mt-10"
            >
              {subscribed ? (
                <div className="flex items-center gap-4 rounded-[1.25rem] border border-[color-mix(in_srgb,var(--on-surface)_15%,transparent)] bg-[color-mix(in_srgb,var(--surface)_34%,transparent)] p-6 shadow-sm backdrop-blur-md">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-[color-mix(in_srgb,var(--on-surface)_10%,transparent)] bg-[color-mix(in_srgb,var(--on-surface)_5%,transparent)] text-[var(--on-surface)]">
                    <IconCheck size={20} stroke={2} />
                  </span>
                  <div>
                    <p className="text-[1.05rem] font-medium tracking-tight text-[var(--on-surface)]">
                      Subscribed.
                    </p>
                    <p className="text-[0.92rem] text-[var(--on-surface-dim)]">
                      First issue lands this week. Welcome to the dispatch.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <div className="flex overflow-hidden rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] shadow-[var(--glass-inner-shadow)] p-1.5 transition-all duration-300 focus-within:border-[color-mix(in_srgb,var(--on-surface)_30%,transparent)] focus-within:shadow-[0_8px_30px_color-mix(in_srgb,var(--on-surface)_6%,transparent)] backdrop-blur-md">
                    <input
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        setError("");
                      }}
                      type="email"
                      placeholder="your@email.com"
                      className="w-full bg-transparent px-5 py-3 text-[0.95rem] text-[var(--on-surface)] outline-none placeholder:text-[color-mix(in_srgb,var(--on-surface-dim)_60%,transparent)]"
                    />
                    <button
                      type="submit"
                      className="group flex shrink-0 items-center justify-center gap-2 rounded-full bg-[var(--on-surface)] px-6 py-3 font-medium text-[var(--bg)] transition-transform hover:scale-[1.02]"
                    >
                      Subscribe
                      <IconArrowRight size={16} stroke={2} className="transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                  {error && <p className="absolute -bottom-7 left-5 text-[0.85rem] text-red-400">{error}</p>}
                </div>
              )}
            </form>

            <div className="my-10">
              <p className="label-caps mb-4 text-[color-mix(in_srgb,var(--on-surface-dim)_58%,transparent)]">
                What we cover
              </p>
              <div className="flex flex-wrap gap-2">
                {topics.map((topic) => (
                  <span
                    key={topic}
                    className="rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3.5 py-1.5 text-[0.8rem] text-[var(--on-surface-dim)] transition-colors hover:border-[color-mix(in_srgb,var(--on-surface)_20%,transparent)] hover:text-[var(--on-surface)]"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function BlogAndFaqNewsletter() {
  return (
    <>
      <BlogSection />
      <FaqNewsletterSection />
    </>
  );
}
