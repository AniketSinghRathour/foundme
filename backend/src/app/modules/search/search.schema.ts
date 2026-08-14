import { z } from "zod";

/**
 * Zod schemas for the search module (§7 — per-module, self-contained).
 */

/** POST /api/search — selfie search against an event's face collection */
export const searchSchema = z.object({
  eventId: z.string().min(1, "Event ID is required"),
  /** Base64-encoded selfie image bytes */
  image: z.string().min(1, "Image data is required"),
});

export type SearchInput = z.infer<typeof searchSchema>;
