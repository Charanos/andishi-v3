import { z } from "zod";

const uuid = z.string().uuid();
const optionalText = z.string().trim().min(1).optional().nullable();

// ── Brief -> project promotion (ADR-0007's central handoff) ──────────

export const promoteBriefToProjectSchema = z.object({
  title: z.string().trim().min(2).optional(),
  engineerIds: z.array(uuid).default([]),
  billingType: z.enum(["fixed", "time_and_materials", "retainer"]),
  budgetCents: z.coerce.number().int().min(0).optional().nullable(),
  startDate: optionalText,
  targetDate: optionalText,
  leadPmUserId: uuid.optional().nullable(),
});

// ── Placement -> project promotion (hire-track equivalent of the above) ──

export const createProjectFromPlacementSchema = z.object({
  title: z.string().trim().min(2),
  description: z.string().trim().min(2),
  billingType: z.enum(["fixed", "time_and_materials", "retainer"]),
  budgetCents: z.coerce.number().int().min(0).optional().nullable(),
  startDate: optionalText,
  targetDate: optionalText,
  leadPmUserId: uuid.optional().nullable(),
});

// ── Milestones ──────────────────────────────────────────────────────

export const createMilestoneSchema = z.object({
  projectId: uuid,
  title: z.string().trim().min(2),
  description: optionalText,
  dueDate: optionalText,
  amountCents: z.coerce.number().int().min(0).optional().nullable(),
  order: z.coerce.number().int().min(0).default(0),
});

export const updateMilestoneSchema = createMilestoneSchema.partial().omit({ projectId: true });

// ── Sprints ─────────────────────────────────────────────────────────

export const sprintStatusValues = ["planned", "active", "completed", "cancelled"] as const;

export const createSprintSchema = z.object({
  projectId: uuid,
  name: z.string().trim().min(2),
  goal: optionalText,
  startDate: optionalText,
  endDate: optionalText,
  status: z.enum(sprintStatusValues).default("planned"),
});

export const updateSprintSchema = createSprintSchema.partial().omit({ projectId: true });

// ── Tasks ─────────────────────────────────────────────────────────

export const taskStatusValues = ["todo", "in_progress", "in_review", "done", "blocked"] as const;
export const taskPriorityValues = ["low", "medium", "high", "urgent"] as const;

export const createTaskSchema = z.object({
  projectId: uuid,
  milestoneId: uuid.optional().nullable(),
  sprintId: uuid.optional().nullable(),
  parentTaskId: uuid.optional().nullable(),
  title: z.string().trim().min(2),
  description: optionalText,
  status: z.enum(taskStatusValues).default("todo"),
  priority: z.enum(taskPriorityValues).default("medium"),
  assigneeEngineerId: uuid.optional().nullable(),
  estimateMinutes: z.coerce.number().int().min(0).optional().nullable(),
  dueDate: optionalText,
  order: z.coerce.number().int().min(0).default(0),
});

export const updateTaskSchema = createTaskSchema.partial().omit({ projectId: true });

/** Kanban-style transition: change status and/or sprint and/or board order in one call. */
export const moveTaskSchema = z
  .object({
    status: z.enum(taskStatusValues).optional(),
    sprintId: uuid.optional().nullable(),
    order: z.coerce.number().int().min(0).optional(),
  })
  .refine(
    (data) => data.status !== undefined || data.sprintId !== undefined || data.order !== undefined,
    {
      message: "Provide at least one of status, sprintId, or order.",
    },
  );

export const createTaskDependencySchema = z.object({
  taskId: uuid,
  dependsOnTaskId: uuid,
});

// ── Allocations ─────────────────────────────────────────────────────

export const createAllocationSchema = z.object({
  engineerId: uuid,
  projectId: uuid,
  weekStart: z.string().trim().min(1),
  plannedMinutes: z.coerce.number().int().min(1),
  note: optionalText,
});

export const updateAllocationSchema = z.object({
  plannedMinutes: z.coerce.number().int().min(1).optional(),
  note: optionalText,
});

// ── Projects (P1 rollup field extensions) ────────────────────────────

export const projectBillingTypeValues = ["fixed", "time_and_materials", "retainer"] as const;
export const projectHealthValues = ["on_track", "at_risk", "off_track"] as const;

export const updateProjectDeliveryFieldsSchema = z.object({
  code: optionalText,
  health: z.enum(projectHealthValues).optional(),
  budgetCents: z.coerce.number().int().min(0).optional().nullable(),
  billingType: z.enum(projectBillingTypeValues).optional().nullable(),
  leadPmUserId: uuid.optional().nullable(),
});
