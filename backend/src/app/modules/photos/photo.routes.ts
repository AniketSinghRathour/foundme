import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import { validate } from "../../common/middleware/validate.js";
import {
  batchUploadSchema,
  listPhotosQuerySchema,
  photoIdParamSchema,
  batchDownloadSchema,
} from "./photo.schema.js";
import * as photoController from "./photo.controller.js";

/**
 * Photo routes.
 *
 * Download endpoints are public (unauthenticated) so attendees can
 * request high-quality presigned S3 download URLs on-demand when clicking
 * download for a specific photo or all matched event photos.
 *
 * Upload and gallery listing routes require authentication (`requireAuth`).
 */
const router = Router();

// ── Public Routes (Attendees & Photographers) ──

/** GET /api/photos/:photoId/download — presigned high-res S3 download URL (on click) */
router.get(
  "/:photoId/download",
  validate(photoIdParamSchema, "params"),
  photoController.getDownloadUrl,
);

/** POST /api/photos/batch-download — presigned high-res S3 download URLs (on "Download All" click) */
router.post(
  "/batch-download",
  validate(batchDownloadSchema, "body"),
  photoController.getBatchDownloadUrls,
);

// ── Authenticated Routes (Photographers) ──

router.use(requireAuth);

/** POST /api/photos/upload-urls — batch presigned upload URL generation */
router.post(
  "/upload-urls",
  validate(batchUploadSchema, "body"),
  photoController.generateUploadUrls,
);

/** GET /api/photos?eventId=... — list photos in an event */
router.get(
  "/",
  validate(listPhotosQuerySchema, "query"),
  photoController.list,
);

/** DELETE /api/photos/batch — delete multiple photos */
router.delete(
  "/batch",
  photoController.deleteBatch,
);

export default router;
