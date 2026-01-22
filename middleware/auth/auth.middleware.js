import { PATH } from "../../config/config.js"
import { modelTools } from "../../model/model-tools.js"
import { TokenService } from "../../services/auth/token.service.js"
import { AppError } from "../../utils/errors/error.utils.js"
import { httpUtils } from "../../utils/http.utils.js"

export class Auth {

static async isAuthenticated(req, res) {
  try {
    const decoded = this.authenticate(req, res)
    if (!decoded) {
    return httpUtils.sendResponse(res, {
      status: 401,
      message: 'Access denied: Please login to continue',
    })
    }

    const raw = await modelTools.findAll(PATH.USER_PATH)
    const user = raw[ENTITY].find(u => u.email === decoded.email)

    const isBadLogin = !user._id
    if (isBadLogin) {
      return httpUtils.sendResponse(res, {
      status: 401,
      message: 'Access denied: Invalid login detected.',
    })
    }
    
    //attach auth payload to request and proceed
    req.user = decoded 
  } catch (error) {
    AppError.handleCatchBlockError(res, error)
  }
}

static authenticate(req, res) {
  try {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return httpUtils.sendResponse(res, {
      status: 401,
      message: 'Access denied: Please login to continue',
    })
  }

  const token = authHeader.split(' ')[1]
  const decoded = TokenService.verify(token)

  if (!decoded || !decoded?.userId || !decoded?.email) {
   return httpUtils.sendResponse(res, {
      status: 401,
      message: 'Invalid or expired token',
    })
  }

  return decoded
  } catch (error) {
    AppError.handleCatchBlockError(res, error)
  }
}


}
