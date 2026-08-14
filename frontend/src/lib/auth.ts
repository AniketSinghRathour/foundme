import { createAuthClient } from "better-auth/react";
import { env } from "./env";

/**
 * Better-Auth client — must point to the backend's auth base path (§6).
 *
 * NEXT_PUBLIC_BETTER_AUTH_URL = http://localhost:8080 (the backend root).
 * The backend mounts Better-Auth at /api/auth, so we append that path here.
 */
export const authClient = createAuthClient({
  baseURL: `${env.NEXT_PUBLIC_BETTER_AUTH_URL}/api/auth`,
});

export const { signIn, signUp, signOut, useSession } = authClient;
