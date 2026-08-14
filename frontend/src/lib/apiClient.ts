import { env } from "./env";

/**
 * A wrapper around native fetch that sets the base URL,
 * ensures credentials are included, and handles common errors.
 */
export async function fetchApi<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${env.NEXT_PUBLIC_API_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      "Content-Type": "application/json",
    },
    // Required to send Better-Auth cookies to the Express backend across origins
    credentials: "include",
  };

  const response = await fetch(url, {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API error: ${response.status}`);
  }

  // Expecting the backend's ApiResponse format { success: boolean, message?: string, data: T }
  const json = await response.json();
  if (json.success === false) {
    throw new Error(json.message || "Unknown API error");
  }

  return json.data as T;
}
