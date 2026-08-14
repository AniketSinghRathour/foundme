import "dotenv/config";
import path from "node:path";
import { defineConfig, env } from "prisma/config";

// This file is read by the Prisma CLI (`prisma generate`, `prisma db push`,
// etc.) only - it is NOT used by the running Lambda function at runtime.
// The actual app connects via the Neon adapter configured directly in
// src/services/dbService.js. Two separate things, both pointed at the
// same database, for two separate purposes (CLI tooling vs. app runtime).
export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    url: env("DATABASE_URL"),
  },
});
