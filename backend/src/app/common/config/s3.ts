import { S3Client } from "@aws-sdk/client-s3";
import { env } from "./env.js";

/**
 * S3 client singleton — configured from validated env (§4).
 *
 * Used by the photos module for presigned upload URLs and
 * by any module that needs to interact with the S3 bucket.
 */
export const s3 = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});
