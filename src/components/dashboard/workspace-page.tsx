import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { DataTable } from "@/components/dashboard/data-table";
import { DrawerPanel } from "@/components/dashboard/drawer-panel";
import { EarningsCard } from "@/components/dashboard/earnings-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { FilterBar } from "@/components/dashboard/filter-bar";
import { InsightsCard } from "@/components/dashboard/insights-card";
import { KanbanBoard } from "@/components/dashboard/kanban-board";
import { OnboardingChecklist } from "@/components/dashboard/onboarding-checklist";
import { ProfileCard } from "@/components/dashboard/profile-card";
import { ProjectCard } from "@/components/dashboard/project-card";
import { TimeTracker } from "@/components/dashboard/time-tracker";
import { WelcomeModal } from "@/components/dashboard/welcome-modal";
import type { DashboardRole } from "@/data/dashboard";
import { activity, clientMatches, kpis, onboardingItems, projects } from "@/data/dashboard";
import { engineers } from "@/data/engineers";

export function DashboardOverview({ role }: { role: DashboardRole }) {
  return (
    <div className="grid gap-6">
      {(role === "client" || role === "developer") && <WelcomeModal role={role} />}
      <section className="grid gap-4 lg:grid-cols-3">
        {kpis[role].map((item) => (
          <InsightsCard key={item.label} {...item} />
        ))}
      </section>
      {role === "admin" && (
        <section className="grid gap-6 xl:grid-cols-[1fr_22rem]">
          <KanbanBoard />
          <ActivityFeed items={activity} />
        </section>
      )}
      {role === "client" && (
        <section className="grid gap-6 xl:grid-cols-[1fr_22rem]">
          <div className="grid gap-4">
            <FilterBar filters={["All", "Available Now", "Full-stack", "AI"]} placeholder="Search matched profiles" />
            <div className="grid gap-4 xl:grid-cols-3">
              {clientMatches.map((engineer) => (
                <ProfileCard key={engineer.slug} engineer={engineer} variant="client" />
              ))}
            </div>
          </div>
          <div className="grid gap-4">
            <OnboardingChecklist items={onboardingItems.client as Array<[string, boolean]>} />
            <ActivityFeed items={activity} />
          </div>
        </section>
      )}
      {role === "developer" && (
        <section className="grid gap-6 xl:grid-cols-[1fr_22rem]">
          <div className="grid gap-4">
            <EarningsCard />
            <TimeTracker />
            <div className="grid gap-4 lg:grid-cols-2">
              {projects.map((project) => (
                <ProjectCard key={project.name} project={project} />
              ))}
            </div>
          </div>
          <OnboardingChecklist items={onboardingItems.developer as Array<[string, boolean]>} />
        </section>
      )}
    </div>
  );
}

export function GenericWorkspacePage({
  role,
  title,
  kind,
}: {
  role: DashboardRole;
  title: string;
  kind: "profiles" | "projects" | "table" | "kanban" | "empty" | "time" | "earnings" | "brief" | "messages";
}) {
  return (
    <div className="grid gap-6">
      <header className="max-w-3xl">
        <p className="label-caps text-[var(--secondary)]">{role}</p>
        <h1 className="mt-4 text-[clamp(2rem,7vw,4.4rem)] font-normal leading-[0.96] tracking-tight text-[var(--on-surface)]">
          {title}
        </h1>
        <p className="body-md mt-4 text-[var(--on-surface-dim)]">
          Static v3 workspace route with the final layout, states, and action surfaces prepared for API integration.
        </p>
      </header>

      {kind === "profiles" && (
        <>
          <FilterBar filters={["All", "Available Now", "Full-stack", "AI", "Cloud"]} />
          <div className="grid gap-4 xl:grid-cols-3">
            {engineers.slice(0, 6).map((engineer) => (
              <ProfileCard key={engineer.slug} engineer={engineer} variant={role === "admin" ? "admin" : "client"} />
            ))}
          </div>
        </>
      )}
      {kind === "projects" && (
        <div className="grid gap-4 lg:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard key={project.name} project={project} />
          ))}
        </div>
      )}
      {kind === "table" && (
        <DataTable
          rows={[
            { Name: "Acme AI", Owner: "Maya CTO", Status: "Active", Updated: "Today" },
            { Name: "Commerce Co", Owner: "Daniel Ops", Status: "Pending", Updated: "Yesterday" },
            { Name: "Cloud audit", Owner: "Zainab", Status: "Active", Updated: "May 6" },
          ]}
        />
      )}
      {kind === "kanban" && <KanbanBoard />}
      {kind === "time" && <TimeTracker />}
      {kind === "earnings" && (
        <div className="grid gap-4 lg:grid-cols-[24rem_1fr]">
          <EarningsCard />
          <DataTable rows={[
            { Date: "May 1", Project: "AI support workflow", Hours: "42", Total: "$4,200", Status: "Pending" },
            { Date: "Apr 1", Project: "Payments reconciliation", Hours: "76", Total: "$7,600", Status: "Paid" },
          ]} />
        </div>
      )}
      {kind === "brief" && (
        <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
          <DataTable rows={[
            { Section: "Role details", Value: "Senior AI product engineer", Status: "Active" },
            { Section: "Tech requirements", Value: "Next.js, Python, RAG, AWS", Status: "Active" },
            { Section: "Timeline", Value: "Start within 2 weeks", Status: "Pending" },
          ]} />
          <DrawerPanel title="Brief updated">
            <p className="text-[0.94rem] leading-relaxed text-[var(--on-surface-dim)]">
              Our team will review changes within 24 hours. The shortlist SLA remains visible from the client overview.
            </p>
          </DrawerPanel>
        </div>
      )}
      {kind === "messages" && (
        <div className="grid gap-4 lg:grid-cols-[20rem_1fr]">
          <DataTable rows={[
            { Conversation: "Amina Otieno", Last: "Intro slots received", Status: "Active" },
            { Conversation: "Andishi Ops", Last: "Brief reviewed", Status: "Pending" },
          ]} />
          <DrawerPanel title="Crisp inbox wrapper">
            <p className="text-[0.94rem] leading-relaxed text-[var(--on-surface-dim)]">
              This route is prepared as a wrapper for Crisp rather than a custom realtime chat implementation.
            </p>
          </DrawerPanel>
        </div>
      )}
      {kind === "empty" && (
        <EmptyState
          heading="Profiles on the way."
          body="Our team is reviewing the brief. First developer profiles arrive within 8 days."
          cta={{ href: role === "developer" ? "/dev/profile" : "/dashboard/brief", label: role === "developer" ? "Complete profile" : "Edit brief" }}
        />
      )}
    </div>
  );
}
