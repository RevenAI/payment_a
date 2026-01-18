import { modelTools } from "../../model/model-tools.js"
import { router } from "../../routes/routers.js"
import { BaseController } from "../base.controller.js"
import { Validator } from "../../validators/validator.js"

class Users extends BaseController {

  //=====================================================
  //  PUBLIC METHODS
  //=====================================================

  async registerUser(req, res) {
    try {
      const data = this._getSanitizedData(req)
      const { firstName, lastName, email, phone, gender, dob } = data

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

      return this._sendResponse(res, {
        status: 201,
        data: newUser,
        message: 'User registered successfully'
      })

    } catch (error) {
      this._handleCatchBlockError(res, error)
    }
  }

  async updateUser(req, res) {
    try {
      const userId = this._getUserId(req)
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

      // SAFE UPDATE PAYLOAD (no undefined overwrite)
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

    } catch (error) {
      this._handleCatchBlockError(res, error)
    }
  }

  async getUsers(req, res) {
    try {
      const users = await this._getUsers()

      return this._sendResponse(res, {
        status: 200,
        data: { numberOfUsersInDb: users.length, users },
        message: users.length ? 'Users fetched successfully.' : 'No users found'
      })
    } catch (error) {
      this._handleCatchBlockError(res, error)
    }
  }

  async getUser(req, res) {
    try {
      const userId = this._getUserId(req)
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
    } catch (error) {
      this._handleCatchBlockError(res, error)
    }
  }

  async deleteUser(req, res) {
    try {
      const userId = this._getUserId(req)
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
    } catch (error) {
      this._handleCatchBlockError(res, error)
    }
  }

  //=====================================================
  //  PRIVATE METHODS
  //=====================================================

  _userPath = './model/users/users.json'
  _entity = modelTools._extractEntityFromPath(this._userPath)

  _getUsers = async () => {
    const raw = await modelTools.findAll(this._userPath)
    return raw[this._entity]
  }

  _getUser = async (_id) => {
    const raw = await modelTools.findOne(this._userPath, _id)
    return raw[this._entity]
  }

  _updateUser = async (_id, data) =>
    modelTools.update(this._userPath, data, _id)

  _deleteUser = async (_id) =>
    modelTools.delete(this._userPath, _id)

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

  _getUserId = (req) => {
    const routeParam = router._getParams(req).routeParam
    const id = Number(
      typeof routeParam === 'string'
        ? routeParam.replace(/^\//, '')
        : routeParam
    )
    return Number.isNaN(id) ? null : id
  }

  _validateUserId = (_id) => {
    if (!Number.isInteger(_id) || _id <= 0) {
      throw new Error('Valid userId is required')
    }
  }
}

export default new Users()
