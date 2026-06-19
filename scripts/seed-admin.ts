import { config } from "dotenv";
import { eq } from "drizzle-orm";
import { getDb } from "../src/db";
import { users } from "../src/db/schema";
import { hashPassword } from "../src/lib/auth/password";

config({ path: ".env.local" });
config({ path: ".env" });

const email = (process.env.ADMIN_SEED_EMAIL ?? "dennis@andishi.dev").toLowerCase();
const password = process.env.ADMIN_SEED_PASSWORD ?? "dennis-andishi@123";
const name = process.env.ADMIN_SEED_NAME ?? "Dennis Munge";

async function main() {
  console.log(`Seeding admin: ${email}`);

  const db = getDb();
  const passwordHash = await hashPassword(password);
  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (existing) {
    await db
      .update(users)
      .set({
        name: existing.name ?? name,
        role: "admin",
        status: "active",
        passwordHash,
        emailVerified: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, existing.id));

    console.log("Updated existing user -> admin");
    return;
  }

  await db.insert(users).values({
    email,
    name,
    role: "admin",
    status: "active",
    passwordHash,
    emailVerified: true,
  });

  console.log("Created admin user");
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
