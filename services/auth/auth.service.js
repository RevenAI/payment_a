import { PATH } from '../../config/config.js'
import { modelTools } from '../../model/model-tools.js'
import { AppError } from '../../utils/errors/error.utils.js'
import { Password } from '../../utils/security/password.js'
import { TokenService } from './token.service.js'

const USER_PATH = PATH.USER_PATH
const ENTITY = modelTools._extractEntityFromPath(USER_PATH)

/**
 * In-memory token blacklist.
 * 
 * ⚠️ NOTE:
 * - This should be replaced with Redis or DB storage in production
 * - Tokens are stored until they naturally expire
 */
const tokenBlacklist = new Set()

/**
 * AuthService
 *
 * Handles authentication-related operations:
 * - Login
 * - Logout
 * - Token invalidation
 *
 * This service is stateless except for the token blacklist.
 */
export class AuthService {

  /**
   * Authenticate a user and issue a JWT
   *
   * Steps:
   * 1. Fetch users
   * 2. Find user by email
   * 3. Verify password hash
   * 4. Sign JWT
   * 5. Return safe user data + token
   *
   * @param {Object} payload
   * @param {string} payload.email
   * @param {string} payload.password
   * @returns {Promise<{ user: Object, token: string }>}
   */
  static async login({ email, password }) {
    const raw = await modelTools.findAll(USER_PATH)
    const user = raw[ENTITY].find(u => u.email === email)

    if (!user || !user._id || !user.email) {
      throw AppError.NotFound('User not registered')
    }

    const isPasswordValid = Password.isMatch(password, user.password)
    if (!isPasswordValid) {
      throw AppError.UnprocessableEntity('Incorrect password')
    }

    const token = TokenService.sign({
      userId: user._id,
      email: user.email
    })

    // Remove sensitive data before returning
    const safeUser = { ...user }
    delete safeUser.password

    return { user: safeUser, token }
  }

  /**
   * Logout a user by invalidating their JWT
   *
   * HOW IT WORKS:
   * - The token is added to a blacklist
   * - All protected routes must check this blacklist
   * - Once expired, the token can be safely removed
   *
   * @param {string} token - JWT to invalidate
   * @returns {{ success: boolean }}
   */
  static logout(token) {
    if (!token) {
      throw AppError.BadRequest('Missing token or user already logout')
    }

    tokenBlacklist.add(token)

    return { success: true }
  }

  /**
   * Check if a token has been revoked
   *
   * Used by authentication middleware before allowing access.
   *
   * @param {string} token
   * @returns {boolean}
   */
  static isTokenRevoked(token) {
    return tokenBlacklist.has(token)
  }
}
