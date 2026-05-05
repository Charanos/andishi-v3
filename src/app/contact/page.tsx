import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { GlassCard } from "@/components/ui/glass-card";
import { IconBrandLinkedin, IconBrandTwitter, IconMail, IconClock, IconCheck } from "@tabler/icons-react";

export const metadata = {
  title: "Contact Andishi — Start your project",
  description: "Book a free 30-minute scoping call with Andishi. No pitch, no retainer required.",
};

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="relative overflow-hidden">
        <section className="relative mx-auto max-w-6xl px-6 pb-24 pt-40 sm:px-8">
          <div className="relative grid gap-16 md:grid-cols-[1fr_1.15fr] md:items-start">
            {/* ── Left ── */}
            <div>
              <p className="label-caps mb-4" style={{ color: "var(--primary)" }}>Start here</p>
              <h1
                style={{
                  fontSize: "clamp(2.4rem, 5vw, 4rem)",
                  fontWeight: 300,
                  lineHeight: 1.1,
                  letterSpacing: "-0.03em",
                  color: "var(--on-surface)",
                }}
              >
                Let&apos;s scope<br />
                <span
                  style={{
                    backgroundImage: "var(--gradient-brand)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  your project.
                </span>
              </h1>
              <p className="body-lg mt-5 max-w-md" style={{ color: "var(--on-surface-dim)" }}>
                The first call is 30 minutes and costs nothing. You will leave with a clear
                picture of what is possible and what it takes.
              </p>

              {/* Trust badges */}
              <div className="mt-10 space-y-3">
                {[
                  { icon: IconClock, text: "Response within 24 hours" },
                  { icon: IconCheck, text: "No pitch, no retainer required" },
                  { icon: IconCheck, text: "Fixed scope & fixed price" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3">
                    <div
                      className="grid h-7 w-7 place-items-center rounded-lg"
                      style={{
                        backgroundColor: "color-mix(in srgb, var(--primary) 10%, transparent)",
                        border: "1px solid color-mix(in srgb, var(--primary) 18%, transparent)",
                        color: "var(--primary)",
                      }}
                    >
                      <Icon size={13} stroke={2} />
                    </div>
                    <p className="text-sm" style={{ color: "var(--on-surface-dim)" }}>{text}</p>
                  </div>
                ))}
              </div>

              {/* Direct contact */}
              <div className="mt-10 pt-8" style={{ borderTop: "1px solid var(--glass-border)" }}>
                <p className="label-caps mb-4" style={{ color: "var(--on-surface-dim)", opacity: 0.6 }}>Or reach out directly</p>
                <a
                  href="mailto:hello@andishi.dev"
                  className="inline-flex items-center gap-2.5 text-sm font-medium transition-opacity hover:opacity-70"
                  style={{ color: "var(--primary)" }}
                >
                  <IconMail size={16} stroke={1.6} />
                  hello@andishi.dev
                </a>

                <div className="flex gap-3 mt-5">
                  {[
                    { icon: IconBrandLinkedin, href: "https://linkedin.com/company/andishi", label: "LinkedIn" },
                    { icon: IconBrandTwitter,  href: "https://twitter.com/andishidev",      label: "Twitter" },
                  ].map(({ icon: Icon, href, label }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
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
            </div>

            {/* ── Right: form ── */}
            <GlassCard glow="violet">
              <h2
                className="mb-8"
                style={{ fontSize: "1.125rem", fontWeight: 400, color: "var(--on-surface)", letterSpacing: "-0.01em" }}
              >
                Tell us what you&apos;re building
              </h2>
              <form
                action="https://formspree.io/f/hello"
                method="POST"
                className="flex flex-col gap-5"
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  {[
                    { name: "name",  label: "Name",  type: "text",  placeholder: "Your name" },
                    { name: "email", label: "Email", type: "email", placeholder: "you@email.com" },
                  ].map((f) => (
                    <label key={f.name} className="flex flex-col gap-2">
                      <span className="label-caps" style={{ color: "var(--on-surface-dim)", opacity: 0.7 }}>{f.label}</span>
                      <input
                        name={f.name}
                        type={f.type}
                        required
                        placeholder={f.placeholder}
                        className="rounded-xl border px-4 py-3 text-sm outline-none transition-all duration-200
                                   focus:ring-2 focus:ring-[color-mix(in_srgb,var(--primary)_30%,transparent)]"
                        style={{
                          backgroundColor: "color-mix(in srgb, var(--surface-high) 60%, transparent)",
                          borderColor: "var(--glass-border)",
                          color: "var(--on-surface)",
                        }}
                      />
                    </label>
                  ))}
                </div>

                <label className="flex flex-col gap-2">
                  <span className="label-caps" style={{ color: "var(--on-surface-dim)", opacity: 0.7 }}>Company / Project</span>
                  <input
                    name="company"
                    placeholder="Acme Ltd or 'early-stage idea'"
                    className="rounded-xl border px-4 py-3 text-sm outline-none transition-all duration-200"
                    style={{
                      backgroundColor: "color-mix(in srgb, var(--surface-high) 60%, transparent)",
                      borderColor: "var(--glass-border)",
                      color: "var(--on-surface)",
                    }}
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="label-caps" style={{ color: "var(--on-surface-dim)", opacity: 0.7 }}>What are you building?</span>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    placeholder="Describe the problem you're solving, not the solution you have in mind."
                    className="rounded-xl border px-4 py-3 text-sm outline-none transition-all duration-200 resize-none"
                    style={{
                      backgroundColor: "color-mix(in srgb, var(--surface-high) 60%, transparent)",
                      borderColor: "var(--glass-border)",
                      color: "var(--on-surface)",
                    }}
                  />
                </label>

                <button
                  type="submit"
                  className="mt-1 min-h-[3.35rem] w-full rounded-full px-6 py-3.5 text-[0.98rem] font-medium text-white
                             shadow-[var(--cta-shadow)] transition-all duration-200 hover:-translate-y-px active:scale-[0.99]"
                  style={{ background: "var(--gradient-brand)" }}
                >
                  Send message
                </button>
              </form>
            </GlassCard>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
