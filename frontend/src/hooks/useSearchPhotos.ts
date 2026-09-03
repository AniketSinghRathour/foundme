import { useMutation } from "@tanstack/react-query";
import { fetchApi } from "@/lib/apiClient";

/**
 * useSearchPhotos — React Query mutation hook per §7.
 *
 * Attendee selfie search (screen #7/#8). Calls the backend's
 * POST /api/search endpoint with base64-encoded selfie image.
 *
 * No caching of search results — calls Rekognition fresh every
 * time (BACKEND_PLAN §9). No auth required (BACKEND_PLAN §7).
 */

import { z } from "zod";

export const MatchedPhotoSchema = z.object({
  id: z.string(),
  previewUrl: z.string(),
});
export type MatchedPhoto = z.infer<typeof MatchedPhotoSchema>;

export const SearchResultSchema = z.object({
  matchCount: z.number(),
  photos: z.array(MatchedPhotoSchema),
  downloadToken: z.string().optional().nullable(),
});
export type SearchResult = z.infer<typeof SearchResultSchema>;

interface SearchInput {
  eventId: string;
  /** Base64-encoded selfie image (with or without data URI prefix) */
  image: string;
}

export function useSearchPhotos() {
  return useMutation({
    mutationFn: async ({ eventId, image }: SearchInput) => {
      // Strip data URI prefix if present
      const base64 = image.includes(",") ? image.split(",")[1] : image;

      const result = await fetchApi<SearchResult>("/search", {
        method: "POST",
        body: JSON.stringify({ eventId, image: base64 }),
        schema: SearchResultSchema,
      });

      return {
        photos: result.photos ?? [],
        downloadToken: result.downloadToken,
      };
    },
  });
}
