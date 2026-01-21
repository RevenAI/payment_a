import { AppError } from "../utils/errors/error.utils.js"
import { Helpers } from "../utils/helper.utils.js"
import { httpUtils } from "../utils/http.utils.js"

export class BaseController {

  _sendResponse(res, { status, data, message, error }) {
    return httpUtils.sendResponse(res, { status, data, message, error })
  }

  _validateAndSanitizeString(strings) {
    const validate = (v) => Helpers.sanitizeAndEscape(v)

    if (typeof strings === 'string') {
      const parts = strings.split(',')
      if (parts.length === 1) {
        return validate(parts[0])
      } else {
        return parts.map(validate)
      }
    }

    if (Array.isArray(strings)) {
      return strings.map(validate)
    }

    //return without throwing for undefined or null values
    return
  }

  _handleCatchBlockError(res, error) {
    AppError.handleCatchBlockError(res, error)
  }
 
  // _handleCatchBlockError(res, error) {
  //   this._sendResponse(res, {
  //     status: error.status || 500,
  //     error: error.message || String(error),
  //     message: error.message || 'Internal server error'
  //   })
  // }

}
