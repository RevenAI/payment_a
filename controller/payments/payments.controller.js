import { modelTools } from "../../model/model-tools.js"
import { router } from "../../routes/routers.js"
import { BaseController } from "../base.controller.js"

class Payments extends BaseController {

  //=====================================================
  //  PUBLIC METHODS
  //=====================================================

  async createProduct(req, res) {
    try {
      const { name, description, price, numberInStock } =
        this._getSanitizedData(req)

      if (!name) {
        return this._sendResponse(res, {
          status: 400,
          message: 'Product name is required'
        })
      }

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

      const created = await modelTools.create(this._productPath, [{
        name: name.toUpperCase(),
        description,
        price,
        numberInStock
      }])

      const product = created[this._entity]?.[0]

      if (!product?._id) {
        return this._sendResponse(res, {
          status: 409,
          message: 'Registration failed. Please try again.'
        })
      }

      return this._sendResponse(res, {
        status: 201,
        data: product,
        message: 'Product registered successfully'
      })

    } catch (error) {
      this._handleCatchBlockError(res, error)
    }
  }

  async updateProduct(req, res) {
    try {
      const productId = this._getProductId(req)
      this._validateProductId(productId)

      const found = (await this._getProduct(productId))[0]
      if (!found) {
        return this._sendResponse(res, {
          status: 404,
          message: 'Product not found'
        })
      }

      const data = this._getSanitizedData(req)

      if (data.name) {
        const products = await this._getProducts()
        const conflict = products.find(
          p =>
            p._id !== found._id &&
            p.name === data.name.toUpperCase()
        )

        if (conflict) {
          return this._sendResponse(res, {
            status: 409,
            message: `Product with name "${data.name}" already exists`
          })
        }
      }

      // prevent undefined overwrite
      const updatePayload = Object.fromEntries(
        Object.entries({
          ...data,
          name: data.name?.toUpperCase()
        }).filter(([, v]) => v !== undefined)
      )

      const updated = await this._updateProduct(found._id, [updatePayload])
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

    } catch (error) {
      this._handleCatchBlockError(res, error)
    }
  }

  async getProducts(req, res) {
    try {
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

    } catch (error) {
      this._handleCatchBlockError(res, error)
    }
  }

  async getProduct(req, res) {
    try {
      const productId = this._getProductId(req)
      this._validateProductId(productId)

      const product = (await this._getProduct(productId))[0]

      if (!product) {
        return this._sendResponse(res, {
          status: 404,
          message: 'Product not found',
          data: null
        })
      }

      return this._sendResponse(res, {
        status: 200,
        data: product,
        message: 'Product fetched successfully'
      })

    } catch (error) {
      this._handleCatchBlockError(res, error)
    }
  }

  async deleteProduct(req, res) {
    try {
      const productId = this._getProductId(req)
      this._validateProductId(productId)

      const deleted =
        (await this._deleteProduct(productId))[this._entity]?.[0]

      if (!deleted) {
        return this._sendResponse(res, {
          status: 404,
          message: 'Product not found'
        })
      }

      return this._sendResponse(res, {
        status: 200,
        message: 'Product deleted successfully',
        data: deleted
      })

    } catch (error) {
      this._handleCatchBlockError(res, error)
    }
  }

  //=====================================================
  //  PRIVATE METHODS
  //=====================================================

  _productPath = './model/products/products.json'
  _entity = modelTools._extractEntityFromPath(this._productPath)

  _getProducts = async () =>
    (await modelTools.findAll(this._productPath))[this._entity]

  _getProduct = async (_id) =>
    (await modelTools.findOne(this._productPath, _id))[this._entity]

  _updateProduct = async (_id, data) =>
    modelTools.update(this._productPath, data, _id)

  _deleteProduct = async (_id) =>
    modelTools.delete(this._productPath, _id)

  _getSanitizedData = (req) => {
    const sanitize = (v) => this._validateAndSanitizeString(v)

    return {
      name: sanitize(req.body?.name),
      description: sanitize(req.body?.description),
      price: sanitize(req.body?.price),
      numberInStock: sanitize(req.body?.numberInStock)
    }
  }

  _getProductId = (req) => {
    const routeParam = router._getParams(req).routeParam
    const id = Number(
      typeof routeParam === 'string'
        ? routeParam.replace(/^\//, '')
        : routeParam
    )
    return Number.isNaN(id) ? null : id
  }

  _validateProductId = (_id) => {
    if (!Number.isInteger(_id) || _id <= 0) {
      throw new Error('Valid productId is required')
    }
  }
}

export default new Payments()
