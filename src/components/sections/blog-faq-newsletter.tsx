"use client";

import {
  IconArrowRight,
  IconCheck,
  IconExternalLink,
  IconPlus,
  IconSend,
} from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { faqItems } from "@/content/landing";

const textureStyle = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg width='34' height='34' viewBox='0 0 34 34' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M17 11v12M11 17h12' stroke='%23c5b8e8' stroke-width='0.65' stroke-linecap='round' opacity='0.22'/%3E%3Cpath d='M4 4h4M26 30h4' stroke='%23c5b8e8' stroke-width='0.55' stroke-linecap='round' opacity='0.16'/%3E%3C/svg%3E\"), radial-gradient(circle, color-mix(in srgb, var(--secondary) 16%, transparent) 0 1px, transparent 1.8px)",
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
  },
  {
    title: "Why African engineers are underpriced in global hiring",
    excerpt:
      "The arbitrage global startups miss: senior production talent, English fluency, and strong Europe overlap.",
    tag: "Point of View",
    date: "Apr 2026",
    read: "5 min",
    image: "/images/blog-image-2.jpg",
  },
  {
    title: "What a strong AI integration engineer actually does",
    excerpt:
      "LLM APIs are the easy part. Retrieval, evaluation, cost control, security, and product fit are where seniority shows.",
    tag: "AI Talent",
    date: "Mar 2026",
    read: "6 min",
    image: "/images/blog-image-6.jpeg",
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

  return (
    <div className="relative overflow-hidden border-y border-[color-mix(in_srgb,var(--on-surface)_10%,transparent)] py-3">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-24 bg-[linear-gradient(to_right,var(--bg),transparent)]" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-24 bg-[linear-gradient(to_left,var(--bg),transparent)]" />
      <div className="blog-ticker-track flex w-max">
        {items.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="inline-flex items-center gap-2 whitespace-nowrap px-5 text-[0.74rem] font-medium uppercase tracking-[0.08em] text-[color-mix(in_srgb,var(--on-surface-dim)_62%,transparent)]"
          >
            <span
              className="h-1 w-1 rounded-full"
              style={{
                backgroundColor:
                  index % 2 === 0
                    ? "var(--secondary)"
                    : "color-mix(in srgb, var(--on-surface) 14%, transparent)",
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
  index,
}: {
  article: (typeof articles)[number];
  index: number;
}) {
  return (
    <Link
      href="/work"
      className={`group relative overflow-hidden rounded-[1.45rem] border border-[color-mix(in_srgb,var(--on-surface)_11%,transparent)] bg-[color-mix(in_srgb,var(--surface)_34%,transparent)] shadow-[0_26px_90px_color-mix(in_srgb,var(--bg-deep)_24%,transparent)] transition-all duration-300 hover:-translate-y-1 hover:border-[color-mix(in_srgb,var(--secondary)_24%,transparent)] ${
        article.hero ? "lg:row-span-2" : ""
      }`}
      style={{ transitionDelay: `${index * 70}ms` }}
    >
      <div
        className={`relative overflow-hidden ${
          article.hero ? "h-64 sm:h-80 lg:h-[21rem]" : "h-48 sm:h-52"
        }`}
      >
        <Image
          src={article.image}
          alt=""
          fill
          sizes={article.hero ? "(min-width: 1024px) 55vw, 100vw" : "45vw"}
          className="object-cover saturate-[0.78] transition-transform duration-700 group-hover:scale-105 group-hover:saturate-100"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_36%,color-mix(in_srgb,var(--bg)_82%,transparent)_100%)]" />
      </div>

      <div className="relative p-5 sm:p-6 lg:p-7">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span
            className="rounded-lg border px-2.5 py-1 text-[0.64rem] font-medium uppercase tracking-[0.1em]"
            style={{
              backgroundColor:
                index === 0
                  ? "color-mix(in srgb, var(--secondary) 10%, transparent)"
                  : "color-mix(in srgb, var(--primary) 8%, transparent)",
              borderColor:
                index === 0
                  ? "color-mix(in srgb, var(--secondary) 22%, transparent)"
                  : "color-mix(in srgb, var(--primary) 18%, transparent)",
              color: index === 0 ? "var(--secondary)" : "var(--primary)",
            }}
          >
            {article.tag}
          </span>
          <span className="font-mono text-[0.66rem] tracking-tight text-[color-mix(in_srgb,var(--on-surface-dim)_62%,transparent)]">
            {article.date}
          </span>
          <span className="ml-auto text-[0.68rem] text-[color-mix(in_srgb,var(--on-surface-dim)_62%,transparent)]">
            {article.read}
          </span>
        </div>

        <h3
          className={`font-medium leading-tight text-[var(--on-surface)] transition-colors duration-300 group-hover:text-[var(--secondary)] ${
            article.hero
              ? "text-[1.55rem] sm:text-[1.75rem]"
              : "text-[1.12rem] sm:text-[1.18rem]"
          }`}
        >
          {article.title}
        </h3>
        <p className="mt-3 line-clamp-3 text-[0.92rem] leading-[1.75] text-[var(--on-surface-dim)]">
          {article.excerpt}
        </p>

        {article.hero && (
          <div className="mt-6 max-w-[64ch] space-y-4 text-[0.94rem] leading-[1.85] text-[var(--on-surface-dim)]">
            <p>
              We unpack the real assessment path: how to read production
              experience, separate tool familiarity from ownership, and spot
              engineers who can work inside a fast-moving startup team.
            </p>
            <p>
              The guide also covers the details that usually get missed before
              hiring: reference questions, async communication patterns,
              timezone overlap, and why a small technical screen beats a long
              interview loop.
            </p>
            <div className="grid gap-3 border-t border-[color-mix(in_srgb,var(--on-surface)_9%,transparent)] pt-4 sm:grid-cols-3">
              {[
                ["01", "Production ownership"],
                ["02", "Reference checks"],
                ["03", "Timezone fit"],
              ].map(([num, item]) => (
                <div key={item}>
                  <p className="font-mono text-[0.66rem] tracking-tight text-[color-mix(in_srgb,var(--on-surface-dim)_54%,transparent)]">
                    {num}
                  </p>
                  <p className="mt-1 text-[0.82rem] font-medium leading-snug text-[var(--on-surface)]">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-5 flex items-center gap-3 border-t border-[color-mix(in_srgb,var(--on-surface)_9%,transparent)] pt-4">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--on-surface)] font-mono text-[0.68rem] text-[var(--bg)]">
            A
          </span>
          <span className="text-[0.82rem] font-medium text-[var(--on-surface-dim)]">
            Andishi Talent
          </span>
          <span className="ml-auto grid h-8 w-8 place-items-center rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--on-surface-dim)] transition-transform duration-300 group-hover:rotate-45 group-hover:text-[var(--secondary)]">
            <IconExternalLink size={14} stroke={1.6} />
          </span>
        </div>
      </div>
    </Link>
  );
}

function BlogSection() {
  return (
    <section className="relative isolate overflow-hidden bg-[var(--bg)] pb-12 sm:pb-14 lg:p-18">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={textureStyle}
      />
      <BlogTicker />

      <div className="relative z-[1] mx-auto mt-12 max-w-7xl px-5 sm:mt-16 sm:px-8 lg:mt-18">
        <div className="mb-9 flex flex-col gap-6 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="label-caps mb-5 flex items-center gap-3 text-[var(--secondary)]">
              <span className="h-px w-7 bg-[var(--secondary)]" />
              From the talent desk
            </p>
            <h2 className="max-w-[12ch] text-[clamp(2.35rem,6vw,4.5rem)] font-normal leading-[0.96] tracking-tight text-[var(--on-surface)]">
              Hiring notes. Talent proof. Startup context.
            </h2>
          </div>
          <Link
            href="/work"
            className="inline-flex items-center gap-2 self-start border-b border-[color-mix(in_srgb,var(--on-surface)_16%,transparent)] pb-1 text-[0.92rem] font-medium text-[var(--on-surface-dim)] transition-colors duration-300 hover:border-[var(--secondary)] hover:text-[var(--secondary)] sm:self-auto"
          >
            All articles
            <IconArrowRight size={15} stroke={1.7} />
          </Link>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr] lg:items-stretch">
          <ArticleCard article={articles[0]} index={0} />
          <div className="grid gap-4">
            {articles.slice(1).map((article, index) => (
              <ArticleCard
                key={article.title}
                article={article}
                index={index + 1}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FaqNewsletterSection() {
  const [openIndex, setOpenIndex] = useState(0);
  const [email, setEmail] = useState("");
  const [typed, setTyped] = useState(false);
  const [error, setError] = useState("");
  const [subscribed, setSubscribed] = useState(false);

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
      id="faq"
      className="relative isolate border-t border-[color-mix(in_srgb,var(--on-surface)_10%,transparent)] bg-[color-mix(in_srgb,var(--bg-deep)_42%,var(--bg))]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={textureStyle}
      />
      <div className="relative z-[1] mx-auto grid max-w-7xl px-5 sm:px-8 lg:grid-cols-2">
        <div className="border-[color-mix(in_srgb,var(--on-surface)_10%,transparent)] py-16 sm:py-20 lg:border-r lg:py-24 lg:pr-14">
          <p className="label-caps mb-5 flex items-center gap-3 text-[var(--secondary)]">
            <span className="h-px w-7 bg-[var(--secondary)]" />
            Common questions
          </p>
          <h2 className="max-w-[12ch] text-[clamp(2.2rem,5vw,3.7rem)] font-normal leading-[0.98] tracking-tight text-[var(--on-surface)]">
            Everything you want to ask.
          </h2>
          <p className="body-md mt-5 max-w-xl text-[0.98rem] leading-[1.75] text-[var(--on-surface-dim)]">
            Honest answers before we ever match profiles.
          </p>

          <div className="mt-10 divide-y divide-[color-mix(in_srgb,var(--on-surface)_10%,transparent)] border-y border-[color-mix(in_srgb,var(--on-surface)_10%,transparent)]">
            {faqItems.slice(0, 5).map((item, index) => {
              const isOpen = openIndex === index;

              return (
                <article key={item.q} className="relative">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? -1 : index)}
                    className="flex w-full items-center gap-4 py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--secondary)_44%,transparent)] sm:py-6"
                    aria-expanded={isOpen}
                  >
                    <span
                      className="font-mono text-[0.72rem] tracking-tight"
                      style={{
                        color: isOpen
                          ? "var(--secondary)"
                          : "color-mix(in srgb, var(--on-surface-dim) 52%, transparent)",
                      }}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span
                      className="flex-1 text-[1.02rem] font-medium leading-snug transition-colors duration-300 sm:text-[1.08rem]"
                      style={{
                        color: isOpen
                          ? "var(--secondary)"
                          : "var(--on-surface)",
                      }}
                    >
                      {item.q}
                    </span>
                    <span
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-all duration-300"
                      style={{
                        borderColor: isOpen
                          ? "color-mix(in srgb, var(--secondary) 28%, transparent)"
                          : "var(--glass-border)",
                        backgroundColor: isOpen
                          ? "color-mix(in srgb, var(--secondary) 10%, transparent)"
                          : "var(--glass-bg)",
                        color: isOpen
                          ? "var(--secondary)"
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

        <div className="border-t border-[color-mix(in_srgb,var(--on-surface)_10%,transparent)] py-16 sm:py-20 lg:border-t-0 lg:py-24 lg:pl-14">
          <p className="label-caps mb-5 flex items-center gap-3 text-[var(--secondary)]">
            <span className="h-px w-7 bg-[var(--secondary)]" />
            Stay in the loop
          </p>
          <h2 className="max-w-[13ch] text-[clamp(2.2rem,5vw,3.7rem)] font-normal leading-[0.98] tracking-tight text-[var(--on-surface)]">
            The African engineering talent dispatch.
          </h2>
          <p className="body-md mt-5 max-w-xl text-[0.98rem] leading-[1.75] text-[var(--on-surface-dim)]">
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
            className="mt-9 overflow-hidden rounded-[1.35rem] border border-[var(--glass-border)] bg-[#0a0a14] shadow-[0_28px_90px_color-mix(in_srgb,var(--bg-deep)_40%,transparent)] focus-within:border-[color-mix(in_srgb,var(--secondary)_28%,transparent)]"
          >
            <div className="flex h-10 items-center gap-2 border-b border-white/8 bg-white/[0.03] px-4">
              <span className="h-2 w-2 rounded-full bg-[#ff6b57]" />
              <span className="h-2 w-2 rounded-full bg-[#ffbd2e]" />
              <span className="h-2 w-2 rounded-full bg-[#27c93f]" />
              <span className="ml-auto font-mono text-[0.6rem] text-white/42">
                dispatch.subscribe
              </span>
            </div>

            {subscribed ? (
              <div className="grid min-h-[18rem] place-items-center p-8 text-center">
                <div>
                  <span className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-[color-mix(in_srgb,var(--tertiary)_24%,transparent)] bg-[color-mix(in_srgb,var(--tertiary)_12%,transparent)] text-[var(--tertiary)]">
                    <IconCheck size={22} stroke={2} />
                  </span>
                  <p className="mt-4 font-mono text-[0.9rem] tracking-tight text-[var(--tertiary)]">
                    Subscribed.
                  </p>
                  <p className="mt-3 text-[0.92rem] leading-[1.75] text-white/62">
                    First issue lands this week. Welcome to the dispatch.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-2 p-5 font-mono text-[0.78rem] leading-[1.85] text-white/62 sm:p-6">
                  <p>
                    <span className="text-[var(--secondary)]">$</span>{" "}
                    andishi-dispatch --subscribe
                  </p>
                  <p>
                    <span className="text-[var(--secondary)]">→</span>{" "}
                    Initialising African Engineering Talent Dispatch...
                  </p>
                  <p className="text-white/36">
                    Cadence: bi-weekly / Format: plain and useful
                  </p>
                  {typed && (
                    <p className="text-[var(--secondary)]">
                      → Validating address format...
                    </p>
                  )}
                  {error && <p className="text-[var(--tertiary)]">x {error}</p>}
                </div>
                <div className="flex flex-col gap-3 border-t border-white/8 px-5 py-4 sm:flex-row sm:items-center sm:px-6">
                  <span className="font-mono text-[var(--secondary)]">›</span>
                  <input
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setTyped(event.target.value.length > 0);
                      setError("");
                    }}
                    type="email"
                    placeholder="your@email.com"
                    className="min-w-0 flex-1 bg-transparent font-mono text-[0.86rem] text-white outline-none placeholder:text-white/32"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--on-surface)] px-4 py-2.5 font-mono text-[0.76rem] font-medium text-[var(--bg)] transition-transform duration-300 hover:-translate-y-px sm:py-2"
                  >
                    send
                    <IconSend size={13} stroke={1.8} />
                  </button>
                </div>
              </>
            )}
          </form>

          <div className="mt-5">
            <p className="label-caps mb-3 text-[color-mix(in_srgb,var(--on-surface-dim)_58%,transparent)]">
              What we cover
            </p>
            <div className="flex flex-wrap gap-2">
              {topics.map((topic) => (
                <span
                  key={topic}
                  className="rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-1.5 text-[0.8rem] text-[var(--on-surface-dim)]"
                >
                  {topic}
                </span>
              ))}
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
