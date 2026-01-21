import { modelTools } from "../../model/model-tools.js"
import { BaseController } from "../base.controller.js"

/**
 * PaymentsController
 *
 * Simulates a real-world payment gateway flow:
 * - Initialize payment
 * - Verify payment
 * - Fetch payments
 *
 * This controller mimics services like Paystack / Stripe
 * but runs fully locally for development & learning.
 */
class PaymentsController extends BaseController {

  //=====================================================
  //  PUBLIC METHODS
  //=====================================================

  /**
   * Initialize a payment transaction
   *
   * Flow:
   * 1. Sanitize payload
   * 2. Validate required fields
   * 3. Generate reference
   * 4. Persist payment with "pending" status
   * 5. Return simulated authorization URL
   *
   * @param {import('http').IncomingMessage} req
   * @param {import('http').ServerResponse} res
   */
  initializePayment = async (req, res) => {
    const { email, amount, currency } = this._getSanitizedData(req)

    if (!email || !amount) {
      return this._sendResponse(res, {
        status: 400,
        message: 'Email and amount are required'
      })
    }

    const reference = this._generateReference()

    const paymentPayload = {
      email,
      amount: Number(amount),
      currency: currency ?? 'NGN',
      reference,
      status: 'pending',
      createdAt: new Date().toISOString()
    }

    const created = await modelTools.create(this._paymentPath, [paymentPayload])
    const payment = created[this._entity]?.[0]

    if (!payment?._id) {
      return this._sendResponse(res, {
        status: 500,
        message: 'Payment initialization failed'
      })
    }

    return this._sendResponse(res, {
      status: 201,
      message: 'Payment initialized',
      data: {
        reference,
        authorization_url: `https://fake-gateway.dev/pay/${reference}`
      }
    })
  }

  /**
 * Pay for a product
 *
 * Simulates a real-world checkout payment flow:
 * - Validate product & quantity
 * - Calculate total cost
 * - Initialize payment
 * - Reserve product stock (soft lock)
 *
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse} res
 */
payForProduct = async (req, res) => {
  const { productId, quantity, email } = this._getSanitizedData(req)

  if (!productId || !quantity || !email) {
    return this._sendResponse(res, {
      status: 400,
      message: 'productId, quantity and email are required'
    })
  }

  const qty = Number(quantity)
  if (!Number.isInteger(qty) || qty <= 0) {
    return this._sendResponse(res, {
      status: 400,
      message: 'Quantity must be a positive integer'
    })
  }

  // Fetch product
  const products = await modelTools.findAll(this._productPath)
  const product = products[this._productEntity]
    .find(p => p._id === Number(productId))

  if (!product) {
    return this._sendResponse(res, {
      status: 404,
      message: 'Product not found'
    })
  }

  if (product.numberInStock < qty) {
    return this._sendResponse(res, {
      status: 409,
      message: 'Insufficient product stock'
    })
  }

  // Calculate total
  const totalAmount = product.price * qty
  const reference = this._generateReference()

  // Create payment (PENDING)
  const paymentPayload = {
    reference,
    email,
    productId: product._id,
    quantity: qty,
    amount: totalAmount,
    currency: 'NGN',
    status: 'pending',
    createdAt: new Date().toISOString()
  }

  const created = await modelTools.create(this._paymentPath, [paymentPayload])
  const payment = created[this._entity]?.[0]

  if (!payment?._id) {
    return this._sendResponse(res, {
      status: 500,
      message: 'Payment initialization failed'
    })
  }

  return this._sendResponse(res, {
    status: 201,
    message: 'Payment initialized for product',
    data: {
      reference,
      product: {
        id: product._id,
        name: product.name,
        quantity: qty,
        unitPrice: product.price,
        totalAmount
      },
      authorization_url: `https://fake-gateway.dev/pay/${reference}`
    }
  })
}

  /**
   * Verify a payment transaction
   *
   * Simulates gateway verification:
   * - If reference exists
   * - Randomly marks payment as success or failed
   * - Idempotent (won't re-process completed payments)
   *
   * @param {import('http').IncomingMessage} req
   * @param {import('http').ServerResponse} res
   */
  verifyPayment = async (req, res) => {
    const reference = this._getPaymentReference(req)

    if (!reference) {
      return this._sendResponse(res, {
        status: 400,
        message: 'Payment reference is required'
      })
    }

    const payments = await this._getPayments()
    const payment = payments.find(p => p.reference === reference)

    if (!payment) {
      return this._sendResponse(res, {
        status: 404,
        message: 'Payment not found'
      })
    }

    // Idempotency: do not re-process completed payments
    if (payment.status !== 'pending') {
      return this._sendResponse(res, {
        status: 200,
        message: 'Payment already processed',
        data: payment
      })
    }

    // Simulate gateway response
    const isSuccessful = Math.random() >= 0.3 // ~70% success rate

    const updatedStatus = isSuccessful ? 'success' : 'failed'

    const updated = await this._updatePayment(payment._id, [{
      status: updatedStatus,
      verifiedAt: new Date().toISOString()
    }])

    const updatedPayment = updated[this._entity]?.[0]

    return this._sendResponse(res, {
      status: 200,
      message: `Payment ${updatedStatus}`,
      data: updatedPayment
    })
  }

  /**
   * Fetch all payments
   *
   * @param {import('http').IncomingMessage} req
   * @param {import('http').ServerResponse} res
   */
  getPayments = async (req, res) => {
    const payments = await this._getPayments()

    return this._sendResponse(res, {
      status: 200,
      data: {
        total: payments.length,
        payments
      },
      message: payments.length
        ? 'Payments fetched successfully'
        : 'No payments found'
    })
  }

  /**
   * Fetch a single payment by reference
   *
   * @param {import('http').IncomingMessage} req
   * @param {import('http').ServerResponse} res
   */
  getPayment = async (req, res) => {
    const reference = this._getPaymentReference(req)

    const payments = await this._getPayments()
    const payment = payments.find(p => p.reference === reference)

    if (!payment) {
      return this._sendResponse(res, {
        status: 404,
        message: 'Payment not found',
        data: null
      })
    }

    return this._sendResponse(res, {
      status: 200,
      data: payment,
      message: 'Payment fetched successfully'
    })
  }

  //=====================================================
  //  PRIVATE METHODS & PROPERTIES
  //=====================================================

  /** Path to payment storage */
  _paymentPath = './model/payments/payments.json'

  /** Extracted entity key */
  _entity = modelTools._extractEntityFromPath(this._paymentPath)

  /**
   * Fetch all payments
   */
  _getPayments = async () => {
    const raw = await modelTools.findAll(this._paymentPath)
    return raw[this._entity]
  }

  /**
   * Update payment record
   */
  _updatePayment = async (_id, data) =>
    modelTools.update(this._paymentPath, data, _id)

  /**
   * Sanitize incoming payload
   */
  _getSanitizedData = (req) => {
    const sanitize = (v) => this._validateAndSanitizeString(v)

    return {
      email: sanitize(req.body?.email),
      amount: sanitize(req.body?.amount),
      currency: sanitize(req.body?.currency)
    }
  }

  /**
   * Extract payment reference from request
   *
   * @param {import('http').IncomingMessage} req
   */
  _getPaymentReference = (req) => {
    return req.ids?.reference || req.query?.reference
  }

  /**
   * Generate unique payment reference
   */
  _generateReference = () => {
    return `PAY_${Date.now()}_${Math.floor(Math.random() * 1000000)}`
  }
}

export default new PaymentsController()
