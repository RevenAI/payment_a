import path from "path"
import { asyncHandler } from "../utils/errors/async.utils.js"
import { AppError } from "../utils/errors/error.utils.js"

/**
 * Router class to handle HTTP routing, path and query parsing,
 * and centralized error handling for asynchronous route handlers.
 *
 * This class provides:
 * - HTTP method validation (GET, POST, PUT, PATCH, DELETE)
 * - Path parameter extraction
 * - Query parameter extraction
 * - Centralized async error handling via asyncHandler
 * 
 * Controllers remain clean; errors are normalized and bubbled.
 */
class Router {
  /**
   * Maps HTTP methods to their respective route-check functions.
   * Used internally to validate that requests match the expected HTTP method.
   * @type {Object<string, string>}
   */
  #routeCheckMap = {
    GET: 'isGetRoute',
    POST: 'isPostRoute',
    PUT: 'isPutRoute',
    PATCH: 'isPatchRoute',
    DELETE: 'isDeleteRoute',
  }

  /**
   * Internal handler to centralize route validation and async error handling.
   *
   * @param {Object} req - Node.js HTTP request object
   * @param {Object} res - Node.js HTTP response object
   * @param {string} method - HTTP method (GET, POST, etc.)
   * @param {string} route - Expected route path
   * @param {Function} fn - Async controller function to execute
   * @returns {Promise<void>} - Returns the result of the wrapped async handler
   * @throws {AppError} - Throws AppError if method is invalid or handler is not a function
   */
  #handle(req, res, method, route, fn) {
    const routeCheck = this.#routeCheckMap[method.toUpperCase()]

    if (!routeCheck || typeof this[routeCheck] !== 'function') {
      throw new AppError.BadRequest(`Unsupported HTTP method: ${method}`)
    }

    if (!this[routeCheck](req, route)) {
      throw new AppError.BadRequest(
        `Invalid request: expected ${method.toUpperCase()} method with correct path parameters`
      )
    }

    if (typeof fn !== 'function') {
      throw new AppError.MethodNotAllowed(
        'Invalid parameter. Third arg must be a function'
      )
    }

    // Wrap the controller in asyncHandler to centralize async error handling
    return asyncHandler(fn)(req, res)
  }

  //====================================================================
  // Convenience wrappers for HTTP methods
  //====================================================================

  /** Handle GET requests */
  get(req, res, route, fn) {
    return this.#handle(req, res, 'GET', route, fn)
  }

  /** Handle POST requests */
  post(req, res, route, fn) {
    return this.#handle(req, res, 'POST', route, fn)
  }

  /** Handle PUT requests */
  put(req, res, route, fn) {
    return this.#handle(req, res, 'PUT', route, fn)
  }

  /** Handle PATCH requests */
  patch(req, res, route, fn) {
    return this.#handle(req, res, 'PATCH', route, fn)
  }

  /** Handle DELETE requests */
  delete(req, res, route, fn) {
    return this.#handle(req, res, 'DELETE', route, fn)
  }

  //====================================================================
  // Route validation methods
  //====================================================================

  /**
   * Check if the request matches a GET route
   * @param {Object} req
   * @param {string} route
   * @returns {boolean}
   */
  isGetRoute(req) {
    return req.method === 'GET'
  }

  /** Check if the request matches a POST route */
  isPostRoute(req) {
    return req.method === 'POST'
  }

  /** Check if the request matches a PUT route */
  isPutRoute(req) {
    return req.method === 'PUT'
  }

  /** Check if the request matches a PATCH route */
  isPatchRoute(req) {
    return req.method === 'PATCH'
  }

  /** Check if the request matches a DELETE route */
  isDeleteRoute(req) {
    return req.method === 'DELETE'
  }

    /**
   * Check if the request path matches the expected route path
   * @param {Object} req
   * @param {string} route
   * @returns {boolean}
   */
  _hasPathParams(req, route) {
  const pathname = this.getPathParams(req, false)
  router._attachIdsToRequest(req, route, req.params)
  const ids = this._getIdFromParams(route, pathname)
  if (!Object.values(ids).length) return false
  return true
  }

  //====================================================================
  // Path and query parameter helpers
  //====================================================================

  /**
   * Extract path parameters from the request URL.
   *
   * @param {Object} req - Node.js request object
   * @param {boolean} intoSegment - Whether to split path into segments
   * @returns {Object|string} - Either the full pathname or an object of segments
   */
  getPathParams(req, intoSegment = false) {
    const url = this._getURL(req)
    let params = {}

    if (intoSegment) {
      const pathnames = url.pathname.split('/').filter(Boolean) || []
      for (let i = 0; i < pathnames.length; i++) {
        params[pathnames[i]] = `/${pathnames[i]}`
      }
      return params
    } else {
      return url.pathname
    }
  }

  /**
   * Extract query parameters from the request URL
   *
   * @param {Object} req - Node.js request object
   * @returns {Object<string, string>} - Object mapping query keys to values
   */
  getQueryParams(req) {
    const url = this._getURL(req)
    const queries = {}
    for (const [key, value] of url.searchParams) {
      queries[key] = value
    }
    return queries
  }

  /**
   * Extract dynamic parameters (e.g., :id) from route path and actual URL path
   *
   * @param {string} route - Route pattern (e.g., "/users/:id")
   * @param {string} pathname - Actual request path (e.g., "/users/123")
   * @returns {Object<string, string>} - Mapping of param names to values
   * @throws {Error} if the route and pathname length mismatch
   */
  _getIdFromParams(route, pathname) {
    const track = {}
    const ROUTE = route.split('/')
    const PATHNAME = pathname.split('/')

    if (PATHNAME.length !== ROUTE.length) {
      //return
      throw AppError.BadRequest('route and pathname not match')
    }

    for (let i = 0; i < ROUTE.length; i++) {
      if (ROUTE[i].startsWith(':')) {
        track[ROUTE[i].slice(1)] = PATHNAME[i]
      }
    }
    return track
  }

/**
 * Attach route parameters (IDs) to the request object.
 *
 * Extracts dynamic route params (like `/users/:id`) from the URL
 * and attaches them to `req.ids` for later use in controllers.
 *
 * @param {import('http').IncomingMessage} req - Node.js request object
 * @param {string} route - Route pattern, e.g., '/users/:id'
 * @param {string} pathname - Pathname extracted from request params, e.g., '/users/:id'
 * @returns {void} Modifies `req` directly
 */
_attachIdsToRequest(req, route, pathname) {
    const pn = pathname ?? this.getPathParams(req, false)
    if (!pn) return null
    const ids = this._getIdFromParams(route, pn)
    req.ids = ids
}

  /**
   * Check if any query parameters include a specific value
   * @param {Object} req
   * @param {string} route
   * @returns {boolean}
   */
  _includedQueryParams(req, route) {
    return Object.values(this.getQueryParams(req)).includes(route)
  }

  /**
   * Build a full URL object from the request
   * Handles `x-forwarded-proto` header or socket encryption
   *
   * @param {Object} req
   * @returns {URL}
   */
  _getURL(req) {
    const protocol =
      req.headers['x-forwarded-proto'] ||
      (req.socket.encrypted ? 'https' : 'http')
    const host = req.headers.host || '127.0.0.1'
    return new URL(req.url || '/', `${protocol}://${host}`)
  }
}

// Export a single router instance
export const router = new Router()
