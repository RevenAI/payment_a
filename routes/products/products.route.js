import productsController from '../../controller/products/products.controller'
import { router } from '../routers'


/**
 * Predefined product routes to avoid repeating strings.
 */
const PRODUCT_ROUTES = {
  GET_ALL: '/products',
  GET_SINGLE: '/products/:productId',
  POST: '/products',
  PUT: '/products/:productId',
  PATCH: '/products/:productId',
  DELETE: '/products/:productId',
}

/**
 * productRouter
 *
 * Handles all HTTP routes related to the "products" resource.
 * Delegates requests to ProductsController methods based on HTTP method and path.
 *
 * @param {import('http').IncomingMessage} req - Node.js request object
 * @param {import('http').ServerResponse} res - Node.js response object
 * @returns {Promise<boolean>} Returns true if route matched and was handled
 */
export const productRouter = async (req, res) => {
  const pathname = router.getPathParams(req, false)

  // -------------------------
  // GET /products - Fetch all products
  // -------------------------
  const isGetAll =
    pathname === PRODUCT_ROUTES.GET_ALL ||
    pathname === `${PRODUCT_ROUTES.GET_ALL}/`

  if (router.isGetRoute(req) && isGetAll) {
    /**
     * @route GET /products
     * @access Public
     */
    await router.get(req, res, PRODUCT_ROUTES.GET_ALL, productsController.getProducts)
    return true
  }

  // -------------------------
  // GET /products/:productId - Fetch single product
  // -------------------------
  if (router.isGetRoute(req) && router._hasPathParams(req, PRODUCT_ROUTES.GET_SINGLE)) {
    /**
     * @route GET /products/:productId
     * @access Public
     * @param {number} req.ids.productId - Product ID from route parameters
     */
    router._attachIdsToRequest(req, PRODUCT_ROUTES.GET_SINGLE, pathname)
    await router.get(req, res, PRODUCT_ROUTES.GET_SINGLE, productsController.getProduct)
    return true
  }

  // -------------------------
  // POST /products - Create new product
  // -------------------------
  const isPost =
    pathname === PRODUCT_ROUTES.POST ||
    pathname === `${PRODUCT_ROUTES.POST}/`

  if (router.isPostRoute(req) && isPost) {
    /**
     * @route POST /products
     * @access Public
     * @param {Object} req.body - Product payload
     * @param {string} req.body.name
     * @param {string} req.body.description
     * @param {number|string} req.body.price
     * @param {number|string} req.body.numberInStock
     */
    await router.post(req, res, PRODUCT_ROUTES.POST, productsController.createProduct)
    return true
  }

  // -------------------------
  // PUT /products/:productId - Full product update
  // -------------------------
  if (router.isPutRoute(req) && router._hasPathParams(req, PRODUCT_ROUTES.PUT)) {
    /**
     * @route PUT /products/:productId
     * @access Public
     * @param {number} req.ids.productId
     * @param {Object} req.body - Updated product payload
     */
    router._attachIdsToRequest(req, PRODUCT_ROUTES.PUT, pathname)
    await router.put(req, res, PRODUCT_ROUTES.PUT, productsController.updateProduct)
    return true
  }

  // -------------------------
  // PATCH /products/:productId - Partial product update
  // -------------------------
  if (router.isPatchRoute(req) && router._hasPathParams(req, PRODUCT_ROUTES.PATCH)) {
    /**
     * @route PATCH /products/:productId
     * @access Public
     * @param {number} req.ids.productId
     * @param {Object} req.body - Partial update payload
     */
    router._attachIdsToRequest(req, PRODUCT_ROUTES.PATCH, pathname)
    await router.patch(req, res, PRODUCT_ROUTES.PATCH, productsController.updateProduct)
    return true
  }

  // -------------------------
  // DELETE /products/:productId - Delete product
  // -------------------------
  if (router.isDeleteRoute(req) && router._hasPathParams(req, PRODUCT_ROUTES.DELETE)) {
    /**
     * @route DELETE /products/:productId
     * @access Public
     * @param {number} req.ids.productId
     */
    router._attachIdsToRequest(req, PRODUCT_ROUTES.DELETE, pathname)
    await router.delete(req, res, PRODUCT_ROUTES.DELETE, productsController.deleteProduct)
    return true
  }

  // No route matched → allow global 404 handler
  return false
}
