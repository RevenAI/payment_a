import { TokenService } from "../../services/auth/token.service.js"


export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    res.writeHead(401)
    return res.end(JSON.stringify({ message: 'Unauthorized' }))
  }

  const token = authHeader.split(' ')[1]
  const decoded = TokenService.verify(token)

  if (!decoded) {
    res.writeHead(401)
    return res.end(JSON.stringify({ message: 'Invalid or expired token' }))
  }

  req.user = decoded
  next()
}
