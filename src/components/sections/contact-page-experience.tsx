"use client";

import { FormEvent, useState } from "react";
import {
  IconBrandLinkedin,
  IconBrandWhatsapp,
  IconBrandX,
  IconCheck,
  IconMail,
  IconMapPin,
  IconPhone,
  IconSend,
  IconLoader2,
  IconAlertCircle,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { cosmicSpring } from "@/lib/motion";
import { motion, AnimatePresence } from "framer-motion";

const directContacts = [
  {
    href: "mailto:hire@andishi.dev",
    label: "Email",
    value: "hire@andishi.dev",
    sub: "General & project inquiries",
    icon: IconMail,
    tone: "var(--primary)",
  },
  {
    href: "https://wa.me/25474882157",
    label: "WhatsApp",
    value: "+254 748 821 57",
    sub: "Direct text line",
    icon: IconBrandWhatsapp,
    tone: "var(--secondary)",
  },
  {
    href: "tel:+254759912373",
    label: "Phone",
    value: "+254 759 912 373",
    sub: "Office hours only",
    icon: IconPhone,
    tone: "var(--primary)",
  },
];

const socials = [
  ["LinkedIn", "https://linkedin.com/company/andishi", IconBrandLinkedin],
  ["Twitter/X", "https://twitter.com/andishidev", IconBrandX],
] as const;

function PlusTexture({
  className,
  opacity = 0.11,
}: {
  className?: string;
  opacity?: number;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0", className)}
      style={{
        opacity,
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg width='34' height='34' viewBox='0 0 34 34' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M17 11.5v11M11.5 17h11' stroke='%23c5b8e8' stroke-width='0.65' stroke-linecap='round' opacity='0.28'/%3E%3C/svg%3E\")",
        backgroundSize: "34px 34px",
      }}
    />
  );
}

export function ContactPageExperience() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/general-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to submit inquiry.");
      }

      setSuccess(true);
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative isolate overflow-hidden bg-[var(--bg)] px-5 sm:px-8 lg:px-10">
      <PlusTexture className="z-0" opacity={0.08} />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--surface-high)_8%,transparent),transparent_24rem),linear-gradient(90deg,color-mix(in_srgb,var(--bg)_88%,transparent),transparent_44%,color-mix(in_srgb,var(--bg)_76%,transparent))]"
      />

      <section className="relative z-[1] mx-auto grid min-h-[calc(100svh-5rem)] w-full max-w-[92rem] gap-12 pb-24 pt-32 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:pt-36">
        
        {/* Left Column: Title & General Contact Form */}
        <motion.div
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={cosmicSpring}
          className="flex flex-col justify-between"
        >
          <div>
            <p className="label-caps mb-4 flex items-center gap-3 text-[var(--secondary)]">
              <span className="h-px w-7 bg-[var(--secondary)]" />
              General Inquiry
            </p>
            <h1 className="title-serif max-w-[17ch] text-[clamp(2.8rem,6vw,4.5rem)] font-normal leading-[0.98] tracking-tight text-[var(--on-surface)]">
              Get in touch with Andishi.
            </h1>
            <p className="body-md mt-6 max-w-xl text-[var(--on-surface-dim)]">
              Have a question about our software studio, design services, or general inquiries? Send us a message and our team will get back to you within 4 hours.
            </p>
          </div>

          <div className="mt-10 flex-1">
            <AnimatePresence mode="wait">
              {success ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={cosmicSpring}
                  className="flex h-full min-h-[22rem] flex-col items-center justify-center rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-8 text-center backdrop-blur-xl"
                >
                  <span className="grid h-16 w-16 place-items-center rounded-full border border-[color-mix(in_srgb,var(--secondary)_28%,transparent)] bg-[color-mix(in_srgb,var(--secondary)_12%,transparent)] text-[var(--secondary)]">
                    <IconCheck size={28} stroke={2} />
                  </span>
                  <h2 className="title-serif mt-6 text-[clamp(1.8rem,3vw,2.2rem)] font-normal leading-tight tracking-tight text-[var(--on-surface)]">
                    Message Sent Successfully.
                  </h2>
                  <p className="body-md mt-4 max-w-md text-[var(--on-surface-dim)]">
                    Thank you for reaching out! We have received your inquiry. A team member from Andishi Studio will review your message and respond shortly.
                  </p>
                  <button
                    onClick={() => setSuccess(false)}
                    className="mt-8 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-6 py-2.5 text-[0.88rem] font-medium text-[var(--on-surface)] hover:bg-[color-mix(in_srgb,var(--on-surface)_6%,transparent)] transition-all duration-300 cursor-pointer"
                  >
                    Send another message
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  className="grid gap-5"
                >
                  {error && (
                    <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-[0.88rem] text-red-400">
                      <IconAlertCircle size={18} className="shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="grid gap-2">
                      <span className="label-caps text-[0.74rem] text-[var(--on-surface-dim)]">Your Name</span>
                      <input
                        required
                        type="text"
                        disabled={loading}
                        value={form.name}
                        onChange={(e) => updateField("name", e.target.value)}
                        placeholder="Jane Wanjiku"
                        className="h-12 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 text-[0.94rem] text-[var(--on-surface)] outline-none backdrop-blur-xl transition-all duration-300 placeholder:text-[color-mix(in_srgb,var(--on-surface-dim)_40%,transparent)] focus:border-[color-mix(in_srgb,var(--secondary)_50%,transparent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--secondary)_10%,transparent)] disabled:opacity-50"
                      />
                    </label>
                    <label className="grid gap-2">
                      <span className="label-caps text-[0.74rem] text-[var(--on-surface-dim)]">Email Address</span>
                      <input
                        required
                        type="email"
                        disabled={loading}
                        value={form.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        placeholder="jane@company.com"
                        className="h-12 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 text-[0.94rem] text-[var(--on-surface)] outline-none backdrop-blur-xl transition-all duration-300 placeholder:text-[color-mix(in_srgb,var(--on-surface-dim)_40%,transparent)] focus:border-[color-mix(in_srgb,var(--secondary)_50%,transparent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--secondary)_10%,transparent)] disabled:opacity-50"
                      />
                    </label>
                  </div>

                  <label className="grid gap-2">
                    <span className="label-caps text-[0.74rem] text-[var(--on-surface-dim)]">Subject</span>
                    <input
                      required
                      type="text"
                      disabled={loading}
                      value={form.subject}
                      onChange={(e) => updateField("subject", e.target.value)}
                      placeholder="How can we help you?"
                      className="h-12 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 text-[0.94rem] text-[var(--on-surface)] outline-none backdrop-blur-xl transition-all duration-300 placeholder:text-[color-mix(in_srgb,var(--on-surface-dim)_40%,transparent)] focus:border-[color-mix(in_srgb,var(--secondary)_50%,transparent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--secondary)_10%,transparent)] disabled:opacity-50"
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="label-caps text-[0.74rem] text-[var(--on-surface-dim)]">Your Message</span>
                    <textarea
                      required
                      disabled={loading}
                      value={form.message}
                      onChange={(e) => updateField("message", e.target.value)}
                      placeholder="Tell us details about your request..."
                      className="min-h-36 resize-none rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-3 text-[0.94rem] leading-relaxed text-[var(--on-surface)] outline-none backdrop-blur-xl transition-all duration-300 placeholder:text-[color-mix(in_srgb,var(--on-surface-dim)_40%,transparent)] focus:border-[color-mix(in_srgb,var(--secondary)_50%,transparent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--secondary)_10%,transparent)] disabled:opacity-50"
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-2 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--on-surface)] px-6 text-[0.92rem] font-medium text-[var(--bg)] shadow-[0_12px_28px_color-mix(in_srgb,var(--bg-deep)_24%,transparent)] transition-all duration-300 hover:-translate-y-px hover:shadow-[0_16px_36px_color-mix(in_srgb,var(--bg-deep)_36%,transparent)] disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <IconLoader2 size={16} className="animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <IconSend size={16} stroke={1.8} />
                        Send Message
                      </>
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Right Column: Address, Google Map & Direct Contacts */}
        <motion.aside
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ...cosmicSpring, delay: 0.08 }}
          className="flex flex-col gap-6 lg:pl-4"
        >
          {/* Nairobi Office Card with Iframe Map */}
          <div className="relative overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_90%,var(--bg)_10%)] p-5 shadow-[0_24px_70px_color-mix(in_srgb,var(--bg-deep)_14%,transparent)] backdrop-blur-2xl">
            <PlusTexture opacity={0.08} />
            <div className="relative h-60 overflow-hidden rounded-xl border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_68%,transparent)]">
              {/* Grayscale, Inverted, Contrast Iframe Google Map centered on 1°11'37.1"S 36°54'18.9"E */}
              <iframe
                title="Andishi Studio Office Location"
                src="https://maps.google.com/maps?q=-1.193639,36.905250&t=&z=16&ie=UTF8&iwloc=&output=embed"
                className="absolute inset-0 h-full w-full border-0"
                allowFullScreen
                loading="lazy"
              />
              <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-lg border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--bg)_70%,transparent)] px-2.5 py-1 font-mono text-[0.68rem] tracking-tight text-[var(--on-surface)] backdrop-blur-xl">
                <IconMapPin size={11} stroke={2} className="text-[var(--secondary)] animate-bounce" />
                <span>1°11&apos;37.1&quot;S 36°54&apos;18.9&quot;E</span>
              </div>
            </div>

            <div className="mt-5 flex gap-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--secondary)]">
                <IconMapPin size={18} stroke={1.6} />
              </span>
              <div>
                <h4 className="text-[0.9rem] font-medium text-[var(--on-surface)]">Studio Headquarters</h4>
                <p className="mt-1 text-[0.84rem] leading-relaxed text-[var(--on-surface-dim)]">
                  Bypass Business Arcade Ground Floor,<br />
                  Northern Bypass - Ruiru, Kenya
                </p>
              </div>
            </div>
          </div>

          {/* Direct Contacts Grid */}
          <div className="grid gap-3">
            {directContacts.map((method) => {
              const Icon = method.icon;

              return (
                <a
                  key={method.label}
                  href={method.href}
                  target={method.href.startsWith("http") ? "_blank" : undefined}
                  rel={method.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="group flex items-center gap-4 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4 backdrop-blur-xl transition-all duration-300 hover:translate-x-1 hover:border-[color-mix(in_srgb,var(--secondary)_34%,transparent)] hover:bg-[color-mix(in_srgb,var(--secondary)_6%,transparent)]"
                >
                  <span
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border"
                    style={{
                      color: method.tone,
                      backgroundColor: `color-mix(in srgb, ${method.tone} 8%, transparent)`,
                      borderColor: `color-mix(in srgb, ${method.tone} 18%, transparent)`,
                    }}
                  >
                    <Icon size={18} stroke={1.6} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="label-caps block text-[0.66rem] text-[var(--on-surface-dim)]">
                      {method.label}
                    </span>
                    <span className="mt-1 block truncate text-[0.92rem] font-medium text-[var(--on-surface)]">
                      {method.value}
                    </span>
                    <span className="mt-0.5 block text-[0.78rem] text-[var(--on-surface-dim)]">
                      {method.sub}
                    </span>
                  </span>
                </a>
              );
            })}
          </div>

          {/* Availability Alert */}
          <div className="rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4 backdrop-blur-xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--tertiary)_26%,transparent)] bg-[color-mix(in_srgb,var(--tertiary)_10%,transparent)] px-3 py-1.5 text-[0.82rem] font-medium text-[var(--tertiary)]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--tertiary)]" />
              Typically responds within 4 hours
            </div>
            <div className="grid gap-2 text-[0.84rem] text-[var(--on-surface-dim)]">
              <div className="flex justify-between border-b border-[var(--glass-border)] pb-2 last:border-0 last:pb-0">
                <span>Monday - Friday</span>
                <span className="font-mono text-[0.76rem]">8:00 AM - 6:00 PM (EAT)</span>
              </div>
              <div className="flex justify-between border-b border-[var(--glass-border)] pb-2 last:border-0 last:pb-0">
                <span>Saturday</span>
                <span className="font-mono text-[0.76rem]">9:00 AM - 1:00 PM (EAT)</span>
              </div>
              <div className="flex justify-between border-b border-[var(--glass-border)] pb-2 last:border-0 last:pb-0">
                <span>Sunday</span>
                <span className="font-mono text-[0.76rem] opacity-50">Closed</span>
              </div>
            </div>
          </div>

          {/* Socials & Trust Badges */}
          <div className="flex items-center justify-between mt-2 px-1">
            <div className="flex gap-2">
              {socials.map(([label, href, Icon]) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="grid h-9 w-9 place-items-center rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--on-surface-dim)] hover:text-[var(--secondary)] hover:border-[color-mix(in_srgb,var(--secondary)_25%,transparent)] transition-all duration-300"
                >
                  <Icon size={16} stroke={1.6} />
                </a>
              ))}
            </div>
            <span className="label-caps text-[0.66rem] text-[var(--on-surface-dim)]">
              studio @ andishi
            </span>
          </div>

        </motion.aside>
      </section>
    </main>
  );
}
