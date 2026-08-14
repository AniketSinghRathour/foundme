import { S3Client } from "@aws-sdk/client-s3";
import { env } from "./env.js";

/**
 * Cloudflare R2 client singleton — S3-compatible object storage.
 *
 * Configured from validated env (§4). Used by:
 * - search module: generating presigned GET URLs for private R2 preview images
 * - photos module: preview image delivery
 */
export const r2 = new S3Client({
  region: "auto",
  endpoint: env.R2_ENDPOINT,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});
