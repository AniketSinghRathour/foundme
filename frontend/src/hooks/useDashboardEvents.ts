import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/apiClient";
import { CreatedEventSchema, CreatedEvent } from "@/types/api";
import { z } from "zod";

/**
 * useDashboardEvents — React Query hook per §7.
 *
 * Fetches the logged-in photographer's event list for the
 * dashboard (screen #10). Uses GET /api/events which requires auth.
 */
export function useDashboardEvents() {
  return useQuery({
    queryKey: ["created-events"],
    queryFn: () => fetchApi<CreatedEvent[]>("/events", { schema: z.array(CreatedEventSchema) }),
  });
}
