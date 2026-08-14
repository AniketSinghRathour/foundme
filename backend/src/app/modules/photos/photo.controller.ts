import type { Request, Response } from "express";
import { ApiResponse } from "../../common/utils/ApiResponse.js";
import { ApiError } from "../../common/utils/ApiError.js";
import * as photoService from "./photo.service.js";
import type {
  BatchUploadInput,
  ListPhotosQuery,
  PhotoIdParam,
  BatchDownloadInput,
} from "./photo.schema.js";
/**
 * Photos controller — shapes responses inline (no DTO file, §7).
 */

/** POST /api/photos/upload-urls — batch presigned upload URL generation */
export async function generateUploadUrls(
  req: Request<{}, {}, BatchUploadInput>,
  res: Response,
): Promise<void> {
  const { eventId, files } = req.body;
  const ownerId = req.user!.id;

  const urls = await photoService.generateUploadUrls(eventId, ownerId, files);

  ApiResponse.created(res, "Upload URLs generated", urls);
}

/** GET /api/photos?eventId=... — list photos in an event with R2 previews */
export async function list(
  req: Request<{}, {}, {}, ListPhotosQuery>,
  res: Response,
): Promise<void> {
  const ownerId = req.user!.id;
  const { eventId } = req.query;

  const photos = await photoService.listPhotosByEvent(eventId as string, ownerId);

  ApiResponse.ok(res, "Photos retrieved", photos);
}

/** DELETE /api/photos/batch */
export async function deleteBatch(
  req: Request<{}, {}, { photoIds: string[] }>,
  res: Response,
): Promise<void> {
  const ownerId = req.user!.id;
  const { photoIds } = req.body;

  if (!photoIds || !Array.isArray(photoIds) || photoIds.length === 0) {
    throw ApiError.badRequest("photoIds must be a non-empty array of photo IDs");
  }

  await photoService.deletePhotos(photoIds, ownerId);

  ApiResponse.ok(res, "Photos deleted successfully");
}

/** GET /api/photos/:photoId/download — presigned high-res S3 download URL for a single photo */
export async function getDownloadUrl(
  req: Request<PhotoIdParam>,
  res: Response,
): Promise<void> {
  const { photoId } = req.params;

  const result = await photoService.getPresignedDownloadUrl(photoId);

  ApiResponse.ok(res, "Download URL generated", result);
}

/** POST /api/photos/batch-download — presigned high-res S3 download URLs for multiple photos */
export async function getBatchDownloadUrls(
  req: Request<{}, {}, BatchDownloadInput>,
  res: Response,
): Promise<void> {
  const { photoIds } = req.body;

  const results = await photoService.getBatchPresignedDownloadUrls(photoIds);

  ApiResponse.ok(res, "Batch download URLs generated", results);
}

/** GET /api/events/:eventId/photos/public — public paginated INDEXED photos for attendee gallery */
export async function listPublic(
  req: Request<{ eventId: string }, {}, {}, { cursor?: string; limit?: string }>,
  res: Response,
): Promise<void> {
  const { eventId } = req.params;
  const cursor = req.query.cursor as string | undefined;
  const limit = req.query.limit ? Math.min(parseInt(req.query.limit as string, 10), 50) : 24;

  const result = await photoService.listPublicEventPhotos(eventId, cursor, limit);

  ApiResponse.ok(res, "Photos retrieved", result);
}
