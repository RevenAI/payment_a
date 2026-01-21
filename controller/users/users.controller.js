import { modelTools } from "../../model/model-tools.js"
import { Validator } from "../../utils/validator.utils.js"
import { BaseController } from "../base.controller.js"

/**
 * UsersController
 *
 * Handles user-related operations:
 * - Registration
 * - Updating user information
 * - Fetching users (single & multiple)
 * - Deletion
 *
 * Extends BaseController to leverage shared controller utilities like
 * `_sendResponse` and sanitization helpers.
 */
class UsersController extends BaseController {

  //=====================================================
  //  PUBLIC METHODS
  //=====================================================

  /**
   * Register a new user
   *
   * Steps:
   * 1. Sanitize input
   * 2. Validate required fields (email & phone)
   * 3. Run payload validation
   * 4. Check for existing user (email/phone conflict)
   * 5. Create user and return response
   *
   * @param {import('http').IncomingMessage} req - Request object
   * @param {import('http').ServerResponse} res - Response object
   */
  registerUser = async (req, res) => {
    
      const data = this._getSanitizedData(req)
      const { firstName, lastName, email, phone, gender, dob } = data

      // Required field check
      if (!email || !phone) {
         return this._sendResponse(res, {
           status: 400,
           message: 'Email and phone required'
         })
      }

      // VALIDATION (after sanitization)
      const validation = Validator.validateUserPayload(data)
      if (!validation.valid) {
        return this._sendResponse(res, {
          status: 400,
          message: validation.errors.join(', ')
        })
      }

      // Check if user already exists
      const users = await this._getUsers()
      const userExists = users.find(
        u => u.email === email.toLowerCase() || u.phone === phone
      )

      if (userExists) {
         return this._sendResponse(res, {
           status: 409,
           message: 'User already registered'
         })
      }

      // Create user
      const created = await modelTools.create(this._userPath, [{
        firstName,
        lastName,
        email: email.toLowerCase(),
        phone,
        gender,
        dob
      }])

      const newUser = created[this._entity]?.[0]

      if (!newUser?._id) {
         return this._sendResponse(res, {
           status: 409,
           message: 'Registration failed. Please try again.'
         })
      }

      // Successful response
      return this._sendResponse(res, {
        status: 201,
        data: newUser,
        message: 'User registered successfully'
      })
  }

  /**
   * Update an existing user
   *
   * Steps:
   * 1. Get and validate userId
   * 2. Fetch the user
   * 3. Sanitize provided fields
   * 4. Validate payload
   * 5. Check email/phone conflicts
   * 6. Update user safely (ignore undefined fields)
   * 7. Return response
   *
   * @param {import('http').IncomingMessage} req
   * @param {import('http').ServerResponse} res
   */
  updateUser = async (req, res) => {
      const userId = Number(this._getUserId(req)?.userId)
      this._validateUserId(userId)

      const foundUser = (await this._getUser(userId))[0]
      if (!foundUser) {
        return this._sendResponse(res, { status: 404, message: 'User not found' })
      }

      const data = this._getSanitizedData(req)

      // VALIDATION (only provided fields)
      const validation = Validator.validateUserPayload(data)
      if (!validation.valid) {
        return this._sendResponse(res, {
          status: 400,
          message: validation.errors.join(', ')
        })
      }

      const { email, phone } = data

      // Check for email/phone conflicts with other users
      if (email || phone) {
        const users = await this._getUsers()
        const conflict = users.find(
          u =>
            u._id !== foundUser._id &&
            (u.email === email?.toLowerCase() || u.phone === phone)
        )

        if (conflict) {
          return this._sendResponse(res, {
            status: 409,
            message: 'Email or phone already in use'
          })
        }
      }

      // SAFE UPDATE PAYLOAD (remove undefined values)
      const updatePayload = Object.fromEntries(
        Object.entries({
          ...data,
          email: data.email?.toLowerCase()
        }).filter(([, v]) => v !== undefined)
      )

      const updated = await this._updateUser(foundUser._id, [updatePayload])
      const updatedUser = updated[this._entity]?.[0]

      if (!updatedUser?._id) {
        return this._sendResponse(res, {
          status: 409,
          message: 'User update failed'
        })
      }

      return this._sendResponse(res, {
        status: 200,
        message: 'User updated successfully',
        data: updatedUser
      })
  }

  /**
   * Get all users
   *
   * @param {import('http').IncomingMessage} req
   * @param {import('http').ServerResponse} res
   */
  getUsers = async (req, res) => {
      const users = await this._getUsers()

      return this._sendResponse(res, {
        status: 200,
        data: { numberOfUsersInDb: users.length, users },
        message: users.length ? 'Users fetched successfully.' : 'No users found'
      })
  }

  /**
   * Get a single user by ID
   *
   * @param {import('http').IncomingMessage} req
   * @param {import('http').ServerResponse} res
   */
  getUser = async (req, res) => {
    const userId = Number(this._getUserId(req)?.userId)
    this._validateUserId(userId)

    const user = (await this._getUser(userId))[0]

    if (!user) {
      return this._sendResponse(res, {
        status: 404,
        data: null,
        message: 'User not found'
      })
    }

    return this._sendResponse(res, {
      status: 200,
      data: user,
      message: 'User fetched successfully.'
    })
  }

  /**
   * Delete a user by ID
   *
   * @param {import('http').IncomingMessage} req
   * @param {import('http').ServerResponse} res
   */
  deleteUser = async (req, res) => {
      const userId = Number(this._getUserId(req)?.userId)
      this._validateUserId(userId)

      const deletedUser = (await this._deleteUser(userId))[this._entity]?.[0]

      if (!deletedUser) {
        return this._sendResponse(res, {
          status: 404,
          message: 'User not found',
          data: null
        })
      }

      return this._sendResponse(res, {
        status: 200,
        message: 'User deleted successfully.',
        data: deletedUser
      })
  }

  //=====================================================
  //  PRIVATE METHODS & PROPERTIES
  //=====================================================

  /** Path to the user JSON file */
  _userPath = './model/users/users.json'

  /** Entity key extracted from file path */
  _entity = modelTools._extractEntityFromPath(this._userPath)

  /**
   * Fetch all users
   * @returns {Promise<Array>} Array of users
   */
  _getUsers = async () => {
    const raw = await modelTools.findAll(this._userPath)
    return raw[this._entity]
  }

  /**
   * Fetch a single user by ID
   * @param {number} _id
   * @returns {Promise<Object[]>} Array with the found user
   */
  _getUser = async (_id) => {
    const raw = await modelTools.findOne(this._userPath, _id)
    return raw[this._entity]
  }

  /**
   * Update a user by ID
   * @param {number} _id
   * @param {Array<Object>} data - Array of update payloads
   */
  _updateUser = async (_id, data) =>
    modelTools.update(this._userPath, data, _id)

  /**
   * Delete a user by ID
   * @param {number} _id
   */
  _deleteUser = async (_id) =>
    modelTools.delete(this._userPath, _id)

  /**
   * Sanitize incoming request data
   * Only strings are validated & sanitized
   *
   * @param {import('http').IncomingMessage} req
   * @returns {Object} Sanitized user data
   */
  _getSanitizedData = (req) => {
    const sanitize = (v) => this._validateAndSanitizeString(v)

    return {
      firstName: sanitize(req.body?.firstName),
      lastName: sanitize(req.body?.lastName),
      email: sanitize(req.body?.email),
      phone: sanitize(req.body?.phone),
      gender: sanitize(req.body?.gender),
      dob: sanitize(req.body?.dob)
    }
  }

  /**
   * Extract userId from request
   *
   * @param {import('http').IncomingMessage} req
   * @returns {Object} Object with userId
   */
    _getUserId = (req) => {
    //route params and query params are attached 
    // to to req at route level and can be access here freely
    //the ids contains any/all ids specified in a given 
    // route as sent from the client
    return req.ids
  }
  /**
   * Validate userId
   * @param {number} _id
   * @throws {Error} if userId is invalid
   */
  _validateUserId = (_id) => {
    if (!Number.isInteger(_id) || Number(_id) <= 0) {
      throw new Error('Valid userId is required')
    }
  }
}

// Export singleton instance
export default new UsersController()


