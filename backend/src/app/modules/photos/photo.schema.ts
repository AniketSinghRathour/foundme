import { z } from "zod";

/**
 * Zod schemas for the photos module (§7 — per-module, self-contained).
 */

/** Single file entry in a batch upload request */
const uploadFileSchema = z.object({
  fileName: z.string().min(1, "File name is required"),
  contentType: z
    .string()
    .min(1)
    .refine((ct) => ct.startsWith("image/"), {
      message: "Content type must be an image MIME type",
    }),
});

/** POST /api/photos/upload-urls — batch presigned upload URL generation */
export const batchUploadSchema = z.object({
  eventId: z.string().min(1, "Event ID is required"),
  files: z
    .array(uploadFileSchema)
    .min(1, "At least one file is required")
    .max(100, "Maximum 100 files per batch"),
});

export type BatchUploadInput = z.infer<typeof batchUploadSchema>;

/** GET /api/photos?eventId=... — list photos in an event */
export const listPhotosQuerySchema = z.object({
  eventId: z.string().min(1, "Event ID is required"),
});

export type ListPhotosQuery = z.infer<typeof listPhotosQuerySchema>;

/** GET /api/photos/:photoId/download — presigned high-res download URL */
export const photoIdParamSchema = z.object({
  photoId: z.string().min(1, "Photo ID is required"),
});

export type PhotoIdParam = z.infer<typeof photoIdParamSchema>;

/** POST /api/photos/batch-download — presigned high-res download URLs for multiple photos */
export const batchDownloadSchema = z.object({
  photoIds: z
    .array(z.string().min(1))
    .min(1, "At least one photo ID is required")
    .max(100, "Maximum 100 photos per batch download"),
  token: z.string().optional(),
});

export type BatchDownloadInput = z.infer<typeof batchDownloadSchema>;
