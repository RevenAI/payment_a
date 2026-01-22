import crypto from 'node:crypto'

const ITERATIONS = 100_000
const KEYLEN = 64
const DIGEST = 'sha512'

export class Password {

  static hash(password) {
    const salt = crypto.randomBytes(16).toString('hex')

    const hash = crypto
      .pbkdf2Sync(password, salt, ITERATIONS, KEYLEN, DIGEST)
      .toString('hex')

    return `${salt}:${hash}`
  }

  /**
   * 
   * @param {*} password Incomming password to verify
   * @param {*} stored Password already stored
   * @returns 
   */
  static isMatch(password, stored) {
    const [salt, originalHash] = stored.split(':')

    const hash = crypto
      .pbkdf2Sync(password, salt, ITERATIONS, KEYLEN, DIGEST)
      .toString('hex')

    return crypto.timingSafeEqual(
      Buffer.from(hash, 'hex'),
      Buffer.from(originalHash, 'hex')
    )
  }
}
