"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  IconArrowLeft,
  IconArrowRight,
  IconBrandLinkedin,
  IconBrandWhatsapp,
  IconBrandX,
  IconCalendarTime,
  IconCheck,
  IconClock,
  IconMail,
  IconMapPin,
  IconPhone,
  IconSend,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { cosmicSpring } from "@/lib/motion";
import { motion } from "framer-motion";

const services = [
  "Web Application",
  "Payment Integration",
  "E-Commerce Store",
  "Conversion Website",
  "Analytics Dashboard",
  "API / Integration",
];

const timelines = ["ASAP / 1-2 weeks", "1 month", "2-3 months", "Flexible"];
const budgets = ["KES 30k - 60k", "KES 60k - 150k", "KES 150k - 300k", "KES 300k+"];

const directContacts = [
  {
    href: "mailto:hello@andishi.dev",
    label: "Email",
    value: "hello@andishi.dev",
    sub: "Best for briefs and proposals",
    icon: IconMail,
    tone: "var(--primary)",
  },
  {
    href: "https://wa.me/254759912373",
    label: "WhatsApp",
    value: "+254 759 912 373",
    sub: "Quick questions and urgent briefs",
    icon: IconBrandWhatsapp,
    tone: "var(--tertiary)",
  },
  {
    href: "tel:+254759912373",
    label: "Phone",
    value: "+254 759 912 373",
    sub: "Office hours only",
    icon: IconPhone,
    tone: "var(--secondary)",
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
  const [step, setStep] = useState(0);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [timeline, setTimeline] = useState("");
  const [budget, setBudget] = useState("");
  const [submittedRef, setSubmittedRef] = useState("");
  const [form, setForm] = useState({
    name: "",
    role: "",
    email: "",
    phone: "",
    description: "",
    source: "",
  });

  const canContinue = useMemo(() => {
    if (step === 0) return form.name.trim() && form.email.trim();
    if (step === 1) return selectedServices.length > 0 && form.description.trim();
    return timeline && budget;
  }, [budget, form.description, form.email, form.name, selectedServices.length, step, timeline]);

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const toggleService = (value: string) => {
    setSelectedServices((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  };

  const submitBrief = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const ref = `AND-${Date.now().toString(36).toUpperCase().slice(-6)}`;
    const body = [
      `Brief reference: ${ref}`,
      "",
      `Name: ${form.name}`,
      `Role: ${form.role || "Not provided"}`,
      `Email: ${form.email}`,
      `Phone / WhatsApp: ${form.phone || "Not provided"}`,
      "",
      `Services: ${selectedServices.join(", ")}`,
      `Timeline: ${timeline}`,
      `Budget: ${budget}`,
      `Source: ${form.source || "Not provided"}`,
      "",
      "Project description:",
      form.description,
    ].join("\n");

    setSubmittedRef(ref);
    window.location.href = `mailto:hello@andishi.dev?subject=${encodeURIComponent(
      `Project brief ${ref}`,
    )}&body=${encodeURIComponent(body)}`;
  };

  return (
    <main className="relative isolate overflow-hidden bg-[var(--bg)]">
      <PlusTexture className="z-0" opacity={0.1} />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--surface-high)_8%,transparent),transparent_24rem),linear-gradient(90deg,color-mix(in_srgb,var(--bg)_88%,transparent),transparent_44%,color-mix(in_srgb,var(--bg)_76%,transparent))]"
      />

      <section className="relative z-[1] mx-auto grid min-h-[calc(100svh-5rem)] w-full max-w-[96rem] gap-0 px-5 pb-24 pt-32 sm:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:px-10 lg:pt-36">
        <motion.div
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={cosmicSpring}
          className="border-b border-[var(--glass-border)] pb-10 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-10"
        >
          <p className="label-caps mb-5 flex items-center gap-3 text-[var(--secondary)]">
            <span className="h-px w-7 bg-[var(--secondary)]" />
            Send a brief
          </p>
          <h1 className="max-w-[11ch] text-[clamp(3rem,9vw,5.8rem)] font-normal leading-[0.94] tracking-normal text-[var(--on-surface)]">
            Start your project brief.
          </h1>
          <p className="body-md mt-7 max-w-xl text-[var(--on-surface-dim)]">
            Three steps. Two minutes. You will leave us with enough context to
            respond clearly, usually with the right next call, scope, or team
            shape.
          </p>

          <form onSubmit={submitBrief} className="mt-9 flex min-h-[36rem] flex-col">
            <StepIndicator step={step} />

            <div className="flex-1">
              {submittedRef ? (
                <SuccessState refCode={submittedRef} />
              ) : (
                <>
                  {step === 0 && (
                    <motion.div
                      key="identity"
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={cosmicSpring}
                      className="grid gap-4"
                    >
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field
                          label="Your name"
                          value={form.name}
                          placeholder="Jane Wanjiku"
                          autoComplete="name"
                          onChange={(value) => updateField("name", value)}
                          required
                        />
                        <Field
                          label="Your role"
                          value={form.role}
                          placeholder="Founder / CTO"
                          onChange={(value) => updateField("role", value)}
                        />
                      </div>
                      <Field
                        label="Email address"
                        value={form.email}
                        type="email"
                        placeholder="jane@company.com"
                        autoComplete="email"
                        onChange={(value) => updateField("email", value)}
                        required
                      />
                      <Field
                        label="Phone / WhatsApp"
                        value={form.phone}
                        type="tel"
                        placeholder="+254 7XX XXX XXX"
                        autoComplete="tel"
                        onChange={(value) => updateField("phone", value)}
                      />
                    </motion.div>
                  )}

                  {step === 1 && (
                    <motion.div
                      key="project"
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={cosmicSpring}
                      className="grid gap-5"
                    >
                      <ChoiceGroup
                        label="What are you building?"
                        options={services}
                        selected={selectedServices}
                        onToggle={toggleService}
                      />
                      <label className="grid gap-2">
                        <span className="label-caps text-[color-mix(in_srgb,var(--on-surface-dim)_62%,transparent)]">
                          Describe the project
                        </span>
                        <textarea
                          value={form.description}
                          onChange={(event) => updateField("description", event.target.value)}
                          placeholder="Tell us what you need built, who it is for, and what problem it solves."
                          className="min-h-36 resize-none rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-3 text-[0.9rem] leading-relaxed text-[var(--on-surface)] outline-none backdrop-blur-xl transition-all duration-300 placeholder:text-[color-mix(in_srgb,var(--on-surface-dim)_42%,transparent)] focus:border-[color-mix(in_srgb,var(--primary)_34%,transparent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--primary)_14%,transparent)]"
                          required
                        />
                      </label>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div
                      key="scope"
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={cosmicSpring}
                      className="grid gap-5"
                    >
                      <ChoiceGroup
                        label="When do you need it live?"
                        options={timelines}
                        selected={timeline ? [timeline] : []}
                        onToggle={setTimeline}
                        single
                      />
                      <ChoiceGroup
                        label="Budget range"
                        options={budgets}
                        selected={budget ? [budget] : []}
                        onToggle={setBudget}
                        single
                      />
                      <label className="grid gap-2">
                        <span className="label-caps text-[color-mix(in_srgb,var(--on-surface-dim)_62%,transparent)]">
                          How did you find us?
                        </span>
                        <select
                          value={form.source}
                          onChange={(event) => updateField("source", event.target.value)}
                          className="h-12 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 text-[0.9rem] text-[var(--on-surface)] outline-none backdrop-blur-xl transition-all duration-300 focus:border-[color-mix(in_srgb,var(--primary)_34%,transparent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--primary)_14%,transparent)]"
                        >
                          <option value="">Select...</option>
                          <option>Google / Search</option>
                          <option>Twitter/X</option>
                          <option>LinkedIn</option>
                          <option>Referral from a client</option>
                          <option>Direct / knew about Andishi</option>
                          <option>Other</option>
                        </select>
                      </label>
                    </motion.div>
                  )}
                </>
              )}
            </div>

            {!submittedRef && (
              <div className="mt-8 flex items-center justify-between gap-4 border-t border-[var(--glass-border)] pt-6">
                {step > 0 ? (
                  <button
                    type="button"
                    onClick={() => setStep((current) => Math.max(current - 1, 0))}
                    className="inline-flex items-center gap-2 text-[0.9rem] text-[var(--on-surface-dim)] transition-colors duration-300 hover:text-[var(--on-surface)]"
                  >
                    <IconArrowLeft size={15} stroke={1.6} />
                    Back
                  </button>
                ) : (
                  <span />
                )}

                {step < 2 ? (
                  <Button
                    type="button"
                    variant="primary"
                    disabled={!canContinue}
                    onClick={() => setStep((current) => Math.min(current + 1, 2))}
                  >
                    {step === 0 ? "Project details" : "Timeline and budget"}
                    <IconArrowRight size={16} stroke={1.8} />
                  </Button>
                ) : (
                  <Button type="submit" variant="primary" disabled={!canContinue}>
                    Prepare brief
                    <IconSend size={16} stroke={1.8} />
                  </Button>
                )}
              </div>
            )}
          </form>
        </motion.div>

        <motion.aside
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ...cosmicSpring, delay: 0.08 }}
          className="pt-10 lg:pl-10 lg:pt-0"
        >
          <div className="lg:sticky lg:top-28">
            <NairobiPanel />
            <div className="mt-5 grid gap-3">
              {directContacts.map((method) => {
                const Icon = method.icon;

                return (
                  <a
                    key={method.label}
                    href={method.href}
                    target={method.href.startsWith("http") ? "_blank" : undefined}
                    rel={method.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="group flex items-center gap-4 rounded-[1rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4 backdrop-blur-xl transition-all duration-300 hover:translate-x-1 hover:border-[color-mix(in_srgb,var(--primary)_24%,transparent)] hover:bg-[color-mix(in_srgb,var(--primary)_8%,transparent)]"
                  >
                    <span
                      className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border"
                      style={{
                        color: method.tone,
                        backgroundColor: `color-mix(in srgb, ${method.tone} 10%, transparent)`,
                        borderColor: `color-mix(in srgb, ${method.tone} 20%, transparent)`,
                      }}
                    >
                      <Icon size={19} stroke={1.6} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="label-caps block text-[color-mix(in_srgb,var(--on-surface-dim)_58%,transparent)]">
                        {method.label}
                      </span>
                      <span className="mt-1 block truncate text-[0.95rem] font-medium text-[var(--on-surface)]">
                        {method.value}
                      </span>
                      <span className="mt-0.5 block text-[0.76rem] text-[var(--on-surface-dim)]">
                        {method.sub}
                      </span>
                    </span>
                    <IconArrowRight
                      size={16}
                      stroke={1.6}
                      className="shrink-0 text-[color-mix(in_srgb,var(--on-surface-dim)_52%,transparent)] transition-transform duration-300 group-hover:translate-x-1 group-hover:text-[var(--primary)]"
                    />
                  </a>
                );
              })}
            </div>

            <div className="mt-5 rounded-[1rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-5 backdrop-blur-xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--tertiary)_26%,transparent)] bg-[color-mix(in_srgb,var(--tertiary)_10%,transparent)] px-3 py-1.5 text-[0.72rem] font-medium text-[var(--tertiary)]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--tertiary)]" />
                Typically responds within 4 hours
              </div>
              <p className="label-caps mb-4 text-[color-mix(in_srgb,var(--on-surface-dim)_62%,transparent)]">
                Office hours / EAT
              </p>
              <div className="grid gap-3">
                {[
                  ["Monday - Friday", "8:00 AM - 6:00 PM", true],
                  ["Saturday", "9:00 AM - 1:00 PM", true],
                  ["Sunday", "Closed", false],
                ].map(([day, hours, open]) => (
                  <div
                    key={day as string}
                    className="flex items-center justify-between gap-4 border-b border-[var(--glass-border)] pb-3 last:border-b-0 last:pb-0"
                  >
                    <span className="text-[0.86rem] text-[var(--on-surface-dim)]">
                      {day}
                    </span>
                    <span
                      className={cn(
                        "font-mono text-[0.74rem] tracking-normal",
                        open
                          ? "text-[var(--tertiary)]"
                          : "text-[color-mix(in_srgb,var(--on-surface-dim)_52%,transparent)]",
                      )}
                    >
                      {hours}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap justify-center gap-x-3 gap-y-1 text-center">
              {["No pitch", "No retainer required", "Response within 24hrs"].map(
                (item) => (
                  <span
                    key={item}
                    className="label-caps text-[0.62rem] text-[color-mix(in_srgb,var(--on-surface-dim)_50%,transparent)]"
                  >
                    {item}
                  </span>
                ),
              )}
            </div>

            <div className="mt-6 flex justify-center gap-2">
              {socials.map(([label, href, Icon]) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="grid h-10 w-10 place-items-center rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--on-surface-dim)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-px hover:border-[color-mix(in_srgb,var(--secondary)_28%,transparent)] hover:text-[var(--secondary)]"
                >
                  <Icon size={17} stroke={1.6} />
                </a>
              ))}
            </div>
          </div>
        </motion.aside>
      </section>
    </main>
  );
}

function StepIndicator({ step }: { step: number }) {
  return (
    <div className="mb-8 flex items-center">
      {[0, 1, 2].map((index) => {
        const isDone = index < step;
        const isActive = index === step;

        return (
          <div key={index} className="flex flex-1 items-center last:flex-none">
            <span
              className={cn(
                "grid h-7 w-7 shrink-0 place-items-center rounded-full border font-mono text-[0.66rem] font-medium tracking-normal transition-all duration-300",
                isDone &&
                  "border-[color-mix(in_srgb,var(--tertiary)_28%,transparent)] bg-[color-mix(in_srgb,var(--tertiary)_12%,transparent)] text-[var(--tertiary)]",
                isActive &&
                  "border-[color-mix(in_srgb,var(--primary)_30%,transparent)] bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-[var(--primary)]",
                !isDone &&
                  !isActive &&
                  "border-[var(--glass-border)] text-[color-mix(in_srgb,var(--on-surface-dim)_48%,transparent)]",
              )}
            >
              {isDone ? <IconCheck size={13} stroke={2} /> : index + 1}
            </span>
            {index < 2 && (
              <span
                className={cn(
                  "h-px flex-1 bg-[var(--glass-border)] transition-colors duration-300",
                  isDone && "bg-[color-mix(in_srgb,var(--tertiary)_38%,transparent)]",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Field({
  autoComplete,
  label,
  onChange,
  placeholder,
  required,
  type = "text",
  value,
}: {
  autoComplete?: string;
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
  type?: string;
  value: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="label-caps text-[color-mix(in_srgb,var(--on-surface-dim)_62%,transparent)]">
        {label}
      </span>
      <input
        autoComplete={autoComplete}
        required={required}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-12 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 text-[0.9rem] text-[var(--on-surface)] outline-none backdrop-blur-xl transition-all duration-300 placeholder:text-[color-mix(in_srgb,var(--on-surface-dim)_42%,transparent)] focus:border-[color-mix(in_srgb,var(--primary)_34%,transparent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--primary)_14%,transparent)]"
      />
    </label>
  );
}

function ChoiceGroup({
  label,
  onToggle,
  options,
  selected,
  single = false,
}: {
  label: string;
  onToggle: (value: string) => void;
  options: string[];
  selected: string[];
  single?: boolean;
}) {
  return (
    <div className="grid gap-3">
      <p className="label-caps text-[color-mix(in_srgb,var(--on-surface-dim)_62%,transparent)]">
        {label}
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((option) => {
          const isSelected = selected.includes(option);

          return (
            <button
              key={option}
              type="button"
              onClick={() => onToggle(option)}
              aria-pressed={isSelected}
              className={cn(
                "flex min-h-12 items-center gap-3 rounded-xl border px-4 py-3 text-left text-[0.84rem] transition-all duration-300",
                isSelected
                  ? "border-[color-mix(in_srgb,var(--primary)_30%,transparent)] bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-[var(--primary)]"
                  : "border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--on-surface-dim)] hover:border-[color-mix(in_srgb,var(--primary)_20%,transparent)] hover:bg-[color-mix(in_srgb,var(--primary)_7%,transparent)] hover:text-[var(--on-surface)]",
              )}
            >
              <span
                className={cn(
                  "h-2.5 w-2.5 shrink-0 rounded-full border border-current transition-colors duration-300",
                  isSelected && "bg-current",
                )}
              />
              <span>{option}</span>
              {single && isSelected && (
                <IconCheck size={14} stroke={1.8} className="ml-auto shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SuccessState({ refCode }: { refCode: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={cosmicSpring}
      className="flex h-full min-h-[24rem] flex-col items-center justify-center text-center"
    >
      <span className="grid h-16 w-16 place-items-center rounded-full border border-[color-mix(in_srgb,var(--tertiary)_28%,transparent)] bg-[color-mix(in_srgb,var(--tertiary)_12%,transparent)] text-[var(--tertiary)]">
        <IconCheck size={28} stroke={2} />
      </span>
      <h2 className="mt-6 text-[clamp(1.7rem,4vw,2.4rem)] font-normal leading-tight tracking-normal text-[var(--on-surface)]">
        Brief prepared.
      </h2>
      <p className="body-md mt-4 max-w-md text-[var(--on-surface-dim)]">
        Your email client should open with the full project brief. Send it from
        there and the Andishi team will respond within 24 hours.
      </p>
      <p className="mt-5 rounded-lg border border-[color-mix(in_srgb,var(--secondary)_20%,transparent)] bg-[color-mix(in_srgb,var(--secondary)_10%,transparent)] px-4 py-2 font-mono text-[0.74rem] tracking-normal text-[var(--secondary)]">
        ref: {refCode}
      </p>
    </motion.div>
  );
}

function NairobiPanel() {
  return (
    <div className="relative overflow-hidden rounded-[1.35rem] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_40%,transparent)] p-5 shadow-[0_24px_70px_color-mix(in_srgb,var(--bg-deep)_22%,transparent)] backdrop-blur-2xl">
      <PlusTexture opacity={0.08} />
      <div className="relative h-56 overflow-hidden rounded-[1rem] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_34%,transparent)]">
        <svg
          aria-hidden="true"
          className="absolute inset-0 h-full w-full text-[var(--on-surface)] opacity-[0.16]"
          viewBox="0 0 520 240"
          fill="none"
        >
          <path
            d="M-20 176C78 126 130 92 206 118C282 144 326 72 420 52C462 43 498 47 542 60"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="9 7"
          />
          <path
            d="M-30 78C68 98 134 176 238 150C341 124 380 168 548 150"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="5 6"
          />
          <path
            d="M92 -20C126 44 144 98 126 156C112 204 128 232 156 264"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="5 6"
          />
          <path
            d="M374 -12C346 58 358 108 392 160C415 194 420 225 408 262"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="5 6"
          />
        </svg>
        <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-[58%] flex-col items-center">
          <span className="h-4 w-4 rounded-full bg-[var(--primary)] shadow-[0_0_0_5px_color-mix(in_srgb,var(--primary)_24%,transparent),0_0_0_10px_color-mix(in_srgb,var(--primary)_10%,transparent)]" />
          <span className="mt-3 rounded-lg border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--bg)_58%,transparent)] px-3 py-1.5 text-[0.74rem] font-medium text-[var(--on-surface)] backdrop-blur-xl">
            Andishi Studio
          </span>
        </div>
        <div className="absolute bottom-4 left-4 flex items-center gap-2 font-mono text-[0.62rem] tracking-normal text-[color-mix(in_srgb,var(--on-surface-dim)_58%,transparent)]">
          <IconMapPin size={13} stroke={1.7} />
          Nairobi, Kenya
        </div>
        <p className="absolute bottom-4 right-4 font-mono text-[0.62rem] tracking-normal text-[color-mix(in_srgb,var(--on-surface-dim)_58%,transparent)]">
          UTC+3
        </p>
      </div>

      <div className="relative mt-5 grid gap-3 sm:grid-cols-3">
        {[
          [IconClock, "24hrs", "response target"],
          [IconCalendarTime, "30min", "scoping call"],
          [IconCheck, "Fixed", "scope first"],
        ].map(([Icon, value, label]) => (
          <div
            key={label as string}
            className="rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-3"
          >
            <Icon
              size={16}
              stroke={1.6}
              className="mb-3 text-[var(--secondary)]"
            />
            <p className="font-mono text-[1.05rem] leading-none tracking-normal text-[var(--on-surface)]">
              {value as string}
            </p>
            <p className="label-caps mt-2 text-[0.56rem] leading-tight text-[color-mix(in_srgb,var(--on-surface-dim)_56%,transparent)]">
              {label as string}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
