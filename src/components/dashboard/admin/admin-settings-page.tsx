"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import {
  IconActivity,
  IconAlertTriangle,
  IconArrowBackUp,
  IconBell,
  IconChecks,
  IconCheck,
  IconCircleX,
  IconCloudUpload,
  IconDatabase,
  IconDeviceFloppy,
  IconMail,
  IconServer,
  IconShieldLock,
  IconPalette,
  IconLayoutSidebar,
  IconLayoutNavbar
} from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import type { NotificationPref } from "@/db/schema/support";
import { DashboardPageHeader } from "@/components/dashboard/shared/dashboard-page-header";
import { StatusBadge } from "@/components/dashboard/shared/status-badge";
import { useToast } from "@/components/dashboard/shared/toast-provider";
import { useAppearance, type AppearanceConfig } from "@/components/dashboard/shared/appearance-provider";
import { AdminPlatformNav } from "@/components/dashboard/admin/admin-platform-nav";
import { cn } from "@/lib/utils";

type Tab = "general" | "notifications" | "status";
type PrefChannel = "email" | "in_app";

const EVENT_TYPES: { key: string; module: string; label: string }[] = [
  { key: "application_submitted", module: "Careers", label: "New application submitted" },
  { key: "application_stage_changed", module: "Careers", label: "Application stage changed" },
  { key: "application_hired", module: "Careers", label: "Candidate hired" },
  { key: "payout_approved", module: "Finance", label: "Payout approved" },
  { key: "payout_paid", module: "Finance", label: "Payout paid" },
  { key: "invoice_sent", module: "Finance", label: "Invoice sent" },
  { key: "invoice_paid", module: "Finance", label: "Invoice paid" },
  { key: "support_case_reply", module: "Support", label: "New support case reply" },
  { key: "support_case_resolved", module: "Support", label: "Support case resolved" },
  { key: "support_case_assigned", module: "Support", label: "Support case assigned to you" },
  { key: "calendar_event_invite", module: "Scheduling", label: "Calendar event invite" },
  { key: "brief_promoted_to_project", module: "Delivery", label: "Brief promoted to project" },
  { key: "placement_promoted_to_project", module: "Delivery", label: "Placement promoted to project" },
  { key: "milestone_created", module: "Delivery", label: "Milestone created" },
  { key: "milestone_submitted", module: "Delivery", label: "Milestone submitted" },
  { key: "milestone_approved", module: "Delivery", label: "Milestone approved" },
  { key: "sprint_opened", module: "Delivery", label: "Sprint opened" },
  { key: "sprint_closed", module: "Delivery", label: "Sprint closed" },
  { key: "task_created", module: "Delivery", label: "Task created" },
  { key: "task_moved", module: "Delivery", label: "Task moved" },
  { key: "timesheet_submitted", module: "Delivery", label: "Timesheet submitted" },
  { key: "timesheet_approved", module: "Delivery", label: "Timesheet approved" },
  { key: "project_message", module: "Delivery", label: "New project message" },
  { key: "project_completed", module: "Delivery", label: "Project marked completed" },
  { key: "project_review_submitted", module: "Delivery", label: "Client review submitted" },
];

const MODULE_ORDER = ["Careers", "Finance", "Support", "Scheduling", "Delivery"];

function Switch({
  on,
  onClick,
  label,
  pending = false,
}: {
  on: boolean;
  onClick: () => void;
  label: string;
  pending?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onClick}
      disabled={pending}
      className={cn(
        "relative flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border p-[2px] transition-colors duration-300 disabled:cursor-wait disabled:opacity-50",
        on
          ? "border-[var(--tertiary)] bg-[var(--tertiary)]"
          : "border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--on-surface)_10%,transparent)]",
      )}
    >
      <motion.div
        layout
        className={cn("h-[18px] w-[18px] rounded-full bg-white shadow-sm", pending && "animate-pulse")}
        animate={{ x: on ? 20 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </button>
  );
}

export function AdminSettingsPage() {
  const [tab, setTab] = useState<Tab>("general");
  const { notify } = useToast();

  const tabs = [
    { id: "general" as const, label: "Appearance", icon: IconPalette },
    { id: "notifications" as const, label: "Notifications", icon: IconBell },
    { id: "status" as const, label: "System Status", icon: IconActivity },
  ];

  return (
    <div className="grid min-w-0 gap-9 py-10 md:gap-10 lg:gap-12 lg:py-12">
      <DashboardPageHeader
        className="mb-0"
        title="Platform Settings"
        description="Global platform configuration, UI branding themes, and notification routing."
        status={<StatusBadge label="Super Admin Access" tone="active" />}
      />

      <AdminPlatformNav />

      <div className="grid items-start gap-8 lg:grid-cols-[16rem_minmax(0,1fr)]">
        {/* Sidebar Nav */}
        <nav className="sticky top-24 grid gap-2 rounded-[1.35rem] border border-[var(--glass-border)] bg-gradient-to-br from-[color-mix(in_srgb,var(--surface-high)_20%,transparent)] to-[color-mix(in_srgb,var(--surface-high)_2%,transparent)] p-3 shadow-[0_18px_48px_color-mix(in_srgb,var(--bg-deep)_4%,transparent),inset_0_1px_0_color-mix(in_srgb,white_10%,transparent)] backdrop-blur-2xl">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-[0.86rem] font-medium transition-all duration-200 cursor-pointer",
                tab === t.id
                  ? "bg-[color-mix(in_srgb,var(--primary)_12%,transparent)] text-[var(--primary)] shadow-[inset_0_1px_0_color-mix(in_srgb,white_20%,transparent)] border border-[color-mix(in_srgb,var(--primary)_20%,transparent)]"
                  : "text-[var(--on-surface-dim)] hover:bg-[color-mix(in_srgb,var(--surface-high)_40%,transparent)] hover:text-[var(--on-surface)] border border-transparent"
              )}
            >
              <t.icon size={18} stroke={1.8} />
              {t.label}
            </button>
          ))}
        </nav>

        {/* Content Pane */}
        <div className="min-w-0">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {tab === "general" && <AppearanceSettingsPanel />}
              {tab === "notifications" && <NotificationPrefsPanel notify={notify} />}
              {tab === "status" && <SystemStatusPanel notify={notify} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ── Appearance: Persistent Platform UI settings ─────────────────────

function AppearanceSettingsPanel() {
  const { appearance, updateAppearanceBatch } = useAppearance();
  const { notify } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  const [draft, setDraft] = useState<AppearanceConfig>(appearance);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  // Track the live (applied) appearance until the user starts editing, so a
  // draft opened before the initial GET /api/settings resolves still picks
  // up the real saved values instead of freezing on the provider's defaults.
  // Once dirty, this stops - an in-progress edit should never be silently
  // overwritten by an external change. Adjusted during render (not an
  // Effect) since this is following `appearance` identity changing, not
  // synchronizing with an external system - the provider always returns a
  // new object on change, so reference inequality is a reliable signal.
  const [syncedAppearance, setSyncedAppearance] = useState(appearance);
  if (appearance !== syncedAppearance) {
    setSyncedAppearance(appearance);
    if (!dirty) setDraft(appearance);
  }

  const setField = <K extends keyof AppearanceConfig>(key: K, value: AppearanceConfig[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setDirty(true);
  };

  useGSAP(() => {
    gsap.fromTo(
      ".gsap-appearance-card",
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power2.out" }
    );
  }, []);

  useGSAP(() => {
    if (!dirty) return;
    gsap.fromTo(barRef.current, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: "power2.out" });
  }, [dirty]);

  const handleDiscard = () => {
    setDraft(appearance);
    setDirty(false);
  };

  const handleSave = async () => {
    const patch: Partial<Record<keyof AppearanceConfig, string>> = {};
    (Object.keys(draft) as Array<keyof AppearanceConfig>).forEach((key) => {
      if (draft[key] !== appearance[key]) patch[key] = draft[key];
    });
    if (Object.keys(patch).length === 0) {
      setDirty(false);
      return;
    }

    setSaving(true);
    try {
      // patch's values were read straight from `draft`, which is already a
      // valid AppearanceConfig - the wider Record<..., string> type above
      // only exists to make the loop's assignment type-check.
      await updateAppearanceBatch(patch as Partial<AppearanceConfig>);
      setDirty(false);
      notify("Appearance preferences saved", "success");
    } catch {
      notify("Failed to save appearance preferences", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div ref={containerRef} className="grid gap-6 pb-20">
      <div className="flex flex-col gap-4">
        <p className="text-[0.86rem] text-[var(--on-surface-dim)] max-w-xl">
          Configure the global look and feel of the platform interface. Pick your preferences below, then Save to apply and persist them across all administrative dashboards.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
         {/* Sidebar Theme Control Board */}
         <div className="gsap-appearance-card flex flex-col overflow-hidden rounded-[2rem] border border-[var(--glass-border)] bg-[var(--surface)] shadow-[0_18px_48px_color-mix(in_srgb,var(--bg-deep)_6%,transparent)]">
            <div className="border-b border-[color-mix(in_srgb,var(--glass-border)_50%,transparent)] bg-[color-mix(in_srgb,var(--glass-bg)_50%,transparent)] p-5 flex items-center gap-4">
               <span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--glass-bg)] border border-[color-mix(in_srgb,var(--primary)_20%,var(--glass-border))] text-[var(--primary)] shadow-sm">
                 <IconLayoutSidebar size={20} />
               </span>
               <div>
                  <h3 className="font-medium text-[var(--on-surface)] text-[0.95rem]">Sidebar Style</h3>
                  <p className="text-[0.8rem] text-[var(--on-surface-dim)] mt-0.5">Visual theme of the left navigation.</p>
               </div>
            </div>
            
            <div className="grid gap-3 p-5">
               {[
                 { id: "glass", label: "Glass Light", desc: "Translucent borders" },
                 { id: "solid", label: "Solid Color", desc: "Opaque background" },
                 { id: "cosmic", label: "Cosmic Dark", desc: "Deep gradient glow" },
               ].map(theme => (
                  <button
                    key={theme.id}
                    onClick={() => setField("sidebarTheme", theme.id as AppearanceConfig["sidebarTheme"])}
                    className={cn(
                       "relative flex items-center justify-between p-4 rounded-[1.25rem] border transition-all cursor-pointer overflow-hidden group",
                       draft.sidebarTheme === theme.id 
                         ? "border-[color-mix(in_srgb,var(--primary)_50%,transparent)] bg-[color-mix(in_srgb,var(--primary)_8%,transparent)] shadow-sm"
                         : "border-[var(--glass-border)] bg-[var(--glass-bg)] hover:border-[color-mix(in_srgb,var(--primary)_30%,transparent)] hover:bg-[color-mix(in_srgb,var(--surface)_50%,transparent)]"
                    )}
                  >
                     {draft.sidebarTheme === theme.id && (
                       <div className="absolute inset-0 bg-[radial-gradient(circle_at_left,color-mix(in_srgb,var(--primary)_10%,transparent),transparent_50%)] pointer-events-none" />
                     )}
                     <div className="relative z-10 flex flex-col items-start gap-1 text-left">
                       <span className={cn(
                          "font-medium text-[0.9rem] transition-colors",
                          draft.sidebarTheme === theme.id ? "text-[var(--primary)]" : "text-[var(--on-surface)] group-hover:text-[var(--primary)]"
                       )}>{theme.label}</span>
                       <span className="text-[0.75rem] text-[var(--on-surface-dim)]">{theme.desc}</span>
                     </div>
                     <div className={cn(
                        "relative z-10 grid h-6 w-6 place-items-center rounded-full border transition-colors",
                        draft.sidebarTheme === theme.id ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--bg)]" : "border-[var(--glass-border)] text-transparent"
                     )}>
                        {draft.sidebarTheme === theme.id && <IconCheck size={14} stroke={3} />}
                     </div>
                  </button>
               ))}
            </div>
         </div>

         {/* Topnav Theme Control Board */}
         <div className="gsap-appearance-card flex flex-col overflow-hidden rounded-[2rem] border border-[var(--glass-border)] bg-[var(--surface)] shadow-[0_18px_48px_color-mix(in_srgb,var(--bg-deep)_6%,transparent)]">
            <div className="border-b border-[color-mix(in_srgb,var(--glass-border)_50%,transparent)] bg-[color-mix(in_srgb,var(--glass-bg)_50%,transparent)] p-5 flex items-center gap-4">
               <span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--glass-bg)] border border-[color-mix(in_srgb,var(--primary)_20%,var(--glass-border))] text-[var(--primary)] shadow-sm">
                 <IconLayoutNavbar size={20} />
               </span>
               <div>
                  <h3 className="font-medium text-[var(--on-surface)] text-[0.95rem]">Top Bar Style</h3>
                  <p className="text-[0.8rem] text-[var(--on-surface-dim)] mt-0.5">Visual theme of the top header area.</p>
               </div>
            </div>
            
            <div className="grid gap-3 p-5">
               {[
                 { id: "transparent", label: "Transparent", desc: "Blurs content behind" },
                 { id: "glass", label: "Frosted Glass", desc: "Subtle background" },
                 { id: "solid", label: "Solid Fill", desc: "Stands out clearly" },
               ].map(theme => (
                  <button
                    key={theme.id}
                    onClick={() => setField("topNavTheme", theme.id as AppearanceConfig["topNavTheme"])}
                    className={cn(
                       "relative flex items-center justify-between p-4 rounded-[1.25rem] border transition-all cursor-pointer overflow-hidden group",
                       draft.topNavTheme === theme.id 
                         ? "border-[color-mix(in_srgb,var(--primary)_50%,transparent)] bg-[color-mix(in_srgb,var(--primary)_8%,transparent)] shadow-sm"
                         : "border-[var(--glass-border)] bg-[var(--glass-bg)] hover:border-[color-mix(in_srgb,var(--primary)_30%,transparent)] hover:bg-[color-mix(in_srgb,var(--surface)_50%,transparent)]"
                    )}
                  >
                     {draft.topNavTheme === theme.id && (
                       <div className="absolute inset-0 bg-[radial-gradient(circle_at_left,color-mix(in_srgb,var(--primary)_10%,transparent),transparent_50%)] pointer-events-none" />
                     )}
                     <div className="relative z-10 flex flex-col items-start gap-1 text-left">
                       <span className={cn(
                          "font-medium text-[0.9rem] transition-colors",
                          draft.topNavTheme === theme.id ? "text-[var(--primary)]" : "text-[var(--on-surface)] group-hover:text-[var(--primary)]"
                       )}>{theme.label}</span>
                       <span className="text-[0.75rem] text-[var(--on-surface-dim)]">{theme.desc}</span>
                     </div>
                     <div className={cn(
                        "relative z-10 grid h-6 w-6 place-items-center rounded-full border transition-colors",
                        draft.topNavTheme === theme.id ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--bg)]" : "border-[var(--glass-border)] text-transparent"
                     )}>
                        {draft.topNavTheme === theme.id && <IconCheck size={14} stroke={3} />}
                     </div>
                  </button>
               ))}
            </div>
         </div>

         {/* Layout States Control Board */}
         <div className="gsap-appearance-card flex flex-col overflow-hidden rounded-[2rem] border border-[var(--glass-border)] bg-[var(--surface)] shadow-[0_18px_48px_color-mix(in_srgb,var(--bg-deep)_6%,transparent)] lg:col-span-2">
            <div className="border-b border-[color-mix(in_srgb,var(--glass-border)_50%,transparent)] bg-[color-mix(in_srgb,var(--glass-bg)_50%,transparent)] p-5 flex items-center gap-4">
               <span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--glass-bg)] border border-[color-mix(in_srgb,var(--primary)_20%,var(--glass-border))] text-[var(--primary)] shadow-sm">
                 <IconLayoutSidebar size={20} />
               </span>
               <div>
                  <h3 className="font-medium text-[var(--on-surface)] text-[0.95rem]">Global Layout Configuration</h3>
                  <p className="text-[0.8rem] text-[var(--on-surface-dim)] mt-0.5">Control the structural persistence of navigation elements.</p>
               </div>
            </div>
            
            <div className="grid gap-6 p-6 sm:grid-cols-2">
               {/* Sidebar State */}
               <div>
                 <p className="text-[0.85rem] font-medium text-[var(--on-surface)] mb-3">Sidebar State</p>
                 <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: "expanded", label: "Expanded", desc: "Full sidebar" },
                      { id: "collapsed", label: "Collapsed", desc: "Icon-only" },
                    ].map(state => (
                       <button
                         key={state.id}
                         onClick={() => setField("sidebarState", state.id as AppearanceConfig["sidebarState"])}
                         className={cn(
                            "flex flex-col items-center justify-center gap-1 text-center p-4 rounded-2xl border transition-all cursor-pointer",
                            draft.sidebarState === state.id 
                              ? "border-[color-mix(in_srgb,var(--primary)_50%,transparent)] bg-[color-mix(in_srgb,var(--primary)_8%,transparent)] shadow-sm scale-105"
                              : "border-[var(--glass-border)] bg-[var(--glass-bg)] hover:border-[color-mix(in_srgb,var(--primary)_30%,transparent)] hover:bg-[color-mix(in_srgb,var(--surface)_50%,transparent)]"
                         )}
                       >
                          <span className={cn(
                             "font-medium text-[0.85rem]",
                             draft.sidebarState === state.id ? "text-[var(--primary)]" : "text-[var(--on-surface)]"
                          )}>{state.label}</span>
                          <span className="text-[0.7rem] text-[var(--on-surface-dim)]">{state.desc}</span>
                       </button>
                    ))}
                 </div>
               </div>

               {/* Top Bar State */}
               <div>
                 <p className="text-[0.85rem] font-medium text-[var(--on-surface)] mb-3">Top Bar State</p>
                 <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: "visible", label: "Visible", desc: "Show globally" },
                      { id: "hidden", label: "Hidden", desc: "Hide globally" },
                    ].map(state => (
                       <button
                         key={state.id}
                         onClick={() => setField("topBarState", state.id as AppearanceConfig["topBarState"])}
                         className={cn(
                            "flex flex-col items-center justify-center gap-1 text-center p-4 rounded-2xl border transition-all cursor-pointer",
                            draft.topBarState === state.id 
                              ? "border-[color-mix(in_srgb,var(--primary)_50%,transparent)] bg-[color-mix(in_srgb,var(--primary)_8%,transparent)] shadow-sm scale-105"
                              : "border-[var(--glass-border)] bg-[var(--glass-bg)] hover:border-[color-mix(in_srgb,var(--primary)_30%,transparent)] hover:bg-[color-mix(in_srgb,var(--surface)_50%,transparent)]"
                         )}
                       >
                          <span className={cn(
                             "font-medium text-[0.85rem]",
                             draft.topBarState === state.id ? "text-[var(--primary)]" : "text-[var(--on-surface)]"
                          )}>{state.label}</span>
                          <span className="text-[0.7rem] text-[var(--on-surface-dim)]">{state.desc}</span>
                       </button>
                    ))}
                 </div>
               </div>
            </div>
         </div>

         {/* Primary Color Accent */}
         <div className="gsap-appearance-card flex flex-col overflow-hidden rounded-[2rem] border border-[var(--glass-border)] bg-[var(--surface)] shadow-[0_18px_48px_color-mix(in_srgb,var(--bg-deep)_6%,transparent)] lg:col-span-2">
            <div className="border-b border-[color-mix(in_srgb,var(--glass-border)_50%,transparent)] bg-[color-mix(in_srgb,var(--glass-bg)_50%,transparent)] p-5 flex items-center gap-4">
               <span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--glass-bg)] border border-[color-mix(in_srgb,var(--primary)_20%,var(--glass-border))] text-[var(--primary)] shadow-sm">
                 <IconPalette size={20} />
               </span>
               <div>
                  <h3 className="font-medium text-[var(--on-surface)] text-[0.95rem]">Brand Accent Color</h3>
                  <p className="text-[0.8rem] text-[var(--on-surface-dim)] mt-0.5">The core color driving buttons, links, and active indicators.</p>
               </div>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 p-8 bg-[var(--glass-bg)]">
               {[
                 { id: "#6366f1", label: "Indigo" },
                 { id: "#3b82f6", label: "Blue" },
                 { id: "#10b981", label: "Emerald" },
                 { id: "#f43f5e", label: "Rose" },
                 { id: "#8b5cf6", label: "Violet" },
                 { id: "#f59e0b", label: "Amber" },
               ].map(color => (
                  <button
                    key={color.id}
                    onClick={() => setField("primaryAccent", color.id)}
                    className={cn(
                       "relative h-14 w-14 rounded-full cursor-pointer transition-all duration-300 shadow-md",
                       draft.primaryAccent === color.id 
                         ? "ring-[6px] ring-offset-4 ring-offset-[var(--surface)] scale-110" 
                         : "hover:scale-110 hover:shadow-lg hover:ring-2 hover:ring-offset-2 hover:ring-offset-[var(--surface)]"
                    )}
                    style={{ backgroundColor: color.id, "--tw-ring-color": color.id } as React.CSSProperties}
                    title={color.label}
                  >
                     {draft.primaryAccent === color.id && (
                        <IconChecks className="absolute inset-0 m-auto text-white" size={24} stroke={2.5} />
                     )}
                  </button>
               ))}
            </div>
         </div>

      </div>

      {dirty && (
        <div
          ref={barRef}
          className="fixed inset-x-0 bottom-6 z-30 mx-auto flex w-[min(34rem,calc(100vw-2rem))] items-center justify-between gap-4 rounded-full border border-[color-mix(in_srgb,var(--primary)_30%,var(--glass-border))] bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] px-5 py-3 shadow-[0_24px_60px_color-mix(in_srgb,var(--bg-deep)_28%,transparent)] backdrop-blur-2xl"
        >
          <p className="min-w-0 truncate text-[0.85rem] font-medium text-[var(--on-surface)]">
            You have unsaved appearance changes
          </p>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={handleDiscard}
              disabled={saving}
              className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-[var(--glass-border)] px-4 text-[0.8rem] font-medium text-[var(--on-surface-dim)] transition-colors hover:text-[var(--on-surface)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <IconArrowBackUp size={14} stroke={1.9} />
              Discard
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full bg-[var(--primary)] px-4 text-[0.8rem] font-medium text-[var(--on-primary)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <IconDeviceFloppy size={14} stroke={1.9} />
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Notifications: real per-event, per-channel routing prefs ────────

function NotificationPrefsPanel({
  notify,
}: {
  notify: (message: string, tone?: "success" | "error" | "info") => void;
}) {
  const [prefs, setPrefs] = useState<NotificationPref[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pending, setPending] = useState<string | null>(null);

  useEffect(() => {
    const loadPrefs = async () => {
      try {
        const res = await fetch("/api/notification-prefs");
        if (res.ok) {
          const data = await res.json();
          setPrefs(data.prefs ?? []);
        } else {
          notify("Failed to load notification preferences", "error");
        }
      } catch {
        notify("Failed to load notification preferences", "error");
      } finally {
        setIsLoading(false);
      }
    };
    loadPrefs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isEnabled = (eventType: string, channel: PrefChannel) => {
    const pref = prefs.find((p) => p.eventType === eventType && p.channel === channel);
    return pref ? pref.enabled : true; // no row yet = default on
  };

  const handleToggle = async (eventType: string, channel: PrefChannel) => {
    const nextEnabled = !isEnabled(eventType, channel);
    const cellKey = `${eventType}:${channel}`;
    setPending(cellKey);
    try {
      const res = await fetch("/api/notification-prefs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel, eventType, enabled: nextEnabled }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      const saved: NotificationPref = data.pref;
      setPrefs((prev) => {
        const exists = prev.some((p) => p.eventType === eventType && p.channel === channel);
        return exists
          ? prev.map((p) => (p.eventType === eventType && p.channel === channel ? saved : p))
          : [...prev, saved];
      });
    } catch {
      notify("Failed to update preference", "error");
    } finally {
      setPending(null);
    }
  };

  const grouped = useMemo(() => {
    const byModule = new Map<string, typeof EVENT_TYPES>();
    for (const event of EVENT_TYPES) {
      const list = byModule.get(event.module) ?? [];
      list.push(event);
      byModule.set(event.module, list);
    }
    return MODULE_ORDER.map((module) => ({ module, events: byModule.get(module) ?? [] })).filter(
      (group) => group.events.length > 0,
    );
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center rounded-[1.35rem] border border-[var(--glass-border)] bg-[var(--surface)] p-12 shadow-sm">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div className="rounded-[1.2rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-5">
         <p className="text-[0.86rem] leading-relaxed text-[var(--on-surface-dim)]">
           Choose how you&apos;re notified for each platform event. Delivery settings are applied immediately.
         </p>
      </div>

      <div className="grid gap-5">
        {grouped.map((group) => (
          <section
            key={group.module}
            className="overflow-hidden rounded-[1.35rem] border border-[var(--glass-border)] bg-[var(--surface)] shadow-[0_18px_48px_color-mix(in_srgb,var(--bg-deep)_6%,transparent)]"
          >
            <div className="flex items-center justify-between border-b border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-high)_40%,transparent)] px-5 py-4">
              <div className="flex items-center gap-2">
                 <span className="grid h-7 w-7 place-items-center rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--primary)]">
                    <IconBell size={14} />
                 </span>
                 <p className="font-mono text-[0.76rem] font-medium uppercase tracking-wider text-[var(--on-surface)]">
                   {group.module} Events
                 </p>
              </div>
              <div className="hidden gap-8 pr-1 font-mono text-[0.65rem] uppercase tracking-wider text-[var(--on-surface-dim)] sm:flex">
                <span className="w-11 text-center">Email</span>
                <span className="w-11 text-center">In-app</span>
              </div>
            </div>
            <ul className="divide-y divide-[var(--glass-border)]">
              {group.events.map((event) => (
                <li
                  key={event.key}
                  className="group/row flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-[color-mix(in_srgb,var(--on-surface)_2%,transparent)]"
                >
                  <p className="min-w-0 text-[0.88rem] font-medium text-[var(--on-surface)] transition-colors group-hover/row:text-[var(--primary)]">
                    {event.label}
                  </p>
                  <div className="flex shrink-0 gap-8 self-end sm:self-auto border-t sm:border-0 border-[var(--glass-border)] pt-3 sm:pt-0 w-full sm:w-auto justify-end">
                    <div className="flex w-11 flex-col items-center gap-1 sm:block">
                      <span className="text-[0.6rem] uppercase tracking-widest text-[var(--on-surface-dim)] sm:hidden">Email</span>
                      <Switch
                        on={isEnabled(event.key, "email")}
                        onClick={() => handleToggle(event.key, "email")}
                        label={`Email for ${event.label}`}
                        pending={pending === `${event.key}:email`}
                      />
                    </div>
                    <div className="flex w-11 flex-col items-center gap-1 sm:block">
                      <span className="text-[0.6rem] uppercase tracking-widest text-[var(--on-surface-dim)] sm:hidden">In-app</span>
                      <Switch
                        on={isEnabled(event.key, "in_app")}
                        onClick={() => handleToggle(event.key, "in_app")}
                        label={`In-app for ${event.label}`}
                        pending={pending === `${event.key}:in_app`}
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

// ── System status: real config presence checks ───────────────────────

type HealthResponse = {
  status: "ok" | "error";
  db: string;
  latencyMs?: number;
  env?: string;
  integrations?: {
    email: boolean;
    rateLimiting: boolean;
    errorTracking: boolean;
    fileStorage: boolean;
  };
};

function StatusCard({
  icon: Icon,
  label,
  description,
  ok,
  latencyMs
}: {
  icon: typeof IconDatabase;
  label: string;
  description: string;
  ok: boolean | null;
  latencyMs?: number;
}) {
  return (
    <div className="flex flex-col justify-between rounded-[1.2rem] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_50%,transparent)] p-5 transition-all hover:bg-[color-mix(in_srgb,var(--surface)_80%,transparent)] hover:border-[color-mix(in_srgb,var(--on-surface)_20%,transparent)]">
       <div className="flex items-start justify-between gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--on-surface)] shadow-sm">
            <Icon size={22} stroke={1.4} />
          </span>
          {ok === null ? (
            <span className="flex h-6 items-center rounded-full bg-[var(--glass-bg)] px-2.5 font-mono text-[0.65rem] uppercase tracking-wider text-[var(--on-surface-dim)]">
              Checking
            </span>
          ) : ok ? (
            <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[0.65rem] font-mono uppercase tracking-wider text-emerald-400">
               <span className="relative flex h-2 w-2">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
               </span>
               Operational
            </div>
          ) : (
            <div className="flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-[0.65rem] font-mono uppercase tracking-wider text-red-400">
               <IconCircleX size={12} />
               Missing
            </div>
          )}
       </div>
       <div className="mt-5">
         <p className="text-[0.95rem] font-medium text-[var(--on-surface)]">{label}</p>
         <p className="mt-1 text-[0.8rem] text-[var(--on-surface-dim)] leading-relaxed">{description}</p>
       </div>
       {latencyMs !== undefined && ok && (
         <div className="mt-4 border-t border-[var(--glass-border)] pt-4">
            <p className="font-mono text-[0.7rem] text-[var(--on-surface-dim)]">
               Latency: <span className="text-[var(--on-surface)] font-medium">{latencyMs}ms</span>
            </p>
         </div>
       )}
    </div>
  );
}

function SystemStatusPanel({
  notify,
}: {
  notify: (message: string, tone?: "success" | "error" | "info") => void;
}) {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadHealth = async () => {
      try {
        const res = await fetch("/api/health");
        const data = await res.json();
        setHealth(data);
        if (res.status >= 500) notify("Database is currently unreachable", "error");
      } catch {
        setHealth({ status: "error", db: "unreachable" });
        notify("Failed to reach the health check endpoint", "error");
      } finally {
        setIsLoading(false);
      }
    };
    loadHealth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dbOk = health ? health.status === "ok" : null;

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between rounded-[1.2rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-5">
        <p className="text-[0.86rem] leading-relaxed text-[var(--on-surface-dim)] max-w-2xl">
          Live infrastructure and integration status, checked on page load. Red indicators represent missing environment variables required for proper functionality.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center rounded-[1.35rem] border border-[var(--glass-border)] bg-[var(--surface)] p-12 shadow-sm">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <StatusCard
            icon={IconDatabase}
            label="Neon Database"
            description="PostgreSQL high-performance serverless database connectivity."
            ok={dbOk}
            latencyMs={health?.latencyMs}
          />
          <StatusCard
            icon={IconMail}
            label="Resend Email"
            description="Transactional email delivery for notifications and auth."
            ok={health?.integrations?.email ?? null}
          />
          <StatusCard
            icon={IconServer}
            label="Upstash Redis"
            description="Serverless Redis for rate limiting and rapid caching."
            ok={health?.integrations?.rateLimiting ?? null}
          />
          <StatusCard
            icon={IconAlertTriangle}
            label="Sentry Errors"
            description="Full-stack monitoring and crash reporting."
            ok={health?.integrations?.errorTracking ?? null}
          />
          <StatusCard
            icon={IconCloudUpload}
            label="Vercel Blob"
            description="Cloud storage for avatars, resumes, and project assets."
            ok={health?.integrations?.fileStorage ?? null}
          />
        </div>
      )}

      <div className="mt-4 flex items-start gap-3 rounded-[1.2rem] border border-amber-500/20 bg-amber-500/5 p-5">
        <IconShieldLock size={18} className="mt-0.5 shrink-0 text-amber-500/80" />
        <p className="text-[0.82rem] leading-relaxed text-amber-500/80 font-medium">
          This dashboard only confirms whether integrations have credentials securely configured&mdash;it never exposes the actual tokens. Add missing secrets securely in your deployment pipeline.
        </p>
      </div>
    </div>
  );
}
