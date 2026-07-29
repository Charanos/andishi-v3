import "dotenv/config";
import { Pool } from "@neondatabase/serverless";

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

async function check() {
  const { rows } = await pool.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'projects';
  `);
  console.log("Columns in projects:", rows.map((r) => r.column_name).join(", "));
  await pool.end();
}

check().catch(console.error);
