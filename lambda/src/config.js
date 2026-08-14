import "dotenv/config";

// Fails loudly at cold start if anything's missing, instead of a mysterious
// crash 200ms into processing a real photo.

const required = [
  "DATABASE_URL",
  "R2_ENDPOINT",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET",
];

function assertRequiredEnv() {
  const missing = required.filter((key) => !process.env[key] || !process.env[key].trim());
  if (missing.length > 0) {
    const presentKeys = Object.keys(process.env).filter(k => !k.startsWith("AWS_"));
    throw new Error(
      `Missing or empty required environment variable(s): ${missing.join(", ")}. Available non-AWS env vars in Lambda: [${presentKeys.join(", ")}]`
    );
  }
}

assertRequiredEnv();

export const config = {
  // AWS_REGION is a reserved env var Lambda sets automatically to wherever
  // the function itself is deployed (e.g. ap-south-1). Don't override it.
  awsRegion: process.env.AWS_REGION,

  // Deliberately separate from awsRegion. Rekognition's default TPS quota
  // varies by region - this lets you point Rekognition calls elsewhere
  // without moving the whole function, though the recommendation (see
  // INFRASTRUCTURE.md) is to request a quota increase in your home region
  // instead, mainly for biometric data residency reasons.
  rekognitionRegion: process.env.REKOGNITION_REGION || process.env.AWS_REGION,

  database: {
    connectionString: process.env.DATABASE_URL, // Neon pooled connection string
  },

  r2: {
    endpoint: process.env.R2_ENDPOINT,
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    bucket: process.env.R2_BUCKET,
  },

  image: {
    previewWidth: 800,
    previewQuality: 75,
    indexingCopyWidth: 1800,
    indexingCopyQuality: 85,
  },
};
