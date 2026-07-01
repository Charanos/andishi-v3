import { relations } from "drizzle-orm";
import { briefs } from "@/db/schema/briefs";
import { allocations, milestones, sprints, taskDependencies, tasks } from "@/db/schema/delivery";
import { engineers } from "@/db/schema/engineers";
import { organizations } from "@/db/schema/organizations";
import { placements } from "@/db/schema/placements";
import { projects } from "@/db/schema/projects";
import { timesheetEntries } from "@/db/schema/timesheets";
import { users } from "@/db/schema/users";

/**
 * Relational query definitions (`db.query.X.findMany({ with: {...} })`).
 * Scoped to the entities where relational reads actually pay off right now
 * - the P1 delivery graph plus the handful of existing links it hangs off
 * (organization, brief, placement) - not an exhaustive relations map for
 * every table in the schema.
 */

export const projectsRelations = relations(projects, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [projects.organizationId],
    references: [organizations.id],
  }),
  brief: one(briefs, { fields: [projects.briefId], references: [briefs.id] }),
  placement: one(placements, { fields: [projects.placementId], references: [placements.id] }),
  leadPm: one(users, { fields: [projects.leadPmUserId], references: [users.id] }),
  milestones: many(milestones),
  sprints: many(sprints),
  tasks: many(tasks),
  allocations: many(allocations),
  timesheetEntries: many(timesheetEntries),
}));

export const milestonesRelations = relations(milestones, ({ one, many }) => ({
  project: one(projects, { fields: [milestones.projectId], references: [projects.id] }),
  tasks: many(tasks),
}));

export const sprintsRelations = relations(sprints, ({ one, many }) => ({
  project: one(projects, { fields: [sprints.projectId], references: [projects.id] }),
  tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  project: one(projects, { fields: [tasks.projectId], references: [projects.id] }),
  milestone: one(milestones, { fields: [tasks.milestoneId], references: [milestones.id] }),
  sprint: one(sprints, { fields: [tasks.sprintId], references: [sprints.id] }),
  parentTask: one(tasks, {
    fields: [tasks.parentTaskId],
    references: [tasks.id],
    relationName: "subtasks",
  }),
  subtasks: many(tasks, { relationName: "subtasks" }),
  assigneeEngineer: one(engineers, {
    fields: [tasks.assigneeEngineerId],
    references: [engineers.id],
  }),
  reporter: one(users, { fields: [tasks.reporterUserId], references: [users.id] }),
  timesheetEntries: many(timesheetEntries),
}));

export const taskDependenciesRelations = relations(taskDependencies, ({ one }) => ({
  task: one(tasks, {
    fields: [taskDependencies.taskId],
    references: [tasks.id],
    relationName: "taskDependencies_task",
  }),
  dependsOnTask: one(tasks, {
    fields: [taskDependencies.dependsOnTaskId],
    references: [tasks.id],
    relationName: "taskDependencies_dependsOn",
  }),
}));

export const allocationsRelations = relations(allocations, ({ one }) => ({
  engineer: one(engineers, { fields: [allocations.engineerId], references: [engineers.id] }),
  project: one(projects, { fields: [allocations.projectId], references: [projects.id] }),
}));

export const timesheetEntriesRelations = relations(timesheetEntries, ({ one }) => ({
  project: one(projects, { fields: [timesheetEntries.projectId], references: [projects.id] }),
  task: one(tasks, { fields: [timesheetEntries.taskId], references: [tasks.id] }),
  engineer: one(engineers, { fields: [timesheetEntries.engineerId], references: [engineers.id] }),
}));
