/**
 * Custom error class for API errors — extends Error with an HTTP
 * status code and optional structured errors array.
 *
 * Controllers throw these directly (e.g. `throw ApiError.notFound(...)`)
 * — Express 5 forwards them to errorHandler automatically, no
 * asyncHandler wrapper needed (§5).
 *
 * Shape: statusCode, message, optional errors[].
 * Static factory methods for common HTTP error statuses.
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly errors: string[];

  constructor(statusCode: number, message: string, errors: string[] = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;

    // Ensure instanceof checks work correctly with extended built-ins
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  static badRequest(message = "Bad request", errors: string[] = []): ApiError {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message = "Unauthorized"): ApiError {
    return new ApiError(401, message);
  }

  static forbidden(message = "Forbidden"): ApiError {
    return new ApiError(403, message);
  }

  static notFound(message = "Not found"): ApiError {
    return new ApiError(404, message);
  }

  static conflict(message = "Conflict"): ApiError {
    return new ApiError(409, message);
  }

  static internal(message = "Internal server error"): ApiError {
    return new ApiError(500, message);
  }
}
