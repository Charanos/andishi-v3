"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  IconArrowRight,
  IconBriefcase,
  IconChecks,
  IconClock,
  IconFilePlus,
  IconPlus,
  IconUserCheck,
  IconX,
} from "@tabler/icons-react";
import { EntityDrawer } from "@/components/dashboard/shared/entity-drawer";
import { StatusBadge } from "@/components/dashboard/shared/status-badge";
import type { PipelineColumn } from "@/components/dashboard/admin/pipeline-board";

type BriefDraft = {
  client: string;
  domain: string;
  owner: string;
  priority: string;
  title: string;
};

type PipelineItem = PipelineColumn["items"][number] & {
  stage: string;
  stageCount: number;
};

export function OverviewHeroActions({
  pipelineColumns,
}: {
  pipelineColumns: PipelineColumn[];
}) {
  const [briefOpen, setBriefOpen] = useState(false);
  const [pipelineOpen, setPipelineOpen] = useState(false);

  return (
    <>
      <div className="mt-9 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={() => setBriefOpen(true)}
          className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--on-surface)_16%,transparent)] bg-[var(--on-surface)] px-5 text-[0.9rem] font-medium text-[var(--bg)] shadow-[0_16px_36px_color-mix(in_srgb,var(--bg-deep)_36%,transparent)] transition-transform duration-300 hover:-translate-y-px"
        >
          <IconPlus size={16} stroke={1.8} />
          New Brief
        </button>
        <button
          type="button"
          onClick={() => setPipelineOpen(true)}
          className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-5 text-[0.9rem] font-medium text-[var(--on-surface)] backdrop-blur-xl transition-transform duration-300 hover:-translate-y-px"
        >
          View Pipeline
          <IconArrowRight size={15} stroke={1.8} />
        </button>
      </div>
      <NewBriefModal open={briefOpen} onClose={() => setBriefOpen(false)} />
      <PipelineDrawer
        columns={pipelineColumns}
        open={pipelineOpen}
        onClose={() => setPipelineOpen(false)}
      />
    </>
  );
}

export function PipelineDrawerButton({
  columns,
}: {
  columns: PipelineColumn[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 text-[0.78rem] font-medium text-[var(--on-surface-dim)] backdrop-blur-xl transition-colors duration-300 hover:text-[var(--on-surface)]"
      >
        <IconBriefcase size={15} stroke={1.6} />
        Inspect pipeline
      </button>
      <PipelineDrawer
        columns={columns}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

export function NewBriefButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--on-surface)_16%,transparent)] bg-[var(--on-surface)] px-4 text-[0.84rem] font-medium text-[var(--bg)] shadow-[0_12px_28px_color-mix(in_srgb,var(--bg-deep)_18%,transparent)] transition-transform duration-200 hover:-translate-y-px active:scale-[0.98]"
      >
        <IconFilePlus size={15} stroke={1.9} />
        New brief
      </button>
      <NewBriefModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

function NewBriefModal({
  onClose,
  open,
}: {
  onClose: () => void;
  open: boolean;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [draft, setDraft] = useState<BriefDraft>({
    client: "",
    domain: "AI / ML",
    owner: "Dennis",
    priority: "High",
    title: "",
  });
  const [created, setCreated] = useState<BriefDraft[]>([]);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, open]);

  if (!open) return null;

  const saveDraft = () => {
    if (!draft.title.trim() || !draft.client.trim()) return;
    setCreated((items) => [
      { ...draft, title: draft.title.trim(), client: draft.client.trim() },
      ...items,
    ]);
    setDraft((current) => ({ ...current, client: "", title: "" }));
  };

  return (
    <div
      className="fixed inset-0 z-[85] grid place-items-center bg-[color-mix(in_srgb,var(--bg-deep)_72%,transparent)] px-4 backdrop-blur-xl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-brief-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="max-h-[calc(100svh-2rem)] w-full max-w-5xl overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-[var(--surface)] shadow-[0_24px_90px_color-mix(in_srgb,var(--bg-deep)_42%,transparent)] sm:max-h-[calc(100svh-4rem)] sm:rounded-3xl">
        <div className="flex items-start justify-between gap-4 border-b border-[var(--glass-border)] p-4 sm:p-5">
          <div className="min-w-0">
            <p className="label-caps text-[var(--secondary)]">Create brief</p>
            <h2
              id="new-brief-title"
              className="title-serif mt-2 break-words text-[1.2rem] font-medium text-[var(--on-surface)]"
            >
              Register a new hiring brief
            </h2>
            <p className="mt-1 text-[0.9rem] text-[var(--on-surface-dim)]">
              Capture the operating details needed to route the brief into
              review.
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close new brief modal"
            className="grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-[var(--glass-border)] text-[var(--on-surface-dim)] hover:text-[var(--on-surface)]"
          >
            <IconX size={17} stroke={1.6} />
          </button>
        </div>
        <div className="grid max-h-[calc(100svh-15rem)] gap-4 overflow-y-auto p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-3">
          <Field label="Brief title">
            <input
              value={draft.title}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              placeholder="Senior AI engineer for support workflow"
              className="h-11 w-full rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 text-[0.9rem] text-[var(--on-surface)] outline-none placeholder:text-[var(--on-surface-dim)]"
            />
          </Field>
          <Field label="Client">
            <input
              value={draft.client}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  client: event.target.value,
                }))
              }
              placeholder="Kijani Analytics"
              className="h-11 w-full rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 text-[0.9rem] text-[var(--on-surface)] outline-none placeholder:text-[var(--on-surface-dim)]"
            />
          </Field>
          <Field label="Domain">
            <select
              value={draft.domain}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  domain: event.target.value,
                }))
              }
              className="h-11 w-full rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 text-[0.9rem] text-[var(--on-surface)] outline-none"
            >
              <option>AI / ML</option>
              <option>Full-stack</option>
              <option>Cloud / DevOps</option>
              <option>Mobile</option>
            </select>
          </Field>
          <Field label="Priority">
            <select
              value={draft.priority}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  priority: event.target.value,
                }))
              }
              className="h-11 w-full rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 text-[0.9rem] text-[var(--on-surface)] outline-none"
            >
              <option>High</option>
              <option>Normal</option>
              <option>Low</option>
            </select>
          </Field>
          <Field label="Owner">
            <input
              value={draft.owner}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  owner: event.target.value,
                }))
              }
              className="h-11 w-full rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 text-[0.9rem] text-[var(--on-surface)] outline-none"
            />
          </Field>
          <div className="flex items-end">
            <button
              type="button"
              onClick={saveDraft}
              className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[var(--on-surface)] px-4 text-[0.9rem] font-medium text-[var(--bg)]"
            >
              <IconFilePlus size={16} stroke={1.8} />
              Save draft
            </button>
          </div>
        </div>
        <div className="border-t border-[var(--glass-border)] p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[0.9rem] font-medium text-[var(--on-surface)]">
              Draft queue
            </p>
            <Link
              href="/admin/briefs"
              className="cursor-pointer text-[0.86rem] font-medium text-[var(--secondary)] transition-opacity hover:opacity-70"
            >
              Open briefs
            </Link>
          </div>
          <div className="mt-3 grid gap-2">
            {(created.length
              ? created
              : [
                  {
                    ...draft,
                    title: "AI support workflow",
                    client: "Kijani Analytics",
                  },
                ]
            )
              .slice(0, 3)
              .map((item, index) => (
                <div
                  key={`${item.title}-${index}`}
                  className="rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-2"
                >
                  <p className="text-[0.86rem] font-medium text-[var(--on-surface)]">
                    {item.title}
                  </p>
                  <p className="mt-1 text-[0.74rem] text-[var(--on-surface-dim)]">
                    {item.client} - {item.domain} - {item.priority}
                  </p>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PipelineDrawer({
  columns,
  onClose,
  open,
}: {
  columns: PipelineColumn[];
  onClose: () => void;
  open: boolean;
}) {
  const [selectedItem, setSelectedItem] = useState<PipelineItem | null>(null);
  const total = columns.reduce((sum, column) => sum + column.count, 0);
  const highest = useMemo(
    () => columns.reduce((max, column) => Math.max(max, column.count), 1),
    [columns],
  );

  return (
    <>
      <EntityDrawer open={open} onClose={onClose} title="Delivery pipeline">
        <div className="grid gap-5">
          <div className="grid gap-4 lg:grid-cols-[0.7fr_1fr]">
            <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4">
              <p className="label-caps text-[var(--secondary)]">
                Pipeline health
              </p>
              <p className="mt-3 font-mono text-[2rem] leading-none text-[var(--on-surface)]">
                {total}
              </p>
              <p className="mt-2 text-[0.88rem] text-[var(--on-surface-dim)]">
                Active briefs across review, matching, intros, and
                confirmations.
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4">
              <p className="text-[0.95rem] font-medium text-[var(--on-surface)]">
                Stage mix
              </p>
              <div className="mt-4 grid gap-2">
                {columns.map((column) => (
                  <div
                    key={`${column.title}-mini`}
                    className="grid grid-cols-[8rem_1fr_auto] items-center gap-2"
                  >
                    <span className="truncate text-[0.72rem] text-[var(--on-surface-dim)]">
                      {column.title}
                    </span>
                    <span className="h-1.5 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--on-surface)_10%,transparent)]">
                      <span
                        className="block h-full rounded-full bg-[var(--secondary)]"
                        style={{
                          width: `${Math.max(12, (column.count / highest) * 100)}%`,
                        }}
                      />
                    </span>
                    <span className="font-mono text-[0.72rem] text-[var(--on-surface)]">
                      {column.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {columns.map((column) => (
            <section
              key={column.title}
              className="rounded-2xl border border-[var(--glass-border)] bg-[var(--surface)] p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[0.95rem] font-medium text-[var(--on-surface)]">
                    {column.title}
                  </p>
                  <p className="mt-1 font-mono text-[0.72rem] text-[var(--on-surface-dim)]">
                    {column.count} active
                  </p>
                </div>
                <StatusBadge
                  label={column.count > 10 ? "Busy" : "Stable"}
                  tone={column.count > 10 ? "pending" : "active"}
                />
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--on-surface)_10%,transparent)]">
                <span
                  className="block h-full rounded-full bg-[var(--secondary)]"
                  style={{
                    width: `${Math.max(12, (column.count / highest) * 100)}%`,
                  }}
                />
              </div>
              <div className="mt-3 grid gap-2">
                {column.items.map((item) => (
                  <button
                    key={`${column.title}-${item.title}`}
                    type="button"
                    onClick={() =>
                      setSelectedItem({
                        ...item,
                        stage: column.title,
                        stageCount: column.count,
                      })
                    }
                    className="cursor-pointer rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-3 text-left transition-colors duration-300 hover:border-[color-mix(in_srgb,var(--secondary)_28%,var(--glass-border))]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[0.86rem] font-medium text-[var(--on-surface)]">
                          {item.title}
                        </p>
                        <p className="mt-1 text-[0.76rem] text-[var(--on-surface-dim)]">
                          {item.meta} - {item.time}
                        </p>
                      </div>
                      {item.status && (
                        <StatusBadge
                          label={item.status}
                          tone={
                            item.status === "Confirmed" ? "active" : "pending"
                          }
                        />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </section>
          ))}
          <div className="grid gap-2 sm:grid-cols-2">
            <Link
              href="/admin/matches"
              className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-[var(--on-surface)] px-4 text-[0.88rem] font-medium text-[var(--bg)] transition-transform hover:-translate-y-px"
            >
              Open pipeline
              <IconArrowRight size={15} stroke={1.7} />
            </Link>
            <Link
              href="/admin/briefs"
              className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full border border-[var(--glass-border)] px-4 text-[0.88rem] font-medium text-[var(--on-surface)] transition-colors hover:bg-[var(--glass-bg)]"
            >
              Review briefs
            </Link>
          </div>
        </div>
      </EntityDrawer>
      <PipelineItemModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </>
  );
}

function PipelineItemModal({
  item,
  onClose,
}: {
  item: PipelineItem | null;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!item) return;
    closeRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [item, onClose]);

  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-[95] grid place-items-center bg-[color-mix(in_srgb,var(--bg-deep)_76%,transparent)] px-4 py-8 backdrop-blur-xl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pipeline-item-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="max-h-[calc(100svh-2rem)] w-full max-w-6xl overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-[var(--surface)] shadow-[0_30px_100px_color-mix(in_srgb,var(--bg-deep)_48%,transparent)] sm:max-h-[calc(100svh-4rem)] sm:rounded-3xl">
        <div className="flex items-start justify-between gap-4 border-b border-[var(--glass-border)] p-4 sm:p-6">
          <div className="min-w-0">
            <p className="label-caps text-[var(--secondary)]">{item.stage}</p>
            <h2
              id="pipeline-item-title"
              className="title-serif mt-3 break-words text-[clamp(1.34rem,2.4vw,1.62rem)] font-medium text-[var(--on-surface)]"
            >
              {item.title}
            </h2>
            <p className="mt-2 text-[0.95rem] text-[var(--on-surface-dim)]">
              {item.meta} - updated {item.time}
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close pipeline item"
            className="grid h-10 w-10 cursor-pointer place-items-center rounded-full border border-[var(--glass-border)] text-[var(--on-surface-dim)] hover:text-[var(--on-surface)]"
          >
            <IconX size={18} stroke={1.6} />
          </button>
        </div>
        <div className="grid max-h-[calc(100svh-11rem)] gap-5 overflow-y-auto p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.72fr)]">
          <div className="grid gap-5">
            <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-5">
              <p className="text-[1rem] font-medium text-[var(--on-surface)]">
                Delivery context
              </p>
              <p className="mt-3 text-[0.92rem] leading-relaxed text-[var(--on-surface-dim)]">
                This item is currently in {item.stage}. Use this detail view to
                inspect ownership, handoff state, suggested next action, and
                client-facing status before moving the brief forward.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <MiniStat
                icon={<IconBriefcase size={16} stroke={1.7} />}
                label="Stage load"
                value={`${item.stageCount} briefs`}
              />
              <MiniStat
                icon={<IconClock size={16} stroke={1.7} />}
                label="Last update"
                value={item.time}
              />
              <MiniStat
                icon={<IconUserCheck size={16} stroke={1.7} />}
                label="Team"
                value={`${item.avatars?.length ?? 1} assigned`}
              />
            </div>
          </div>
          <aside className="rounded-2xl border border-[var(--glass-border)] bg-[var(--surface)] p-5">
            <p className="text-[1rem] font-medium text-[var(--on-surface)]">
              Next actions
            </p>
            <div className="mt-4 grid gap-2">
              <button
                type="button"
                className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-[var(--on-surface)] text-[0.88rem] font-medium text-[var(--bg)]"
              >
                <IconChecks size={16} stroke={1.8} />
                Mark reviewed
              </button>
              <Link
                href="/admin/matches"
                className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full border border-[var(--glass-border)] text-[0.88rem] font-medium text-[var(--on-surface)] transition-colors hover:bg-[var(--glass-bg)]"
              >
                Open matching workspace
              </Link>
              <Link
                href="/admin/briefs"
                className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full border border-[var(--glass-border)] text-[0.88rem] font-medium text-[var(--on-surface)] transition-colors hover:bg-[var(--glass-bg)]"
              >
                View brief record
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Field({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-[0.78rem] font-medium text-[var(--on-surface-dim)]">
        {label}
      </span>
      {children}
    </label>
  );
}

function MiniStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--surface)] p-4">
      <span className="text-[var(--secondary)]">{icon}</span>
      <p className="mt-3 text-[0.72rem] text-[var(--on-surface-dim)]">
        {label}
      </p>
      <p className="mt-1 font-mono text-[0.9rem] text-[var(--on-surface)]">
        {value}
      </p>
    </div>
  );
}
