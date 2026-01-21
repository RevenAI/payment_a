import { modelTools } from '../../model/model-tools.js'
import { AppError } from '../../utils/errors/error.utils.js'
import { Password } from '../../utils/security/password.js'
import { TokenService } from './token.service.js'

const USER_PATH = './model/users/users.json'
const ENTITY = modelTools._extractEntityFromPath(USER_PATH)

export class AuthService {

  static async register({ email, password, ...rest }) {
    const raw = await modelTools.findAll(USER_PATH)
    const users = raw[ENTITY]

    if (users.find(u => u.email === email)) {
      throw AppError.Conflict('User already registered')
    }

    const hashedPassword = Password.hash(password)

    const created = await modelTools.create(USER_PATH, [
      { email, password: hashedPassword, ...rest }
    ])

    const user = created[ENTITY][0]

    const token = TokenService.sign({
      userId: user._id,
      email: user.email
    })

    delete user.password

    return { user, token }
  }

  static async login({ email, password }) {
    const raw = await modelTools.findAll(USER_PATH)
    const user = raw[ENTITY].find(u => u.email === email)

    if (!user || !Password.verify(password, user.password)) {
      throw new Error('Invalid credentials')
    }

    const token = TokenService.sign({
      userId: user._id,
      email: user.email
    })

    const safeUser = { ...user }
    delete safeUser.password

    return { user: safeUser, token }
  }
}
