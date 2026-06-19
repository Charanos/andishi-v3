import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/db/schema";

type DrizzleClient = ReturnType<typeof drizzle<typeof schema>>;

let client: DrizzleClient | null = null;

export function getDb() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for database access.");
  }

  if (!client) {
    client = drizzle(neon(databaseUrl), { schema });
  }

  return client;
}

export type DB = ReturnType<typeof getDb>;

