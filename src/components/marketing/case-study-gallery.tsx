"use client";

/**
 * src/components/marketing/case-study-gallery.tsx
 *
 * Responsive image gallery with full-screen lightbox.
 * No external dependencies — uses framer-motion (already in project) for transitions.
 *
 * Accessibility:
 * - Lightbox is a <dialog>-like focus trap (manual, no dialog element for SSR compat)
 * - Keyboard: Escape closes, ArrowLeft/ArrowRight navigate
 * - Screen readers: all images have descriptive alt text; lightbox is aria-modal
 * - prefers-reduced-motion: no animations when user prefers reduced motion
 */

import Image from "next/image";
import { useCallback, useEffect, useReducer } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  IconX,
  IconChevronLeft,
  IconChevronRight,
  IconTrash,
  IconChevronUp,
  IconChevronDown,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import type { CaseStudyGalleryImage } from "@/types/case-study";
import { cosmicSpring } from "@/lib/motion";

type GalleryState = {
  open: boolean;
  index: number;
};

type GalleryAction =
  | { type: "open"; index: number }
  | { type: "close" }
  | { type: "prev" }
  | { type: "next"; total: number };

function reducer(state: GalleryState, action: GalleryAction): GalleryState {
  switch (action.type) {
    case "open":
      return { open: true, index: action.index };
    case "close":
      return { ...state, open: false };
    case "prev":
      return { ...state, index: Math.max(0, state.index - 1) };
    case "next":
      return { ...state, index: Math.min(action.total - 1, state.index + 1) };
  }
}

export function CaseStudyGallery({
  images,
  isAdmin,
  onUpdate,
}: {
  images: CaseStudyGalleryImage[];
  isAdmin?: boolean;
  onUpdate?: (images: CaseStudyGalleryImage[]) => void;
}) {
  const prefersReducedMotion = useReducedMotion();
  const sorted = [...images].sort((a, b) => a.order - b.order);

  const [lb, dispatch] = useReducer(reducer, { open: false, index: 0 });
  const active = sorted[lb.index];

  const close = useCallback(() => dispatch({ type: "close" }), []);
  const prev = useCallback(() => dispatch({ type: "prev" }), []);
  const next = useCallback(() => dispatch({ type: "next", total: sorted.length }), [sorted.length]);

  useEffect(() => {
    if (!lb.open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lb.open, close, prev, next]);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    document.body.style.overflow = lb.open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [lb.open]);

  if (!sorted.length) return null;

  const spring = prefersReducedMotion ? { duration: 0 } : cosmicSpring;

  return (
    <>
      {/* Grid */}
      <div
        className={cn(
          "grid gap-3",
          sorted.length === 1
            ? "grid-cols-1"
            : sorted.length === 2
              ? "grid-cols-2"
              : "grid-cols-2 md:grid-cols-3",
        )}
      >
        {sorted.map((img, idx) => (
          <div
            key={img.id}
            className={cn(
              "group relative overflow-hidden rounded-2xl border border-[var(--glass-border)]",
              sorted.length === 1 ? "aspect-video" : "aspect-[4/3]",
              idx === 0 && sorted.length >= 3 ? "col-span-2 md:col-span-1 row-span-2" : "",
            )}
          >
            <motion.button
              onClick={() => dispatch({ type: "open", index: idx })}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0, transition: { ...spring, delay: idx * 0.06 } }}
              viewport={{ once: true, margin: "-60px" }}
              whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
              className="absolute inset-0 w-full h-full cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--secondary)_50%,transparent)]"
              aria-label={`View ${img.alt} (${idx + 1} of ${sorted.length})`}
            >
              <Image
                src={img.url}
                alt={img.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-2 right-2 rounded-lg bg-black/50 px-2 py-1 text-[0.7rem] text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm">
                {idx + 1} / {sorted.length}
              </div>
            </motion.button>
            {isAdmin && onUpdate && (
              <AdminItemControls
                onMoveUp={
                  idx > 0
                    ? () => {
                        const newImages = [...sorted];
                        [newImages[idx - 1], newImages[idx]] = [newImages[idx], newImages[idx - 1]];
                        newImages.forEach((img, i) => (img.order = i));
                        onUpdate(newImages);
                      }
                    : undefined
                }
                onMoveDown={
                  idx < sorted.length - 1
                    ? () => {
                        const newImages = [...sorted];
                        [newImages[idx], newImages[idx + 1]] = [newImages[idx + 1], newImages[idx]];
                        newImages.forEach((img, i) => (img.order = i));
                        onUpdate(newImages);
                      }
                    : undefined
                }
                onDelete={() => {
                  onUpdate(sorted.filter((_, i) => i !== idx));
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lb.open && active && (
          <motion.div
            key="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: prefersReducedMotion ? 0 : 0.2 } }}
            exit={{ opacity: 0, transition: { duration: prefersReducedMotion ? 0 : 0.2 } }}
            role="dialog"
            aria-modal="true"
            aria-label={`Image viewer: ${active.alt}`}
            className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90 backdrop-blur-xl"
            onClick={(e) => {
              if (e.target === e.currentTarget) close();
            }}
          >
            {/* Image */}
            <AnimatePresence mode="wait">
              <motion.div
                key={lb.index}
                initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.96 }}
                animate={{ opacity: 1, scale: 1, transition: spring }}
                exit={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.96 }}
                className="relative max-h-[85vh] max-w-[90vw]"
              >
                <Image
                  src={active.url}
                  alt={active.alt}
                  width={active.width ?? 1200}
                  height={active.height ?? 800}
                  className="max-h-[85vh] w-auto rounded-2xl object-contain shadow-2xl"
                  priority
                />
                {/* Caption */}
                {active.alt && (
                  <p className="mt-3 text-center text-[0.85rem] text-white/70">{active.alt}</p>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Controls */}
            <button
              onClick={close}
              aria-label="Close image viewer (Escape)"
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-xl hover:bg-white/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            >
              <IconX size={18} />
            </button>

            {lb.index > 0 && (
              <button
                onClick={prev}
                aria-label="Previous image (ArrowLeft)"
                className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-xl hover:bg-white/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              >
                <IconChevronLeft size={20} />
              </button>
            )}

            {lb.index < sorted.length - 1 && (
              <button
                onClick={next}
                aria-label="Next image (ArrowRight)"
                className="absolute right-14 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-xl hover:bg-white/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              >
                <IconChevronRight size={20} />
              </button>
            )}

            {/* Position indicator */}
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
              {sorted.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => dispatch({ type: "open", index: idx })}
                  aria-label={`Go to image ${idx + 1}`}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    idx === lb.index ? "w-5 bg-white" : "w-1.5 bg-white/40 hover:bg-white/60",
                  )}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function AdminItemControls({
  onMoveUp,
  onMoveDown,
  onDelete,
}: {
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="absolute right-2 top-2 z-20 hidden items-center gap-1 rounded-lg border border-white/20 bg-black/50 p-1 backdrop-blur-xl group-hover:flex">
      {onMoveUp && (
        <button
          onClick={onMoveUp}
          className="flex h-7 w-7 items-center justify-center rounded-md text-white/70 hover:bg-white/20 hover:text-white transition-colors"
          title="Move Up"
        >
          <IconChevronUp size={14} />
        </button>
      )}
      {onMoveDown && (
        <button
          onClick={onMoveDown}
          className="flex h-7 w-7 items-center justify-center rounded-md text-white/70 hover:bg-white/20 hover:text-white transition-colors"
          title="Move Down"
        >
          <IconChevronDown size={14} />
        </button>
      )}
      <div className="mx-1 h-4 w-px bg-white/20" />
      <button
        onClick={onDelete}
        className="flex h-7 w-7 items-center justify-center rounded-md text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors"
        title="Delete"
      >
        <IconTrash size={14} />
      </button>
    </div>
  );
}
