"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  IconArrowLeft,
  IconArrowRight,
  IconCalendarTime,
  IconCheck,
  IconFileText,
  IconHome,
  IconMail,
  IconRocket,
  IconSend,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { cosmicSpring } from "@/lib/motion";

const steps = [
  {
    title: "About you",
    sub: "Your contact details and role.",
  },
  {
    title: "Talent need",
    sub: "The role, stack, and bottleneck.",
  },
  {
    title: "Timeline & model",
    sub: "Start date, duration, and engagement shape.",
  },
  {
    title: "Context",
    sub: "Current team, product, and useful notes.",
  },
  {
    title: "Review & send",
    sub: "Confirm the brief before transmission.",
  },
];

const serviceOptions = [
  ["Full-stack Engineer", "React, Next.js, Node.js, Python"],
  ["AI Integration Engineer", "LLMs, RAG, agents, model APIs"],
  ["Cloud / AWS Engineer", "Infrastructure, deployment, reliability"],
  ["Backend API Engineer", "REST, GraphQL, databases, payments"],
  ["Web3 Engineer", "Solidity, Ethereum, DeFi integrations"],
  ["Mobile Engineer", "React Native, Swift, Kotlin"],
] as const;

const timelines = [
  ["ASAP", "this week"],
  ["2 weeks", "near-term"],
  ["1 month", "planned start"],
  ["Flexible", "open timing"],
] as const;

const budgets = [
  "Contract / fractional",
  "Team extension",
  "Dedicated build team",
  "Permanent hire pathway",
];

const controlSurfaceClass =
  "border-[color-mix(in_srgb,var(--on-surface)_20%,transparent)] bg-[color-mix(in_srgb,var(--surface)_94%,var(--bg)_6%)] shadow-[inset_0_1px_0_color-mix(in_srgb,white_42%,transparent),0_10px_28px_color-mix(in_srgb,var(--bg-deep)_8%,transparent)] dark:border-[var(--glass-border)] dark:bg-[var(--glass-bg)] dark:shadow-none";

const controlFocusClass =
  "focus:border-[color-mix(in_srgb,var(--primary)_58%,transparent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--primary)_18%,transparent)] dark:focus:border-[color-mix(in_srgb,var(--secondary)_40%,transparent)] dark:focus:ring-[color-mix(in_srgb,var(--secondary)_18%,transparent)]";

const fieldLabelClass = "text-[0.9rem] font-medium text-[var(--on-surface)]";

const helperTextClass =
  "text-[0.88rem] leading-relaxed text-[var(--on-surface-dim)]";

function PlusTexture({ opacity = 0.1 }: { opacity?: number }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{
        opacity,
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg width='34' height='34' viewBox='0 0 34 34' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M17 11.5v11M11.5 17h11' stroke='%23c5b8e8' stroke-width='0.65' stroke-linecap='round' opacity='0.28'/%3E%3C/svg%3E\")",
        backgroundSize: "34px 34px",
      }}
    />
  );
}

export function StartProjectExperience() {
  const [step, setStep] = useState(0);
  const [services, setServices] = useState<string[]>([]);
  const [timeline, setTimeline] = useState("");
  const [budget, setBudget] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [sentRef, setSentRef] = useState("");
  const [form, setForm] = useState({
    name: "",
    role: "",
    email: "",
    phone: "",
    company: "",
    description: "",
    existing: "",
    stack: "",
    source: "",
    extra: "",
  });

  const progress = Math.round(((step + 1) / steps.length) * 100);

  const canContinue = useMemo(() => {
    if (step === 0) return form.name.trim().length > 1 && isEmail(form.email);
    if (step === 1)
      return services.length > 0 && form.description.trim().length > 19;
    if (step === 2) return timeline && budget;
    if (step === 4) return agreed;
    return true;
  }, [
    agreed,
    budget,
    form.description,
    form.email,
    form.name,
    services.length,
    step,
    timeline,
  ]);

  const update = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const toggleService = (value: string) => {
    setServices((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  };

  const goNext = () => {
    if (!canContinue) return;
    setStep((current) => Math.min(current + 1, steps.length - 1));
  };

  const submitBrief = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canContinue) return;

    const ref = `AND-${Date.now().toString(36).toUpperCase().slice(-6)}`;
    const body = [
      `Hiring brief reference: ${ref}`,
      "",
      `Name: ${form.name}`,
      `Role: ${form.role || "Not provided"}`,
      `Email: ${form.email}`,
      `Phone / WhatsApp: ${form.phone || "Not provided"}`,
      `Company: ${form.company || "Not provided"}`,
      "",
      `Talent need: ${services.join(", ")}`,
      `Start timing: ${timeline}`,
      `Engagement model: ${budget}`,
      "",
      "Role / engineering need:",
      form.description,
      "",
      `Existing product or team: ${form.existing || "Not provided"}`,
      `Current / preferred stack: ${form.stack || "No preference"}`,
      `Source: ${form.source || "Not provided"}`,
      "",
      "Extra context:",
      form.extra || "Not provided",
    ].join("\n");

    setSentRef(ref);
    window.location.href = `mailto:hire@andishi.dev?subject=${encodeURIComponent(
      `Hiring brief ${ref}`,
    )}&body=${encodeURIComponent(body)}`;
  };

  if (sentRef) {
    return <SuccessScreen refCode={sentRef} />;
  }

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[var(--bg)] pt-24">
      <PlusTexture opacity={0.08} />
      <ArtworkLayer />
      <div className="relative z-[1] mx-auto grid min-h-[calc(100svh-6rem)] w-full max-w-[96rem] px-5 pb-12 sm:px-8 lg:grid-cols-[20rem_1fr] lg:px-10">
        <aside className="hidden border-r border-[var(--glass-border)] py-8 pr-6 lg:flex lg:flex-col">
          <div className="space-y-1">
            {steps.map((item, index) => {
              const isActive = index === step;
              const isDone = index < step;

              return (
                <div
                  key={item.title}
                  className="relative flex gap-4 pb-6 last:pb-0"
                >
                  {index < steps.length - 1 && (
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute left-[0.94rem] top-8 h-[calc(100%-2rem)] w-px bg-[color-mix(in_srgb,var(--on-surface)_16%,transparent)] dark:bg-[var(--glass-border)]",
                        isDone &&
                          "bg-[color-mix(in_srgb,var(--tertiary)_38%,transparent)]",
                      )}
                    />
                  )}
                  <span
                    className={cn(
                      "relative z-[1] grid h-8 w-8 shrink-0 place-items-center rounded-full border bg-[color-mix(in_srgb,var(--surface)_92%,var(--bg)_8%)] font-mono text-[0.74rem] tracking-tight dark:bg-[var(--bg)]",
                      isDone &&
                        "border-[color-mix(in_srgb,var(--tertiary)_30%,transparent)] bg-[color-mix(in_srgb,var(--tertiary)_12%,transparent)] text-[var(--tertiary)]",
                      isActive &&
                        "border-[color-mix(in_srgb,var(--primary)_34%,transparent)] bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-[var(--primary)]",
                      !isDone &&
                        !isActive &&
                        "border-[color-mix(in_srgb,var(--on-surface)_18%,transparent)] text-[color-mix(in_srgb,var(--on-surface-dim)_74%,var(--on-surface))] dark:border-[var(--glass-border)] dark:text-[color-mix(in_srgb,var(--on-surface-dim)_58%,transparent)]",
                    )}
                  >
                    {isDone ? <IconCheck size={14} stroke={2} /> : index + 1}
                  </span>
                  <span className="pt-0.5">
                    <span
                      className={cn(
                        "block text-[0.95rem] font-medium leading-snug",
                        isActive
                          ? "text-[var(--on-surface)]"
                          : "text-[var(--on-surface-dim)]",
                      )}
                    >
                      {item.title}
                    </span>
                    <span
                      className={cn(
                        "mt-1.5 block text-[0.9rem] leading-relaxed",
                        isActive
                          ? "text-[var(--on-surface-dim)]"
                          : "text-[color-mix(in_srgb,var(--on-surface-dim)_84%,var(--on-surface))] dark:text-[color-mix(in_srgb,var(--on-surface-dim)_72%,transparent)]",
                      )}
                    >
                      {item.sub}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-auto border-t border-[var(--glass-border)] pt-6">
            <p className="label-caps mb-4 text-[0.82rem] text-[color-mix(in_srgb,var(--on-surface-dim)_88%,var(--on-surface))]">
              What happens next
            </p>
            <div className="grid gap-3">
              {[
                [IconMail, "Confirmation email"],
                [IconCalendarTime, "Technical call within 24 hours"],
                [IconFileText, "Matched profiles within 48 hours"],
                [IconRocket, "Engineer onboarding after approval"],
              ].map(([Icon, label]) => (
                <div
                  key={label as string}
                  className="flex items-center gap-3 text-[0.94rem] leading-snug text-[var(--on-surface-dim)]"
                >
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-[var(--primary)]">
                    <Icon size={14} stroke={1.6} />
                  </span>
                  {label as string}
                </div>
              ))}
            </div>

            <div className="mt-6">
              <div className="mb-2 flex justify-between text-[0.74rem]">
                <span className="text-[0.86rem] text-[var(--on-surface-dim)]">
                  Brief completion
                </span>
                <span className="font-mono text-[0.86rem] tracking-tight text-[var(--secondary)]">
                  {progress}%
                </span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-[var(--glass-border)]">
                <motion.div
                  className="h-full rounded-full bg-[var(--gradient-brand)]"
                  animate={{ width: `${progress}%` }}
                  transition={cosmicSpring}
                />
              </div>
            </div>
          </div>
        </aside>

        <form
          onSubmit={submitBrief}
          className="flex min-h-[calc(100svh-6rem)] flex-col py-8 lg:pl-10"
        >
          <div className="mb-6 flex items-center justify-between gap-4 border-b border-[color-mix(in_srgb,var(--on-surface)_16%,transparent)] pb-5 dark:border-[var(--glass-border)]">
            <p className="font-mono text-[0.86rem] tracking-tight text-[var(--on-surface-dim)]">
              Step {step + 1} of {steps.length} / {steps[step].title}
            </p>
            <Link
              href="/"
              className="text-[0.9rem] text-[var(--on-surface-dim)] transition-colors duration-300 hover:text-[var(--on-surface)]"
            >
              Save & exit
            </Link>
          </div>

          <motion.div
            key={step}
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={cosmicSpring}
            className="flex-1"
          >
            {step === 0 && (
              <StepShell
                eyebrow="Step 1 of 5"
                title="Let us start with who you are."
                desc="Basic contact details so we can reach you after reviewing your brief."
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Full name"
                    value={form.name}
                    placeholder="Jane Wanjiku"
                    required
                    autoComplete="name"
                    onChange={(value) => update("name", value)}
                  />
                  <Field
                    label="Your role"
                    value={form.role}
                    placeholder="Founder, CTO, product manager"
                    onChange={(value) => update("role", value)}
                  />
                </div>
                <Field
                  label="Email address"
                  type="email"
                  value={form.email}
                  placeholder="jane@company.com"
                  required
                  autoComplete="email"
                  onChange={(value) => update("email", value)}
                />
                <Field
                  label="Phone / WhatsApp"
                  type="tel"
                  value={form.phone}
                  placeholder="+254 7XX XXX XXX"
                  autoComplete="tel"
                  help="Optional, but useful if WhatsApp is quicker."
                  onChange={(value) => update("phone", value)}
                />
              </StepShell>
            )}

            {step === 1 && (
              <StepShell
                eyebrow="Step 2 of 5"
                title="What kind of engineer do you need?"
                desc="Select every role that applies. We will shape the shortlist around the actual work, not a generic job title."
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  {serviceOptions.map(([title, sub]) => (
                    <button
                      key={title}
                      type="button"
                      aria-pressed={services.includes(title)}
                      onClick={() => toggleService(title)}
                      className={cn(
                        "flex min-h-16 gap-3 rounded-[1rem] border px-4 py-3 text-left transition-all duration-300",
                        services.includes(title)
                          ? "border-[color-mix(in_srgb,var(--primary)_54%,transparent)] bg-[color-mix(in_srgb,var(--primary)_14%,var(--surface)_86%)] shadow-[0_12px_32px_color-mix(in_srgb,var(--primary)_10%,transparent)] dark:border-[color-mix(in_srgb,var(--primary)_34%,transparent)] dark:bg-[color-mix(in_srgb,var(--primary)_10%,transparent)]"
                          : `${controlSurfaceClass} hover:border-[color-mix(in_srgb,var(--primary)_34%,transparent)] hover:bg-[color-mix(in_srgb,var(--surface)_98%,var(--primary)_2%)] dark:hover:border-[color-mix(in_srgb,var(--primary)_22%,transparent)] dark:hover:bg-[color-mix(in_srgb,var(--primary)_7%,transparent)]`,
                      )}
                    >
                      <span
                        className={cn(
                          "mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-md border text-transparent",
                          services.includes(title)
                            ? "border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_16%,var(--surface)_84%)] text-[var(--primary)] dark:bg-[color-mix(in_srgb,var(--primary)_12%,transparent)]"
                            : "border-[color-mix(in_srgb,var(--on-surface)_22%,transparent)] dark:border-[var(--glass-border)]",
                        )}
                      >
                        <IconCheck size={12} stroke={2.4} />
                      </span>
                      <span>
                        <span className="block text-[0.9rem] font-medium text-[var(--on-surface)]">
                          {title}
                        </span>
                        <span className="mt-1 block text-[0.84rem] leading-relaxed text-[var(--on-surface-dim)]">
                          {sub}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
                <Field
                  label="Company / organisation"
                  value={form.company}
                  placeholder="Your Business Ltd."
                  autoComplete="organization"
                  onChange={(value) => update("company", value)}
                />
                <TextArea
                  label="Describe the engineering need"
                  value={form.description}
                  placeholder="What are you building, what stack are you using, and what should this engineer own?"
                  required
                  help="Bullet points are fine. Aim for a few clear sentences about ownership, stack, and urgency."
                  onChange={(value) => update("description", value)}
                />
              </StepShell>
            )}

            {step === 2 && (
              <StepShell
                eyebrow="Step 3 of 5"
                title="Timing and engagement model."
                desc="Tell us when the engineer should start and how you want them embedded."
              >
                <PickerGroup
                  label="When do you need it live?"
                  options={timelines}
                  selected={timeline}
                  onSelect={setTimeline}
                />
                <div>
                  <p className="label-caps mb-3 text-[color-mix(in_srgb,var(--on-surface-dim)_86%,var(--on-surface))]">
                    Engagement model
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {budgets.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setBudget(item)}
                        aria-pressed={budget === item}
                        className={cn(
                          "flex h-12 items-center gap-3 rounded-xl border px-4 text-left transition-all duration-300",
                          budget === item
                            ? "border-[color-mix(in_srgb,var(--primary)_54%,transparent)] bg-[color-mix(in_srgb,var(--primary)_14%,var(--surface)_86%)] text-[var(--primary)] dark:border-[color-mix(in_srgb,var(--primary)_32%,transparent)] dark:bg-[color-mix(in_srgb,var(--primary)_10%,transparent)]"
                            : `${controlSurfaceClass} text-[var(--on-surface-dim)] hover:text-[var(--on-surface)]`,
                        )}
                      >
                        <span
                          className={cn(
                            "h-2.5 w-2.5 rounded-full border border-current",
                            budget === item && "bg-current",
                          )}
                        />
                        <span className="font-mono text-[0.8rem] tracking-tight">
                          {item}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </StepShell>
            )}

            {step === 3 && (
              <StepShell
                eyebrow="Step 4 of 5"
                title="Any extra context?"
                desc="Optional, but useful if you already have a product, stack, hiring process, or compliance constraints."
              >
                <SelectField
                  label="Existing product or team"
                  value={form.existing}
                  onChange={(value) => update("existing", value)}
                  options={[
                    "New team - first engineering hire",
                    "Existing team - needs extension",
                    "Existing product - needs new features",
                    "Existing product - needs specialist support",
                  ]}
                />
                <Field
                  label="Current or preferred tech stack"
                  value={form.stack}
                  placeholder="Next.js, Supabase, React Native..."
                  help="Leave blank if you want us to recommend the matching profile by role instead."
                  onChange={(value) => update("stack", value)}
                />
                <SelectField
                  label="How did you find Andishi?"
                  value={form.source}
                  onChange={(value) => update("source", value)}
                  options={[
                    "Google / Search",
                    "Twitter/X",
                    "LinkedIn",
                    "Referral from a client",
                    "WhatsApp referral",
                    "Direct / knew about Andishi",
                    "Other",
                  ]}
                />
                <TextArea
                  label="Anything else we should know?"
                  value={form.extra}
                  placeholder="Interview process, overlap needs, integrations, compliance, existing infrastructure, team context..."
                  onChange={(value) => update("extra", value)}
                />
              </StepShell>
            )}

            {step === 4 && (
              <StepShell
                eyebrow="Step 5 of 5"
                title="Review your brief."
                desc="Everything looks right? Prepare the hiring brief and send it from your email client."
              >
                <div className="grid gap-3">
                  {[
                    ["Name", form.name],
                    ["Email", form.email],
                    ["Phone", form.phone || "Not provided"],
                    ["Talent need", services.join(", ")],
                    ["Role brief", form.description],
                    ["Start timing", timeline],
                    ["Model", budget],
                    ["Stack", form.stack || "No preference"],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className={`grid gap-0 overflow-hidden rounded-xl border sm:grid-cols-[8rem_1fr] ${controlSurfaceClass}`}
                    >
                      <p className="border-b border-[color-mix(in_srgb,var(--on-surface)_14%,transparent)] bg-[color-mix(in_srgb,var(--surface-high)_72%,var(--surface)_28%)] px-4 py-3 text-[0.8rem] font-medium uppercase tracking-[0.08em] text-[var(--on-surface)] sm:border-b-0 sm:border-r dark:border-[var(--glass-border)] dark:bg-[color-mix(in_srgb,var(--surface-high)_42%,transparent)] dark:text-[var(--on-surface-dim)]">
                        {label}
                      </p>
                      <p className="px-4 py-3 text-[0.9rem] leading-relaxed text-[var(--on-surface-dim)]">
                        {value || "Not provided"}
                      </p>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setAgreed((current) => !current)}
                  aria-pressed={agreed}
                  className={`mt-4 flex items-start gap-3 rounded-xl border p-4 text-left transition-all duration-300 hover:border-[color-mix(in_srgb,var(--primary)_34%,transparent)] ${controlSurfaceClass}`}
                >
                  <span
                    className={cn(
                      "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border text-transparent",
                      agreed
                        ? "border-[color-mix(in_srgb,var(--tertiary)_46%,transparent)] bg-[color-mix(in_srgb,var(--tertiary)_14%,var(--surface)_86%)] text-[var(--tertiary)] dark:border-[color-mix(in_srgb,var(--tertiary)_36%,transparent)] dark:bg-[color-mix(in_srgb,var(--tertiary)_12%,transparent)]"
                        : "border-[color-mix(in_srgb,var(--on-surface)_22%,transparent)] dark:border-[var(--glass-border)]",
                    )}
                  >
                    <IconCheck size={12} stroke={2.4} />
                  </span>
                  <span className="text-[0.88rem] leading-relaxed text-[var(--on-surface-dim)]">
                    I confirm this brief is accurate and understand the matching
                    call is free and non-binding.
                  </span>
                </button>
              </StepShell>
            )}
          </motion.div>

          <div className="mt-8 flex items-center justify-between gap-4 border-t border-[color-mix(in_srgb,var(--on-surface)_16%,transparent)] pt-6 dark:border-[var(--glass-border)]">
            <button
              type="button"
              disabled={step === 0}
              onClick={() => setStep((current) => Math.max(current - 1, 0))}
              className="inline-flex h-12 items-center gap-2 rounded-lg text-[0.9rem] text-[var(--on-surface-dim)] transition-colors duration-300 hover:text-[var(--on-surface)] disabled:pointer-events-none disabled:opacity-30"
            >
              <IconArrowLeft size={16} stroke={1.6} />
              Back
            </button>
            {step < steps.length - 1 ? (
              <Button
                type="button"
                variant="primary"
                disabled={!canContinue}
                onClick={goNext}
              >
                Continue
                <IconArrowRight size={16} stroke={1.8} />
              </Button>
            ) : (
              <Button type="submit" variant="primary" disabled={!canContinue}>
                Prepare hiring brief
                <IconSend size={16} stroke={1.8} />
              </Button>
            )}
          </div>
        </form>
      </div>
    </main>
  );
}

function ArtworkLayer() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <img
        src="/light-blob.svg"
        alt=""
        className="absolute left-[58%] top-1/2 h-auto w-[min(1180px,96vw)] max-w-none -translate-x-1/2 -translate-y-1/2 object-contain opacity-[0.24] dark:hidden max-[899px]:left-1/2 max-[899px]:w-[150vw]"
      />
      <img
        src="/dark-blob.svg"
        alt=""
        className="absolute left-[58%] top-1/2 hidden h-auto w-[min(1180px,96vw)] max-w-none -translate-x-1/2 -translate-y-1/2 object-contain opacity-[0.5] dark:block max-[899px]:left-1/2 max-[899px]:w-[150vw]"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--bg)_0%,color-mix(in_srgb,var(--bg)_90%,transparent)_30%,color-mix(in_srgb,var(--bg)_74%,transparent)_58%,color-mix(in_srgb,var(--bg)_84%,transparent)_84%,var(--bg)_100%)] dark:bg-[linear-gradient(90deg,var(--bg)_0%,color-mix(in_srgb,var(--bg)_82%,transparent)_30%,color-mix(in_srgb,var(--bg)_58%,transparent)_58%,color-mix(in_srgb,var(--bg)_78%,transparent)_84%,var(--bg)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,var(--bg)_0%,color-mix(in_srgb,var(--bg)_84%,transparent)_18%,color-mix(in_srgb,var(--bg)_72%,transparent)_56%,var(--bg)_100%)] dark:bg-[linear-gradient(180deg,var(--bg)_0%,color-mix(in_srgb,var(--bg)_72%,transparent)_18%,color-mix(in_srgb,var(--bg)_58%,transparent)_56%,var(--bg)_100%)]" />
    </div>
  );
}

function StepShell({
  children,
  desc,
  eyebrow,
  title,
}: {
  children: React.ReactNode;
  desc: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="label-caps mb-4 flex items-center gap-3 text-[var(--secondary)]">
        <span className="h-px w-7 bg-[var(--secondary)]" />
        {eyebrow}
      </p>
      <h1 className="max-w-[13ch] text-[clamp(2.5rem,8vw,5rem)] font-normal leading-[0.94] tracking-tight text-[var(--on-surface)]">
        {title}
      </h1>
      <p className="body-md mt-6 max-w-2xl text-[var(--on-surface-dim)]">
        {desc}
      </p>
      <div className="mt-9 grid gap-5">{children}</div>
    </div>
  );
}

function Field({
  autoComplete,
  help,
  label,
  onChange,
  placeholder,
  required,
  type = "text",
  value,
}: {
  autoComplete?: string;
  help?: string;
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
  type?: string;
  value: string;
}) {
  return (
    <label className="grid gap-2">
      <span className={fieldLabelClass}>
        {label}
        {required && <span className="ml-1 text-[var(--secondary)]">*</span>}
      </span>
      <input
        autoComplete={autoComplete}
        required={required}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={`h-12 rounded-xl border px-4 text-[1rem] text-[var(--on-surface)] outline-none backdrop-blur-xl transition-all duration-300 placeholder:text-[color-mix(in_srgb,var(--on-surface-dim)_76%,transparent)] ${controlSurfaceClass} ${controlFocusClass}`}
      />
      {help && <span className={helperTextClass}>{help}</span>}
    </label>
  );
}

function TextArea({
  help,
  label,
  onChange,
  placeholder,
  required,
  value,
}: {
  help?: string;
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
  value: string;
}) {
  return (
    <label className="grid gap-2">
      <span className={fieldLabelClass}>
        {label}
        {required && <span className="ml-1 text-[var(--secondary)]">*</span>}
      </span>
      <textarea
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={`min-h-32 resize-none rounded-xl border px-4 py-3 text-[1rem] leading-relaxed text-[var(--on-surface)] outline-none backdrop-blur-xl transition-all duration-300 placeholder:text-[color-mix(in_srgb,var(--on-surface-dim)_76%,transparent)] ${controlSurfaceClass} ${controlFocusClass}`}
      />
      {help && <span className={helperTextClass}>{help}</span>}
    </label>
  );
}

function SelectField({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: string[];
  value: string;
}) {
  return (
    <label className="grid gap-2">
      <span className={fieldLabelClass}>{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`h-12 rounded-xl border px-4 text-[1rem] text-[var(--on-surface)] outline-none backdrop-blur-xl transition-all duration-300 ${controlSurfaceClass} ${controlFocusClass}`}
      >
        <option value="">Select one...</option>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function PickerGroup({
  label,
  onSelect,
  options,
  selected,
}: {
  label: string;
  onSelect: (value: string) => void;
  options: readonly (readonly [string, string])[];
  selected: string;
}) {
  return (
    <div>
      <p className="label-caps mb-3 text-[color-mix(in_srgb,var(--on-surface-dim)_86%,var(--on-surface))]">
        {label}
      </p>
      <div className="grid gap-2 sm:grid-cols-4">
        {options.map(([value, sub]) => (
          <button
            key={value}
            type="button"
            onClick={() => onSelect(value)}
            aria-pressed={selected === value}
            className={cn(
              "flex min-h-14 flex-col items-center justify-center rounded-xl border px-3 py-2 text-center transition-all duration-300",
              selected === value
                ? "border-[color-mix(in_srgb,var(--primary)_54%,transparent)] bg-[color-mix(in_srgb,var(--primary)_14%,var(--surface)_86%)] shadow-[0_12px_32px_color-mix(in_srgb,var(--primary)_10%,transparent)] dark:border-[color-mix(in_srgb,var(--primary)_32%,transparent)] dark:bg-[color-mix(in_srgb,var(--primary)_10%,transparent)]"
                : `${controlSurfaceClass} hover:border-[color-mix(in_srgb,var(--primary)_34%,transparent)]`,
            )}
          >
            <span className="font-mono text-[0.84rem] tracking-tight text-[var(--on-surface)]">
              {value}
            </span>
            <span className="mt-1 text-[0.8rem] text-[var(--on-surface-dim)]">
              {sub}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function SuccessScreen({ refCode }: { refCode: string }) {
  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[var(--bg)] px-5 py-32 text-center sm:px-8">
      <PlusTexture opacity={0.08} />
      <ArtworkLayer />
      <div className="relative z-[1] mx-auto flex min-h-[calc(100svh-16rem)] max-w-2xl flex-col items-center justify-center">
        <span className="grid h-20 w-20 place-items-center rounded-full border border-[color-mix(in_srgb,var(--tertiary)_30%,transparent)] bg-[color-mix(in_srgb,var(--tertiary)_12%,transparent)] text-[var(--tertiary)]">
          <IconCheck size={34} stroke={2} />
        </span>
        <p className="label-caps mt-8 text-[var(--tertiary)]">
          Hiring brief prepared
        </p>
        <h1 className="mt-4 text-[clamp(2.3rem,7vw,4.4rem)] font-normal leading-[0.98] tracking-tight text-[var(--on-surface)]">
          Hiring brief ready to transmit.
        </h1>
        <p className="body-md mt-5 max-w-lg text-[var(--on-surface-dim)]">
          Your email client should open with the full hiring brief. Send it from
          there, and Andishi will respond with the next step within 24 hours.
        </p>
        <p className="mt-6 rounded-xl border border-[color-mix(in_srgb,var(--secondary)_22%,transparent)] bg-[color-mix(in_srgb,var(--secondary)_10%,transparent)] px-5 py-2.5 font-mono text-[0.78rem] tracking-tight text-[var(--secondary)]">
          ref: {refCode}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex min-h-[2.35rem] items-center justify-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--on-surface)_16%,transparent)] bg-[var(--on-surface)] px-6 py-2.5 text-[0.98rem] font-medium text-[var(--bg)] shadow-[0_16px_36px_color-mix(in_srgb,var(--bg-deep)_36%,transparent)] transition-all duration-300 hover:-translate-y-px"
          >
            Back to Andishi
            <IconHome size={16} stroke={1.8} />
          </Link>
        </div>
      </div>
    </main>
  );
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
