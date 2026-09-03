import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/apiClient";

/**
 * useEventPhotos — React Query infinite-query hook per §7.
 *
 * Powers the cursor-paginated photo gallery for both:
 * - Screen #4: Attendee default gallery (public, no auth)
 * - Screen #14: Photographer's event gallery (authenticated)
 *
 * Pagination contract (matches BACKEND_PLAN §14):
 * - 40 photos per page, cursor-based
 * - Cursor = last photo's ID from previous page
 * - useInfiniteQuery threads the cursor automatically
 *
 * Uses the public endpoint GET /api/events/:eventId/photos/public
 * for attendee gallery. The photographer's view uses
 * GET /api/photos?eventId=... (authenticated).
 */

import { z } from "zod";

export const PublicPhotoSchema = z.object({
  id: z.string(),
  previewUrl: z.string(),
  createdAt: z.coerce.date(),
});
export type PublicPhoto = z.infer<typeof PublicPhotoSchema>;

export const PublicPhotosPageSchema = z.object({
  photos: z.array(PublicPhotoSchema),
  nextCursor: z.string().nullable(),
});
export type PublicPhotosPage = z.infer<typeof PublicPhotosPageSchema>;

export function useEventPhotos(eventId: string) {
  const query = useInfiniteQuery({
    queryKey: ["event-gallery-public", eventId],
    queryFn: ({ pageParam }) =>
      fetchApi<PublicPhotosPage>(
        `/events/${eventId}/photos/public${pageParam ? `?cursor=${pageParam}` : ""}`,
        { schema: PublicPhotosPageSchema }
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: !!eventId,
  });

  // Flatten all pages into a single photo array
  const photos = query.data?.pages.flatMap((p) => p.photos) ?? [];

  return {
    photos,
    isLoading: query.isLoading,
    hasNextPage: !!query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage: query.fetchNextPage,
    error: query.error,
  };
}
