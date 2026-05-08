import { StatusBadge } from "@/components/dashboard/status-badge";

export function ProjectCard({
  project,
}: {
  project: {
    name: string;
    client: string;
    description: string;
    status: string;
    progress: number;
    nextMilestone: string;
    due: string;
  };
}) {
  return (
    <article className="rounded-[1.15rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-5 backdrop-blur-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-[1.05rem] font-medium text-[var(--on-surface)]">{project.name}</h3>
          <p className="mt-1 text-[0.86rem] text-[var(--on-surface-dim)]">{project.client}</p>
        </div>
        <StatusBadge label={project.status} tone={project.status === "Active" ? "active" : "pending"} />
      </div>
      <p className="mt-4 text-[0.94rem] leading-relaxed text-[var(--on-surface-dim)]">{project.description}</p>
      <div className="mt-5">
        <div className="mb-2 flex justify-between font-mono text-[0.72rem] text-[var(--on-surface-dim)]">
          <span>Milestone progress</span>
          <span>{project.progress}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--on-surface)_10%,transparent)]">
          <div className="h-full rounded-full bg-[var(--secondary)]" style={{ width: `${project.progress}%` }} />
        </div>
      </div>
      <p className="mt-4 text-[0.88rem] text-[var(--on-surface-dim)]">
        Next: <span className="text-[var(--on-surface)]">{project.nextMilestone}</span> · {project.due}
      </p>
    </article>
  );
}
