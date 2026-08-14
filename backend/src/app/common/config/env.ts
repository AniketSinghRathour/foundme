import { z } from "zod";

/**
 * Single flat Zod schema for all environment variables.
 * Parsed once at import time — every other config file imports
 * the validated `env` object from here, never reads process.env directly.
 *
 * Rule: this file has ZERO imports from sibling config files (prisma.ts,
 * s3.ts, rekognition.ts, auth.config.ts). Everything else imports FROM
 * this file. Never the reverse.
 */
const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  BETTER_AUTH_SECRET: z.string().min(1),
  BETTER_AUTH_URL: z.string().min(1),
  GMAIL_USER: z.string().min(1),
  GMAIL_APP_PASSWORD: z.string().min(1),
  AWS_REGION: z.string().min(1),
  AWS_ACCESS_KEY_ID: z.string().min(1),
  AWS_SECRET_ACCESS_KEY: z.string().min(1),
  S3_BUCKET_NAME: z.string().min(1),
  R2_ENDPOINT: z.string().min(1),
  R2_ACCESS_KEY_ID: z.string().min(1),
  R2_SECRET_ACCESS_KEY: z.string().min(1),
  R2_BUCKET: z.string().min(1),
  // Optional: if the R2 preview bucket is public (served via a custom domain),
  // set this to the base URL (e.g. "https://previews.yourdomain.com").
  // r2.ts uses this for URL construction; if absent, presigned GET URLs are generated instead.
  R2_PUBLIC_BASE_URL: z.string().url().optional(),
  PORT: z.string().optional().default("8080"),
});

/**
 * Validated environment — crashes the process at boot if any required
 * variable is missing, rather than silently proceeding.
 *
 * IMPORTANT: dotenv must be loaded in server.ts BEFORE this module is
 * ever imported, otherwise process.env will be empty when this runs.
 */
export const env = envSchema.parse(process.env);
