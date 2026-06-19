import { Resend } from "resend";

let resendClient: Resend | null = null;

function getResend() {
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

function getFromEmail() {
  return process.env.RESEND_FROM_EMAIL ?? "noreply@andishi.dev";
}

/** HTML-escape user-supplied strings to prevent XSS in email content */
function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// ── Email guard ───────────────────────────────────────────────────

function isEmailEnabled() {
  return Boolean(process.env.RESEND_API_KEY);
}

// ── Verification ──────────────────────────────────────────────────

/**
 * Sends an email verification link to a newly registered user.
 * Silently skips if RESEND_API_KEY is not configured.
 */
export async function sendVerificationEmail(
  to: string,
  name: string,
  token: string,
) {
  if (!isEmailEnabled()) return;

  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-email?token=${token}`;

  await getResend().emails.send({
    from: getFromEmail(),
    to,
    subject: "Verify your Andishi account",
    html: [
      `<p>Hi ${escapeHtml(name)},</p>`,
      "<p>Verify your email to activate your Andishi workspace.</p>",
      `<p><a href="${verifyUrl}">Verify email →</a></p>`,
      "<p>This link expires in 24 hours.</p>",
    ].join(""),
  });
}

// ── Invite ────────────────────────────────────────────────────────

/**
 * Sends an invitation email when a user is added to Andishi by an admin.
 */
export async function sendInviteEmail(
  to: string,
  inviterName: string,
  role: string,
  inviteUrl: string,
) {
  if (!isEmailEnabled()) return;

  await getResend().emails.send({
    from: getFromEmail(),
    to,
    subject: "You've been invited to Andishi",
    html: [
      `<p>${escapeHtml(inviterName)} has invited you to join Andishi as a <strong>${escapeHtml(role)}</strong>.</p>`,
      `<p><a href="${inviteUrl}">Accept invitation →</a></p>`,
      "<p>This link expires in 48 hours.</p>",
    ].join(""),
  });
}

// ── Match proposed (talent track) ─────────────────────────────────

/**
 * Notifies a client that a match has been proposed for their hire brief.
 */
export async function sendMatchProposedEmail(
  to: string,
  clientName: string,
  engineerName: string,
  dashboardUrl: string,
) {
  if (!isEmailEnabled()) return;

  await getResend().emails.send({
    from: getFromEmail(),
    to,
    subject: `Your Andishi match is ready: ${engineerName}`,
    html: [
      `<p>Hi ${escapeHtml(clientName)},</p>`,
      `<p>A senior engineer has been matched to your brief: <strong>${escapeHtml(engineerName)}</strong>.</p>`,
      `<p><a href="${dashboardUrl}">View profile and request an intro →</a></p>`,
    ].join(""),
  });
}

// ── Build brief confirmation (NEW - June 2026) ────────────────────

const serviceLabelMap: Record<string, string> = {
  "custom-software": "custom software development",
  "saas-development": "SaaS product development",
  "ai-systems": "AI and intelligent systems",
  "mobile-apps": "mobile application development",
  "enterprise-software": "enterprise software",
  "blockchain": "blockchain and Web3 development",
  "apis-integrations": "API and systems integration",
  "product-strategy": "product strategy and design",
};

/**
 * Confirms to the submitter that their build project brief was received.
 * Fires when POST /api/contact is called with type: "build".
 */
export async function sendBuildBriefConfirmation(
  to: string,
  name: string,
  serviceType: string,
) {
  if (!isEmailEnabled()) return;

  const serviceLabel = serviceLabelMap[serviceType] ?? serviceType;

  await getResend().emails.send({
    from: getFromEmail(),
    to,
    subject: "We received your project brief - Andishi",
    html: [
      `<p>Hi ${escapeHtml(name)},</p>`,
      `<p>We've received your build inquiry for <strong>${escapeHtml(serviceLabel)}</strong>.</p>`,
      "<p>Someone from the Andishi team will be in touch within one business day to schedule a scoping call.</p>",
      `<p>In the meantime, you can see examples of work we've shipped at <a href="${process.env.NEXT_PUBLIC_APP_URL}/work">andishi.dev/work</a>.</p>`,
      "<p>- The Andishi Team</p>",
    ].join(""),
  });
}

// ── Hire brief confirmation (NEW - June 2026) ─────────────────────

/**
 * Confirms to the submitter that their hire brief was received.
 * Fires when POST /api/contact is called with type: "hire".
 */
export async function sendHireBriefConfirmation(
  to: string,
  name: string,
  role: string,
) {
  if (!isEmailEnabled()) return;

  await getResend().emails.send({
    from: getFromEmail(),
    to,
    subject: "We received your hiring brief - Andishi",
    html: [
      `<p>Hi ${escapeHtml(name)},</p>`,
      `<p>We've received your request for a <strong>${escapeHtml(role)}</strong>.</p>`,
      "<p>We typically propose a match within 8 business days. We'll contact you as soon as a profile is ready for your review.</p>",
      "<p>- The Andishi Team</p>",
    ].join(""),
  });
}

// ── Admin inquiry notification (NEW - June 2026) ──────────────────

/**
 * Notifies the admin team of a new inbound inquiry (build or hire).
 * Fires on every POST /api/contact submission.
 */
export async function sendProjectInquiryNotification(
  to: string,
  data: Record<string, unknown>,
) {
  if (!isEmailEnabled()) return;

  const type = data.type === "build" ? "Build inquiry" : "Hire inquiry";
  const detail =
    data.type === "build"
      ? `Service: ${data.serviceType}<br>Budget: ${data.projectBudget ?? "Not specified"}<br>Timeline: ${data.projectTimeline ?? "Not specified"}`
      : `Role: ${data.role}<br>Domain: ${data.domain}<br>Seniority: ${data.seniority}`;

  const body =
    data.type === "build"
      ? `<strong>Problem:</strong><br>${escapeHtml(String(data.problemStatement ?? ""))}`
      : `<strong>Description:</strong><br>${escapeHtml(String(data.description ?? ""))}`;

  await getResend().emails.send({
    from: getFromEmail(),
    to,
    subject: `[Andishi] New ${type} from ${data.name}`,
    html: [
      `<p><strong>${type}</strong></p>`,
      `<p>Name: ${escapeHtml(String(data.name ?? ""))}<br>Email: ${escapeHtml(String(data.email ?? ""))}<br>Company: ${escapeHtml(String(data.company ?? "Not provided"))}</p>`,
      `<p>${detail}</p>`,
      `<p>${body}</p>`,
      `<p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/briefs">View in Admin →</a></p>`,
    ].join(""),
  });
}

// ── Password reset ────────────────────────────────────────────────

/**
 * Sends a password reset link. Token should be stored in the tokens table
 * with a 1-hour expiry before calling this function.
 */
export async function sendPasswordResetEmail(
  to: string,
  name: string,
  token: string,
) {
  if (!isEmailEnabled()) return;

  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

  await getResend().emails.send({
    from: getFromEmail(),
    to,
    subject: "Reset your Andishi password",
    html: [
      `<p>Hi ${escapeHtml(name)},</p>`,
      "<p>Reset your password using the link below. It expires in 1 hour.</p>",
      `<p><a href="${resetUrl}">Reset password →</a></p>`,
      "<p>If you didn't request this, you can safely ignore this email.</p>",
    ].join(""),
  });
}
