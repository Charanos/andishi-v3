import {
  IconBell,
  IconBriefcase,
  IconChartBar,
  IconClock,
  IconCode,
  IconCoin,
  IconCreditCard,
  IconGitBranch,
  IconFileText,
  IconLayoutDashboard,
  IconMessageCircle,
  IconMessageQuestion,
  IconReportAnalytics,
  IconSettings,
  IconTimeline,
  IconUserCircle,
  IconUsers,
  IconUserCheck,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { engineers } from "@/data/engineers";
import type { UserRole } from "@/types/auth";

export type DashboardRole = UserRole;

export type DashboardNavItem = {
  href: string;
  label: string;
  icon: Icon;
  group: string;
  /** One of these lives in the mobile bottom bar's fixed slots - see MobileBottomNav. */
  primary?: boolean;
  children?: Array<{
    href: string;
    label: string;
  }>;
};

/**
 * Grouping mirrors the real backend module map (docs/backend/
 * BACKEND_ARCHITECTURE_MASTER.md Part 5) rather than ad-hoc page ordering -
 * Workflow = the CRM-intake-to-delivery handoff (Briefs -> Pipeline ->
 * Placements, same sequence and terminology as AdminWorkflowNav - the group
 * is named "Workflow" rather than "Pipeline" so it doesn't collide with the
 * Pipeline item label inside it), Network = talent supply + accounts,
 * Marketing = CMS/proof assets, Support = support + notifications,
 * Platform = identity/access + governance. Every href below is a route that
 * already exists; no placeholders for not-yet-built pages.
 */
export const roleNav: Record<DashboardRole, DashboardNavItem[]> = {
  admin: [
    {
      href: "/admin",
      label: "Overview",
      icon: IconLayoutDashboard,
      group: "Command",
      primary: true,
    },
    {
      href: "/admin/briefs",
      label: "Briefs",
      icon: IconFileText,
      group: "Workflow",
      primary: true,
      children: [
        { href: "/admin/briefs", label: "Review Queue" },
        { href: "/admin/briefs/shortlist", label: "Shortlists" },
      ],
    },
    {
      href: "/admin/matches",
      label: "Pipeline",
      icon: IconGitBranch,
      group: "Workflow",
      primary: true,
    },
    {
      href: "/admin/placements",
      label: "Placements",
      icon: IconBriefcase,
      group: "Workflow",
      primary: true,
      children: [
        { href: "/admin/placements", label: "Active Work" },
        { href: "/admin/placements/timeline", label: "Timeline" },
      ],
    },
    {
      href: "/admin/engineers",
      label: "Engineers",
      icon: IconCode,
      group: "Network",
      children: [
        { href: "/admin/engineers", label: "Directory" },
        { href: "/admin/placements", label: "Availability" },
      ],
    },
    { href: "/admin/careers", label: "Careers", icon: IconUserCheck, group: "Network" },
    { href: "/admin/clients", label: "Clients", icon: IconUsers, group: "Network" },
    { href: "/admin/payments", label: "Payments", icon: IconCreditCard, group: "Finance" },
    { href: "/admin/revenue", label: "Revenue", icon: IconChartBar, group: "Finance" },
    {
      href: "/admin/testimonials",
      label: "Testimonials",
      icon: IconMessageCircle,
      group: "Marketing",
    },
    { href: "/admin/content", label: "Content", icon: IconTimeline, group: "Marketing" },
    { href: "/admin/users", label: "User Mgmt", icon: IconUsers, group: "Platform" },
    {
      href: "/admin/audit",
      label: "Audit Reports",
      icon: IconReportAnalytics,
      group: "Platform",
    },
    { href: "/admin/profile", label: "Profile", icon: IconUserCircle, group: "Platform" },
    { href: "/admin/settings", label: "Settings", icon: IconSettings, group: "Platform" },
    { href: "/admin/support", label: "Support", icon: IconMessageQuestion, group: "Support" },
    { href: "/admin/notifications", label: "Notifications", icon: IconBell, group: "Support" },
  ],
  client: [
    {
      href: "/dashboard",
      label: "Overview",
      icon: IconLayoutDashboard,
      group: "Hiring",
      primary: true,
    },
    {
      href: "/dashboard/brief",
      label: "My Brief",
      icon: IconFileText,
      group: "Hiring",
      primary: true,
    },
    { href: "/dashboard/matches", label: "Developer Profiles", icon: IconUsers, group: "Hiring" },
    {
      href: "/dashboard/team",
      label: "My Team",
      icon: IconCode,
      group: "Engagement",
      primary: true,
    },
    {
      href: "/dashboard/projects",
      label: "Projects",
      icon: IconBriefcase,
      group: "Engagement",
      primary: true,
    },
    {
      href: "/dashboard/support",
      label: "Support",
      icon: IconMessageQuestion,
      group: "Engagement",
    },
    {
      href: "/dashboard/messages",
      label: "Messages",
      icon: IconMessageCircle,
      group: "Engagement",
    },
    { href: "/dashboard/payments", label: "Payments", icon: IconCreditCard, group: "Billing" },
    { href: "/dashboard/settings", label: "Settings", icon: IconSettings, group: "Account" },
  ],
  developer: [
    {
      href: "/dev",
      label: "Overview",
      icon: IconLayoutDashboard,
      group: "Work",
      primary: true,
    },
    {
      href: "/dev/projects",
      label: "My Projects",
      icon: IconBriefcase,
      group: "Work",
      primary: true,
    },
    { href: "/dev/time", label: "Time Tracking", icon: IconClock, group: "Work", primary: true },
    { href: "/dev/support", label: "Support", icon: IconMessageQuestion, group: "Work" },
    { href: "/dev/profile", label: "My Profile", icon: IconUserCircle, group: "Career" },
    {
      href: "/dev/earnings",
      label: "Earnings",
      icon: IconCoin,
      group: "Career",
      primary: true,
    },
    { href: "/dev/messages", label: "Messages", icon: IconMessageCircle, group: "Account" },
    { href: "/dev/settings", label: "Settings", icon: IconSettings, group: "Account" },
  ],
};

export const roleLabels: Record<DashboardRole, string> = {
  admin: "Super Admin",
  client: "Client Workspace",
  developer: "Developer Workspace",
};

export const kpis = {
  admin: [
    { label: "Active Briefs", value: "18", trend: "+4 this week", data: [5, 7, 8, 7, 11, 13, 18] },
    { label: "Live Builds", value: "42", trend: "+9%", data: [21, 24, 28, 31, 35, 39, 42] },
    {
      label: "Monthly Revenue",
      value: "$118k",
      trend: "+16%",
      data: [64, 72, 78, 84, 91, 105, 118],
    },
  ],
  client: [
    { label: "Proposals Scoped", value: "3", trend: "2 proposals ready", data: [0, 0, 1, 1, 2, 3, 3] },
    { label: "Discovery Syncs", value: "1", trend: "awaiting kickoff", data: [0, 0, 0, 1, 1, 1, 1] },
    { label: "Days to Target", value: "5", trend: "inside 8-day SLA", data: [8, 7, 7, 6, 6, 5, 5] },
  ],
  developer: [
    {
      label: "Hours This Week",
      value: "26.5",
      trend: "+4.5 vs last week",
      data: [12, 16, 18, 19, 22, 24, 26],
    },
    {
      label: "This Month Earned",
      value: "$7.8k",
      trend: "+12%",
      data: [3, 4, 5, 6, 6.8, 7.2, 7.8],
    },
    { label: "Active Projects", value: "2", trend: "1 milestone due", data: [1, 1, 2, 2, 2, 2, 2] },
  ],
};

export const clientMatches = engineers.slice(0, 3);

export const projects = [
  {
    name: "AI support workflow",
    client: "Series A SaaS",
    sourceBrief: "Senior AI engineer for customer support workflow",
    description: "RAG assistant, admin review queue, and evaluation traces.",
    status: "Active",
    progress: 68,
    nextMilestone: "Evaluation dashboard",
    due: "May 17, 2026",
  },
  {
    name: "Payments reconciliation",
    client: "Commerce platform",
    sourceBrief: "Full-stack engineer for payments reconciliation",
    description: "Webhook retries, M-Pesa matching, and finance reporting.",
    status: "Planning",
    progress: 32,
    nextMilestone: "Provider contract tests",
    due: "May 22, 2026",
  },
];

export const activity = [
  ["10:24", "Hiring brief reviewed by Andishi operations"],
  ["09:15", "Amina Otieno marked as a strong match"],
  ["Yesterday", "Intro request sent to Kwame Mensah"],
  ["May 6", "Workspace created from public hiring brief"],
];

export const onboardingItems = {
  client: [
    ["Account created", true],
    ["Hiring brief submitted", true],
    ["First profile viewed", true],
    ["Intro request sent", false],
    ["First engineer onboarded", false],
  ],
  developer: [
    ["Account created", true],
    ["Profile completed", true],
    ["Technical assessment passed", false],
    ["First placement matched", false],
    ["First payment received", false],
  ],
};

export const notifications = [
  { icon: IconBell, label: "3 profile updates ready" },
  { icon: IconClock, label: "One milestone due this week" },
];

export const pinnedChats = [
  {
    id: "chat-support",
    name: "Support Desk",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=80&q=80",
    color: "bg-[var(--tertiary)]",
    colorText: "text-[var(--tertiary)]",
    unread: 0,
    type: "support" as const,
    initials: "SD",
  },
  {
    id: "chat-project",
    name: "Alpha Project Chat",
    avatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=80&q=80",
    color: "bg-[var(--secondary)]",
    colorText: "text-[var(--secondary)]",
    unread: 0,
    type: "project" as const,
    initials: "AP",
  },
  {
    id: "chat-team",
    name: "Team Sync",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80",
    color: "bg-purple-500",
    colorText: "text-purple-500",
    unread: 2,
    type: "team" as const,
    initials: "TS",
  },
];
