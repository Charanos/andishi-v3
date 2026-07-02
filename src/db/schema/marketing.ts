import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "@/db/schema/users";

// Master doc §6.7 - Marketing. campaign_metrics is an ingestion target
// (GA4 export or manual entry), one row per campaign per day.

export const campaignChannelEnum = pgEnum("campaign_channel", [
  "email",
  "social",
  "content",
  "paid_search",
  "paid_social",
  "referral",
  "partnership",
  "other",
]);

export const campaignStatusEnum = pgEnum("campaign_status", [
  "draft",
  "active",
  "paused",
  "completed",
  "archived",
]);

export interface CampaignUtm {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
}

export const campaigns = pgTable(
  "campaigns",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    channel: campaignChannelEnum("channel").notNull(),
    status: campaignStatusEnum("status").notNull().default("draft"),
    startDate: text("start_date"),
    endDate: text("end_date"),
    budgetCents: integer("budget_cents").notNull().default(0),
    utm: jsonb("utm").$type<CampaignUtm>(),
    ownerUserId: uuid("owner_user_id").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    statusIdx: index("campaigns_status_idx").on(table.status),
  }),
);

export type Campaign = typeof campaigns.$inferSelect;
export type NewCampaign = typeof campaigns.$inferInsert;

export const newsletterSubscriberStatusEnum = pgEnum("newsletter_subscriber_status", [
  "subscribed",
  "unsubscribed",
]);

export const newsletterSubscribers = pgTable(
  "newsletter_subscribers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull().unique(),
    status: newsletterSubscriberStatusEnum("status").notNull().default("subscribed"),
    // Free text - e.g. "blog_faq_newsletter", "footer_form" - which form/page captured the signup.
    source: text("source"),
    subscribedAt: timestamp("subscribed_at", { withTimezone: true }).notNull().defaultNow(),
    unsubscribedAt: timestamp("unsubscribed_at", { withTimezone: true }),
  },
  (table) => ({
    statusIdx: index("newsletter_subscribers_status_idx").on(table.status),
  }),
);

export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type NewNewsletterSubscriber = typeof newsletterSubscribers.$inferInsert;

export const campaignMetrics = pgTable(
  "campaign_metrics",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    campaignId: uuid("campaign_id")
      .notNull()
      .references(() => campaigns.id, { onDelete: "cascade" }),
    // Plain text date (e.g. "2026-07-01"), one row per campaign per day -
    // same convention as finance.ts's periodStart/periodEnd.
    date: text("date").notNull(),
    impressions: integer("impressions").notNull().default(0),
    clicks: integer("clicks").notNull().default(0),
    conversions: integer("conversions").notNull().default(0),
    spendCents: integer("spend_cents").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    // One row per campaign per day - re-ingesting the same day upserts
    // rather than duplicating (GA4 exports can be re-run/backfilled).
    campaignDateIdx: uniqueIndex("campaign_metrics_campaign_date_idx").on(
      table.campaignId,
      table.date,
    ),
  }),
);

export type CampaignMetric = typeof campaignMetrics.$inferSelect;
export type NewCampaignMetric = typeof campaignMetrics.$inferInsert;
