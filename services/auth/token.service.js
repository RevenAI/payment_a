import crypto from 'node:crypto'
// import { AppError } from '../../utils/errors/error.utils'
// import { modelTools } from '../../model/model-tools'
// import { PATH } from '../../config/config'

const SECRET = process.env.JWT_SECRET || 'super-secret-key'
const EXPIRES_IN = 60 * 60 //1 hour 

export class TokenService {

  //wrapper for convinience
  /**
   * @description generate token and persists it to db with unique Id
   * @param {*} payload 
   * @returns 
   */
  // static async generateToken(payload, userId) {
  //   const token = this.sign(payload)
  //   //userId is the tokenId -> token will not be found if defferent 
  //   // user that doesnt sign it uses it
  // await modelTools.create(PATH.USER_TOKEN, [{ tokenId: userId, token}])
  // return token
  // }

  // static async verifyToken(token) {
  //   const verified = this.verify(token)
  //   const raw = await modelTools.findAll(PATH.USER_TOKEN)
  //   const found = (raw[modelTools._extractEntityFromPath(PATH.USER_TOKEN)] || []).find(tkn => {
  //     tkn.tokenId === verified.userId
  //   })
  //   if (!found) {
  //     throw AppError.Forbidden('Access denied: Token is not valid')
  //   }
  //   return verified
  // }
  
  //main methods
  static sign(payload) {
    const header = Buffer.from(
      JSON.stringify({ alg: 'HS256', typ: 'JWT' })
    ).toString('base64url')

    const body = Buffer.from(
      JSON.stringify({
        ...payload,
        exp: Math.floor(Date.now() / 1000) + EXPIRES_IN
      })
    ).toString('base64url')

    const signature = crypto
      .createHmac('sha256', SECRET)
      .update(`${header}.${body}`)
      .digest('base64url')

    return `${header}.${body}.${signature}`
  }

  static verify(token) {
    const [header, payload, signature] = token.split('.')
    if (!header || !payload || !signature) return null

    const expectedSig = crypto
      .createHmac('sha256', SECRET)
      .update(`${header}.${payload}`)
      .digest('base64url')

    if (!crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSig)
    )) {
      return null
    }

    const decoded = JSON.parse(
      Buffer.from(payload, 'base64url').toString()
    )

    if (decoded.exp < Math.floor(Date.now() / 1000)) {
      return null
    }

    return decoded
  }

  
}
