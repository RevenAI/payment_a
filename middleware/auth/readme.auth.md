
---

# 0️⃣ What This Code *Is*

This is a **manual authentication middleware**.

In Framework like Express we’d write:

```js
app.use(Auth.isAuthenticated)
```

But since we’re using **raw Node HTTP**, we’re implementing that behavior ourselves.

This code:

* Extracts the JWT from the request
* Verifies it
* Attaches the authenticated user to `req`
* Blocks unauthenticated requests

---

# 1️⃣ Imports

```js
import { TokenService } from "../../services/auth/token.service.js"
```

This is our **JWT engine**:

* `sign()` → creates token
* `verify()` → validates token

Auth depends on TokenService.

---

```js
import { AppError } from "../../utils/errors/error.utils.js"
```

This centralizes error handling:

* Prevents leaking stack traces
* Keeps consistent error responses
* Prevents server crashes

---

```js
import { httpUtils } from "../../utils/http.utils.js"
```

This ensures:

* All responses have the same structure
* Status codes are consistent
* JSON is always returned

---

# 2️⃣ Auth Class (Why a Class?)

```js
export class Auth {
```

Why a class instead of functions?

* Logical grouping
* Namespacing
* Static utility behavior

This is a **service**, not an instance.

---

# 3️⃣ isAuthenticated(req, res)

This is the **entry point**.

```js
static isAuthenticated(req, res) {
```

Think of this as:

> “Before allowing this request to continue, check if the user is logged in.”

---

## 3.1️⃣ Call authenticate()

```js
const decoded = this.authenticate(req, res)
```

This:

* Extracts token
* Verifies token
* Returns decoded payload OR null

---

## 3.2️⃣ Block unauthenticated users

```js
if (!decoded) {
  return httpUtils.sendResponse(res, {
    status: 401,
    message: 'Access denied: Please login to continue',
  })
}
```

Why **401**?

* 401 = *Unauthenticated*
* 403 = *Authenticated but not allowed*

This is correct semantics.

---

## 3.3️⃣ Attach user to request

```js
req.user = decoded
```

This is **CRUCIAL**.

From now on:

```js
req.user.userId
req.user.role
```

Controllers don’t need to:

* Parse tokens
* Re-authenticate
* Re-verify

This is **separation of concerns**.

---

## 3.4️⃣ Why no `next()`?

Because we’re not using Express.

In our system:

* The request continues naturally
* If response is sent → request ends
* If not → router/controller executes

---

# 4️⃣ authenticate(req, res)

This is the **core logic**.

```js
static authenticate(req, res) {
```

This function:

* Does NOT send responses normally
* Returns decoded data
* Sends responses only on failure

---

## 4.1️⃣ Read Authorization header

```js
const authHeader = req.headers.authorization
```

HTTP request example:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

---

## 4.2️⃣ Validate header format

```js
if (!authHeader || !authHeader.startsWith('Bearer ')) {
```

Why this matters:

* Prevents malformed tokens
* Prevents missing tokens
* Enforces standard format

---

### Why "Bearer"?

Bearer means:

> Whoever holds this token is authenticated

No passwords, no re-check.

---

## 4.3️⃣ Extract token

```js
const token = authHeader.split(' ')[1]
```

This splits:

```txt
Bearer <TOKEN>
```

Token alone is what we verify.

---

## 4.4️⃣ Verify token

```js
const decoded = TokenService.verify(token)
```

This checks:

* Signature
* Expiration
* Integrity

Returns:

* Decoded payload → valid
* `null` → invalid or expired

---

## 4.5️⃣ Reject invalid tokens

```js
if (!decoded) {
  return httpUtils.sendResponse(res, {
    status: 401,
    message: 'Invalid or expired token',
  })
}
```

This blocks:

* Tampered tokens
* Expired tokens
* Fake tokens

---

## 4.6️⃣ Return decoded payload

```js
return decoded
```

This goes back to:

```js
const decoded = this.authenticate(...)
```

---

# 5️⃣ Why two functions?

You may ask:

> Why not put everything in `isAuthenticated`?

Answer:

* `authenticate()` = logic
* `isAuthenticated()` = policy

Later `authenticate()` can be reused for:

* Optional auth routes
* WebSocket auth
* Token refresh
* Admin checks

This is **clean architecture**.

---

# 6️⃣ Error Handling Strategy

```js
catch (error) {
  AppError.handleCatchBlockError(res, error)
}
```

Why wrap everything?

* Crypto errors
* JSON parse errors
* Unexpected crashes

This ensures:

* No server crash
* Controlled response
* No leaked stack traces

---

# 7️⃣ Request Lifecycle (End-to-End)

### Incoming request:

```http
GET /users
Authorization: Bearer <token>
```

### Flow:

1. `Auth.isAuthenticated`
2. `authenticate`
3. Token verified
4. `req.user` attached
5. Controller executes
6. Response sent

If token invalid → request dies early.

---

# 8️⃣ How Controllers Use This

```js
getUsers(req, res) {
  console.log(req.user.userId)
}
```

No JWT logic in controller.

This is **how professionals design APIs**.

---

# 9️⃣ Security Properties Achieved

✔ Stateless authentication
✔ Tamper-proof tokens
✔ Expiration enforced
✔ No password exposure
✔ Clean separation of concerns

---

# 🔟 Common Mistakes (You Avoided)

❌ Decoding JWT without verifying
❌ Storing auth logic in controllers
❌ Forgetting expiration
❌ Using localStorage blindly (XSS risk)
❌ Returning raw errors

---

# 🧠 Mental Model (Memorize This)

* **TokenService** → cryptography
* **Auth** → policy enforcement
* **Controller** → business logic
* **Router** → request mapping

Each layer does ONE job.

---
