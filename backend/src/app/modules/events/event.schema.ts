import { z } from "zod";

/**
 * Zod schemas for the events module (§7 — per-module, self-contained).
 */

/** POST /api/events — create a new event */
export const createEventSchema = z.object({
  name: z.string().min(1, "Event name is required").max(200),
  description: z.string().max(2000).optional(),
  coverImage: z.string().url("Cover image must be a valid URL").optional(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;

/** PATCH /api/events/:eventId — update an event */
export const updateEventSchema = z.object({
  name: z.string().min(1, "Event name is required").max(200).optional(),
  description: z.string().max(2000).optional(),
  coverImage: z.string().url("Cover image must be a valid URL").optional(),
});

export type UpdateEventInput = z.infer<typeof updateEventSchema>;

/** GET /api/events/:eventId — path param */
export const eventIdParamSchema = z.object({
  eventId: z.string().min(1, "Event ID is required"),
});

export type EventIdParam = z.infer<typeof eventIdParamSchema>;
