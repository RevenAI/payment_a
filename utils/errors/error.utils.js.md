import { httpUtils } from "../http.utils.js"

export class AppError extends Error {
    constructor(status, message) {
        super(message)          // allow standard Error properties
        this.status = status
        this.name = 'AppError'
    }

    static handleCatchBlockError(res, error) {
    httpUtils.sendResponse(res, {
      status: error.status || 500,
      error: error.message || String(error),
      message: error.message || 'Internal server error'
    })
    }

    // Async handler wrapper for raw Node.js
    // static asyncHandler(fn) {
    //     return async (req, res) => {
    //         try {
    //             await fn(req, res)
    //         } catch (err) {
    //             // If controller threw AppError, use its status
    //             const status = err instanceof AppError ? err.status : 500
    //             const message = err.message || 'Internal Server Error'
                
    //             // Send response (assuming a _sendResponse helper exists)
    //             httpUtils.sendResponse(res, { status, message, error: err })
    //         }
    //     }
    // }

    // Status codes reference
    static statusMessage = {
        // 2xx Success
        OK: 200,
        CREATED: 201,
        ACCEPTED: 202,
        NO_CONTENT: 204,

        // 3xx Redirection
        MOVED_PERMANENTLY: 301,
        FOUND: 302,
        NOT_MODIFIED: 304,
        TEMPORARY_REDIRECT: 307,
        PERMANENT_REDIRECT: 308,

        // 4xx Client Error
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

        // 5xx Server Error
        INTERNAL_SERVER_ERROR: 500,
        NOT_IMPLEMENTED: 501,
        BAD_GATEWAY: 502,
        SERVICE_UNAVAILABLE: 503,
        GATEWAY_TIMEOUT: 504
    };
}

