import {
  IconBell,
  IconBriefcase,
  IconChartBar,
  IconChecklist,
  IconClock,
  IconCode,
  IconCoin,
  IconCreditCard,
  IconFileText,
  IconLayoutDashboard,
  IconMessageCircle,
  IconSettings,
  IconUserCircle,
  IconUsers,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { engineers } from "@/data/engineers";

export type DashboardRole = "admin" | "client" | "developer";

export type DashboardNavItem = {
  href: string;
  label: string;
  icon: Icon;
  group: string;
};

export const roleNav: Record<DashboardRole, DashboardNavItem[]> = {
  admin: [
    { href: "/admin", label: "Overview", icon: IconLayoutDashboard, group: "Command" },
    { href: "/admin/engineers", label: "Engineers", icon: IconCode, group: "Network" },
    { href: "/admin/clients", label: "Clients", icon: IconUsers, group: "Network" },
    { href: "/admin/placements", label: "Placements", icon: IconBriefcase, group: "Operations" },
    { href: "/admin/briefs", label: "Briefs", icon: IconFileText, group: "Operations" },
    { href: "/admin/matches", label: "Matches", icon: IconChecklist, group: "Operations" },
    { href: "/admin/revenue", label: "Revenue", icon: IconChartBar, group: "Business" },
    { href: "/admin/content", label: "Content", icon: IconFileText, group: "Business" },
    { href: "/admin/settings", label: "Settings", icon: IconSettings, group: "Admin" },
  ],
  client: [
    { href: "/dashboard", label: "Overview", icon: IconLayoutDashboard, group: "Hiring" },
    { href: "/dashboard/brief", label: "My Brief", icon: IconFileText, group: "Hiring" },
    { href: "/dashboard/matches", label: "Developer Profiles", icon: IconUsers, group: "Hiring" },
    { href: "/dashboard/team", label: "My Team", icon: IconCode, group: "Engagement" },
    { href: "/dashboard/projects", label: "Projects", icon: IconBriefcase, group: "Engagement" },
    { href: "/dashboard/messages", label: "Messages", icon: IconMessageCircle, group: "Engagement" },
    { href: "/dashboard/payments", label: "Payments", icon: IconCreditCard, group: "Billing" },
    { href: "/dashboard/settings", label: "Settings", icon: IconSettings, group: "Account" },
  ],
  developer: [
    { href: "/dev", label: "Overview", icon: IconLayoutDashboard, group: "Work" },
    { href: "/dev/projects", label: "My Projects", icon: IconBriefcase, group: "Work" },
    { href: "/dev/time", label: "Time Tracking", icon: IconClock, group: "Work" },
    { href: "/dev/profile", label: "My Profile", icon: IconUserCircle, group: "Career" },
    { href: "/dev/earnings", label: "Earnings", icon: IconCoin, group: "Career" },
    { href: "/dev/messages", label: "Messages", icon: IconMessageCircle, group: "Admin" },
    { href: "/dev/settings", label: "Settings", icon: IconSettings, group: "Admin" },
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
    { label: "Live Placements", value: "42", trend: "+9%", data: [21, 24, 28, 31, 35, 39, 42] },
    { label: "Monthly Revenue", value: "$118k", trend: "+16%", data: [64, 72, 78, 84, 91, 105, 118] },
  ],
  client: [
    { label: "Profiles Ready", value: "3", trend: "2 strong matches", data: [0, 0, 1, 1, 2, 3, 3] },
    { label: "Intro Requests", value: "1", trend: "awaiting reply", data: [0, 0, 0, 1, 1, 1, 1] },
    { label: "Days to Target", value: "5", trend: "inside 8-day SLA", data: [8, 7, 7, 6, 6, 5, 5] },
  ],
  developer: [
    { label: "Hours This Week", value: "26.5", trend: "+4.5 vs last week", data: [12, 16, 18, 19, 22, 24, 26] },
    { label: "This Month Earned", value: "$7.8k", trend: "+12%", data: [3, 4, 5, 6, 6.8, 7.2, 7.8] },
    { label: "Active Projects", value: "2", trend: "1 milestone due", data: [1, 1, 2, 2, 2, 2, 2] },
  ],
};

export const clientMatches = engineers.slice(0, 3);

export const projects = [
  {
    name: "AI support workflow",
    client: "Series A SaaS",
    description: "RAG assistant, admin review queue, and evaluation traces.",
    status: "Active",
    progress: 68,
    nextMilestone: "Evaluation dashboard",
    due: "May 17, 2026",
  },
  {
    name: "Payments reconciliation",
    client: "Commerce platform",
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
