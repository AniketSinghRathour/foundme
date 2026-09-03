import { NextRequest, NextResponse } from "next/server";

/**
 * Next.js middleware — Better-Auth redirect logic per §5.
 *
 * Protects photographer routes (/dashboard/*) by checking for
 * the Better-Auth session cookie. If no session cookie exists,
 * redirect to /sign-in.
 *
 * Public routes (/, /e/*, /sign-in, /sign-up, /account) are
 * accessible without authentication.
 *
 * Note: This is a lightweight cookie-presence check, NOT a full
 * session validation. The actual auth verification happens
 * server-side when the frontend calls the backend API.
 */

const PROTECTED_PATHS = ["/dashboard"];
const AUTH_PATHS = ["/sign-in", "/sign-up"];

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for Better-Auth session cookie
  const sessionCookie =
    request.cookies.get("better-auth.session_token") ??
    request.cookies.get("__Secure-better-auth.session_token");

  const isAuthenticated = !!sessionCookie;

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && AUTH_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirect unauthenticated users away from protected pages
  if (
    !isAuthenticated &&
    PROTECTED_PATHS.some((p) => pathname.startsWith(p))
  ) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Run middleware on these paths only (skip static files, API routes, etc.)
  matcher: ["/dashboard/:path*", "/sign-in", "/sign-up"],
};
