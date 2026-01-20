class Router {
    isGetRoute(req, route) {
        return req.method === 'GET' && route === this._getParams(req).routeParam
    }

    isPostRoute(req, route) {
        return req.method === 'POST' && route === this._getParams(req).routeParam
    }

    isPutRoute(req, route) {
        return req.method === 'PUT' && route === this._getParams(req).routeParam
    }

    isPatchRoute(req, route) {
        return req.method === 'PATCH' && route === this._getParams(req).routeParam
    }

    isDeleteRoute(req, route) {
        return req.method === 'DELETE' && route === this._getParams(req).routeParam
    }

    getQueryParam(req, queryName) {
        return this._getParams(req, { queryName }).queryParam
    }

    _getParams(req, options = {}) {
        const protocol = req.headers['x-forwarded-proto'] || (req.socket.encrypted ? 'https' : 'http')
        const host = req.headers.host || '127.0.0.1'

        const url = new URL(req.url || '/', `${protocol}://${host}`)
        const { pathNameIndex = 0, queryName } = options
        const segments = url.pathname.split('/').filter(Boolean)

        return {
            routeParam: segments[pathNameIndex] ? `/${segments[pathNameIndex]}` : '',
            queryParam: queryName ? url.searchParams.get(queryName) || '' : ''
        }
    }
}

export const router = new Router()
