import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/apiClient";
import { useSession } from "@/lib/auth";

/**
 * Derives account capabilities from the current session and API state.
 *
 * Capability model (§7):
 * - Any signed-in account can search photos as an attendee.
 * - Creating an event unlocks photographer-facing features for that account.
 * - "isPhotographer" is derived at runtime, not stored as a fixed role.
 */
export function useAccountCapabilities() {
  const { data: session, isPending: sessionLoading } = useSession();

  const { data: createdEvents, isLoading: eventsLoading } = useQuery({
    queryKey: ["created-events"],
    queryFn: () => fetchApi<any[]>("/events"),
    enabled: !!session,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const isAuthenticated = !!session;
  // User is a photographer if they have created at least one event (§7)
  const isPhotographer =
    isAuthenticated && Array.isArray(createdEvents) && createdEvents.length > 0;
  // Only wait for eventsLoading if we're actually authenticated —
  // prevents spinner flash for unauthenticated users whose events query is disabled.
  const isLoading = sessionLoading || (isAuthenticated && eventsLoading);

  return {
    isAuthenticated,
    isPhotographer,
    isLoading,
    session,
    createdEvents,
  };
}
