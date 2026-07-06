"use client";

import { useEffect, useState, useMemo } from "react";
import {
  IconSearch,
  IconPlus,
  IconEdit,
  IconTrash,
  IconCheck,
  IconX,
  IconStar,
  IconArchive,
  IconRefresh,
} from "@tabler/icons-react";
import type { Testimonial } from "@/db/schema/testimonials";
import { DashboardPageHeader } from "@/components/dashboard/shared/dashboard-page-header";
import { KpiCard } from "@/components/dashboard/shared/kpi-card";
import { StatusBadge } from "@/components/dashboard/shared/status-badge";
import { ConfirmDialog } from "@/components/dashboard/shared/confirm-dialog";
import { useToast } from "@/components/dashboard/shared/toast-provider";
import { cn } from "@/lib/utils";
import Image from "next/image";

type TestimonialDraft = Omit<Testimonial, "createdAt" | "updatedAt" | "projectId" | "organizationId" | "engineerId">;

function toDraft(t?: Testimonial): TestimonialDraft {
  return {
    id: t?.id ?? "",
    authorName: t?.authorName ?? "",
    authorRole: t?.authorRole ?? "",
    content: t?.content ?? "",
    avatarUrl:
      t?.avatarUrl ??
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80",
    projectUrl: t?.projectUrl ?? null,
    rating: t?.rating ?? 5,
    date: t?.date ?? new Date().toISOString().split("T")[0],
    status: t?.status ?? "active",
    featured: t?.featured ?? false,
    order: t?.order ?? 0,
  };
}

export function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { notify } = useToast();

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TestimonialDraft | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Deletion confirm state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadTestimonials = async () => {
      try {
        const res = await fetch("/api/testimonials?all=true");
        if (res.ok) {
          const data = await res.json();
          setTestimonials(data.testimonials ?? []);
        } else {
          notify("Failed to load testimonials", "error");
        }
      } catch {
        notify("Failed to load testimonials", "error");
      } finally {
        setIsLoading(false);
      }
    };
    loadTestimonials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // KPIs Calculations
  const kpiStats = useMemo(() => {
    const total = testimonials.length;
    const active = testimonials.filter((t) => t.status === "active").length;
    const archived = testimonials.filter((t) => t.status === "archived").length;

    const sumRatings = testimonials.reduce((acc, t) => acc + t.rating, 0);
    const avg = total > 0 ? (sumRatings / total).toFixed(1) : "0.0";

    return { total, active, archived, avg };
  }, [testimonials]);

  // Filtered Testimonials
  const filtered = useMemo(() => {
    return testimonials.filter((t) => {
      const matchSearch =
        t.authorName.toLowerCase().includes(search.toLowerCase()) ||
        t.authorRole.toLowerCase().includes(search.toLowerCase()) ||
        t.content.toLowerCase().includes(search.toLowerCase());

      const matchRating = ratingFilter === "all" || t.rating === parseInt(ratingFilter);
      const matchStatus = statusFilter === "all" || t.status === statusFilter;

      return matchSearch && matchRating && matchStatus;
    });
  }, [testimonials, search, ratingFilter, statusFilter]);

  // Actions
  const handleAddNew = () => {
    setEditingItem(toDraft());
    setIsNew(true);
    setModalOpen(true);
  };

  const handleEdit = (t: Testimonial) => {
    setEditingItem(toDraft(t));
    setIsNew(false);
    setModalOpen(true);
  };

  const patchTestimonial = async (id: string, payload: Record<string, unknown>) => {
    const res = await fetch(`/api/testimonials/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Update failed");
    const data = await res.json();
    return data.testimonial as Testimonial;
  };

  const handleToggleStatus = async (t: Testimonial) => {
    const nextStatus = t.status === "active" ? "archived" : "active";
    try {
      const updated = await patchTestimonial(t.id, { status: nextStatus });
      setTestimonials((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      notify(nextStatus === "active" ? "Testimonial restored" : "Testimonial archived", "success");
    } catch {
      notify("Failed to update status", "error");
    }
  };

  const handleDeleteRequest = (id: string) => {
    setItemToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/testimonials/${itemToDelete}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setTestimonials((prev) => prev.filter((item) => item.id !== itemToDelete));
      notify("Testimonial deleted", "success");
    } catch {
      notify("Failed to delete testimonial", "error");
    } finally {
      setIsDeleting(false);
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    }
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const payload = {
      authorName: editingItem.authorName,
      authorRole: editingItem.authorRole,
      content: editingItem.content,
      avatarUrl: editingItem.avatarUrl,
      projectUrl: editingItem.projectUrl,
      rating: editingItem.rating,
      date: editingItem.date,
      status: editingItem.status,
      featured: editingItem.featured,
      order: editingItem.order,
    };

    setIsSaving(true);
    try {
      let saved: Testimonial;
      if (isNew) {
        const res = await fetch("/api/testimonials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Create failed");
        saved = (await res.json()).testimonial;
      } else {
        saved = await patchTestimonial(editingItem.id, payload);
      }

      setTestimonials((prev) =>
        isNew ? [...prev, saved] : prev.map((item) => (item.id === saved.id ? saved : item)),
      );
      setModalOpen(false);
      setEditingItem(null);
      notify(isNew ? "Testimonial added" : "Testimonial updated", "success");
    } catch {
      notify("Failed to save testimonial", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const renderRatingStars = (rating: number) => {
    return (
      <div className="flex gap-0.5 text-amber-400">
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

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Client Reviews"
        description="Manage user testimonials and slider reviews on the marketing pages."
        actions={
          <button
            onClick={handleAddNew}
            className="flex h-10 items-center gap-2 rounded-xl bg-[var(--primary)] px-4 font-mono text-[0.72rem] uppercase tracking-wider text-[var(--on-primary)] transition-all hover:opacity-90 hover:scale-[1.01] cursor-pointer"
          >
            <IconPlus size={16} /> Add Testimonial
          </button>
        }
      />

      {/* KPI Metric Strip */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total Reviews" value={String(kpiStats.total)} trend="Live from database" />
        <KpiCard label="Average Rating" value={`${kpiStats.avg} ★`} trend="Score out of 5" />
        <KpiCard
          label="Active Slider Reviews"
          value={String(kpiStats.active)}
          trend="Visible in marquee"
        />
        <KpiCard
          label="Archived Reviews"
          value={String(kpiStats.archived)}
          trend="Hidden from marquee"
        />
      </div>

      {/* Control Filters Row */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4 rounded-2xl shadow-[var(--glass-inner-shadow)] backdrop-blur-md">
        <div className="relative flex-1 max-w-md">
          <IconSearch
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--on-surface-dim)] opacity-40"
            size={16}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-xl border border-[var(--glass-border)] bg-[var(--surface-container)] pl-10 pr-4 text-[0.8rem] text-[var(--on-surface)] placeholder-[var(--on-surface-dim)]/50 focus:outline-none focus:border-[var(--primary)]"
            placeholder="Search client reviews..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Rating filter */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-[0.66rem] uppercase text-[var(--on-surface-dim)]">
              Stars:
            </span>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="h-9 cursor-pointer rounded-xl border border-[var(--glass-border)] bg-[var(--surface-container)] px-3 text-[0.74rem] text-[var(--on-surface)] focus:outline-none"
            >
              <option value="all" className="bg-[var(--surface)] text-[var(--on-surface)]">
                All Stars
              </option>
              <option value="5" className="bg-[var(--surface)] text-[var(--on-surface)]">
                5 Stars
              </option>
              <option value="4" className="bg-[var(--surface)] text-[var(--on-surface)]">
                4 Stars
              </option>
              <option value="3" className="bg-[var(--surface)] text-[var(--on-surface)]">
                3 Stars
              </option>
            </select>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-[0.66rem] uppercase text-[var(--on-surface-dim)]">
              Status:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 cursor-pointer rounded-xl border border-[var(--glass-border)] bg-[var(--surface-container)] px-3 text-[0.74rem] text-[var(--on-surface)] focus:outline-none"
            >
              <option value="all" className="bg-[var(--surface)] text-[var(--on-surface)]">
                All
              </option>
              <option value="active" className="bg-[var(--surface)] text-[var(--on-surface)]">
                Active Only
              </option>
              <option value="archived" className="bg-[var(--surface)] text-[var(--on-surface)]">
                Archived Only
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews Data List */}
      <div className="overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] shadow-[var(--glass-inner-shadow)] backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[var(--glass-border)] bg-white/5 font-mono text-[0.64rem] uppercase tracking-wider text-[var(--on-surface-dim)]">
                <th className="p-4 font-medium">Client Info</th>
                <th className="p-4 font-medium">Review Message</th>
                <th className="p-4 font-medium">Stars</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--glass-border)] text-[0.8rem] text-[var(--on-surface)]">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[var(--on-surface-dim)]">
                    <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="p-8 text-center text-[var(--on-surface-dim)] opacity-55"
                  >
                    No matching testimonials found.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-white/2 transition-colors">
                    {/* Client image & name */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 overflow-hidden rounded-full border border-[var(--glass-border)] bg-white/5 relative">
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
                          <div className="font-medium text-[0.82rem]">{item.authorName}</div>
                          <div className="text-[0.68rem] text-[var(--on-surface-dim)] font-medium">
                            {item.authorRole}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Review Snippet */}
                    <td className="p-4 max-w-[320px]">
                      <div className="line-clamp-2 italic text-[var(--on-surface-dim)] leading-relaxed">
                        &ldquo;{item.content}&rdquo;
                      </div>
                    </td>

                    {/* Rating stars */}
                    <td className="p-4">{renderRatingStars(item.rating)}</td>

                    {/* Review date */}
                    <td className="p-4 font-mono text-[0.7rem] text-[var(--on-surface-dim)]">
                      {item.date}
                    </td>

                    {/* Status Badge */}
                    <td className="p-4">
                      <StatusBadge
                        label={item.status === "active" ? "Active" : "Archived"}
                        tone={item.status === "active" ? "active" : "pending"}
                      />
                    </td>

                    {/* Actions Panel */}
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => handleEdit(item)}
                          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-[var(--glass-border)] bg-white/5 text-[var(--on-surface-dim)] transition-all duration-200 hover:scale-105 hover:bg-white/10 hover:text-[var(--on-surface)] active:scale-95"
                          title="Edit"
                        >
                          <IconEdit size={14} />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(item)}
                          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-[var(--glass-border)] bg-white/5 text-[var(--on-surface-dim)] transition-all duration-200 hover:scale-105 hover:bg-white/10 hover:text-[var(--on-surface)] active:scale-95"
                          title={item.status === "active" ? "Archive" : "Restore"}
                        >
                          {item.status === "active" ? (
                            <IconArchive size={14} />
                          ) : (
                            <IconRefresh size={14} />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteRequest(item.id)}
                          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-red-500/25 bg-red-500/10 text-red-400 transition-all duration-200 hover:scale-105 hover:bg-red-500/20 active:scale-95"
                          title="Delete"
                        >
                          <IconTrash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Review Modal Dialog */}
      {modalOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[var(--glass-border)] bg-[var(--surface-low)] p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="title-serif text-[1.2rem] text-[var(--on-surface)]">
                {isNew ? "Add Client Review" : "Edit Client Review"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="cursor-pointer text-[var(--on-surface-dim)] hover:text-[var(--on-surface)]"
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
                  value={editingItem.authorName}
                  onChange={(e) => setEditingItem({ ...editingItem, authorName: e.target.value })}
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
                  value={editingItem.authorRole}
                  onChange={(e) => setEditingItem({ ...editingItem, authorRole: e.target.value })}
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
                  value={editingItem.avatarUrl}
                  onChange={(e) => setEditingItem({ ...editingItem, avatarUrl: e.target.value })}
                  className="w-full rounded-xl border border-[var(--glass-border)] bg-[var(--surface-container)] px-3 py-2 text-[0.8rem] text-[var(--on-surface)] focus:outline-none"
                  placeholder="Image URL"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[0.68rem] font-mono uppercase tracking-wider text-[var(--on-surface-dim)] mb-1">
                    Rating
                  </label>
                  <select
                    value={editingItem.rating}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        rating: parseInt(e.target.value),
                      })
                    }
                    className="w-full cursor-pointer rounded-xl border border-[var(--glass-border)] bg-[var(--surface-container)] px-3 py-2 text-[0.8rem] text-[var(--on-surface)] focus:outline-none"
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
                    Review Date
                  </label>
                  <input
                    type="date"
                    value={editingItem.date}
                    onChange={(e) => setEditingItem({ ...editingItem, date: e.target.value })}
                    className="w-full rounded-xl border border-[var(--glass-border)] bg-[var(--surface-container)] px-3 py-2 text-[0.8rem] text-[var(--on-surface)] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-[0.74rem] text-[var(--on-surface)] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={editingItem.featured}
                    onChange={(e) => setEditingItem({ ...editingItem, featured: e.target.checked })}
                    className="cursor-pointer rounded border-[var(--glass-border)]"
                  />
                  Feature this review prominently
                </label>
              </div>

              <div>
                <label className="block text-[0.68rem] font-mono uppercase tracking-wider text-[var(--on-surface-dim)] mb-1">
                  Testimonial content
                </label>
                <textarea
                  value={editingItem.content}
                  onChange={(e) => setEditingItem({ ...editingItem, content: e.target.value })}
                  rows={4}
                  className="w-full rounded-xl border border-[var(--glass-border)] bg-[var(--surface-container)] px-3 py-2 text-[0.8rem] text-[var(--on-surface)] focus:outline-none focus:border-[var(--primary)] leading-relaxed"
                  placeholder="Type testimonial text..."
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[var(--glass-border)]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={isSaving}
                  className="cursor-pointer rounded-full border border-[var(--glass-border)] bg-transparent px-4 py-2 text-[0.74rem] font-mono uppercase tracking-wider text-[var(--on-surface-dim)] hover:bg-white/5 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex cursor-pointer items-center gap-1 rounded-full bg-[var(--on-surface)] px-5 py-2 text-[0.74rem] font-mono uppercase tracking-wider text-[var(--bg)] hover:opacity-90 transition-opacity disabled:opacity-70"
                >
                  {isSaving ? (
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-[var(--bg)] border-t-transparent" />
                  ) : (
                    <IconCheck size={12} />
                  )}
                  {isSaving ? "Saving…" : "Save Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Deletion */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Testimonial"
        description="Are you sure you want to permanently delete this testimonial? This action cannot be undone."
        confirmLabel={isDeleting ? "Deleting…" : "Delete Testimonial"}
        cancelLabel="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
    </div>
  );
}
