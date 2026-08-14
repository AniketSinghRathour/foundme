import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError.js";

/**
 * Global error-formatting middleware — registered LAST in app.ts (§5, §8).
 *
 * This does NOT catch errors (Express 5 does that automatically for
 * async route handlers). It only FORMATS whatever error arrives:
 *
 * - If it's an ApiError → use its statusCode, message, and errors[].
 * - Otherwise → treat as unexpected: log it, return a generic 500,
 *   never leak internal details to the client.
 *
 * The 4-argument signature (err, req, res, next) is how Express
 * identifies this as an error-handling middleware.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors.length > 0 ? err.errors : undefined,
    });
    return;
  }

  // Unexpected error — log for debugging, never expose internals
  console.error("[errorHandler] Unhandled error:", err);

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
}
