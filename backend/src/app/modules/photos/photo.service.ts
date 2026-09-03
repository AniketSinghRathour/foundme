import { randomUUID } from "node:crypto";
import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { DeleteFacesCommand } from "@aws-sdk/client-rekognition";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { rekognition } from "../../common/config/rekognition.js";
import { s3 } from "../../common/config/s3.js";
import { r2 } from "../../common/config/r2.js";
import { env } from "../../common/config/env.js";
import { prisma } from "../../common/config/prisma.js";
import { ApiError } from "../../common/utils/ApiError.js";
import jwt from "jsonwebtoken";

/** Presigned upload URL expiry — 15 minutes */
const UPLOAD_EXPIRES_IN = 15 * 60;

/** Presigned download/preview GET URL expiry — 1 hour */
const GET_EXPIRES_IN = 60 * 60;

interface FileRequest {
  fileName: string;
  contentType: string;
}

interface UploadUrlResult {
  fileName: string;
  s3KeyOriginal: string;
  uploadUrl: string;
  photoId: string;
}

/**
 * Helper to generate a presigned GET URL for an R2 preview image
 * (or fallback to S3 original if preview isn't ready yet).
 */
export async function getPresignedPreviewUrl(
  r2KeyPreview: string | null,
  s3KeyOriginal: string,
): Promise<string> {
  if (r2KeyPreview) {
    const command = new GetObjectCommand({
      Bucket: env.R2_BUCKET,
      Key: r2KeyPreview,
    });
    return getSignedUrl(r2, command, { expiresIn: GET_EXPIRES_IN });
  }

  const command = new GetObjectCommand({
    Bucket: env.S3_BUCKET_NAME,
    Key: s3KeyOriginal,
  });
  return getSignedUrl(s3, command, { expiresIn: GET_EXPIRES_IN });
}

/**
 * Generate a presigned GET URL for a single high-quality S3 original download (on-demand when clicked).
 */
export async function getPresignedDownloadUrl(
  photoId: string,
  userId?: string,
  token?: string,
): Promise<{ id: string; downloadUrl: string; fileName: string }> {
  const photo = await prisma.photo.findUnique({
    where: { id: photoId },
    include: { event: true },
  });

  if (!photo) {
    throw ApiError.notFound("Photo not found");
  }

  // Access control check (§12)
  let hasAccess = false;
  if (userId && photo.event.ownerId === userId) {
    hasAccess = true; // Photographer owns the event
  } else if (token) {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as { photoIds: string[] };
      if (decoded.photoIds && decoded.photoIds.includes(photoId)) {
        hasAccess = true; // Attendee has signed token containing this photo
      }
    } catch (err) {
      // Invalid token
    }
  }

  if (!hasAccess) {
    throw ApiError.forbidden("You do not have permission to download this photo");
  }

  const fileName = photo.s3KeyOriginal.split("/").pop() ?? `photo-${photo.id}.jpg`;

  const command = new GetObjectCommand({
    Bucket: env.S3_BUCKET_NAME,
    Key: photo.s3KeyOriginal,
    ResponseContentDisposition: `attachment; filename="${fileName}"`,
  });

  const downloadUrl = await getSignedUrl(s3, command, {
    expiresIn: GET_EXPIRES_IN,
  });

  return { id: photo.id, downloadUrl, fileName };
}

/**
 * Generate presigned GET URLs for a batch of high-quality S3 originals (e.g. "Download All My Photos").
 */
export async function getBatchPresignedDownloadUrls(
  photoIds: string[],
  userId?: string,
  token?: string,
): Promise<Array<{ id: string; downloadUrl: string; fileName: string }>> {
  const photos = await prisma.photo.findMany({
    where: { id: { in: photoIds } },
    include: { event: true },
  });

  if (photos.length !== photoIds.length) {
    throw ApiError.notFound("One or more photos not found");
  }

  // Access control check (§12)
  for (const photo of photos) {
    let hasAccess = false;
    if (userId && photo.event.ownerId === userId) {
      hasAccess = true; // Photographer owns the event
    } else if (token) {
      try {
        const decoded = jwt.verify(token, env.JWT_SECRET) as { photoIds: string[] };
        if (decoded.photoIds && decoded.photoIds.includes(photo.id)) {
          hasAccess = true; // Attendee has signed token containing this photo
        }
      } catch (err) {
        // Invalid token
      }
    }

    if (!hasAccess) {
      throw ApiError.forbidden("You do not have permission to download one or more photos");
    }
  }

  return Promise.all(
    photos.map(async (photo) => {
      const fileName =
        photo.s3KeyOriginal.split("/").pop() ?? `photo-${photo.id}.jpg`;

      const command = new GetObjectCommand({
        Bucket: env.S3_BUCKET_NAME,
        Key: photo.s3KeyOriginal,
        ResponseContentDisposition: `attachment; filename="${fileName}"`,
      });

      const downloadUrl = await getSignedUrl(s3, command, {
        expiresIn: GET_EXPIRES_IN,
      });

      return { id: photo.id, downloadUrl, fileName };
    }),
  );
}

/**
 * Generate presigned S3 upload URLs for a batch of files and
 * create corresponding `pending` Photo rows.
 *
 * Keys follow Lambda pattern: `originals/${eventId}/${photoId}.${ext}`
 */
export async function generateUploadUrls(
  eventId: string,
  ownerId: string,
  files: FileRequest[],
): Promise<UploadUrlResult[]> {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    throw ApiError.notFound("Event not found");
  }

  if (event.ownerId !== ownerId) {
    throw ApiError.forbidden("You do not own this event");
  }

  const results = await Promise.all(
    files.map(async (file) => {
      const photoId = randomUUID();
      const ext = file.fileName.split(".").pop() ?? "jpg";
      const s3KeyOriginal = `originals/${eventId}/${photoId}.${ext}`;

      const command = new PutObjectCommand({
        Bucket: env.S3_BUCKET_NAME,
        Key: s3KeyOriginal,
        ContentType: file.contentType,
      });

      const uploadUrl = await getSignedUrl(s3, command, {
        expiresIn: UPLOAD_EXPIRES_IN,
      });

      await prisma.photo.create({
        data: {
          id: photoId,
          s3KeyOriginal,
          status: "PENDING",
          eventId,
        },
      });

      return {
        fileName: file.fileName,
        s3KeyOriginal,
        uploadUrl,
        photoId,
      };
    }),
  );

  return results;
}

/** List all photos in an event with presigned R2 preview URLs */
export async function listPhotosByEvent(eventId: string, ownerId: string) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    throw ApiError.notFound("Event not found");
  }

  if (event.ownerId !== ownerId) {
    throw ApiError.forbidden("You do not own this event");
  }

  const photos = await prisma.photo.findMany({
    where: { eventId },
    orderBy: { createdAt: "desc" },
  });

  return Promise.all(
    photos.map(async (p) => ({
      id: p.id,
      s3KeyOriginal: p.s3KeyOriginal,
      r2KeyPreview: p.r2KeyPreview,
      previewUrl: await getPresignedPreviewUrl(p.r2KeyPreview, p.s3KeyOriginal),
      status: p.status,
      createdAt: p.createdAt,
    })),
  );
}

/**
 * Deletes a list of photos from S3, R2, Rekognition, and the DB.
 */
export async function deletePhotos(photoIds: string[], ownerId: string) {
  const photos = await prisma.photo.findMany({
    where: { id: { in: photoIds } },
    include: { event: true, faces: true },
  });

  if (photos.length === 0) return;

  // Verify ownership
  for (const photo of photos) {
    if (photo.event.ownerId !== ownerId) {
      throw ApiError.forbidden("You do not own one or more of these photos");
    }
  }

  // Delete faces from Rekognition for each event
  const photosByEvent = photos.reduce((acc, photo) => {
    if (!acc[photo.eventId]) {
      acc[photo.eventId] = { collectionId: photo.event.rekognitionCollectionId, faceIds: [] };
    }
    acc[photo.eventId].faceIds.push(...photo.faces.map(f => f.rekognitionFaceId));
    return acc;
  }, {} as Record<string, { collectionId: string, faceIds: string[] }>);

  for (const { collectionId, faceIds } of Object.values(photosByEvent)) {
    if (faceIds.length > 0) {
      // Rekognition DeleteFaces supports max 4000 per request, we should be fine
      await rekognition.send(
        new DeleteFacesCommand({
          CollectionId: collectionId,
          FaceIds: faceIds,
        })
      ).catch(err => {
        if (err.name === "ResourceNotFoundException") {
          console.log(`[Info] Rekognition collection ${collectionId} already deleted or not found during face deletion.`);
        } else {
          console.error("Rekognition delete error", err);
        }
      });
    }
  }

  // Delete from S3 and R2
  const s3Keys = photos.map(p => ({ Key: p.s3KeyOriginal }));
  const r2Keys = photos.filter(p => p.r2KeyPreview).map(p => ({ Key: p.r2KeyPreview as string }));

  if (s3Keys.length > 0) {
    // S3/R2 delete objects takes max 1000 per request, assuming < 1000 for now
    await s3.send(
      new DeleteObjectsCommand({
        Bucket: env.S3_BUCKET_NAME,
        Delete: { Objects: s3Keys },
      })
    ).catch(err => console.error("S3 delete error", err));
  }

  if (r2Keys.length > 0) {
    await r2.send(
      new DeleteObjectsCommand({
        Bucket: env.R2_BUCKET,
        Delete: { Objects: r2Keys },
      })
    ).catch(err => console.error("R2 delete error", err));
  }

  // Delete from DB
  await prisma.photo.deleteMany({
    where: { id: { in: photoIds } },
  });
}

/** Page size for public photo listing — §14: 40, flat, named constant */
const PUBLIC_PHOTOS_PAGE_SIZE = 40;

/**
 * List INDEXED photos for an event — public, no auth or ownership check.
 * Used by the attendee gallery view. Returns only INDEXED photos with
 * cursor-based pagination (cursor = last photo's id, created_at desc).
 */
export async function listPublicEventPhotos(
  eventId: string,
  cursor?: string,
  limit: number = PUBLIC_PHOTOS_PAGE_SIZE,
): Promise<{ photos: Array<{ id: string; previewUrl: string; createdAt: Date }>; nextCursor: string | null }> {
  const event = await prisma.event.findUnique({ where: { id: eventId }, select: { id: true } });
  if (!event) throw ApiError.notFound("Event not found");

  const photos = await prisma.photo.findMany({
    where: {
      eventId,
      status: "INDEXED",
      ...(cursor
        ? {
            createdAt: {
              lt: (await prisma.photo.findUnique({ where: { id: cursor }, select: { createdAt: true } }))?.createdAt,
            },
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit + 1, // Fetch one extra to determine if there's a next page
    select: { id: true, r2KeyPreview: true, s3KeyOriginal: true, createdAt: true },
  });

  const hasMore = photos.length > limit;
  const page = hasMore ? photos.slice(0, limit) : photos;
  const nextCursor = hasMore ? page[page.length - 1].id : null;

  const photosWithUrls = await Promise.all(
    page.map(async (p) => ({
      id: p.id,
      previewUrl: await getPresignedPreviewUrl(p.r2KeyPreview, p.s3KeyOriginal),
      createdAt: p.createdAt,
    }))
  );

  return { photos: photosWithUrls, nextCursor };
}
