import type { Response } from "express";

/**
 * Standardised API response helper — static methods that call
 * res.status().json() with a consistent { success, message, data } shape.
 *
 * Express-style: `res` is passed in, not returned (§5).
 * Controllers call e.g. `ApiResponse.ok(res, "Event created", event)`.
 */
export class ApiResponse {
  static ok<T>(res: Response, message: string, data?: T): void {
    res.status(200).json({
      success: true,
      message,
      data: data ?? null,
    });
  }

  static created<T>(res: Response, message: string, data?: T): void {
    res.status(201).json({
      success: true,
      message,
      data: data ?? null,
    });
  }

  static noContent(res: Response): void {
    res.status(204).end();
  }
}
