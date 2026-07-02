"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  IconArrowLeft,
  IconMapPin,
  IconClock,
  IconCheck,
  IconBriefcase,
  IconUpload,
  IconBrandGithub,
  IconBrandLinkedin,
  IconWorld,
  IconAlertCircle,
  IconEdit,
  IconX,
} from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  getJobBySlug,
  saveJobOpening,
  saveApplication,
  JobOpening,
  Application,
  JobKind,
  JobStatus,
} from "@/data/careers";
import { PublicPageShell, GlassPanel } from "./public-page";

// Custom simple markdown parser to render descriptions beautifully without library dependencies
function MarkdownRenderer({ content }: { content: string }) {
  if (!content) return null;

  const lines = content.split("\n");
  return (
    <div className="space-y-4 text-[0.9rem] leading-[1.7] text-[var(--on-surface-dim)]">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        // Headers
        if (trimmed.startsWith("## ")) {
          return (
            <h2
              key={idx}
              className="title-serif text-[1.4rem] font-normal text-[var(--on-surface)] mt-8 mb-4 border-b border-[var(--glass-border)] pb-2 first:mt-0"
            >
              {trimmed.substring(3)}
            </h2>
          );
        }
        if (trimmed.startsWith("### ")) {
          return (
            <h3
              key={idx}
              className="font-sans font-normal text-[1.05rem] text-[var(--on-surface)] mt-6 mb-2"
            >
              {trimmed.substring(4)}
            </h3>
          );
        }

        // Bullet Lists
        if (trimmed.startsWith("- ")) {
          const listText = trimmed.substring(2);
          // Parse bold markers inside list items
          return (
            <ul key={idx} className="list-disc pl-5 space-y-1.5 my-2">
              <li className="pl-1">
                <span dangerouslySetInnerHTML={{ __html: parseBold(listText) }} />
              </li>
            </ul>
          );
        }

        // Standard Paragraphs (ignore empty lines)
        if (trimmed === "") return <div key={idx} className="h-2" />;

        return (
          <p key={idx} className="mb-3">
            <span dangerouslySetInnerHTML={{ __html: parseBold(trimmed) }} />
          </p>
        );
      })}
    </div>
  );
}

// Simple helper to replace **bold** with <strong>bold</strong>
function parseBold(text: string): string {
  return text.replace(
    /\*\*(.*?)\*\*/g,
    '<strong class="font-normal text-[var(--on-surface)]">$1</strong>',
  );
}

const kindLabels: Record<JobKind, string> = {
  freelance: "Freelance Project",
  internal: "Studio Core",
  outsourced: "Client Placement",
};

export function CareerDetailExperience({ slug }: { slug: string }) {
  const [job, setJob] = useState<JobOpening | null>(() => {
    return getJobBySlug(slug) || null;
  });
  const [loading, setLoading] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeUrl, setResumeUrl] = useState("");
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [coverNote, setCoverNote] = useState("");

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "done">("idle");

  // Admin inline editing simulation state
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTitle, setEditingTitle] = useState(() => getJobBySlug(slug)?.title ?? "");
  const [editingLocation, setEditingLocation] = useState(() => getJobBySlug(slug)?.location ?? "");
  const [editingCompensation, setEditingCompensation] = useState(
    () => getJobBySlug(slug)?.compensation_note ?? "",
  );
  const [editingDescription, setEditingDescription] = useState(
    () => getJobBySlug(slug)?.description_md ?? "",
  );
  const [editingStatus, setEditingStatus] = useState<JobStatus>(
    () => getJobBySlug(slug)?.status ?? "open",
  );

  useEffect(() => {
    // Intentionally an Effect, not a lazy useState initializer: localStorage
    // isn't available during SSR, so reading it eagerly would make the first
    // client render disagree with the server-rendered HTML (a hydration
    // mismatch). Deferring to an Effect keeps the first paint consistent and
    // only flips isAdmin after hydration completes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsAdmin(localStorage.getItem("andishi_admin_sim_logged_in") === "true");
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResumeFile(file);
      setUploadStatus("uploading");
      // Simulate file upload progress
      setTimeout(() => {
        setUploadStatus("done");
        setResumeUrl(`https://example.com/resumes/${file.name}`);
      }, 1500);
    }
  };

  const handleApply = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!job) return;

    if (!resumeUrl && !resumeFile) {
      alert("Please upload a resume or provide a link.");
      return;
    }

    setIsSubmitting(true);
    setSubmitProgress(10);

    // Simulate submission timeline
    const interval = setInterval(() => {
      setSubmitProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 25;
      });
    }, 400);

    setTimeout(() => {
      clearInterval(interval);
      setSubmitProgress(100);

      const application: Application = {
        id: `app-${Date.now()}`,
        job_opening_id: job.id,
        applicant_name: name,
        applicant_email: email,
        resume_url: resumeUrl || `https://example.com/resumes/${resumeFile?.name || "cv.pdf"}`,
        links: { github, linkedin, portfolio },
        cover_note: coverNote,
        stage: "applied",
        created_at: new Date().toISOString(),
      };

      saveApplication(application);

      setTimeout(() => {
        setIsSubmitting(false);
        setIsSuccess(true);
      }, 300);
    }, 2000);
  };

  // Inline edit save
  const handleInlineSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;

    const updatedJob: JobOpening = {
      ...job,
      title: editingTitle,
      location: editingLocation,
      compensation_note: editingCompensation,
      description_md: editingDescription,
      status: editingStatus,
    };

    saveJobOpening(updatedJob);
    setJob(updatedJob);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <PublicPageShell>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
        </div>
      </PublicPageShell>
    );
  }

  if (!job) {
    return (
      <PublicPageShell>
        <div className="mx-auto max-w-[92rem] px-5 py-32 text-center sm:px-8 lg:px-10">
          <GlassPanel className="max-w-md mx-auto py-16 flex flex-col items-center gap-5">
            <IconAlertCircle size={40} className="text-red-400" />
            <h1 className="title-serif text-[1.5rem] text-[var(--on-surface)]">
              Opening Not Found
            </h1>
            <p className="body-md text-[0.85rem] text-[var(--on-surface-dim)]">
              This job position may have been closed or is temporarily unavailable.
            </p>
            <Link
              href="/careers"
              className="flex items-center gap-1.5 rounded-xl bg-white px-5 py-2.5 font-mono text-[0.7rem] uppercase tracking-wider text-black transition-all hover:bg-white/90"
            >
              <IconArrowLeft size={14} /> Back to Careers
            </Link>
          </GlassPanel>
        </div>
      </PublicPageShell>
    );
  }

  return (
    <PublicPageShell>
      {/* Back link bar */}
      <div className="mx-auto max-w-[92rem] px-5 pt-28 sm:px-8 lg:px-10">
        <Link
          href="/careers"
          className="group inline-flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-wider text-[var(--on-surface-dim)] hover:text-white transition-colors duration-200"
        >
          <IconArrowLeft
            size={14}
            className="transition-transform duration-200 group-hover:-translate-x-0.5"
          />
          All Openings
        </Link>
      </div>

      {/* Main Container */}
      <section className="px-5 pb-20 pt-8 sm:px-8 lg:px-10 lg:pb-32">
        <div className="mx-auto max-w-[92rem]">
          {/* Header Block */}
          <div className="relative border-b border-[var(--glass-border)] pb-8 mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="rounded-full bg-white/5 border border-[var(--glass-border)] px-3 py-[3px] font-mono text-[0.64rem] uppercase tracking-wider text-[var(--primary)] font-medium">
                  {kindLabels[job.kind]}
                </span>
                <span className="font-mono text-[0.66rem] text-[var(--on-surface-dim)] opacity-50">
                  {job.department} &bull; {job.seniority}
                </span>
              </div>
              <h1 className="title-serif text-[clamp(2.1rem,5vw,3.3rem)] font-normal leading-[1.04] tracking-tight text-[var(--on-surface)]">
                {job.title}
              </h1>
            </div>

            <div className="flex flex-col items-start gap-4 md:items-end">
              <div className="flex flex-wrap items-center gap-4 font-mono text-[0.74rem] text-[var(--on-surface-dim)]">
                <div className="flex items-center gap-1">
                  <IconMapPin size={15} className="text-[var(--secondary)]" />
                  {job.location} {job.remote && "(Remote eligible)"}
                </div>
                <div className="flex items-center gap-1">
                  <IconClock size={15} />
                  {job.compensation_note}
                </div>
              </div>

              {/* Inline Edit Trigger */}
              {isAdmin && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3.5 py-1.5 font-mono text-[0.68rem] tracking-tight text-[var(--on-surface-dim)] hover:text-white hover:border-[var(--on-surface)] transition-all"
                >
                  <IconEdit size={12} />
                  Edit Role Details
                </button>
              )}
            </div>
          </div>

          {/* Grid Content Split */}
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-start">
            {/* Left Rail (7-columns): Description */}
            <div className="lg:col-span-7 space-y-6">
              <div
                className={cn(
                  "relative overflow-hidden flex flex-col justify-between group transition-all duration-300",
                  "md:rounded-[1.35rem] md:border md:border-[var(--glass-border)] md:bg-[color-mix(in_srgb,var(--surface)_38%,transparent)] md:p-8 md:shadow-[0_24px_80px_color-mix(in_srgb,var(--bg-deep)_24%,transparent)] md:backdrop-blur-2xl",
                  "max-md:p-0 max-md:bg-transparent max-md:shadow-none",
                )}
              >
                <MarkdownRenderer content={job.description_md} />

                {/* Requirements Skills */}
                <div className="mt-8 pt-8 border-t border-[var(--glass-border)]">
                  <h3 className="font-sans font-normal text-[1.05rem] text-[var(--on-surface)] mb-4">
                    Relevant Technologies & Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full border border-[var(--glass-border)] bg-[var(--surface-high)] px-3.5 py-1.5 font-mono text-[0.68rem] text-[var(--on-surface)]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Rail (5-columns): Form Card */}
            <div className="lg:col-span-5">
              <AnimatePresence mode="wait">
                {!isSuccess ? (
                  <motion.div
                    key="apply-form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.35 }}
                  >
                    <GlassPanel className="p-6 sm:p-8 border-[color-mix(in_srgb,var(--primary)_20%,transparent)] shadow-[0_24px_64px_rgba(208,188,255,0.06)]">
                      <h2 className="title-serif text-[1.5rem] font-normal text-[var(--on-surface)] mb-2">
                        Apply Now
                      </h2>
                      <p className="body-md text-[0.8rem] text-[var(--on-surface-dim)] mb-6 leading-relaxed">
                        Submit your developer profile directly to Andishi operations. Files upload
                        locally.
                      </p>

                      <form onSubmit={handleApply} className="space-y-4">
                        {/* Name */}
                        <div>
                          <label className="block text-[0.7rem] font-mono uppercase tracking-wider text-[var(--on-surface-dim)] mb-1">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Amina Otieno"
                            className="h-10 w-full rounded-xl border border-[var(--glass-border)] bg-[var(--surface-low)] px-3 text-[0.85rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)] transition-all"
                          />
                        </div>

                        {/* Email */}
                        <div>
                          <label className="block text-[0.7rem] font-mono uppercase tracking-wider text-[var(--on-surface-dim)] mb-1">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="amina@kijani.io"
                            className="h-10 w-full rounded-xl border border-[var(--glass-border)] bg-[var(--surface-low)] px-3 text-[0.85rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)] transition-all"
                          />
                        </div>

                        {/* Resume File Upload Selector */}
                        <div>
                          <label className="block text-[0.7rem] font-mono uppercase tracking-wider text-[var(--on-surface-dim)] mb-1">
                            Upload Resume *
                          </label>
                          <div className="relative flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--glass-border)] bg-[var(--surface-low)] p-5 text-center transition-all hover:bg-[color-mix(in_srgb,var(--on-surface)_3%,transparent)]">
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx"
                              onChange={handleFileChange}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            {uploadStatus === "idle" && (
                              <div className="flex flex-col items-center gap-1 text-[var(--on-surface-dim)]">
                                <IconUpload size={20} stroke={1.5} />
                                <span className="text-[0.78rem]">Select PDF / Word file</span>
                                <span className="text-[0.62rem] opacity-50">(Max 5MB)</span>
                              </div>
                            )}
                            {uploadStatus === "uploading" && (
                              <div className="flex flex-col items-center gap-2">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
                                <span className="font-mono text-[0.68rem] text-[var(--primary)]">
                                  Simulating upload...
                                </span>
                              </div>
                            )}
                            {uploadStatus === "done" && (
                              <div className="flex flex-col items-center gap-1 text-emerald-400">
                                <IconCheck size={20} />
                                <span className="text-[0.78rem] font-medium">
                                  {resumeFile?.name}
                                </span>
                                <span className="text-[0.62rem] opacity-60">Ready to submit</span>
                              </div>
                            )}
                          </div>

                          <div className="mt-2 text-center text-[0.68rem] text-[var(--on-surface-dim)] opacity-40">
                            — or provide a URL —
                          </div>

                          <input
                            type="url"
                            value={resumeUrl}
                            onChange={(e) => {
                              setResumeUrl(e.target.value);
                              if (e.target.value) setUploadStatus("done");
                            }}
                            placeholder="https://drive.google.com/your-cv.pdf"
                            className="h-10 w-full rounded-xl border border-[var(--glass-border)] bg-[var(--surface-low)] px-3 mt-2 text-[0.82rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)] transition-all"
                          />
                        </div>

                        {/* Social Links */}
                        <div className="space-y-2 pt-2">
                          <label className="block text-[0.7rem] font-mono uppercase tracking-wider text-[var(--on-surface-dim)] mb-1">
                            Relevant Links
                          </label>
                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                            <div className="relative">
                              <IconBrandGithub
                                size={14}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--on-surface-dim)] opacity-60"
                              />
                              <input
                                type="url"
                                value={github}
                                onChange={(e) => setGithub(e.target.value)}
                                placeholder="GitHub URL"
                                className="h-9 w-full rounded-lg border border-[var(--glass-border)] bg-[var(--surface-low)] pl-8 pr-2 text-[0.78rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
                              />
                            </div>
                            <div className="relative">
                              <IconBrandLinkedin
                                size={14}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--on-surface-dim)] opacity-60"
                              />
                              <input
                                type="url"
                                value={linkedin}
                                onChange={(e) => setLinkedin(e.target.value)}
                                placeholder="LinkedIn URL"
                                className="h-9 w-full rounded-lg border border-[var(--glass-border)] bg-[var(--surface-low)] pl-8 pr-2 text-[0.78rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
                              />
                            </div>
                            <div className="relative">
                              <IconWorld
                                size={14}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--on-surface-dim)] opacity-60"
                              />
                              <input
                                type="url"
                                value={portfolio}
                                onChange={(e) => setPortfolio(e.target.value)}
                                placeholder="Portfolio URL"
                                className="h-9 w-full rounded-lg border border-[var(--glass-border)] bg-[var(--surface-low)] pl-8 pr-2 text-[0.78rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Cover Note */}
                        <div>
                          <label className="block text-[0.7rem] font-mono uppercase tracking-wider text-[var(--on-surface-dim)] mb-1">
                            Cover Note / Pitch (Optional)
                          </label>
                          <textarea
                            rows={4}
                            value={coverNote}
                            onChange={(e) => setCoverNote(e.target.value)}
                            placeholder="Why are you a good fit for this role? Share relevant highlights."
                            className="w-full rounded-xl border border-[var(--glass-border)] bg-[var(--surface-low)] p-3 text-[0.82rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)] transition-all"
                          />
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4">
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full flex items-center justify-center gap-2 rounded-xl bg-white px-5 h-11 text-[0.82rem] font-normal text-black transition-all hover:bg-white/90 active:scale-[0.98] disabled:opacity-50"
                          >
                            {isSubmitting ? (
                              <div className="flex items-center gap-2">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                                <span>Submitting ({submitProgress}%)</span>
                              </div>
                            ) : (
                              <>
                                <IconBriefcase size={16} stroke={2} />
                                Submit Application
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    </GlassPanel>
                  </motion.div>
                ) : (
                  <motion.div
                    key="apply-success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", duration: 0.5 }}
                  >
                    <GlassPanel className="p-8 text-center border-emerald-400/20 shadow-[0_24px_64px_rgba(16,185,129,0.06)] flex flex-col items-center gap-5">
                      <div className="h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                        <IconCheck size={26} stroke={2.5} />
                      </div>
                      <h2 className="title-serif text-[1.6rem] text-[var(--on-surface)]">
                        Application Logged!
                      </h2>
                      <p className="body-md text-[0.84rem] text-[var(--on-surface-dim)] max-w-sm">
                        Thank you for applying, <strong className="text-white">{name}</strong>. Your
                        profile has been queued directly into Andishi&apos;s operational pipeline.
                      </p>

                      <div className="w-full rounded-xl bg-[var(--surface-low)] border border-[var(--glass-border)] p-4 text-left font-mono text-[0.66rem] space-y-2 text-[var(--on-surface-dim)]">
                        <div className="flex justify-between border-b border-white/5 pb-1">
                          <span>Applicant</span>
                          <span className="text-white">{email}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-1">
                          <span>Position</span>
                          <span className="text-white">{job.title}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Verification Status</span>
                          <span className="text-emerald-400 font-medium">
                            QUEUED &bull; STAGE 1
                          </span>
                        </div>
                      </div>

                      <p className="text-[0.72rem] text-[var(--on-surface-dim)] opacity-50 mt-1">
                        A recruiter will review your profile and get back to you shortly. You can
                        also view this application in the admin portal simulation.
                      </p>

                      <button
                        onClick={() => {
                          setIsSuccess(false);
                          setName("");
                          setEmail("");
                          setResumeFile(null);
                          setResumeUrl("");
                          setGithub("");
                          setLinkedin("");
                          setPortfolio("");
                          setCoverNote("");
                          setUploadStatus("idle");
                        }}
                        className="rounded-xl border border-[var(--glass-border)] px-4 py-2 font-mono text-[0.68rem] uppercase tracking-wider text-[var(--on-surface)] hover:bg-white/5 transition-all"
                      >
                        Submit another application
                      </button>
                    </GlassPanel>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Edit Drawer Sidebar (Full Screen Modal Overlay) */}
      <AnimatePresence>
        {isEditing && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-md"
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.35, ease: "easeInOut" }}
              className="h-full w-full max-w-xl border-l border-[var(--glass-border)] bg-[var(--surface-container)] p-6 shadow-2xl backdrop-blur-2xl overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-[var(--glass-border)] pb-4 mb-6">
                <div>
                  <h2 className="title-serif text-[1.4rem] text-[var(--on-surface)]">
                    Edit Opening Details
                  </h2>
                  <p className="font-mono text-[0.65rem] text-[var(--on-surface-dim)] opacity-50">
                    ID: {job.id}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="rounded-full p-1 text-[var(--on-surface-dim)] hover:text-[var(--on-surface)] hover:bg-[color-mix(in_srgb,var(--on-surface)_10%,transparent)] transition-colors"
                >
                  <IconX size={20} />
                </button>
              </div>

              <form onSubmit={handleInlineSave} className="space-y-4">
                <div>
                  <label className="block text-[0.7rem] font-mono uppercase tracking-wider text-[var(--on-surface-dim)] mb-1">
                    Job Title
                  </label>
                  <input
                    type="text"
                    required
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    className="h-10 w-full rounded-xl border border-[var(--glass-border)] bg-[var(--surface-low)] px-3 text-[0.85rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
                  />
                </div>

                <div>
                  <label className="block text-[0.7rem] font-mono uppercase tracking-wider text-[var(--on-surface-dim)] mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    required
                    value={editingLocation}
                    onChange={(e) => setEditingLocation(e.target.value)}
                    className="h-10 w-full rounded-xl border border-[var(--glass-border)] bg-[var(--surface-low)] px-3 text-[0.85rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
                  />
                </div>

                <div>
                  <label className="block text-[0.7rem] font-mono uppercase tracking-wider text-[var(--on-surface-dim)] mb-1">
                    Compensation Note
                  </label>
                  <input
                    type="text"
                    required
                    value={editingCompensation}
                    onChange={(e) => setEditingCompensation(e.target.value)}
                    className="h-10 w-full rounded-xl border border-[var(--glass-border)] bg-[var(--surface-low)] px-3 text-[0.85rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
                  />
                </div>

                <div>
                  <label className="block text-[0.7rem] font-mono uppercase tracking-wider text-[var(--on-surface-dim)] mb-1">
                    Status
                  </label>
                  <select
                    value={editingStatus}
                    onChange={(e) => setEditingStatus(e.target.value as JobStatus)}
                    className="h-10 w-full rounded-xl border border-[var(--glass-border)] bg-[var(--surface-low)] px-3 text-[0.85rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
                  >
                    <option value="open">Open (Public)</option>
                    <option value="draft">Draft (Admin Only)</option>
                    <option value="closed">Closed / Filled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[0.7rem] font-mono uppercase tracking-wider text-[var(--on-surface-dim)] mb-1">
                    Job Description (Markdown)
                  </label>
                  <textarea
                    required
                    rows={12}
                    value={editingDescription}
                    onChange={(e) => setEditingDescription(e.target.value)}
                    className="w-full rounded-xl border border-[var(--glass-border)] bg-[var(--surface-low)] p-3 font-sans text-[0.82rem] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--glass-border)] mt-6">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="rounded-xl border border-[var(--glass-border)] px-4 h-10 font-mono text-[0.7rem] uppercase tracking-wider text-[var(--on-surface-dim)] hover:bg-[color-mix(in_srgb,var(--on-surface)_5%,transparent)] transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 rounded-xl bg-[var(--on-surface)] px-5 h-10 font-mono text-[0.7rem] uppercase tracking-wider text-[var(--bg)] hover:bg-[color-mix(in_srgb,var(--on-surface)_90%,transparent)] transition-all active:scale-95"
                  >
                    <IconCheck size={14} />
                    Save Details
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PublicPageShell>
  );
}
