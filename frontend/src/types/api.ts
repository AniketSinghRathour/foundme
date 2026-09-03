import { z } from "zod";

export const EventSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional().nullable(),
  coverImage: z.string().optional().nullable(),
  rekognitionCollectionId: z.string(),
  ownerId: z.string().optional().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type Event = z.infer<typeof EventSchema>;

export const PublicEventSchema = z.object({
  id: z.string(),
  name: z.string(),
  coverImage: z.string().nullable(),
});
export type PublicEvent = z.infer<typeof PublicEventSchema>;

export const CreatedEventSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional().nullable(),
  coverImage: z.string().optional().nullable(),
  createdAt: z.coerce.date(),
  photoCount: z.number().optional().default(0),
});
export type CreatedEvent = z.infer<typeof CreatedEventSchema>;

export const PhotoStatusSchema = z.enum(["PENDING", "INDEXED", "FAILED"]);
export type PhotoStatus = z.infer<typeof PhotoStatusSchema>;

export const PhotoSchema = z.object({
  id: z.string(),
  s3KeyOriginal: z.string(),
  r2KeyPreview: z.string().nullable(),
  previewUrl: z.string(),
  status: z.enum(["PENDING", "INDEXED", "FAILED"]),
  createdAt: z.coerce.date(),
});
export type Photo = z.infer<typeof PhotoSchema>;

export const FaceSchema = z.object({
  id: z.string(),
  photoId: z.string(),
  rekognitionFaceId: z.string(),
  boundingBox: z.unknown().optional().nullable(),
  confidence: z.number().optional().nullable(),
  createdAt: z.coerce.date(),
});
export type Face = z.infer<typeof FaceSchema>;

export const EventSearchSchema = z.object({
  id: z.string(),
  userId: z.string(),
  eventId: z.string(),
  searchedAt: z.coerce.date(),
  event: z.object({
    id: z.string(),
    name: z.string(),
    coverImage: z.string().nullable(),
  }).optional().nullable(),
});
export type EventSearch = z.infer<typeof EventSearchSchema>;

export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    message: z.string().optional().nullable(),
    data: dataSchema,
  });

export type ApiResponse<T> = {
  success: boolean;
  message?: string | null;
  data: T;
};
