import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { getClientIp } from "@/lib/api/request";
import { rateLimit } from "@/lib/rate-limit";
import { emitActivityEvent } from "@/lib/services/activity";

const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL ?? "dennis@andishi.dev";
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "noreply@andishi.dev";

const generalInquirySchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Please enter a valid email address"),
  subject: z.string().trim().min(2, "Subject must be at least 2 characters"),
  message: z.string().trim().min(10, "Message must be at least 10 characters"),
});

export async function POST(req: NextRequest) {
  try {
    const { allowed } = await rateLimit("general-inquiry", getClientIp(req) ?? "unknown", {
      limit: 5,
      windowSeconds: 3600,
    });
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many submissions. Please try again later." },
        { status: 429 },
      );
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = generalInquirySchema.safeParse(body);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return NextResponse.json(
        { error: issue?.message ?? "Validation failed", field: issue?.path.join(".") },
        { status: 400 },
      );
    }

    const { name, email, subject, message } = parsed.data;

    console.log(
      `[General Inquiry] Received from ${name} (${email}): Subject: "${subject}" - Message: "${message}"`,
    );

    // Persist to the activity feed so admins can track/action it in the
    // dashboard even if Resend isn't configured or the notification email
    // fails to send - the DB row is the durable record, the email is a
    // best-effort nudge.
    await emitActivityEvent({
      type: "general_inquiry_submitted",
      actorRole: "guest",
      entityType: "general_inquiry",
      description: `General inquiry from ${name} (${email}): ${subject}`,
      metadata: { name, email, subject, message },
      visibleTo: ["admin"],
    }).catch((err) => {
      console.error("[General Inquiry] Failed to log activity event:", err);
    });

    // Attempt to send email via Resend if API key is configured
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);

      const cleanHtml = (text: string) => {
        return text
          .replaceAll("&", "&amp;")
          .replaceAll("<", "&lt;")
          .replaceAll(">", "&gt;")
          .replaceAll('"', "&quot;")
          .replaceAll("'", "&#039;");
      };

      await resend.emails
        .send({
          from: FROM_EMAIL,
          to: ADMIN_EMAIL,
          subject: `[Andishi] General Inquiry: ${subject}`,
          html: `
          <p><strong>New General Inquiry Received</strong></p>
          <p><strong>Name:</strong> ${cleanHtml(name)}</p>
          <p><strong>Email:</strong> ${cleanHtml(email)}</p>
          <p><strong>Subject:</strong> ${cleanHtml(subject)}</p>
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap; padding: 12px; background-color: #f6f6f6; border-radius: 6px;">${cleanHtml(message)}</p>
        `,
        })
        .catch((err) => {
          console.error("[General Inquiry Email Error]:", err);
        });
    } else {
      console.log("[General Inquiry] Resend not configured, skipping email dispatch.");
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("[General Inquiry Server Error]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
