import { AppError } from "./error.utils.js"

/**
 * Wraps an asynchronous request handler and centralizes error handling.
 *
 * This utility ensures that:
 * - Errors thrown inside async handlers are properly caught.
 * - Known application errors (`AppError`) are rethrown unchanged.
 * - Unknown errors are normalized into a standardized
 *   `InternalServerError` before bubbling up to the router or server layer.
 *
 * It is designed to be used at the routing layer, allowing controllers
 * to remain free of try/catch blocks and focus only on business logic.
 *
 * @param {(req: object, res: object) => Promise<void>} fn
 * An asynchronous handler function (e.g., a controller method)
 * with the signature `(req, res) => Promise<void>`.
 *
 * @returns {Function}
 * A wrapped asynchronous handler that preserves error bubbling
 * and delegates final error response handling to a higher layer.
 *
 * @example
 * router.get(
 *   req,
 *   "/users",
 *   asyncHandler(usersController.getUsers)
 * )
 */
export const asyncHandler = (fn) => {
  return async (req, res) => {
    try {
      await fn(req, res)
    } catch (error) {
      if (error instanceof AppError) {
        throw error
      }

      throw AppError.InternalServerError(
        error.message || "Unexpected error occurs",
        "Internal Server Error",
        error
      )
    }
  }
}
