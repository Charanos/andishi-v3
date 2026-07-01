import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as relationsSchema from "@/db/relations";
import * as tablesSchema from "@/db/schema";

// neon-http (the previous driver here) cannot run interactive transactions -
// it throws "No transactions support in neon-http driver" at runtime. The
// service layer (ADR-0002) and the finance ledger's balanced-entry writes
// (ADR-0003) both require real BEGIN/COMMIT transactions, so this uses the
// WebSocket-based Pool driver instead. It still talks to the same pooled
// Neon connection string - no infra or connection-string change needed.
neonConfig.webSocketConstructor = ws;

// Tables + relations merged so db.query.<table>.findMany({ with: {...} })
// is available and typed - see src/db/relations.ts.
const schema = { ...tablesSchema, ...relationsSchema };

type DrizzleClient = ReturnType<typeof drizzle<typeof schema>>;

let client: DrizzleClient | null = null;

export function getDb() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for database access.");
  }

  if (!client) {
    client = drizzle(new Pool({ connectionString: databaseUrl }), { schema });
  }

  return client;
}

export type DB = ReturnType<typeof getDb>;
