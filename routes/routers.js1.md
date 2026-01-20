import { asyncHandler } from "../utils/errors/async.utils.js"
import { AppError } from "../utils/errors/error.utils.js"

class Router {
      // map HTTP methods to route-check functions
  #routeCheckMap = {
    GET: 'isGetRoute',
    POST: 'isPostRoute',
    PUT: 'isPutRoute',
    PATCH: 'isPatchRoute',
    DELETE: 'isDeleteRoute',
  }

  
  #handle(req, res, method, route, fn) {
    const routeCheck = this.#routeCheckMap[method.toUpperCase()]
    if (!routeCheck || typeof this[routeCheck] !== 'function') {
      throw new AppError.BadRequest(`Unsupported HTTP method: ${method}`)
    }

    if (!this[routeCheck](req, route)) {
      throw AppError.BadRequest(
        `Invalid request: expected ${method.toUpperCase()} method with correct path parameters`
      )
    }

    if (typeof fn !== 'function') {
      throw AppError.MethodNotAllowed(
        'Invalid parameter. Third arg must be a function'
      )
    }

    // Execute async handler
    return asyncHandler(fn)(req, res)
  }

    //====================================================================
    async get(req, res, route, fn) {
        if (!this.isGetRoute(req, route)) {
            throw AppError.BadRequest('Invalid request: expected GET method with correct path parameters')
        }

        if (typeof fn !== 'function') {
            throw AppError.MethodNotAllowed('Invalid parameter. Third arg must be a function')
        }

        return asyncHandler(fn)(req, res) //curring
    }

    async post(req, res, route, fn) {
        if (!this.isPostRoute(req, route)) {
            throw AppError.BadRequest('Invalid request: expected POST method with correct path parameters')
        }

        if (typeof fn !== 'function') {
            throw AppError.MethodNotAllowed('Invalid parameter. Third arg must be a function')
        }

        return asyncHandler(fn)(req, res) //curring
    }

    async put(req, res, route, fn) {
        if (!this.isPutRoute(req, route)) {
            throw AppError.BadRequest('Invalid request: expected PUT method with correct path parameters')
        }

        if (typeof fn !== 'function') {
            throw AppError.MethodNotAllowed('Invalid parameter. Third arg must be a function')
        }

        return asyncHandler(fn)(req, res) //curring
    }

    async patch(req, res, route, fn) {
        if (!this.isPatchRoute(req, route)) {
            throw AppError.BadRequest('Invalid request: expected PATCH method with correct path parameters')
        }

        if (typeof fn !== 'function') {
            throw AppError.MethodNotAllowed('Invalid parameter. Third arg must be a function')
        }

        return asyncHandler(fn)(req, res) //curring
    }

    async delete(req, res, route, fn) {
        if (!this.isDeleteRoute(req, route)) {
            throw AppError.BadRequest('Invalid request: expected DELETE method with correct path parameters')
        }

        if (typeof fn !== 'function') {
            throw AppError.MethodNotAllowed('Invalid parameter. Third arg must be a function')
        }

        return asyncHandler(fn)(req, res) //curring
    }

    //====================================================================
    isGetRoute(req, route) {
        return req.method === 'GET' && this._hasPathParams(req, route)
    }

    isPostRoute(req, route) {
        return req.method === 'POST' && this._hasPathParams(req, route)
    }

    isPutRoute(req, route) {
        return req.method === 'PUT' && this._hasPathParams(req, route)
    }

    isPatchRoute(req, route) {
        return req.method === 'PATCH' && this._hasPathParams(req, route)
    }

    isDeleteRoute(req, route) {
        return req.method === 'DELETE' && this._hasPathParams(req, route)
    }

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

    getQueryParams(req) {
        const url = this._getURL(req)
        let queries = {}
        for (const [key, value] of url.searchParams) {
            queries[key] = value
        }
        return queries
    }

  _getIdFromParams(route, pathname) {
  const track = {}
  let ROUTE = route.split('/')
  let PATHNAME = pathname.split('/')

  if (PATHNAME.length !== ROUTE.length) {
  throw new Error('Path does not match route');
  }

  for (let i =0; i < ROUTE.length; i++) {
    if (ROUTE[i].startsWith(':')) {
      track[ROUTE[i].slice(1)] = PATHNAME[i]
    }
  }
  return track
}

    _hasPathParams(req, route) {
        return this.getPathParams(req, false) === route
    }

    _includedQueryParams(req, route) {
        return Object.values(this.getQueryParams(req)).includes(route)
    }

    _getURL(req) {
        const protocol = req.headers['x-forwarded-proto'] || (req.socket.encrypted ? 'https' : 'http')
        const host = req.headers.host || '127.0.0.1'
        return new URL(req.url || '/', `${protocol}://${host}`)    
    }

}

export const router = new Router()
