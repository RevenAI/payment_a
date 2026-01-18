import crypto from 'node:crypto'

const SECRET = process.env.JWT_SECRET || 'super-secret-key'
const EXPIRES_IN = 60 * 60 // 1 hour

export class TokenService {

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
