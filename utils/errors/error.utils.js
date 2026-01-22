import { settings } from "../../config/config.js";

/**
 * Custom application error class for standardized error handling.
 * Extends the native Error object and adds HTTP status codes and details.
 */
export class AppError extends Error {
  /**
   * Create a new AppError instance.
   * @param {number} statusCode - HTTP status code (e.g., 404, 500).
   * @param {string} status - Short status description (e.g., "Not Found").
   * @param {string|null} message - Human-readable error message.
   * @param {object|null} details - Optional extra details for debugging.
   */
  constructor(statusCode, status, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = status;
    this.details = details;
    this.name = "AppError";
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Handle errors inside catch blocks and send a standardized response.
   * @param {object} res - Express response object.
   * @param {Error} error - Error instance (AppError or generic Error).
   */
  static handleCatchBlockError(res, error) {
    const statusCode = error instanceof AppError ? error.statusCode : 500;
    const status = error instanceof AppError ? error.status : "Internal Server Error";
    const message = error.message || "Unexpected error occurred";
    const details = settings.isDevMode ? error : null

    // httpUtils.sendResponse(res, {
    //   statusCode,
    //   status,
    //   message,
    //   details: error.details || null,
    // });
    return new AppError(statusCode, status, message, details)
  }

  // -------------------------
  // Factory methods for errors
  // -------------------------

  /**
   * 400 Bad Request
   * @param {string|null} message - Error message.
   * @param {string} status - Status description.
   * @param {object|null} details - Optional extra details.
   * @returns {AppError}
   */
  static BadRequest(message = null, status = "Bad Request", details = null) {
    return new AppError(this.statusMessage.BAD_REQUEST, status, message, details);
  }

  /**
   * 401 Unauthorized
   */
  static Unauthorized(message = null, status = "Unauthorized", details = null) {
    return new AppError(this.statusMessage.UNAUTHORIZED, status, message, details);
  }

  /**
   * 403 Forbidden
   */
  static Forbidden(message = null, status = "Forbidden", details = null) {
    return new AppError(this.statusMessage.FORBIDDEN, status, message, details);
  }

  /**
   * 404 Not Found
   */
  static NotFound(message = null, status = "Not Found", details = null) {
    return new AppError(this.statusMessage.NOT_FOUND, status, message, details);
  }

  /**
   * 409 Conflict
   */
  static Conflict(message = null, status = "Conflict", details = null) {
    return new AppError(this.statusMessage.CONFLICT, status, message, details);
  }

  /**
   * 500 Internal Server Error
   */
  static InternalServerError(message = null, status = "Internal Server Error", details = null) {
    return new AppError(this.statusMessage.INTERNAL_SERVER_ERROR, status, message, details);
  }

  /**
   * 405 Method Not Allowd
   */
  static MethodNotAllowed(message = null, status = "Method Not Allowed", details = null) {
    return new AppError(this.statusMessage.METHOD_NOT_ALLOWED, status, message, details);
  }

  /**
   * 503 Service Unavailable
   */
  static ServiceUnavailable(message = null, status = "Service Unavailable", details = null) {
    return new AppError(this.statusMessage.METHOD_NOT_ALLOWED, status, message, details);
  }

  /**
   * 422 Unprocessable Entity
   */
  static UnprocessableEntity(message = null, status = "Unprocessable Entity", details = null) {
    return new AppError(this.statusMessage.UNPROCESSABLE_ENTITY, status, message, details);
  }

  // -------------------------
  // Status codes reference
  // -------------------------
  static statusMessage = {
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NO_CONTENT: 204,

    MOVED_PERMANENTLY: 301,
    FOUND: 302,
    NOT_MODIFIED: 304,
    TEMPORARY_REDIRECT: 307,
    PERMANENT_REDIRECT: 308,

    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    CONFLICT: 409,
    GONE: 410,
    PAYLOAD_TOO_LARGE: 413,
    UNSUPPORTED_MEDIA_TYPE: 415,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,

    INTERNAL_SERVER_ERROR: 500,
    NOT_IMPLEMENTED: 501,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504,
  };
}
