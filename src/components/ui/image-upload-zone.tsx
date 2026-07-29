"use client";

/**
 * src/components/ui/image-upload-zone.tsx
 *
 * Drag-and-drop + click upload zone for the case study admin overlay.
 * Uploads to POST /api/work/manage/[id]/images and returns a CDN URL.
 *
 * Accessibility:
 * - Keyboard: Space/Enter activates the file picker
 * - Screen readers: role="button" + aria-label describe the action
 * - Focus: visible focus ring
 */

import { useRef, useState, useCallback } from "react";
import { IconUpload, IconPhoto, IconX, IconCheck } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

type UploadState =
  | { status: "idle" }
  | { status: "dragging" }
  | { status: "uploading"; progress: number }
  | { status: "success"; url: string }
  | { status: "error"; message: string };

type ImageUploadZoneProps = {
  /** DB project ID — used to build the upload URL */
  projectId: string;
  /** Which field this upload belongs to (determines blob pathname) */
  field?: "cover" | "og" | "gallery" | "step" | "highlight";
  /** Called when upload succeeds with the CDN URL */
  onSuccess: (url: string) => void;
  /** Optional: preview URL to show before upload */
  currentUrl?: string | null;
  /** Label shown in the drop zone */
  label?: string;
  /** Extra className on the wrapper */
  className?: string;
};

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
const MAX_BYTES = 8 * 1024 * 1024; // 8MB

export function ImageUploadZone({
  projectId,
  field = "gallery",
  onSuccess,
  currentUrl,
  label = "Upload image",
  className,
}: ImageUploadZoneProps) {
  const [state, setState] = useState<UploadState>({ status: "idle" });
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(
    async (file: File) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setState({ status: "error", message: "Only JPEG, PNG, WebP, AVIF, and GIF are allowed" });
        return;
      }
      if (file.size > MAX_BYTES) {
        setState({
          status: "error",
          message: `File too large (${Math.round(file.size / 1024)}KB). Max 8MB.`,
        });
        return;
      }

      // Client-side preview
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);

      setState({ status: "uploading", progress: 0 });

      try {
        const form = new FormData();
        form.append("file", file);

        const res = await fetch(`/api/work/manage/${projectId}/images?field=${field}`, {
          method: "POST",
          body: form,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Upload failed" }));
          setState({ status: "error", message: err.error ?? "Upload failed" });
          return;
        }

        const { url } = await res.json();
        setState({ status: "success", url });
        onSuccess(url);
      } catch {
        setState({ status: "error", message: "Network error — please try again" });
      }
    },
    [projectId, field, onSuccess],
  );

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files?.length) return;
      uploadFile(files[0]);
    },
    [uploadFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setState({ status: "idle" });
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setState({ status: "dragging" });
  };

  const handleDragLeave = () => {
    if (state.status === "dragging") setState({ status: "idle" });
  };

  const isDragging = state.status === "dragging";
  const isUploading = state.status === "uploading";

  return (
    <div className={cn("relative", className)}>
      {/* Preview */}
      {preview && (
        <div className="mb-2 overflow-hidden rounded-xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Preview"
            className="h-40 w-full object-cover rounded-xl border border-[var(--glass-border)]"
          />
        </div>
      )}

      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label={label}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--secondary)_50%,transparent)]",
          isDragging
            ? "border-[var(--secondary)] bg-[color-mix(in_srgb,var(--secondary)_8%,transparent)]"
            : "border-[var(--glass-border)] bg-[var(--glass-bg)] hover:border-[var(--secondary)] hover:bg-[color-mix(in_srgb,var(--secondary)_5%,transparent)]",
        )}
      >
        {isUploading ? (
          <>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-high)]">
              <div
                className="h-full rounded-full bg-[var(--secondary)] transition-all duration-300"
                style={{ width: "60%" }} // Indeterminate — no XHR progress events with fetch
              />
            </div>
            <span className="text-[0.82rem] text-[var(--on-surface-dim)]">Uploading…</span>
          </>
        ) : state.status === "success" ? (
          <>
            <IconCheck size={20} className="text-[var(--tertiary)]" />
            <span className="text-[0.82rem] text-[var(--tertiary)]">Uploaded</span>
          </>
        ) : state.status === "error" ? (
          <>
            <IconX size={20} className="text-[var(--error)]" />
            <span className="text-[0.82rem] text-[var(--error)]">{state.message}</span>
            <span className="text-[0.75rem] text-[var(--on-surface-dim)]">Click to try again</span>
          </>
        ) : (
          <>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--secondary-container)]">
              {isDragging ? (
                <IconPhoto size={18} className="text-[var(--secondary)]" />
              ) : (
                <IconUpload size={18} className="text-[var(--secondary)]" />
              )}
            </div>
            <span className="text-[0.82rem] text-[var(--on-surface-dim)]">
              {isDragging ? "Drop to upload" : "Drag & drop or click to upload"}
            </span>
            <span className="text-[0.72rem] text-[var(--on-surface-dim)] opacity-60">
              JPEG, PNG, WebP — max 8MB
            </span>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        className="sr-only"
        onChange={(e) => handleFiles(e.target.files)}
        aria-hidden="true"
        tabIndex={-1}
      />
    </div>
  );
}
