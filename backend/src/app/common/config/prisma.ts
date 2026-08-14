import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { env } from "./env.js";

/**
 * Prisma client singleton — uses Prisma 7's driver adapter pattern.
 *
 * Prisma 7 removed the built-in Rust query engine. All database
 * connections now go through a JavaScript driver adapter
 * (@prisma/adapter-pg wrapping the `pg` driver).
 *
 * The connection URL comes from env.ts (never process.env directly).
 */
const pool = new pg.Pool({ connectionString: env.DATABASE_URL });
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });
