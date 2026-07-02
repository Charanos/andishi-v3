import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { activityEvents, briefs, organizations, users } from "@/db/schema";
import { getClientIp } from "@/lib/api/request";
import { jsonError, parseJson, validationError } from "@/lib/api/responses";
import { contactSchema, type BuildContactInput } from "@/lib/validation/contact";
import {
  sendBuildBriefConfirmation,
  sendHireBriefConfirmation,
  sendProjectInquiryNotification,
} from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";

const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL ?? "dennis@andishi.dev";

/**
 * POST /api/contact
 *
 * Public endpoint - no authentication required.
 * Accepts both build and hire inquiries from unauthenticated visitors.
 *
 * Flow:
 * 1. Validate input via discriminated union (type: "build" | "hire")
 * 2. Find or create a guest organization (keyed by billing email)
 * 3. Find or create a guest user (status: "invited", not yet a full account)
 * 4. Create a brief record with the correct briefType
 * 5. Log an activity event
 * 6. Fire confirmation email to submitter (non-blocking)
 * 7. Fire admin notification email (non-blocking)
 *
 * Security: does NOT leak whether an email already exists (silent upsert).
 */
export async function POST(req: NextRequest) {
  const { allowed } = await rateLimit("contact", getClientIp(req) ?? "unknown", {
    limit: 5,
    windowSeconds: 3600,
  });
  if (!allowed) return jsonError("Too many submissions. Please try again later.", 429);

  const body = await parseJson(req);
  const parsed = contactSchema.safeParse(body);

  if (!parsed.success) {
    return validationError(parsed.error);
  }

  const data = parsed.data;
  const db = getDb();

  // ── 1. Find or create guest organization ─────────────────────

  let [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.billingEmail, data.email.toLowerCase()))
    .limit(1);

  if (!org) {
    [org] = await db
      .insert(organizations)
      .values({
        name: data.company ?? data.name,
        billingEmail: data.email.toLowerCase(),
      })
      .returning();
  }

  // ── 2. Find or create guest user ──────────────────────────────

  let [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, data.email.toLowerCase()))
    .limit(1);

  if (!user) {
    [user] = await db
      .insert(users)
      .values({
        email: data.email.toLowerCase(),
        name: data.name,
        role: "client",
        status: "invited", // guest - not yet a registered user
        emailVerified: false,
        organizationId: org.id,
      })
      .returning();
  }

  // ── 3. Create brief record (type-discriminated) ───────────────

  const briefValues =
    data.type === "build"
      ? {
          organizationId: org.id,
          submittedById: user.id,
          title: `Build: ${data.serviceType} - ${data.company ?? data.name}`,
          briefType: "build" as const,
          serviceType: data.serviceType,
          problemStatement: composeBuildProblemStatement(data),
          projectBudget: data.projectBudget,
          projectTimeline: data.projectTimeline,
          hasExistingProduct: data.hasExistingProduct ?? false,
          buildStackPreferences: data.stackPreferences ?? [],
          status: "submitted" as const,
        }
      : {
          organizationId: org.id,
          submittedById: user.id,
          title: `Hire: ${data.seniority} ${data.role} - ${data.company ?? data.name}`,
          briefType: "hire" as const,
          role: data.role,
          domain: data.domain,
          seniority: data.seniority,
          stackTags: data.stackTags,
          timeline: data.timeline,
          engagementModel: data.engagementModel,
          description: data.description,
          status: "submitted" as const,
        };

  const [brief] = await db.insert(briefs).values(briefValues).returning();

  // ── 4. Log activity event ─────────────────────────────────────

  await db.insert(activityEvents).values({
    type: data.type === "build" ? "brief_build_submitted" : "brief_hire_submitted",
    actorId: user.id,
    actorRole: "client",
    entityType: "brief",
    entityId: brief.id,
    description: `${data.type === "build" ? "Build" : "Hire"} inquiry from ${data.name} (${data.email})`,
    visibleTo: ["admin"],
    metadata: {
      company: data.company,
      serviceType: data.type === "build" ? data.serviceType : data.domain,
      source:
        data.type === "build" ? (data.source ?? "public_contact_form") : "public_contact_form",
    },
  });

  // ── 5. Send emails (non-blocking - failures are logged, not thrown) ──

  if (data.type === "build") {
    sendBuildBriefConfirmation(data.email, data.name, data.serviceType).catch((err) =>
      console.error("[email] Build confirmation failed:", err),
    );
  } else {
    sendHireBriefConfirmation(data.email, data.name, data.role).catch((err) =>
      console.error("[email] Hire confirmation failed:", err),
    );
  }

  sendProjectInquiryNotification(ADMIN_EMAIL, data as Record<string, unknown>).catch((err) =>
    console.error("[email] Admin notification failed:", err),
  );

  return NextResponse.json({ success: true, briefId: brief.id }, { status: 201 });
}

/**
 * Folds the /start-project wizard's extra fields (phone, role, additional
 * services beyond the primary one, and free-text context) into the single
 * problemStatement text, so nothing submitted is lost even though those
 * fields don't have dedicated brief columns yet.
 */
function composeBuildProblemStatement(data: BuildContactInput): string {
  const parts = [data.problemStatement];
  const extras: string[] = [];

  if (data.submitterRole) extras.push(`Submitter role: ${data.submitterRole}`);
  if (data.phone) extras.push(`Phone: ${data.phone}`);
  if (data.additionalServices?.length) {
    extras.push(`Also interested in: ${data.additionalServices.join(", ")}`);
  }
  if (data.additionalContext) extras.push(`Additional context: ${data.additionalContext}`);

  if (extras.length > 0) {
    parts.push("", "— Additional details —", ...extras);
  }

  return parts.join("\n");
}
