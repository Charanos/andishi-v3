import { z } from "zod";

const uuid = z.string().uuid();
const optionalText = z.string().trim().min(1).optional().nullable();

// ── Campaigns (master doc §6.7) ───────────────────────────────────────

const campaignUtmSchema = z.object({
  source: z.string().trim().min(1).optional(),
  medium: z.string().trim().min(1).optional(),
  campaign: z.string().trim().min(1).optional(),
  term: z.string().trim().min(1).optional(),
  content: z.string().trim().min(1).optional(),
});

export const createCampaignSchema = z.object({
  name: z.string().trim().min(2),
  channel: z.enum([
    "email",
    "social",
    "content",
    "paid_search",
    "paid_social",
    "referral",
    "partnership",
    "other",
  ]),
  status: z.enum(["draft", "active", "paused", "completed", "archived"]).default("draft"),
  startDate: optionalText,
  endDate: optionalText,
  budgetCents: z.coerce.number().int().min(0).default(0),
  utm: campaignUtmSchema.optional().nullable(),
  ownerUserId: uuid.optional().nullable(),
});

export const updateCampaignSchema = createCampaignSchema.partial();

// ── Newsletter subscribers (master doc §6.7) ─────────────────────────

export const subscribeNewsletterSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  source: optionalText,
});

export const updateNewsletterSubscriberSchema = z.object({
  status: z.enum(["subscribed", "unsubscribed"]),
});

// ── Campaign metrics (master doc §6.7 - ingestion target) ────────────

export const recordCampaignMetricSchema = z.object({
  date: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD"),
  impressions: z.coerce.number().int().min(0).default(0),
  clicks: z.coerce.number().int().min(0).default(0),
  conversions: z.coerce.number().int().min(0).default(0),
  spendCents: z.coerce.number().int().min(0).default(0),
});
