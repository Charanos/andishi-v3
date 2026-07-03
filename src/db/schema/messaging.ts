import { index, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { projects } from "@/db/schema/projects";
import { users } from "@/db/schema/users";

// Internal project messaging - a running conversation thread scoped to a
// project, shared by the admin(s), assigned developer(s), and the client.
// Distinct from support_cases (a ticket with a resolution lifecycle): this
// is just delivery-context chat, e.g. "here's the staging link" or "can we
// push the demo to Thursday". Access is derived from the project's existing
// relations (organizationId/engineerIds) via delivery/access.ts's
// resolveProjectAccess - no separate participants table needed.

export const projectMessages = pgTable(
  "project_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    senderUserId: uuid("sender_user_id").references(() => users.id, { onDelete: "set null" }),
    body: text("body").notNull(),
    attachments: jsonb("attachments").$type<string[]>(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    projectIdx: index("project_messages_project_idx").on(table.projectId),
  }),
);

export type ProjectMessage = typeof projectMessages.$inferSelect;
export type NewProjectMessage = typeof projectMessages.$inferInsert;
