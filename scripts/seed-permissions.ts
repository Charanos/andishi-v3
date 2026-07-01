import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { getDb } from "../src/db";
import { PERMISSION_CATALOG, SYSTEM_ROLES } from "../src/lib/authz/catalog";
import { seedPermissionCatalog } from "../src/lib/authz/seed";

async function main() {
  console.log(
    `Seeding ${PERMISSION_CATALOG.length} permissions and ${SYSTEM_ROLES.length} system roles...`,
  );

  const db = getDb();
  const { roleIdBySlug } = await seedPermissionCatalog(db);

  for (const roleDef of SYSTEM_ROLES) {
    console.log(
      `  - ${roleDef.slug} (${roleIdBySlug.get(roleDef.slug)}): ${roleDef.permissions.length} permissions`,
    );
  }

  console.log("Done.");
  process.exit(0);
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
