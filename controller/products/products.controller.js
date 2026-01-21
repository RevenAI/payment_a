import { modelTools } from "../../model/model-tools.js"
import { BaseController } from "../base.controller.js"

/**
 * ProductsController
 *
 * Handles product-related operations:
 * - Creation
 * - Updating product details
 * - Fetching products (single & multiple)
 * - Deletion
 *
 * Extends BaseController to leverage shared controller utilities like
 * `_sendResponse` and sanitization helpers.
 */
class ProductsController extends BaseController {

  //=====================================================
  //  PUBLIC METHODS
  //=====================================================

  /**
   * Create a new product
   *
   * Steps:
   * 1. Sanitize input
   * 2. Validate required fields
   * 3. Check for duplicate product name
   * 4. Create product
   * 5. Return response
   *
   * @param {import('http').IncomingMessage} req
   * @param {import('http').ServerResponse} res
   */
  createProduct = async (req, res) => {
    const data = this._getSanitizedData(req)
    const { name, description, price, numberInStock } = data

    // Required field check
    if (!name) {
      return this._sendResponse(res, {
        status: 400,
        message: 'Product name is required'
      })
    }

    // Check for existing product
    const products = await this._getProducts()
    const exists = products.find(
      p => p.name === name.toUpperCase()
    )

    if (exists) {
      return this._sendResponse(res, {
        status: 409,
        message: 'Product already registered'
      })
    }

    // Create product
    const created = await modelTools.create(this._productPath, [{
      name: name.toUpperCase(),
      description,
      price,
      numberInStock
    }])

    const newProduct = created[this._entity]?.[0]

    if (!newProduct?._id) {
      return this._sendResponse(res, {
        status: 409,
        message: 'Registration failed. Please try again.'
      })
    }

    return this._sendResponse(res, {
      status: 201,
      data: newProduct,
      message: 'Product registered successfully'
    })
  }

  /**
   * Update an existing product
   *
   * Steps:
   * 1. Extract and validate productId
   * 2. Fetch existing product
   * 3. Sanitize provided fields
   * 4. Check for name conflicts
   * 5. Update product safely
   * 6. Return response
   *
   * @param {import('http').IncomingMessage} req
   * @param {import('http').ServerResponse} res
   */
  updateProduct = async (req, res) => {
    const productId = Number(this._getProductId(req)?.productId)
    this._validateProductId(productId)

    const foundProduct = (await this._getProduct(productId))[0]
    if (!foundProduct) {
      return this._sendResponse(res, {
        status: 404,
        message: 'Product not found'
      })
    }

    const data = this._getSanitizedData(req)

    // Name conflict check (only if name provided)
    if (data.name) {
      const products = await this._getProducts()
      const conflict = products.find(
        p =>
          p._id !== foundProduct._id &&
          p.name === data.name.toUpperCase()
      )

      if (conflict) {
        return this._sendResponse(res, {
          status: 409,
          message: `Product with name "${data.name}" already exists`
        })
      }
    }

    // SAFE UPDATE PAYLOAD (ignore undefined fields)
    const updatePayload = Object.fromEntries(
      Object.entries({
        ...data,
        name: data.name?.toUpperCase()
      }).filter(([, v]) => v !== undefined)
    )

    const updated = await this._updateProduct(foundProduct._id, [updatePayload])
    const updatedProduct = updated[this._entity]?.[0]

    if (!updatedProduct?._id) {
      return this._sendResponse(res, {
        status: 409,
        message: 'Product update failed'
      })
    }

    return this._sendResponse(res, {
      status: 200,
      message: 'Product updated successfully',
      data: updatedProduct
    })
  }

  /**
   * Fetch all products
   *
   * @param {import('http').IncomingMessage} req
   * @param {import('http').ServerResponse} res
   */
  getProducts = async (req, res) => {
    const products = await this._getProducts()

    return this._sendResponse(res, {
      status: 200,
      data: {
        numberOfProductsInDb: products.length,
        products
      },
      message: products.length
        ? 'Products fetched successfully.'
        : 'No products found'
    })
  }

  /**
   * Fetch a single product by ID
   *
   * @param {import('http').IncomingMessage} req
   * @param {import('http').ServerResponse} res
   */
  getProduct = async (req, res) => {
    const productId = Number(this._getProductId(req)?.productId)
    this._validateProductId(productId)

    const product = (await this._getProduct(productId))[0]

    if (!product) {
      return this._sendResponse(res, {
        status: 404,
        data: null,
        message: 'Product not found'
      })
    }

    return this._sendResponse(res, {
      status: 200,
      data: product,
      message: 'Product fetched successfully'
    })
  }

  /**
   * Delete a product by ID
   *
   * @param {import('http').IncomingMessage} req
   * @param {import('http').ServerResponse} res
   */
  deleteProduct = async (req, res) => {
    const productId = Number(this._getProductId(req)?.productId)
    this._validateProductId(productId)

    const deletedProduct =
      (await this._deleteProduct(productId))[this._entity]?.[0]

    if (!deletedProduct) {
      return this._sendResponse(res, {
        status: 404,
        message: 'Product not found',
        data: null
      })
    }

    return this._sendResponse(res, {
      status: 200,
      message: 'Product deleted successfully',
      data: deletedProduct
    })
  }

  //=====================================================
  //  PRIVATE METHODS & PROPERTIES
  //=====================================================

  /** Path to the products JSON file */
  _productPath = './model/products/products.json'

  /** Entity key extracted from file path */
  _entity = modelTools._extractEntityFromPath(this._productPath)

  /**
   * Fetch all products
   * @returns {Promise<Array>} Array of products
   */
  _getProducts = async () => {
    const raw = await modelTools.findAll(this._productPath)
    return raw[this._entity]
  }

  /**
   * Fetch a single product by ID
   * @param {number} _id
   * @returns {Promise<Object[]>} Array containing the product
   */
  _getProduct = async (_id) => {
    const raw = await modelTools.findOne(this._productPath, _id)
    return raw[this._entity]
  }

  /**
   * Update a product by ID
   * @param {number} _id
   * @param {Array<Object>} data
   */
  _updateProduct = async (_id, data) =>
    modelTools.update(this._productPath, data, _id)

  /**
   * Delete a product by ID
   * @param {number} _id
   */
  _deleteProduct = async (_id) =>
    modelTools.delete(this._productPath, _id)

  /**
   * Sanitize incoming product data
   *
   * @param {import('http').IncomingMessage} req
   * @returns {Object} Sanitized product payload
   */
  _getSanitizedData = (req) => {
    const sanitize = (v) => this._validateAndSanitizeString(v)

    return {
      name: sanitize(req.body?.name),
      description: sanitize(req.body?.description),
      price: sanitize(req.body?.price),
      numberInStock: sanitize(req.body?.numberInStock)
    }
  }

  /**
   * Extract productId from request
   *
   * @param {import('http').IncomingMessage} req
   * @returns {Object} Object containing productId
   */
  _getProductId = (req) => {
    // route-level middleware attaches all ids to req.ids
    return req.ids
  }

  /**
   * Validate productId
   *
   * @param {number} _id
   * @throws {Error} if productId is invalid
   */
  _validateProductId = (_id) => {
    if (!Number.isInteger(_id) || _id <= 0) {
      throw new Error('Valid productId is required')
    }
  }
}

// Export singleton instance
export default new ProductsController()
