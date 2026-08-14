import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";
import { ApiError } from "../utils/ApiError.js";

/**
 * Generic Zod validation middleware factory (§3).
 *
 * Returns Express middleware that validates a specific part of the
 * request (body, query, or params) against a Zod schema. On failure,
 * throws ApiError.badRequest with Zod's issue messages.
 *
 * Usage in routes:
 *   router.post("/", validate(createEventSchema, "body"), controller.create);
 */
export function validate(
  schema: ZodType,
  source: "body" | "query" | "params" = "body",
) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => issue.message);
      throw ApiError.badRequest("Validation failed", errors);
    }

    // Replace with parsed (and potentially transformed/defaulted) data
    // Use Object.defineProperty to bypass getter-only properties (like req.query in some Express setups)
    Object.defineProperty(req, source, {
      value: result.data,
      writable: true,
      enumerable: true,
      configurable: true,
    });
    next();
  };
}
