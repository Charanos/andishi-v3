import { createHash, randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { emailVerificationTokens, engineers, organizations, users } from "@/db/schema";
import { hashPassword, validatePassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { sendVerificationEmail } from "@/lib/email";
import { registerSchema } from "@/lib/validation/auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 },
    );
  }

  const passwordError = validatePassword(parsed.data.password);
  if (passwordError) {
    return NextResponse.json({ error: passwordError }, { status: 400 });
  }

  const db = getDb();
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, parsed.data.email))
    .limit(1);

  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  const [user] = await db
    .insert(users)
    .values({
      email: parsed.data.email,
      name: parsed.data.name,
      passwordHash: await hashPassword(parsed.data.password),
      role: parsed.data.role,
      status: "active",
      emailVerified: false,
    })
    .returning();

  let linkedOrganizationId: string | null = null;
  let linkedEngineerId: string | null = null;

  if (user.role === "client") {
    const [organization] = await db
      .insert(organizations)
      .values({
        name: `${user.name}'s workspace`,
        billingEmail: user.email,
        industry: "Pending intake",
        stage: "new",
      })
      .returning({ id: organizations.id });
    linkedOrganizationId = organization.id;
    await db
      .update(users)
      .set({ organizationId: linkedOrganizationId, updatedAt: new Date() })
      .where(eq(users.id, user.id));
  }

  if (user.role === "developer") {
    const [engineer] = await db
      .insert(engineers)
      .values({
        userId: user.id,
        slug: createSlug(user.name, user.id),
        name: user.name,
        role: "Developer profile pending",
        domain: "fullstack",
        domainLabel: "Full-stack",
        avatar: getInitials(user.name),
        avatarColor: "#00B7E8",
        yearsExp: 0,
        location: "Pending",
        timezone: "Pending",
        availability: "soon",
        bio: "Profile created from developer registration. Awaiting onboarding details.",
        highlight: "New Andishi developer registration.",
        profileComplete: false,
        isPublic: false,
        verified: false,
      })
      .returning({ id: engineers.id });
    linkedEngineerId = engineer.id;
    await db
      .update(users)
      .set({ engineerId: linkedEngineerId, updatedAt: new Date() })
      .where(eq(users.id, user.id));
  }

  const token = randomBytes(32).toString("base64url");
  await db.insert(emailVerificationTokens).values({
    userId: user.id,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
  });

  sendVerificationEmail(user.email, user.name, token).catch((error) => {
    console.error("Verification email failed:", error);
  });

  await createSession(
    user.id,
    {
      userAgent: req.headers.get("user-agent") ?? undefined,
      ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
    },
    user.role,
  );

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      organizationId: linkedOrganizationId,
      engineerId: linkedEngineerId,
    },
    redirect: parsed.data.role === "client" ? "/dashboard" : "/dev",
  }, { status: 201 });
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function createSlug(name: string, id: string) {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 42);
  return `${base || "developer"}-${id.slice(0, 8)}`;
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "AD";
}
