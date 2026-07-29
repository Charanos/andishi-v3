"use client";

/**
 * src/components/ui/inline-edit-field.tsx
 *
 * Click-to-edit field for the case study admin overlay.
 * Renders as a styled text element when in read mode; activates a
 * <textarea> or <input> on click. Autosave fires 800ms after last keystroke.
 *
 * Accessibility:
 * - Keyboard: Enter/Tab commits, Escape discards
 * - Focus: field activates on Enter/Space when focused in read mode
 * - Screen readers: aria-label describes the edit action
 */

import { useCallback, useRef, useState } from "react";
import { IconPencil, IconCheck, IconX } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

type InlineEditFieldProps = {
  /** Current value to display and edit */
  value: string;
  /** Called when the value changes (use for autosave) */
  onChange: (value: string) => void;
  /** Optional: called when the user explicitly commits (Enter/Tab/blur) */
  onCommit?: (value: string) => void;
  /** Input mode: "text" = single line input, "textarea" = multi-line */
  mode?: "text" | "textarea";
  /** Placeholder shown in the edit field when empty */
  placeholder?: string;
  /** ClassName applied to the read-mode wrapper */
  readClassName?: string;
  /** ClassName applied to the edit input/textarea */
  editClassName?: string;
  /** Accessible label for the edit affordance */
  label: string;
  /** Max character count (shows counter in textarea mode) */
  maxLength?: number;
  /** If true, renders the pencil icon even when not hovered */
  alwaysShowEdit?: boolean;
};

const AUTOSAVE_DELAY = 800;

export function InlineEditField({
  value,
  onChange,
  onCommit,
  mode = "textarea",
  placeholder = "Click to edit…",
  readClassName,
  editClassName,
  label,
  maxLength,
  alwaysShowEdit = false,
}: InlineEditFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [isHovered, setIsHovered] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    if (!isEditing) setDraft(value);
  }

  const activate = useCallback(() => {
    setDraft(value);
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [value]);

  const commit = useCallback(() => {
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    setIsEditing(false);
    onCommit?.(draft);
  }, [draft, onCommit]);

  const discard = useCallback(() => {
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    setDraft(value);
    setIsEditing(false);
  }, [value]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      const next = e.target.value;
      setDraft(next);
      // Debounced autosave
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
      autosaveTimer.current = setTimeout(() => {
        onChange(next);
      }, AUTOSAVE_DELAY);
    },
    [onChange],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      if (e.key === "Escape") {
        discard();
        return;
      }
      if (mode === "text" && (e.key === "Enter" || e.key === "Tab")) {
        e.preventDefault();
        commit();
      }
    },
    [commit, discard, mode],
  );

  const handleReadKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        activate();
      }
    },
    [activate],
  );

  if (isEditing) {
    const sharedProps = {
      ref: inputRef as never,
      value: draft,
      onChange: handleChange,
      onKeyDown: handleKeyDown,
      onBlur: commit,
      placeholder,
      maxLength,
      "aria-label": label,
      className: cn(
        "w-full rounded-xl border border-[var(--secondary)] bg-[var(--surface-high)]",
        "px-3 py-2 text-[var(--on-surface)] placeholder-[var(--on-surface-dim)]",
        "focus:outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--secondary)_50%,transparent)]",
        "resize-none transition-all duration-200",
        editClassName,
      ),
    };

    return (
      <div className="relative">
        {mode === "textarea" ? (
          <textarea {...sharedProps} rows={Math.max(3, draft.split("\n").length + 1)} />
        ) : (
          <input type="text" {...sharedProps} />
        )}
        {maxLength && mode === "textarea" && (
          <span className="absolute bottom-2 right-3 font-mono text-[0.7rem] text-[var(--on-surface-dim)]">
            {draft.length}/{maxLength}
          </span>
        )}
        <div className="mt-1.5 flex items-center gap-2">
          <button
            onClick={commit}
            className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-[0.78rem] text-[var(--tertiary)] hover:bg-[color-mix(in_srgb,var(--tertiary)_10%,transparent)] transition-colors"
            title="Commit (Enter)"
          >
            <IconCheck size={13} />
            Save
          </button>
          <button
            onClick={discard}
            className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-[0.78rem] text-[var(--on-surface-dim)] hover:bg-[var(--surface-high)] transition-colors"
            title="Discard (Escape)"
          >
            <IconX size={13} />
            Discard
          </button>
        </div>
      </div>
    );
  }

  const showIcon = alwaysShowEdit || isHovered;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Edit ${label}`}
      onClick={activate}
      onKeyDown={handleReadKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "group relative cursor-text rounded-lg transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--secondary)_40%,transparent)]",
        isHovered && "bg-[color-mix(in_srgb,var(--secondary)_5%,transparent)]",
        readClassName,
      )}
    >
      {value || <span className="italic text-[var(--on-surface-dim)]">{placeholder}</span>}
      {showIcon && (
        <span
          aria-hidden="true"
          className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--secondary)] shadow-lg"
        >
          <IconPencil size={11} className="text-white" />
        </span>
      )}
    </div>
  );
}
