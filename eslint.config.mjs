import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import drizzle from "eslint-plugin-drizzle";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Guards against a real footgun in the growing service layer: calling
    // db.delete(table) or db.update(table).set(...) without .where() wipes
    // or overwrites the whole table.
    files: ["src/**/*.ts"],
    plugins: { drizzle },
    rules: {
      "drizzle/enforce-delete-with-where": "error",
      "drizzle/enforce-update-with-where": "error",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
