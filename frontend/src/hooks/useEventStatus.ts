import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/apiClient";

/**
 * useEventStatus — React Query hook per §7.
 *
 * Polls event photo processing status for the photographer's
 * upload screen (screen #13). Shows indexed/pending/failed counts.
 *
 * Polls every 5 seconds while on the page.
 */

import { z } from "zod";

export const EventStatusSchema = z.object({
  eventId: z.string(),
  eventName: z.string(),
  total: z.number(),
  indexed: z.number(),
  pending: z.number(),
  failed: z.number(),
});
export type EventStatus = z.infer<typeof EventStatusSchema>;

export function useEventStatus(eventId: string, enabled = true) {
  return useQuery({
    queryKey: ["event-status", eventId],
    queryFn: () => fetchApi<EventStatus>(`/events/${eventId}/status`, { schema: EventStatusSchema }),
    enabled: !!eventId && enabled,
    refetchInterval: 5000,
  });
}
