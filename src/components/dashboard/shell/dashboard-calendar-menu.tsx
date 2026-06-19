"use client";

import { useMemo, useState } from "react";
import { IconCalendarTime, IconChevronLeft, IconChevronRight, IconPlus } from "@tabler/icons-react";
import { useDetailsPopover } from "@/components/dashboard/shell/use-details-popover";
import type { AuthUser } from "@/types/auth";

type CalendarEvent = {
  date: string;
  time: string;
  title: string;
  type: string;
};

const seedEvents: Record<AuthUser["role"], CalendarEvent[]> = {
  admin: [
    { date: "2026-05-26", time: "10:30", title: "Review Kijani shortlist", type: "Review" },
    { date: "2026-05-27", time: "14:00", title: "Intro slot with Amina", type: "Intro" },
  ],
  client: [
    { date: "2026-05-26", time: "11:00", title: "Review prepared profiles", type: "Review" },
    { date: "2026-05-28", time: "15:30", title: "Intro with senior AI engineer", type: "Intro" },
  ],
  developer: [
    { date: "2026-05-26", time: "17:00", title: "Submit timesheet evidence", type: "Delivery" },
    { date: "2026-05-29", time: "09:30", title: "Milestone sync", type: "Project" },
  ],
};

const eventTypes: Record<AuthUser["role"], string[]> = {
  admin: ["Review", "Intro", "Client call", "Placement", "Finance"],
  client: ["Review", "Intro", "Decision", "Payment"],
  developer: ["Delivery", "Project", "Timesheet", "Payout"],
};

export function DashboardCalendarMenu({ role }: { role: AuthUser["role"] }) {
  const popoverRef = useDetailsPopover();
  const today = new Date(2026, 4, 26);
  const [cursor, setCursor] = useState(new Date(today));
  const [events, setEvents] = useState<CalendarEvent[]>(seedEvents[role]);
  const [form, setForm] = useState<CalendarEvent>({
    date: "2026-05-26",
    time: "09:00",
    title: "",
    type: eventTypes[role][0] ?? "Review",
  });

  const days = useMemo(() => buildCalendarDays(cursor), [cursor]);
  const monthLabel = cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const displayDate = today.toLocaleDateString("en-US", { day: "2-digit", month: "2-digit", year: "numeric" });

  const addEvent = () => {
    if (!form.title.trim()) return;
    setEvents((current) =>
      [...current, { ...form, title: form.title.trim() }].sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)),
    );
    setForm((current) => ({ ...current, title: "" }));
  };

  return (
    <details ref={popoverRef} className="group relative hidden xl:block">
      <summary className="flex h-10 cursor-pointer list-none items-center gap-2 rounded-full border border-[var(--glass-border)] px-3 text-[0.72rem] text-[var(--on-surface-dim)] transition-colors duration-300 hover:text-[var(--on-surface)]">
        <IconCalendarTime size={14} stroke={1.6} />
        <span className="font-mono">{displayDate}</span>
      </summary>
      <div className="absolute right-0 top-12 z-50 w-[24rem] overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-[var(--surface)] p-3 shadow-[0_24px_70px_color-mix(in_srgb,var(--bg-deep)_28%,transparent)]">
        <div className="flex items-center justify-between gap-3 px-1 py-1">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => setCursor((value) => new Date(value.getFullYear(), value.getMonth() - 1, 1))}
            className="grid h-8 w-8 cursor-pointer place-items-center rounded-full border border-[var(--glass-border)] text-[var(--on-surface-dim)] hover:text-[var(--on-surface)]"
          >
            <IconChevronLeft size={15} stroke={1.6} />
          </button>
          <p className="font-medium text-[var(--on-surface)]">{monthLabel}</p>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => setCursor((value) => new Date(value.getFullYear(), value.getMonth() + 1, 1))}
            className="grid h-8 w-8 cursor-pointer place-items-center rounded-full border border-[var(--glass-border)] text-[var(--on-surface-dim)] hover:text-[var(--on-surface)]"
          >
            <IconChevronRight size={15} stroke={1.6} />
          </button>
        </div>
        <div className="mt-3 grid grid-cols-7 gap-1 text-center font-mono text-[0.62rem] uppercase text-[var(--on-surface-dim)]">
          {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
            <span key={`${day}-${index}`}>{day}</span>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-7 gap-1">
          {days.map((day) => {
            const iso = toDateInput(day.date);
            const hasEvent = events.some((event) => event.date === iso);
            const active = iso === "2026-05-26";

            return (
              <button
                key={iso}
                type="button"
                onClick={() => setForm((current) => ({ ...current, date: iso }))}
                className={[
                  "relative grid h-8 cursor-pointer place-items-center rounded-lg font-mono text-[0.72rem] transition-colors duration-300",
                  day.inMonth ? "text-[var(--on-surface)]" : "text-[color-mix(in_srgb,var(--on-surface-dim)_38%,transparent)]",
                  active
                    ? "bg-[var(--secondary)] text-[var(--on-secondary)] ring-2 ring-[color-mix(in_srgb,var(--secondary)_30%,transparent)]"
                    : "hover:bg-[color-mix(in_srgb,var(--on-surface)_7%,transparent)]",
                ].join(" ")}
              >
                {day.date.getDate()}
                {hasEvent && (
                  <span
                    className={[
                      "absolute bottom-1 h-1 w-1 rounded-full",
                      active ? "bg-[var(--on-secondary)]" : "bg-[var(--secondary)]",
                    ].join(" ")}
                  />
                )}
              </button>
            );
          })}
        </div>
        <div className="mt-4 border-t border-[var(--glass-border)] pt-4">
          <p className="text-[0.86rem] font-medium text-[var(--on-surface)]">Register event</p>
          <div className="mt-3 grid gap-2">
            <input
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              placeholder="Event title"
              className="h-10 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 text-[0.84rem] text-[var(--on-surface)] outline-none placeholder:text-[var(--on-surface-dim)]"
            />
            <div className="grid grid-cols-[1fr_0.75fr] gap-2">
              <input
                type="date"
                value={form.date}
                onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
                className="h-10 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 font-mono text-[0.78rem] text-[var(--on-surface)] outline-none"
              />
              <input
                type="time"
                value={form.time}
                onChange={(event) => setForm((current) => ({ ...current, time: event.target.value }))}
                className="h-10 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 font-mono text-[0.78rem] text-[var(--on-surface)] outline-none"
              />
            </div>
            <select
              value={form.type}
              onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}
              className="h-10 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 text-[0.84rem] text-[var(--on-surface)] outline-none"
            >
              {eventTypes[role].map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={addEvent}
              className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-full bg-[var(--on-surface)] px-4 text-[0.84rem] font-medium text-[var(--bg)]"
            >
              <IconPlus size={15} stroke={1.8} />
              Add event
            </button>
          </div>
        </div>
        <div className="mt-4 grid gap-1 border-t border-[var(--glass-border)] pt-3">
          {events.slice(0, 4).map((event) => (
            <div key={`${event.date}-${event.time}-${event.title}`} className="rounded-xl px-3 py-2 text-[0.82rem] text-[var(--on-surface-dim)]">
              <p className="font-medium text-[var(--on-surface)]">{event.title}</p>
              <p className="mt-1 font-mono text-[0.68rem]">{event.date} at {event.time} - {event.type}</p>
            </div>
          ))}
        </div>
      </div>
    </details>
  );
}

function buildCalendarDays(cursor: Date) {
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const first = new Date(year, month, 1);
  const start = new Date(year, month, 1 - first.getDay());

  return Array.from({ length: 35 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return { date, inMonth: date.getMonth() === month };
  });
}

function toDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
