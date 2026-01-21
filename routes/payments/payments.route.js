import paymentsController from "../../controller/payments/payments.controller.js"
import { router } from "../routers.js"

/**
 * Predefined payment routes to avoid repeating strings.
 */
const PAYMENT_ROUTES = {
  GET_ALL: '/payments',
  GET_SINGLE: '/payments/:paymentId',
  INIT: '/payments',
  PAY_PRODUCT: '/payments/pay-product',
  VERIFY: '/payments/verify/:reference'
}

/**
 * paymentRouter
 *
 * Handles all HTTP routes related to payments.
 * Delegates requests to PaymentsController methods.
 *
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse} res
 * @returns {Promise<boolean>} Returns true if route matched and was handled
 */
export const paymentRouter = async (req, res) => {
  const pathname = router.getPathParams(req, false)

  // -------------------------
  // GET /payments - Fetch all payments
  // -------------------------
  const isGetAll =
    pathname === PAYMENT_ROUTES.GET_ALL ||
    pathname === `${PAYMENT_ROUTES.GET_ALL}/`

  if (router.isGetRoute(req) && isGetAll) {
    /**
     * @route GET /payments
     * @access Public
     */
    await router.get(req, res, PAYMENT_ROUTES.GET_ALL, paymentsController.getPayments)
    return true
  }

  // -------------------------
  // GET /payments/:paymentId - Fetch single payment
  // -------------------------
  if (router.isGetRoute(req) && router._hasPathParams(req, PAYMENT_ROUTES.GET_SINGLE)) {
    /**
     * @route GET /payments/:paymentId
     * @access Public
     * @param {number} req.ids.paymentId
     */
    router._attachIdsToRequest(req, PAYMENT_ROUTES.GET_SINGLE, pathname)
    await router.get(req, res, PAYMENT_ROUTES.GET_SINGLE, paymentsController.getPayment)
    return true
  }

  // -------------------------
  // POST /payments - Initialize payment
  // -------------------------
  const isPost =
    pathname === PAYMENT_ROUTES.INIT ||
    pathname === `${PAYMENT_ROUTES.INIT}/`

  if (router.isPostRoute(req) && isPost) {
    /**
     * @route POST /payments
     * @access Public
     */
    await router.post(req, res, PAYMENT_ROUTES.INIT, paymentsController.initializePayment)
    return true
  }

  // -------------------------
  // POST /payments/pay-product - Pay for product
  // -------------------------
  if (router.isPostRoute(req) && pathname === PAYMENT_ROUTES.PAY_PRODUCT) {
    /**
     * @route POST /payments/pay-product
     * @access Public
     */
    await router.post(req, res, PAYMENT_ROUTES.PAY_PRODUCT, paymentsController.payForProduct)
    return true
  }

  // -------------------------
  // GET /payments/verify/:reference - Verify payment
  // -------------------------
  if (router.isGetRoute(req) && router._hasPathParams(req, PAYMENT_ROUTES.VERIFY)) {
    /**
     * @route GET /payments/verify/:reference
     * @access Public
     * @param {string} req.ids.reference
     */
    router._attachIdsToRequest(req, PAYMENT_ROUTES.VERIFY, pathname)
    await router.get(req, res, PAYMENT_ROUTES.VERIFY, paymentsController.verifyPayment)
    return true
  }

  // No route matched
  return false
}
