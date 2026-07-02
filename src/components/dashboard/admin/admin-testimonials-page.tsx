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
import {
  Testimonial,
  getTestimonials,
  saveTestimonial,
  deleteTestimonial,
} from "@/data/testimonials";
import { DashboardPageHeader } from "@/components/dashboard/shared/dashboard-page-header";
import { KpiCard } from "@/components/dashboard/shared/kpi-card";
import { StatusBadge } from "@/components/dashboard/shared/status-badge";
import { ConfirmDialog } from "@/components/dashboard/shared/confirm-dialog";
import { cn } from "@/lib/utils";
import Image from "next/image";

export function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(() => {
    if (typeof window === "undefined") return [];
    return getTestimonials();
  });
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
  const [isNew, setIsNew] = useState(false);

  // Deletion confirm state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setTestimonials(getTestimonials());
    };
    window.addEventListener("testimonials_updated", handleUpdate);
    return () => {
      window.removeEventListener("testimonials_updated", handleUpdate);
    };
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
    setEditingItem({
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

  const handleEdit = (t: Testimonial) => {
    setEditingItem({ ...t });
    setIsNew(false);
    setModalOpen(true);
  };

  const handleToggleStatus = (t: Testimonial) => {
    const updated = {
      ...t,
      status: t.status === "active" ? ("archived" as const) : ("active" as const),
    };
    saveTestimonial(updated);
  };

  const handleDeleteRequest = (id: string) => {
    setItemToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      deleteTestimonial(itemToDelete);
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    }
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      saveTestimonial(editingItem);
      setModalOpen(false);
      setEditingItem(null);
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
            className="flex h-10 items-center gap-2 rounded-xl bg-[var(--primary)] px-4 font-mono text-[0.72rem] uppercase tracking-wider text-black transition-all hover:opacity-90 hover:scale-[1.01]"
          >
            <IconPlus size={16} /> Add Testimonial
          </button>
        }
      />

      {/* KPI Metric Strip */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total Reviews" value={String(kpiStats.total)} trend="All seeded items" />
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
              className="h-9 rounded-xl border border-[var(--glass-border)] bg-[var(--surface-container)] px-3 text-[0.74rem] text-[var(--on-surface)] focus:outline-none"
            >
              <option value="all">All Stars</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
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
              className="h-9 rounded-xl border border-[var(--glass-border)] bg-[var(--surface-container)] px-3 text-[0.74rem] text-[var(--on-surface)] focus:outline-none"
            >
              <option value="all">All</option>
              <option value="active">Active Only</option>
              <option value="archived">Archived Only</option>
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
              {filtered.length === 0 ? (
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
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--glass-border)] bg-white/5 text-[var(--on-surface-dim)] hover:bg-white/10 transition-colors"
                          title="Edit"
                        >
                          <IconEdit size={14} />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(item)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--glass-border)] bg-white/5 text-[var(--on-surface-dim)] hover:bg-white/10 transition-colors"
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
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
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
                    className="w-full rounded-xl border border-[var(--glass-border)] bg-[var(--surface-container)] px-3 py-2 text-[0.8rem] text-[var(--on-surface)] focus:outline-none"
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

      {/* Confirm Deletion */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Testimonial"
        description="Are you sure you want to permanently delete this testimonial? This action cannot be undone."
        confirmLabel="Delete Testimonial"
        cancelLabel="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
    </div>
  );
}
