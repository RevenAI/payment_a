import { modelTools } from "../model/model-tools.js"

/**
 * HttpUtils
 *
 * A utility class for handling HTTP request parsing and response sending
 * in a Node.js server environment.
 *
 * Responsibilities:
 * - Parse JSON request bodies with size limits
 * - Validate content types
 * - Serialize and send structured JSON responses
 * - Handle errors consistently
 *
 * This keeps controller logic clean and centralized.
 */
class HttpUtils {

    /**
     * Parse the body of an incoming HTTP request.
     * Handles JSON content type validation, size limiting, and parsing errors.
     *
     * @param {import('http').IncomingMessage} req - Node.js HTTP request object
     * @param {Object} options - Optional configuration
     * @param {number} options.maxSize - Maximum request payload size in MB (default 10MB)
     * @returns {Promise<Object>} - Resolves with parsed JSON object or empty object
     * @throws {Error} - Throws if content type is invalid, payload exceeds maxSize, or JSON parsing fails
     *
     * @example
     * const body = await httpUtils.parseRequestBody(req, { maxSize: 5 })
     */
    parseRequestBody(req, options = {}) {
        return new Promise((resolve, reject) => {
            const contentType = req.headers['content-type']

            // Validate that the request has JSON content type
            if (!contentType || !contentType.includes('application/json')) {
                return reject(new Error('Invalid content type'))
            }

            let body = ''
            let bytesRead = 0
            const maxSize = options?.maxSize ?? 10
            const MAX_SIZE = maxSize * 1024 * 1024 // Convert MB to bytes

            // Collect data chunks as they arrive
            req.on('data', chunk => {
                bytesRead += chunk.length
                if (bytesRead > MAX_SIZE) {
                    // Reject if request payload is too large
                    reject(new Error('Payload too large'))
                    req.destroy() // Terminate connection to prevent further data
                    return
                }
                body += chunk
            })

            // Parse body when request ends
            req.on('end', () => {
                try {
                    resolve(body ? JSON.parse(body) : {})
                } catch (error) {
                    reject(new Error('Error parsing request payload'))
                }
            })

            // Handle request-level errors
            req.on('error', error => reject(error))
        })
    }

    /**
     * Send a JSON response to the client.
     * Automatically serializes data and structures payload for success or error.
     *
     * @param {import('http').ServerResponse} res - Node.js HTTP response object
     * @param {Object} options
     * @param {number} [options.status=200] - HTTP status code
     * @param {any} [options.data] - Response payload for successful requests
     * @param {string} [options.message] - Optional human-readable message
     * @param {Error} [options.error] - Optional error object for failed requests
     *
     * @example
     * httpUtils.sendResponse(res, {
     *   status: 200,
     *   data: { users: [...] },
     *   message: 'Users fetched successfully'
     * })
     *
     * @example
     * httpUtils.sendResponse(res, {
     *   status: 500,
     *   error: new Error('Something went wrong')
     * })
     */
    sendResponse(res, { status, data, message, error }) {
        // Avoid writing headers/body if already sent
        if (res.headersSent) return
        
        // Set response status code and content type
        res.statusCode = status ?? 200
        res.setHeader('Content-Type', 'application/json')

        // Helper: serialize data using modelTools if not already serialized
        const _serialize = (d) => 
            modelTools._isSerialized(d) ? d : modelTools._serialize(d)

        // Construct the payload object
        let payload
        if (error) {
            // Error response structure
            payload = {
                status: res.statusCode,
                success: false,
                error:  error, //String(error),
                data: null,
                message: message || error.message || null
            }
        } else {
            // Success response structure
            payload = {
                status: res.statusCode,
                success: res.statusCode <= 308, // Success for 1xx–3xx
                data: _serialize(data),
                message
            }
        }

        // Send serialized JSON payload
        res.end(_serialize(payload))
    }
}

// Export a singleton instance for use across the application
export const httpUtils = new HttpUtils()
