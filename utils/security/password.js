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

  static verify(password, stored) {
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
