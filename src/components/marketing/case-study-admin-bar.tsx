"use client";

/**
 * src/components/marketing/case-study-admin-bar.tsx
 *
 * Floating admin control bar — appears at the top of /work/[slug] when the
 * server determines session.user.role === "admin". Never rendered for public
 * visitors (no CSS-hide — it's simply not included in the RSC output).
 *
 * Features:
 * - Autosave state indicator ("Saved" / "Saving…" / "Error")
 * - Publish button with validation modal
 * - Archive (soft-delete) with confirmation dialog
 * - "Back to admin" link
 */

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconSend2,
  IconArchive,
  IconChevronLeft,
  IconAlertCircle,
  IconCheck,
  IconLoader2,
  IconX,
} from "@tabler/icons-react";
import Link from "next/link";
import { cosmicSpring } from "@/lib/motion";
import { cn } from "@/lib/utils";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

type PublishValidationError = {
  field: string;
  message: string;
};

type CaseStudyAdminBarProps = {
  projectId: string;
  projectTitle: string;
  caseStudyStatus: "draft" | "published" | "archived";
  saveStatus: SaveStatus;
  onPublish: () => Promise<PublishValidationError[]>;
  onArchive: () => Promise<void>;
};

function ArchiveModal({
  title,
  onConfirm,
  onCancel,
}: {
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[250] flex items-center justify-center bg-black/60 backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1, transition: cosmicSpring }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="mx-4 w-full max-w-sm rounded-3xl border border-[color-mix(in_srgb,var(--error)_20%,transparent)] bg-[var(--surface-highest)] p-6 shadow-2xl backdrop-blur-2xl"
      >
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--error)_12%,transparent)]">
          <IconArchive size={20} className="text-[var(--error)]" />
        </div>
        <h3 className="text-[1.05rem] text-[var(--on-surface)]">Archive this case study?</h3>
        <p className="mt-2 text-[0.88rem] text-[var(--on-surface-dim)]">
          &ldquo;{title}&rdquo; will be removed from /work and hidden from visitors. The row is not
          deleted — you can restore it later.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-2 text-[0.88rem] text-[var(--on-surface-dim)] hover:border-[var(--outline)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--secondary)_40%,transparent)]"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-full bg-[var(--error)] px-4 py-2 text-[0.88rem] text-white hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--error)]"
          >
            Archive
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function PublishModal({
  errors,
  onClose,
}: {
  errors: PublishValidationError[];
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[250] flex items-center justify-center bg-black/60 backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1, transition: cosmicSpring }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="mx-4 w-full max-w-md rounded-3xl border border-[color-mix(in_srgb,var(--error)_20%,transparent)] bg-[var(--surface-highest)] p-6 shadow-2xl backdrop-blur-2xl"
      >
        <div className="mb-4 flex items-center gap-2">
          <IconAlertCircle size={18} className="text-[var(--error)]" />
          <h3 className="text-[1rem] text-[var(--on-surface)]">Cannot publish yet</h3>
        </div>
        <p className="mb-4 text-[0.88rem] text-[var(--on-surface-dim)]">
          Fix the following before publishing:
        </p>
        <ul className="space-y-2">
          {errors.map((err, i) => (
            <li key={i} className="flex items-start gap-2 text-[0.88rem]">
              <IconX size={14} className="mt-0.5 shrink-0 text-[var(--error)]" />
              <span className="text-[var(--on-surface)]">
                <span className="text-[var(--on-surface-dim)]">{err.field}: </span>
                {err.message}
              </span>
            </li>
          ))}
        </ul>
        <button
          onClick={onClose}
          className="mt-5 w-full rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] py-2 text-[0.88rem] text-[var(--on-surface-dim)] hover:border-[var(--outline)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--secondary)_40%,transparent)]"
        >
          OK, I&rsquo;ll fix it
        </button>
      </motion.div>
    </motion.div>
  );
}

export function CaseStudyAdminBar({
  projectTitle,
  caseStudyStatus,
  saveStatus,
  onPublish,
  onArchive,
}: Omit<CaseStudyAdminBarProps, "projectId">) {
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [publishErrors, setPublishErrors] = useState<PublishValidationError[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  const handlePublish = useCallback(async () => {
    setIsPublishing(true);
    try {
      const errors = await onPublish();
      if (errors.length > 0) {
        setPublishErrors(errors);
      }
    } finally {
      setIsPublishing(false);
    }
  }, [onPublish]);

  const handleArchiveConfirm = useCallback(async () => {
    setShowArchiveModal(false);
    setIsArchiving(true);
    try {
      await onArchive();
    } finally {
      setIsArchiving(false);
    }
  }, [onArchive]);

  const saveIcons = {
    idle: null,
    saving: <IconLoader2 size={14} className="animate-spin text-[var(--secondary)]" />,
    saved: <IconCheck size={14} className="text-[var(--tertiary)]" />,
    error: <IconAlertCircle size={14} className="text-[var(--error)]" />,
  };

  const saveLabels = {
    idle: null,
    saving: "Saving…",
    saved: "Saved",
    error: "Save error",
  };

  return (
    <>
      {/* Admin Bar */}
      <motion.div
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1, transition: cosmicSpring }}
        className="fixed left-0 right-0 top-0 z-[150] flex items-center justify-between gap-3 border-b border-[color-mix(in_srgb,var(--secondary)_18%,transparent)] bg-[color-mix(in_srgb,var(--bg)_92%,transparent)] px-4 py-2.5 backdrop-blur-2xl sm:px-6"
        aria-label="Case study admin controls"
      >
        {/* Left: back + status */}
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-[0.8rem] text-[var(--on-surface-dim)] hover:text-[var(--on-surface)] hover:bg-[var(--surface-high)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--secondary)_40%,transparent)]"
          >
            <IconChevronLeft size={14} />
            Admin
          </Link>

          <span className="hidden h-4 w-px bg-[var(--outline-variant)] sm:block" aria-hidden />

          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                caseStudyStatus === "published"
                  ? "bg-[var(--tertiary)]"
                  : caseStudyStatus === "archived"
                    ? "bg-[var(--error)]"
                    : "bg-[var(--secondary)]",
              )}
              aria-hidden
            />
            <span className="hidden text-[0.78rem] text-[var(--on-surface-dim)] sm:inline">
              {caseStudyStatus === "published"
                ? "Published"
                : caseStudyStatus === "archived"
                  ? "Archived"
                  : "Draft"}
            </span>
          </div>
        </div>

        {/* Center: title */}
        <p className="hidden truncate text-[0.82rem] text-[var(--on-surface-dim)] md:block max-w-[200px]">
          Editing: <span className="text-[var(--on-surface)]">{projectTitle}</span>
        </p>

        {/* Right: save status + actions */}
        <div className="flex items-center gap-2">
          {/* Save status */}
          {saveStatus !== "idle" && (
            <div className="flex items-center gap-1.5 rounded-lg px-2 py-1">
              {saveIcons[saveStatus]}
              <span
                className={cn(
                  "text-[0.78rem]",
                  saveStatus === "saved"
                    ? "text-[var(--tertiary)]"
                    : saveStatus === "error"
                      ? "text-[var(--error)]"
                      : "text-[var(--on-surface-dim)]",
                )}
              >
                {saveLabels[saveStatus]}
              </span>
            </div>
          )}

          {/* Archive */}
          {caseStudyStatus !== "archived" && (
            <button
              onClick={() => setShowArchiveModal(true)}
              disabled={isArchiving}
              aria-label="Archive case study"
              className="flex items-center gap-1.5 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-1.5 text-[0.8rem] text-[var(--on-surface-dim)] hover:border-[color-mix(in_srgb,var(--error)_30%,transparent)] hover:text-[var(--error)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--error)_40%,transparent)] disabled:opacity-50"
            >
              {isArchiving ? (
                <IconLoader2 size={13} className="animate-spin" />
              ) : (
                <IconArchive size={13} />
              )}
              <span className="hidden sm:inline">Archive</span>
            </button>
          )}

          {/* Publish */}
          {caseStudyStatus !== "published" && caseStudyStatus !== "archived" && (
            <button
              onClick={handlePublish}
              disabled={isPublishing}
              aria-label="Publish case study"
              className="flex items-center gap-1.5 rounded-full bg-[var(--secondary)] px-4 py-1.5 text-[0.8rem] text-white hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--secondary)] disabled:opacity-50"
            >
              {isPublishing ? (
                <IconLoader2 size={13} className="animate-spin" />
              ) : (
                <IconSend2 size={13} />
              )}
              {isPublishing ? "Publishing…" : "Publish"}
            </button>
          )}

          {/* Re-publish (already published — keep visible for re-run) */}
          {caseStudyStatus === "published" && (
            <div className="flex items-center gap-1.5 rounded-full border border-[color-mix(in_srgb,var(--tertiary)_20%,transparent)] bg-[color-mix(in_srgb,var(--tertiary)_8%,transparent)] px-3 py-1.5 text-[0.8rem] text-[var(--tertiary)]">
              <IconCheck size={13} />
              Live
            </div>
          )}
        </div>
      </motion.div>

      {/* Spacer to prevent content from going under the bar */}
      <div className="h-12" aria-hidden />

      {/* Modals */}
      <AnimatePresence>
        {showArchiveModal && (
          <ArchiveModal
            key="archive-modal"
            title={projectTitle}
            onConfirm={handleArchiveConfirm}
            onCancel={() => setShowArchiveModal(false)}
          />
        )}
        {publishErrors.length > 0 && (
          <PublishModal
            key="publish-modal"
            errors={publishErrors}
            onClose={() => setPublishErrors([])}
          />
        )}
      </AnimatePresence>
    </>
  );
}
