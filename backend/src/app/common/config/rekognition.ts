import { RekognitionClient } from "@aws-sdk/client-rekognition";
import { env } from "./env.js";

/**
 * Rekognition client singleton — configured from validated env (§4).
 *
 * Used by:
 * - events module: CreateCollection when a new event is created
 * - search module: SearchFacesByImage for attendee selfie search
 */
export const rekognition = new RekognitionClient({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});
