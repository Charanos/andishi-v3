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
import Image from "next/image";

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
      className={cn("pointer-events-none absolute inset-0", className)}
      style={{
        opacity,
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M16 11.5v9M11.5 16h9' stroke='%23c5b8e8' stroke-width='0.7' stroke-linecap='round' opacity='0.32'/%3E%3C/svg%3E\")",
        backgroundSize: "32px 32px",
      }}
    />
  );
}

function HireIllustrationLayer({ compact = false }: { compact?: boolean }) {
  return (
    <>
      <div
        aria-hidden="true"
        className={[
          "pointer-events-none absolute inset-0 z-0",
          compact
            ? "bg-[radial-gradient(ellipse_at_50%_48%,color-mix(in_srgb,var(--bg)_18%,transparent),color-mix(in_srgb,var(--bg)_86%,transparent)_72%),linear-gradient(180deg,color-mix(in_srgb,var(--bg)_80%,transparent)_0%,color-mix(in_srgb,var(--bg)_48%,transparent)_42%,color-mix(in_srgb,var(--bg)_88%,transparent)_100%)]"
            : "bg-[linear-gradient(90deg,color-mix(in_srgb,var(--bg)_90%,transparent)_0%,color-mix(in_srgb,var(--bg)_54%,transparent)_34%,color-mix(in_srgb,var(--bg)_34%,transparent)_58%,color-mix(in_srgb,var(--bg)_76%,transparent)_100%),linear-gradient(180deg,color-mix(in_srgb,var(--bg)_86%,transparent)_0%,transparent_34%,color-mix(in_srgb,var(--bg)_88%,transparent)_100%)]",
        ].join(" ")}
      />
      <Image
        aria-hidden="true"
        src="/hire-hero.png"
        alt=""
        width={1400}
        height={1100}
        priority={!compact}
        loading={compact ? "lazy" : undefined}
        className={[
          "pointer-events-none absolute z-0 h-auto max-w-none object-contain",
          compact
            ? "left-1/2 top-1/2 w-[min(1180px,132vw)] -translate-x-1/2 -translate-y-1/2 opacity-[0.24] dark:opacity-[0.28]"
            : "left-1/2 top-[5.5rem] w-[min(1500px,118vw)] -translate-x-1/2 opacity-[0.24] dark:opacity-[0.28] max-lg:top-[12rem] max-lg:w-[min(1180px,165vw)]",
        ].join(" ")}
        style={{
          maskImage:
            "radial-gradient(ellipse at 50% 20%, black 10%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at 50% 20%, black 10%, transparent 75%)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(to_top,var(--bg)_10%,transparent_60%)]" />
    </>
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
      <HireIllustrationLayer />
      <PatternTexture className="z-0" opacity={0.1} />
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
                        className="h-12 border-b border-[var(--glass-border)] bg-transparent px-0 text-[1.1rem] text-[var(--on-surface)] outline-none transition-all duration-300 placeholder:text-[color-mix(in_srgb,var(--on-surface-dim)_30%,transparent)] focus:border-[var(--secondary)] disabled:opacity-50"
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
                        className="h-12 border-b border-[var(--glass-border)] bg-transparent px-0 text-[1.1rem] text-[var(--on-surface)] outline-none transition-all duration-300 placeholder:text-[color-mix(in_srgb,var(--on-surface-dim)_30%,transparent)] focus:border-[var(--secondary)] disabled:opacity-50"
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
                      className="h-12 border-b border-[var(--glass-border)] bg-transparent px-0 text-[1.1rem] text-[var(--on-surface)] outline-none transition-all duration-300 placeholder:text-[color-mix(in_srgb,var(--on-surface-dim)_30%,transparent)] focus:border-[var(--secondary)] disabled:opacity-50"
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
                      className="min-h-36 resize-none border-b border-[var(--glass-border)] bg-transparent px-0 py-3 text-[1.1rem] leading-relaxed text-[var(--on-surface)] outline-none transition-all duration-300 placeholder:text-[color-mix(in_srgb,var(--on-surface-dim)_30%,transparent)] focus:border-[var(--secondary)] disabled:opacity-50"
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
          {/* Hero Map Experience */}
          <div className="relative w-full overflow-hidden rounded-[2rem] border border-[var(--glass-border)] shadow-[0_32px_80px_color-mix(in_srgb,var(--bg-deep)_16%,transparent)] group">
            <div className="relative h-[28rem] sm:h-[34rem] w-full overflow-hidden bg-[color-mix(in_srgb,var(--surface-high)_68%,transparent)]">
              <iframe
                title="Andishi Studio Office Location"
                src="https://maps.google.com/maps?q=-1.193639,36.905250&t=&z=16&ie=UTF8&iwloc=&output=embed"
                className="absolute inset-0 h-[120%] w-full -top-[10%] border-0 opacity-80 mix-blend-luminosity brightness-[0.7] contrast-[1.2] transition-all duration-1000 group-hover:mix-blend-normal group-hover:opacity-100 group-hover:brightness-90"
                allowFullScreen
                loading="lazy"
              />
              <div className="absolute inset-0 bg-[linear-gradient(to_top,color-mix(in_srgb,var(--surface)_96%,transparent),transparent_50%)] pointer-events-none" />
              
              {/* Studio Info overlayed on map bottom */}
              <div className="absolute bottom-0 left-0 w-full p-6 sm:p-8 flex flex-col justify-end pointer-events-none">
                <div className="inline-flex items-center gap-2 rounded-full border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--bg)_70%,transparent)] px-3 py-1.5 font-mono text-[0.7rem] tracking-tight text-[var(--on-surface)] backdrop-blur-xl mb-4 w-fit pointer-events-auto">
                  <IconMapPin size={12} stroke={2} className="text-[var(--secondary)] animate-bounce" />
                  <span>1°11&apos;37.1&quot;S 36°54&apos;18.9&quot;E</span>
                </div>
                <div className="pointer-events-auto">
                  <h4 className="text-[1.2rem] font-medium text-[var(--on-surface)]">Studio Headquarters</h4>
                  <p className="mt-1.5 text-[0.95rem] leading-relaxed text-[var(--on-surface-dim)] font-medium">
                    Bypass Business Arcade Ground Floor,<br />
                    Northern Bypass - Ruiru, Kenya
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Direct Contacts Grid */}
          <div className="mt-4 grid gap-0 border-y border-[var(--glass-border)] py-1">
            {directContacts.map((method) => {
              const Icon = method.icon;

              return (
                <a
                  key={method.label}
                  href={method.href}
                  target={method.href.startsWith("http") ? "_blank" : undefined}
                  rel={method.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  data-cursor-text="CONTACT"
                  className="group flex items-center justify-between gap-5 py-4 border-b border-[color-mix(in_srgb,var(--glass-border)_40%,transparent)] last:border-0 transition-all duration-300 hover:px-2 hover:bg-[color-mix(in_srgb,var(--surface)_40%,transparent)]"
                >
                  <span
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-full border transition-transform duration-300 group-hover:scale-110"
                    style={{
                      color: method.tone,
                      backgroundColor: `color-mix(in srgb, ${method.tone} 6%, transparent)`,
                      borderColor: `color-mix(in srgb, ${method.tone} 15%, transparent)`,
                    }}
                  >
                    <Icon size={18} stroke={1.6} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="label-caps block text-[0.66rem] text-[var(--on-surface-dim)]">
                      {method.label}
                    </span>
                    <span className="mt-1 block truncate text-[1rem] font-medium text-[var(--on-surface)]">
                      {method.value}
                    </span>
                    <span className="mt-0.5 block text-[0.78rem] text-[color-mix(in_srgb,var(--on-surface-dim)_70%,transparent)]">
                      {method.sub}
                    </span>
                  </span>
                </a>
              );
            })}
          </div>

          {/* Availability Alert */}
          <div className="p-2">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--tertiary)_26%,transparent)] bg-[color-mix(in_srgb,var(--tertiary)_10%,transparent)] px-3 py-1.5 text-[0.82rem] font-medium text-[var(--tertiary)]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--tertiary)]" />
              Typically responds within 4 hours
            </div>
            <div className="grid gap-2 text-[0.84rem] text-[var(--on-surface-dim)] font-medium">
              <div className="flex justify-between border-b border-[color-mix(in_srgb,var(--glass-border)_40%,transparent)] pb-2 last:border-0 last:pb-0">
                <span>Monday - Friday</span>
                <span className="font-mono text-[0.76rem]">8:00 AM - 6:00 PM (EAT)</span>
              </div>
              <div className="flex justify-between border-b border-[color-mix(in_srgb,var(--glass-border)_40%,transparent)] pb-2 last:border-0 last:pb-0">
                <span>Saturday</span>
                <span className="font-mono text-[0.76rem]">9:00 AM - 1:00 PM (EAT)</span>
              </div>
              <div className="flex justify-between border-b border-[color-mix(in_srgb,var(--glass-border)_40%,transparent)] pb-2 last:border-0 last:pb-0">
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
