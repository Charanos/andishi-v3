"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  IconCalendarEvent,
  IconCheck,
  IconClock,
  IconEdit,
  IconPlus,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { StatusBadge } from "@/components/dashboard/shared/status-badge";

type EventStatus = "confirmed" | "draft" | "review";

type OpsEvent = {
  date: string;
  id: string;
  owner: string;
  status: EventStatus;
  time: string;
  title: string;
  type: string;
};

const initialEvents: OpsEvent[] = [
  {
    date: "2026-05-26",
    id: "evt-brief-review",
    owner: "Dennis",
    status: "review",
    time: "10:30",
    title: "Kijani shortlist review",
    type: "Review",
  },
  {
    date: "2026-05-27",
    id: "evt-amina-intro",
    owner: "Amina",
    status: "confirmed",
    time: "14:00",
    title: "Founder intro slot",
    type: "Intro",
  },
  {
    date: "2026-05-28",
    id: "evt-revenue-sync",
    owner: "Ops",
    status: "draft",
    time: "09:15",
    title: "Revenue reconciliation sync",
    type: "Finance",
  },
];

const emptyDraft: Omit<OpsEvent, "id"> = {
  date: "2026-05-26",
  owner: "Dennis",
  status: "draft",
  time: "09:00",
  title: "",
  type: "Review",
};

export function AdminEventsPanel() {
  const [events, setEvents] = useState<OpsEvent[]>(initialEvents);
  const [draft, setDraft] = useState(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<OpsEvent | null>(null);

  const sortedEvents = useMemo(
    () =>
      [...events].sort((a, b) =>
        `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`),
      ),
    [events],
  );
  const resetDraft = () => {
    setDraft(emptyDraft);
    setEditingId(null);
  };

  const saveEvent = () => {
    if (!draft.title.trim()) return;
    if (editingId) {
      setEvents((current) =>
        current.map((event) =>
          event.id === editingId
            ? { ...event, ...draft, title: draft.title.trim() }
            : event,
        ),
      );
    } else {
      setEvents((current) => [
        ...current,
        {
          ...draft,
          id: `evt-${Date.now()}`,
          title: draft.title.trim(),
        },
      ]);
    }
    resetDraft();
  };

  const editEvent = (event: OpsEvent) => {
    setEditingId(event.id);
    setDraft({
      date: event.date,
      owner: event.owner,
      status: event.status,
      time: event.time,
      title: event.title,
      type: event.type,
    });
  };

  const deleteEvent = (id: string) => {
    setEvents((current) => current.filter((event) => event.id !== id));
    if (editingId === id) resetDraft();
  };

  const confirmEvent = (id: string) => {
    setEvents((current) =>
      current.map((event) =>
        event.id === id ? { ...event, status: "confirmed" } : event,
      ),
    );
  };

  return (
    <>
      <section className="min-w-0 my-8">
        <div className="min-w-0">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="label-caps text-[var(--secondary)]">
                Events command
              </p>
              <h2 className="title-serif mt-3 text-[1.2rem] font-medium text-[var(--on-surface)]">
                Operational calendar
              </h2>
              <p className="mt-1.5 max-w-3xl text-[0.94rem] leading-relaxed text-[var(--on-surface-dim)]">
                Create, update, confirm, and inspect schedule items tied to
                briefs and placements.
              </p>
            </div>
            <StatusBadge label={`${events.length} events`} tone="pending" />
          </div>

          <div className="mt-7 grid min-w-0 gap-5 border-t border-[var(--glass-border)] pt-7 lg:grid-cols-[minmax(18rem,0.82fr)_minmax(0,1.18fr)]">
            <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-5">
              <p className="text-[1rem] font-medium text-[var(--on-surface)]">
                {editingId ? "Edit event" : "Register event"}
              </p>
              <div className="mt-4 grid gap-3">
                <input
                  value={draft.title}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  placeholder="Event title"
                  className="h-11 rounded-xl border border-[var(--glass-border)] bg-[var(--surface)] px-3.5 text-[0.92rem] text-[var(--on-surface)] outline-none placeholder:text-[var(--on-surface-dim)]"
                />
                <div className="grid gap-2 min-[420px]:grid-cols-[1fr_0.72fr]">
                  <input
                    type="date"
                    value={draft.date}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        date: event.target.value,
                      }))
                    }
                    className="h-11 rounded-xl border border-[var(--glass-border)] bg-[var(--surface)] px-3.5 font-mono text-[0.84rem] text-[var(--on-surface)] outline-none"
                  />
                  <input
                    type="time"
                    value={draft.time}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        time: event.target.value,
                      }))
                    }
                    className="h-11 rounded-xl border border-[var(--glass-border)] bg-[var(--surface)] px-3.5 font-mono text-[0.84rem] text-[var(--on-surface)] outline-none"
                  />
                </div>
                <div className="grid gap-2 min-[420px]:grid-cols-2">
                  <select
                    value={draft.type}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        type: event.target.value,
                      }))
                    }
                    className="h-11 rounded-xl border border-[var(--glass-border)] bg-[var(--surface)] px-3.5 text-[0.9rem] text-[var(--on-surface)] outline-none"
                  >
                    <option>Review</option>
                    <option>Intro</option>
                    <option>Finance</option>
                    <option>Placement</option>
                  </select>
                  <select
                    value={draft.status}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        status: event.target.value as EventStatus,
                      }))
                    }
                    className="h-11 rounded-xl border border-[var(--glass-border)] bg-[var(--surface)] px-3.5 text-[0.9rem] text-[var(--on-surface)] outline-none"
                  >
                    <option value="draft">Draft</option>
                    <option value="review">Review</option>
                    <option value="confirmed">Confirmed</option>
                  </select>
                </div>
                <input
                  value={draft.owner}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      owner: event.target.value,
                    }))
                  }
                  placeholder="Owner"
                  className="h-11 rounded-xl border border-[var(--glass-border)] bg-[var(--surface)] px-3.5 text-[0.92rem] text-[var(--on-surface)] outline-none placeholder:text-[var(--on-surface-dim)]"
                />
                <div className="grid gap-2 min-[420px]:grid-cols-[1fr_auto]">
                  <button
                    type="button"
                    onClick={saveEvent}
                    className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-[var(--on-surface)] px-4 text-[0.92rem] font-medium text-[var(--bg)]"
                  >
                    <IconPlus size={15} stroke={1.8} />
                    {editingId ? "Update" : "Create"}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={resetDraft}
                      className="grid h-11 w-11 cursor-pointer place-items-center rounded-full border border-[var(--glass-border)] text-[var(--on-surface-dim)] hover:text-[var(--on-surface)]"
                      aria-label="Cancel editing"
                    >
                      <IconX size={15} stroke={1.7} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid content-start gap-3">
              {sortedEvents.map((event) => (
                <article
                  key={event.id}
                  className="rounded-2xl border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_70%,transparent)] p-4"
                >
                  <div className="flex min-w-0 flex-col gap-3 min-[460px]:flex-row min-[460px]:items-start min-[460px]:justify-between">
                    <button
                      type="button"
                      onClick={() => setSelectedEvent(event)}
                      className="min-w-0 cursor-pointer text-left"
                    >
                      <p className="break-words text-[1rem] font-medium leading-snug text-[var(--on-surface)]">
                        {event.title}
                      </p>
                      <p className="mt-1.5 flex flex-wrap items-center gap-2 font-mono text-[0.78rem] text-[var(--on-surface-dim)]">
                        <IconClock size={14} stroke={1.6} />
                        {event.date} at {event.time}
                        <span>{event.owner}</span>
                      </p>
                    </button>
                    <StatusBadge
                      label={event.status}
                      tone={statusTone(event.status)}
                    />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => editEvent(event)}
                      className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-[var(--glass-border)] px-3 text-[0.82rem] text-[var(--on-surface-dim)] hover:text-[var(--on-surface)]"
                    >
                      <IconEdit size={14} stroke={1.6} />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => confirmEvent(event.id)}
                      className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-[var(--glass-border)] px-3 text-[0.82rem] text-[var(--on-surface-dim)] hover:text-[var(--on-surface)]"
                    >
                      <IconCheck size={14} stroke={1.6} />
                      Confirm
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteEvent(event.id)}
                      className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-[color-mix(in_srgb,var(--error)_28%,transparent)] px-3 text-[0.82rem] text-[var(--error)]"
                    >
                      <IconTrash size={14} stroke={1.6} />
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
      <EventDetailModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onDelete={(id) => {
          deleteEvent(id);
          setSelectedEvent(null);
        }}
        onConfirm={(id) => {
          confirmEvent(id);
          setSelectedEvent((current) =>
            current ? { ...current, status: "confirmed" } : current,
          );
        }}
      />
    </>
  );
}

export function AdminScheduleIntelligencePanel() {
  const sortedEvents = [...initialEvents].sort((a, b) =>
    `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`),
  );
  const nextEvent = sortedEvents[0];

  return (
    <section className="min-w-0 my-12">
      <p className="label-caps text-[var(--secondary)]">
        Schedule intelligence
      </p>
      <h2 className="title-serif mt-3 text-[clamp(1.48rem,2vw,1.9rem)] font-medium text-[var(--on-surface)]">
        Next operational move
      </h2>
      <div className="mt-6 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-5">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-[color-mix(in_srgb,var(--secondary)_22%,transparent)] bg-[color-mix(in_srgb,var(--secondary)_8%,transparent)] text-[var(--secondary)]">
            <IconCalendarEvent size={21} stroke={1.7} />
          </span>
          <div className="min-w-0">
            <p className="break-words text-[1.02rem] font-medium text-[var(--on-surface)]">
              {nextEvent?.title ?? "No events scheduled"}
            </p>
            <p className="mt-2 text-[0.9rem] leading-relaxed text-[var(--on-surface-dim)]">
              {nextEvent
                ? `${nextEvent.type} owned by ${nextEvent.owner}, scheduled for ${nextEvent.date} at ${nextEvent.time}.`
                : "Create an event to populate the operations schedule."}
            </p>
          </div>
        </div>
      </div>
      <div className="mt-6 grid gap-3 border-t border-[var(--glass-border)] pt-6">
        <InsightRow
          label="Confirmed"
          value={
            sortedEvents.filter((event) => event.status === "confirmed").length
          }
        />
        <InsightRow
          label="Needs review"
          value={
            sortedEvents.filter((event) => event.status === "review").length
          }
        />
        <InsightRow
          label="Drafts"
          value={
            sortedEvents.filter((event) => event.status === "draft").length
          }
        />
      </div>
    </section>
  );
}

function EventDetailModal({
  event,
  onClose,
  onConfirm,
  onDelete,
}: {
  event: OpsEvent | null;
  onClose: () => void;
  onConfirm: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!event) return;
    closeRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (keyboardEvent: KeyboardEvent) => {
      if (keyboardEvent.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [event, onClose]);

  if (!event) return null;

  return (
    <div
      className="fixed inset-0 z-[90] grid place-items-center bg-[color-mix(in_srgb,var(--bg-deep)_72%,transparent)] px-4 py-8 backdrop-blur-xl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-detail-title"
      onMouseDown={(mouseEvent) => {
        if (mouseEvent.target === mouseEvent.currentTarget) onClose();
      }}
    >
      <div className="max-h-[calc(100svh-2rem)] w-full max-w-5xl overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-[var(--surface)] shadow-[0_30px_100px_color-mix(in_srgb,var(--bg-deep)_44%,transparent)] sm:max-h-[calc(100svh-4rem)] sm:rounded-3xl">
        <div className="flex items-start justify-between gap-4 border-b border-[var(--glass-border)] p-4 sm:p-6">
          <div className="min-w-0">
            <p className="label-caps text-[var(--secondary)]">{event.type}</p>
            <h2
              id="event-detail-title"
              className="title-serif mt-3 break-words text-[clamp(1.62rem,3.6vw,2.05rem)] font-medium text-[var(--on-surface)]"
            >
              {event.title}
            </h2>
            <p className="mt-2 text-[1rem] text-[var(--on-surface-dim)]">
              {event.date} at {event.time} - Owner: {event.owner}
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close event details"
            className="grid h-10 w-10 cursor-pointer place-items-center rounded-full border border-[var(--glass-border)] text-[var(--on-surface-dim)] hover:text-[var(--on-surface)]"
          >
            <IconX size={18} stroke={1.6} />
          </button>
        </div>
        <div className="grid max-h-[calc(100svh-11rem)] gap-5 overflow-y-auto p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.72fr)]">
          <div className="grid gap-4">
            <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-5">
              <p className="text-[1.05rem] font-medium text-[var(--on-surface)]">
                Operational notes
              </p>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-[var(--on-surface-dim)]">
                Use this event to coordinate shortlist reviews, client intros,
                placement decisions, or revenue follow-ups. The detail modal is
                structured for handoff notes and quick status changes.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <MiniStat label="Status" value={event.status} />
              <MiniStat label="Type" value={event.type} />
              <MiniStat label="Owner" value={event.owner} />
            </div>
          </div>
          <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--surface)] p-5">
            <p className="text-[1.05rem] font-medium text-[var(--on-surface)]">
              Actions
            </p>
            <div className="mt-4 grid gap-2">
              <button
                type="button"
                onClick={() => onConfirm(event.id)}
                className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-[var(--on-surface)] text-[0.92rem] font-medium text-[var(--bg)]"
              >
                <IconCheck size={15} stroke={1.8} />
                Confirm event
              </button>
              <button
                type="button"
                onClick={() => onDelete(event.id)}
                className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--error)_28%,transparent)] text-[0.92rem] font-medium text-[var(--error)]"
              >
                <IconTrash size={15} stroke={1.8} />
                Delete event
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InsightRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-3">
      <p className="text-[0.92rem] text-[var(--on-surface-dim)]">{label}</p>
      <p className="font-mono text-[1.12rem] text-[var(--on-surface)]">
        {value}
      </p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--surface)] p-4">
      <p className="text-[0.82rem] text-[var(--on-surface-dim)]">{label}</p>
      <p className="mt-2 font-mono text-[1.02rem] text-[var(--on-surface)]">
        {value}
      </p>
    </div>
  );
}

function statusTone(status: EventStatus) {
  if (status === "confirmed") return "active";
  if (status === "review") return "pending";
  return "available";
}
