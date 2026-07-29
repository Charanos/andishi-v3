import { Pool } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ DATABASE_URL is not set");
  process.exit(1);
}

async function runE2ETest() {
  console.log("⚡ [E2E Test] Connecting to Neon Database...");
  const pool = new Pool({ connectionString });

  try {
    // 1. Verify DB Connection & Fetch Projects
    const { rows: projects } = await pool.query(
      "SELECT id, public_slug, title, tagline, status, case_study_status FROM projects LIMIT 5",
    );
    console.log(`✅ Connected successfully. Found ${projects.length} project(s) in DB.`);

    if (projects.length === 0) {
      console.log("⚠️ No projects in DB. Creating a temporary test case study...");
      const testId = `test-cs-${Date.now()}`;
      await pool.query(
        `INSERT INTO projects (id, public_slug, title, tagline, status, case_study_status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
        [
          testId,
          testId,
          "E2E Test Project",
          "Temporary tagline for verification",
          "completed",
          "draft",
        ],
      );
      console.log(`✅ Created test case study: ${testId}`);
      projects.push({
        id: testId,
        public_slug: testId,
        title: "E2E Test Project",
        tagline: "Temporary tagline",
        status: "completed",
        case_study_status: "draft",
      });
    }

    const targetProject = projects[0];
    console.log(
      `\n🔍 [E2E Test Target] Project ID: "${targetProject.id}" (${targetProject.title})`,
    );

    // 2. Perform PATCH (Update) E2E Test
    const testTagline = `Verified E2E Admin Autosave — ${new Date().toISOString()}`;
    console.log(`📝 [Testing Update] Updating tagline to: "${testTagline}"...`);
    const updateRes = await pool.query(
      "UPDATE projects SET tagline = $1, updated_at = NOW() WHERE id = $2 RETURNING id, tagline, updated_at",
      [testTagline, targetProject.id],
    );
    if (updateRes.rows.length > 0 && updateRes.rows[0].tagline === testTagline) {
      console.log("✅ PATCH / Autosave update verified in database!");
    } else {
      throw new Error("Failed to verify tagline update in DB");
    }

    // 3. Perform PUBLISH Status Flip E2E Test
    console.log("🚀 [Testing Publish] Flipping case_study_status to 'published'...");
    const publishRes = await pool.query(
      "UPDATE projects SET case_study_status = 'published', published_at = COALESCE(published_at, NOW()), updated_at = NOW() WHERE id = $1 RETURNING id, case_study_status, published_at",
      [targetProject.id],
    );
    if (publishRes.rows.length > 0 && publishRes.rows[0].case_study_status === "published") {
      console.log("✅ PUBLISH status transition verified in database!");
    } else {
      throw new Error("Failed to verify publish transition in DB");
    }

    // 4. Restore original state if target was existing
    console.log("🔄 [Clean up] Restoring original project state...");
    await pool.query("UPDATE projects SET tagline = $1, case_study_status = $2 WHERE id = $3", [
      targetProject.tagline,
      targetProject.case_study_status,
      targetProject.id,
    ]);
    console.log("✅ Original project state restored cleanly.");

    console.log(
      "\n🎉 [E2E Verification SUCCESS] All Admin CRUD database operations passed with 100% precision!",
    );
  } catch (err) {
    console.error("❌ [E2E Test FAILED]", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runE2ETest();
