"use client";

import React, { useState, useEffect, useRef } from "react";
import { IconStar, IconEdit, IconTrash, IconPlus, IconX, IconCheck } from "@tabler/icons-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  Testimonial,
  getTestimonials,
  saveTestimonial,
  deleteTestimonial,
} from "@/data/testimonials";
import { cn } from "@/lib/utils";
import Image from "next/image";

export function TestimonialsMarquee() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(() => {
    if (typeof window === "undefined") return [];
    return getTestimonials().filter((t) => t.status !== "archived");
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setTestimonials(getTestimonials().filter((t) => t.status !== "archived"));
    };
    window.addEventListener("testimonials_updated", handleUpdate);

    // Sync admin login status
    const checkAdmin = () => {
      setIsAdmin(localStorage.getItem("andishi_admin_sim_logged_in") === "true");
    };
    checkAdmin();
    window.addEventListener("storage", checkAdmin);
    window.addEventListener("admin_sim_changed", checkAdmin);

    return () => {
      window.removeEventListener("testimonials_updated", handleUpdate);
      window.removeEventListener("storage", checkAdmin);
      window.removeEventListener("admin_sim_changed", checkAdmin);
    };
  }, []);

  // GSAP Infinite Scroll Animation
  useGSAP(
    () => {
      if (!trackRef.current || testimonials.length === 0) return;

      // Kill previous tween if it exists
      if (tweenRef.current) {
        tweenRef.current.kill();
      }

      // Smooth horizontal animation of track shifting by half its duplicated width (-50%)
      const tween = gsap.to(trackRef.current, {
        xPercent: -50,
        ease: "none",
        duration: testimonials.length * 14, // Slower speed (14 seconds per item)
        repeat: -1,
      });

      tweenRef.current = tween;

      return () => {
        tween.kill();
      };
    },
    { dependencies: [testimonials], scope: containerRef },
  );

  const handleMouseEnter = () => {
    if (tweenRef.current) {
      tweenRef.current.pause();
    }
  };

  const handleMouseLeave = () => {
    if (tweenRef.current) {
      tweenRef.current.play();
    }
  };

  // Open Edit Modal
  const handleEditInline = (t: Testimonial, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setEditingTestimonial({ ...t });
    setIsNew(false);
    setModalOpen(true);
  };

  // Open Create Modal
  const handleAddInline = () => {
    setEditingTestimonial({
      id: `test-${Date.now()}`,
      authorName: "",
      authorRole: "",
      content: "",
      avatarUrl:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80",
      rating: 5,
      date: new Date().toISOString().split("T")[0],
      status: "active",
    });
    setIsNew(true);
    setModalOpen(true);
  };

  // Delete Testimonial
  const handleDeleteInline = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (confirm("Are you sure you want to delete this testimonial?")) {
      deleteTestimonial(id);
    }
  };

  // Submit Modal Save
  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTestimonial) return;

    if (!editingTestimonial.authorName || !editingTestimonial.content) {
      alert("Name and Content are required.");
      return;
    }

    saveTestimonial(editingTestimonial);
    setModalOpen(false);
    setEditingTestimonial(null);
  };

  // Render Star Indicators
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5 text-amber-400">
        {Array.from({ length: 5 }).map((_, i) => (
          <IconStar
            key={i}
            size={12}
            className={cn("fill-current", i < rating ? "opacity-100" : "opacity-25")}
          />
        ))}
      </div>
    );
  };

  // Duplicate items for seamless continuous marquee loop
  const duplicatedItems = [...testimonials, ...testimonials];

  return (
    <div className="relative w-full py-10" ref={containerRef}>
      {/* Testimonials Eyebrow & Header (Desktop Only Inline Controller) */}
      <div className="mx-auto max-w-[92rem] px-5 sm:px-8 lg:px-10 mb-8 flex items-center justify-between">
        <div>
          <p className="label-caps text-[var(--tertiary)] tracking-[0.15em] font-medium text-[0.74rem]">
            CLIENT TESTIMONIALS
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={handleAddInline}
            className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-1.5 text-[0.66rem] font-mono uppercase tracking-wider text-emerald-400 hover:bg-emerald-500/10 transition-colors"
          >
            <IconPlus size={12} /> Add Review
          </button>
        )}
      </div>

      {/* Marquee viewport slider */}
      <div
        className="relative overflow-hidden border-y border-[var(--glass-border)] py-8 bg-[color-mix(in_srgb,var(--bg-deep)_34%,transparent)]"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Soft fading edges gradients */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-[18%] max-w-[240px] bg-gradient-to-r from-[var(--bg)] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-[18%] max-w-[240px] bg-gradient-to-l from-[var(--bg)] to-transparent" />

        {/* Moving track wrapper */}
        <div ref={trackRef} className="flex w-max will-change-transform">
          {duplicatedItems.map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              className="group/card relative w-[420px] max-w-[85vw] shrink-0 p-8 mx-5 rounded-[2rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] shadow-[var(--glass-inner-shadow)] backdrop-blur-md transition-all duration-300 hover:border-[color-mix(in_srgb,var(--on-surface)_18%,transparent)]"
            >
              {/* Star rating row */}
              <div className="flex justify-between items-center mb-4">
                {renderStars(item.rating)}
                <span className="font-mono text-[0.58rem] tracking-wider text-[var(--on-surface-dim)] opacity-40">
                  {item.date}
                </span>
              </div>

              {/* Review content */}
              <p className="text-[0.85rem] leading-[1.65] text-[var(--on-surface)] opacity-90 mb-6 font-normal">
                &ldquo;{item.content}&rdquo;
              </p>

              {/* Author profile row */}
              <div className="flex items-center gap-3">
                <div className="relative h-9 w-9 overflow-hidden rounded-full border border-[var(--glass-border)] bg-white/5">
                  <Image
                    src={item.avatarUrl}
                    alt={item.authorName}
                    width={36}
                    height={36}
                    unoptimized
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-[0.8rem] font-medium text-[var(--on-surface)]">
                    {item.authorName}
                  </h4>
                  <p className="text-[0.66rem] text-[var(--on-surface-dim)] font-medium">
                    {item.authorRole}
                  </p>
                </div>
              </div>

              {/* Inline Administrator actions overlays */}
              {isAdmin && (
                <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={(e) => handleEditInline(item, e)}
                    className="p-1.5 rounded-lg border border-white/10 bg-black/40 text-[var(--on-surface)] hover:bg-white/10 transition-colors"
                    title="Edit Review"
                  >
                    <IconEdit size={12} />
                  </button>
                  <button
                    onClick={(e) => handleDeleteInline(item.id, e)}
                    className="p-1.5 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                    title="Delete Review"
                  >
                    <IconTrash size={12} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials Inline Edit Modal */}
      {modalOpen && editingTestimonial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[var(--glass-border)] bg-[var(--surface-low)] p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="title-serif text-[1.2rem] text-[var(--on-surface)]">
                {isNew ? "Add Testimonial Inline" : "Edit Testimonial Inline"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-[var(--on-surface-dim)] hover:text-[var(--on-surface)]"
              >
                <IconX size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="space-y-4">
              <div>
                <label className="block text-[0.68rem] font-mono uppercase tracking-wider text-[var(--on-surface-dim)] mb-1">
                  Author Name
                </label>
                <input
                  type="text"
                  value={editingTestimonial.authorName}
                  onChange={(e) =>
                    setEditingTestimonial({ ...editingTestimonial, authorName: e.target.value })
                  }
                  className="w-full rounded-xl border border-[var(--glass-border)] bg-[var(--surface-container)] px-3 py-2 text-[0.8rem] text-[var(--on-surface)] focus:outline-none focus:border-[var(--primary)]"
                  placeholder="e.g. Amina Otieno"
                  required
                />
              </div>

              <div>
                <label className="block text-[0.68rem] font-mono uppercase tracking-wider text-[var(--on-surface-dim)] mb-1">
                  Author Role / Company
                </label>
                <input
                  type="text"
                  value={editingTestimonial.authorRole}
                  onChange={(e) =>
                    setEditingTestimonial({ ...editingTestimonial, authorRole: e.target.value })
                  }
                  className="w-full rounded-xl border border-[var(--glass-border)] bg-[var(--surface-container)] px-3 py-2 text-[0.8rem] text-[var(--on-surface)] focus:outline-none focus:border-[var(--primary)]"
                  placeholder="e.g. CTO, Haraka Fleet"
                  required
                />
              </div>

              <div>
                <label className="block text-[0.68rem] font-mono uppercase tracking-wider text-[var(--on-surface-dim)] mb-1">
                  Avatar Image URL
                </label>
                <input
                  type="url"
                  value={editingTestimonial.avatarUrl}
                  onChange={(e) =>
                    setEditingTestimonial({ ...editingTestimonial, avatarUrl: e.target.value })
                  }
                  className="w-full rounded-xl border border-[var(--glass-border)] bg-[var(--surface-container)] px-3 py-2 text-[0.8rem] text-[var(--on-surface)] focus:outline-none focus:border-[var(--primary)]"
                  placeholder="Image URL"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[0.68rem] font-mono uppercase tracking-wider text-[var(--on-surface-dim)] mb-1">
                    Rating (1-5 Stars)
                  </label>
                  <select
                    value={editingTestimonial.rating}
                    onChange={(e) =>
                      setEditingTestimonial({
                        ...editingTestimonial,
                        rating: parseInt(e.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-[var(--glass-border)] bg-[var(--surface-container)] px-3 py-2 text-[0.8rem] text-[var(--on-surface)] focus:outline-none focus:border-[var(--primary)]"
                  >
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option
                        key={n}
                        value={n}
                        className="bg-[var(--surface)] text-[var(--on-surface)]"
                      >
                        {n} Stars
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[0.68rem] font-mono uppercase tracking-wider text-[var(--on-surface-dim)] mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={editingTestimonial.date}
                    onChange={(e) =>
                      setEditingTestimonial({ ...editingTestimonial, date: e.target.value })
                    }
                    className="w-full rounded-xl border border-[var(--glass-border)] bg-[var(--surface-container)] px-3 py-2 text-[0.8rem] text-[var(--on-surface)] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[0.68rem] font-mono uppercase tracking-wider text-[var(--on-surface-dim)] mb-1">
                  Testimonial content
                </label>
                <textarea
                  value={editingTestimonial.content}
                  onChange={(e) =>
                    setEditingTestimonial({ ...editingTestimonial, content: e.target.value })
                  }
                  rows={4}
                  className="w-full rounded-xl border border-[var(--glass-border)] bg-[var(--surface-container)] px-3 py-2 text-[0.8rem] text-[var(--on-surface)] focus:outline-none focus:border-[var(--primary)] leading-relaxed"
                  placeholder="Type review text..."
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[var(--glass-border)]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-full border border-[var(--glass-border)] bg-transparent px-4 py-2 text-[0.74rem] font-mono uppercase tracking-wider text-[var(--on-surface-dim)] hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1 rounded-full bg-[var(--on-surface)] px-5 py-2 text-[0.74rem] font-mono uppercase tracking-wider text-[var(--bg)] hover:opacity-90 transition-opacity"
                >
                  <IconCheck size={12} /> Save Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
