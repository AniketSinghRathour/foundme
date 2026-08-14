import type { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "./auth.config.js";

/**
 * Session verification middleware — imported by OTHER modules' routes
 * that need a logged-in user (e.g. event.routes.ts, photo.routes.ts).
 *
 * This is an intentional cross-module import (§6): auth is the one
 * module nearly everything else legitimately depends on.
 *
 * Uses Better-Auth's server-side getSession API with fromNodeHeaders
 * to convert Express's Node-style headers into the Web API Headers
 * format that Better-Auth expects.
 *
 * On success, attaches `req.user` and `req.session` for downstream
 * handlers to use.
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session || !session.user) {
    res.status(401).json({
      success: false,
      message: "Unauthorized — valid session required",
    });
    return;
  }

  // Attach to request for downstream handlers
  req.user = session.user;
  req.session = session.session;

  next();
}

/**
 * Optional session verification middleware.
 * 
 * Sets req.user if a valid session exists, otherwise leaves it undefined.
 * Does not block the request if unauthorized.
 */
export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (session && session.user) {
    req.user = session.user;
    req.session = session.session;
  }

  next();
}
