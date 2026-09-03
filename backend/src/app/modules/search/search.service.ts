import { SearchFacesByImageCommand } from "@aws-sdk/client-rekognition";
import { rekognition } from "../../common/config/rekognition.js";
import { prisma } from "../../common/config/prisma.js";
import { ApiError } from "../../common/utils/ApiError.js";
import jwt from "jsonwebtoken";
import { getPresignedPreviewUrl } from "../photos/photo.service.js";
import { env } from "../../common/config/env.js";
/** Minimum confidence threshold for face matches */
const FACE_MATCH_THRESHOLD = 80;

/**
 * Search for photos matching a selfie in an event's face collection.
 *
 * Returns light-weight presigned R2 GET URLs (`previewUrl`) for gallery display.
 * Returns light-weight presigned R2 GET URLs (`previewUrl`) for gallery display.
 * High-res S3 download URLs are fetched on-demand when the attendee clicks download.
 */
export async function searchByFace(eventId: string, imageBase64: string, userId?: string) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { rekognitionCollectionId: true },
  });

  if (!event) {
    throw ApiError.notFound("Event not found");
  }

  const imageBytes = Buffer.from(imageBase64, "base64");

  let result;
  try {
    result = await rekognition.send(
      new SearchFacesByImageCommand({
        CollectionId: event.rekognitionCollectionId,
        Image: { Bytes: imageBytes },
        FaceMatchThreshold: FACE_MATCH_THRESHOLD,
        MaxFaces: 50,
      }),
    );
  } catch (error: any) {
    // AWS throws InvalidParameterException if no faces are found in the uploaded image
    if (error.name === "InvalidParameterException") {
      throw ApiError.badRequest("No face detected in the image. Please upload a clear selfie.");
    }
    throw error; // Let other unexpected AWS errors bubble up as 500s
  }

  const faceMatches = result.FaceMatches ?? [];
  


  if (faceMatches.length === 0) {
    return { photos: [], downloadToken: null };
  }

  const matchedFaceIds = faceMatches
    .map((match) => match.Face?.FaceId)
    .filter((id): id is string => id !== undefined);

  if (matchedFaceIds.length === 0) {
    return { photos: [], downloadToken: null };
  }

  // Look up Face rows linked to Photos in this event
  const faces = await prisma.face.findMany({
    where: {
      rekognitionFaceId: { in: matchedFaceIds },
      photo: { eventId },
    },
    select: {
      photo: {
        select: {
          id: true,
          s3KeyOriginal: true,
          r2KeyPreview: true,
        },
      },
    },
  });

  // Deduplicate by photo ID
  const photoMap = new Map<
    string,
    { id: string; s3KeyOriginal: string; r2KeyPreview: string | null }
  >();
  for (const face of faces) {
    if (!photoMap.has(face.photo.id)) {
      photoMap.set(face.photo.id, face.photo);
    }
  }

  const matchedPhotos = Array.from(photoMap.values());

  // Log the search asynchronously for analytics
  prisma.eventSearch
    .create({
      data: {
        eventId,
        matchesFound: matchedPhotos.length,
      },
    })
    .catch((err) => {
      console.error("Failed to log event search analytics:", err);
    });

  // Generate presigned R2 preview URLs for display
  const photosWithUrls = await Promise.all(
    matchedPhotos.map(async (photo) => {
      const previewUrl = await getPresignedPreviewUrl(
        photo.r2KeyPreview,
        photo.s3KeyOriginal,
      );

      return {
        id: photo.id,
        previewUrl,
      };
    }),
  );

  // Generate a signed download token containing the matched photo IDs (§12)
  // Valid for 24 hours
  const photoIds = matchedPhotos.map(p => p.id);
  const downloadToken = jwt.sign(
    { eventId, photoIds },
    env.JWT_SECRET,
    { expiresIn: "24h" }
  );

  return {
    photos: photosWithUrls,
    downloadToken,
  };
}
