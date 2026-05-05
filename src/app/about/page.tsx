import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { GlassCard } from "@/components/ui/glass-card";
import { IconArrowRight, IconBrandLinkedin, IconBrandTwitter, IconMail } from "@tabler/icons-react";
import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "About Andishi — Built in Nairobi",
  description: "Andishi is a Nairobi-based product studio building digital products for ambitious African businesses.",
};

const values = [
  {
    title: "Directness over bureaucracy",
    body: "You work with the people doing the work. No account managers. No layers. The person on the call is the person writing the code.",
    color: "var(--primary)",
  },
  {
    title: "Shipped, not delivered",
    body: "We measure success by what is live and working, not what is in a document. If it is not in production, it does not count.",
    color: "var(--secondary)",
  },
  {
    title: "Local knowledge, global standard",
    body: "We understand M-Pesa integrations, Kenyan compliance requirements, and the infrastructure realities of building for East Africa — without compromising on quality.",
    color: "var(--tertiary)",
  },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="relative overflow-hidden">
        {/* Page hero */}
        <section className="relative mx-auto max-w-7xl px-6 pb-16 pt-40 sm:px-8">
          <div className="relative max-w-2xl">
            <p className="label-caps mb-4" style={{ color: "var(--secondary)" }}>Who we are</p>
            <h1
              style={{
                fontSize: "clamp(2.4rem, 5vw, 4rem)",
                fontWeight: 300,
                lineHeight: 1.1,
                letterSpacing: "-0.03em",
                color: "var(--on-surface)",
              }}
            >
              Built in Nairobi.<br />
              <span
                style={{
                  backgroundImage: "var(--gradient-brand)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Thinking about what comes next.
              </span>
            </h1>
            <p className="body-lg mt-5 max-w-lg" style={{ color: "var(--on-surface-dim)" }}>
              Andishi exists for businesses with real ambition who need digital partners that
              understand the market, the deadline, and the stakes of shipping well.
            </p>
          </div>
        </section>

        {/* Stats strip */}
        <section className="mx-auto max-w-7xl px-6 pb-16 sm:px-8">
          <GlassCard glow="violet" className="grid grid-cols-2 gap-8 sm:grid-cols-4 text-center">
            {[
              { value: "50+",  label: "Projects shipped" },
              { value: "3–8w", label: "Avg. build time"  },
              { value: "30d",  label: "Post-launch support" },
              { value: "100%", label: "Fixed-price projects" },
            ].map((s) => (
              <div key={s.value}>
                <p
                  style={{
                    fontFamily: "var(--font-jetbrains, monospace)",
                    fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
                    fontWeight: 300,
                    lineHeight: 1,
                    letterSpacing: "-0.04em",
                    color: "var(--primary)",
                  }}
                >
                  {s.value}
                </p>
                <p className="label-caps mt-2" style={{ color: "var(--on-surface-dim)", opacity: 0.6 }}>{s.label}</p>
              </div>
            ))}
          </GlassCard>
        </section>

        {/* Values */}
        <section className="mx-auto max-w-7xl px-6 pb-16 sm:px-8">
          <div className="mb-10">
            <p className="label-caps mb-3" style={{ color: "var(--primary)" }}>How we work</p>
            <h2
              style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.6rem)", fontWeight: 300, letterSpacing: "-0.025em", color: "var(--on-surface)" }}
            >
              What you can actually expect.
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {values.map((v) => (
              <GlassCard key={v.title} glow="none" bento>
                <div
                  className="mb-4 h-1 w-8 rounded-full"
                  style={{ background: `linear-gradient(to right, ${v.color}, transparent)` }}
                />
                <h3 style={{ fontSize: "1rem", fontWeight: 500, color: "var(--on-surface)", letterSpacing: "-0.01em" }}>{v.title}</h3>
                <p className="body-md mt-3" style={{ color: "var(--on-surface-dim)" }}>{v.body}</p>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* Founder */}
        <section className="mx-auto max-w-7xl px-6 pb-24 sm:px-8">
          <GlassCard glow="amber" className="grid gap-10 md:grid-cols-[280px_1fr] md:items-center">
            <div
              className="relative aspect-square max-w-[280px] overflow-hidden rounded-2xl"
              style={{ border: "1px solid color-mix(in srgb, var(--tertiary) 18%, transparent)" }}
            >
              <Image
                src="/images/dev1.jpg"
                alt="Andishi Founder"
                fill
                sizes="280px"
                className="object-cover"
              />
            </div>
            <div>
              <p className="label-caps mb-4" style={{ color: "var(--tertiary)" }}>The founder</p>
              <blockquote
                style={{
                  fontSize: "clamp(1.3rem, 3vw, 1.9rem)",
                  fontWeight: 300,
                  lineHeight: 1.25,
                  letterSpacing: "-0.02em",
                  color: "var(--on-surface)",
                }}
              >
                I started Andishi because I kept watching founders get burned by agencies that
                didn&apos;t understand the market they were building for.
              </blockquote>
              <p className="body-md mt-5 max-w-lg" style={{ color: "var(--on-surface-dim)" }}>
                Everything at Andishi is built around one principle: ship working software, on time, at a fair price, for the real world it will operate in.
              </p>
              <p className="label-caps mt-6" style={{ color: "var(--primary)" }}>Andishi Founder</p>

              <div className="flex gap-3 mt-5">
                {[
                  { icon: IconBrandLinkedin, href: "https://linkedin.com/company/andishi" },
                  { icon: IconBrandTwitter,  href: "https://twitter.com/andishidev" },
                  { icon: IconMail,          href: "mailto:hello@andishi.dev" },
                ].map(({ icon: Icon, href }) => (
                  <a
                    key={href}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-xl border transition-opacity hover:opacity-70"
                    style={{
                      backgroundColor: "var(--glass-bg)",
                      borderColor: "var(--glass-border)",
                      color: "var(--on-surface-dim)",
                    }}
                  >
                    <Icon size={16} stroke={1.6} />
                  </a>
                ))}
              </div>
            </div>
          </GlassCard>
        </section>

        {/* CTA */}
        <section className="relative mx-auto max-w-3xl px-6 pb-40 text-center sm:px-8">
          <h2
            style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", fontWeight: 300, letterSpacing: "-0.025em", color: "var(--on-surface)" }}
          >
            Let&apos;s work together.
          </h2>
          <p className="body-md mt-4 mx-auto max-w-md" style={{ color: "var(--on-surface-dim)" }}>
            One 30-minute call. No pitch. No retainer required.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/contact"
              className="inline-flex min-h-[3.35rem] items-center gap-2 rounded-full px-6 py-3.5 text-[0.98rem] font-medium text-white shadow-[var(--cta-shadow)] transition-all duration-200 hover:-translate-y-px"
              style={{ background: "var(--gradient-brand)" }}
            >
              Book a scoping call <IconArrowRight size={15} stroke={2} />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
