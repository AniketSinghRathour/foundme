import prismaClientPkg from "@prisma/client";
const { PrismaClient } = prismaClientPkg;

import { PrismaNeon } from "@prisma/adapter-neon";
import { config } from "../config.js";

// Module-level, so warm invocations reuse this instead of reconnecting
// per message. The Neon adapter talks over HTTP rather than a long-lived
// TCP connection, which is a better fit for Lambda's short-lived,
// bursty invocation pattern than a traditional connection pool.
if (!config.database.connectionString) {
  throw new Error(
    `DATABASE_URL connection string is missing or undefined. Current process.env.DATABASE_URL: ${JSON.stringify(process.env.DATABASE_URL)}`
  );
}

// PrismaNeon expects a config object, not a Pool instance.
// It will create and manage the Pool internally.
const adapter = new PrismaNeon({ connectionString: config.database.connectionString });
const prisma = new PrismaClient({ adapter });

// Guards against double-processing if SQS ever delivers the same message
// twice (at-least-once delivery is the norm, not the exception).
export async function isAlreadyIndexed(photoId) {
  const photo = await prisma.photo.findUnique({
    where: { id: photoId },
    select: { status: true },
  });
  return photo?.status === "INDEXED" || photo?.status === "indexed";
}

export async function saveIndexingResult({ photoId, faceRecords, previewKey }) {
  await prisma.$transaction([
    prisma.face.deleteMany({ where: { photoId } }),
    ...faceRecords.map((face) =>
      prisma.face.create({
        data: {
          photoId,
          rekognitionFaceId: face.Face.FaceId,
          boundingBox: face.Face.BoundingBox,
          confidence: face.Face.Confidence,
        },
      })
    ),
    prisma.photo.update({
      where: { id: photoId },
      data: {
        status: "INDEXED",
        indexedAt: new Date(),
        r2KeyPreview: previewKey,
        errorMessage: null,
      },
    }),
  ]);
}

export async function markPhotoFailed(photoId, errorMessage) {
  // Best-effort - if this write itself fails, don't let it mask the
  // original error that caused us to be here.
  // Never overwrite a photo that has already been successfully indexed.
  try {
    await prisma.photo.updateMany({
      where: { id: photoId, status: { notIn: ["INDEXED", "indexed"] } },
      data: { status: "FAILED", errorMessage: errorMessage?.slice(0, 500) || null },
    });
  } catch (err) {
    console.error(
      JSON.stringify({
        level: "ERROR",
        message: "Failed to record photo failure state",
        photoId,
        error: err.message,
      })
    );
  }
}
