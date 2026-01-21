
# This is essentially a **manual implementation of JWT (JSON Web Token)** using Node’s `crypto` module designed for this code node.js app.

Take your time reading this — this is *core backend security knowledge*.

---

# 0️⃣ Big Picture (Before Code)

This class does **stateless authentication**.

Instead of:

* Server storing sessions in memory / DB

You:

* **Sign** a token once
* Client sends it on every request
* Server **verifies** it without storing anything

That’s what JWT is.

---

# 1️⃣ Imports & Constants

```js
import crypto from 'node:crypto'
```

### What is `crypto`?

Node’s **standard cryptography library**:

* Hashing
* HMAC
* Encryption
* Secure random bytes
* Timing-safe comparisons

No external dependencies → very reliable.

---

```js
const SECRET = process.env.JWT_SECRET || 'super-secret-key'
```

### SECRET explained

This is the **HMAC signing key**.

* Only the server knows it
* Used to **sign** tokens
* Used again to **verify** tokens

If this leaks → **all tokens become forgeable**

⚠️ In production:

```bash
JWT_SECRET=long-random-256-bit-value
```

Never hardcode secrets.

---

```js
const EXPIRES_IN = 60 * 60 // 1 hour
```

### Why tokens expire

* Prevents stolen tokens from working forever
* Limits damage window
* Forces re-authentication

This is **mandatory** in real systems.

---

# 2️⃣ What is a JWT (Structure)

JWT has **3 parts**:

```txt
HEADER.PAYLOAD.SIGNATURE
```

Example:

```txt
eyJhbGciOiJIUzI1NiJ9
.
eyJ1c2VySWQiOjEsImV4cCI6MTcwMDAwMDAwMH0
.
X9fJz...
```

Each part is:

* Base64URL encoded
* Joined by dots

---

# 3️⃣ TokenService.sign(payload)

This **creates** a token.

---

## 3.1️⃣ Header

```js
const header = Buffer.from(
  JSON.stringify({ alg: 'HS256', typ: 'JWT' })
).toString('base64url')
```

### Header meaning

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

* `alg`: algorithm used to sign
* `typ`: token type

`HS256` = **HMAC + SHA-256**

⚠️ Header is **not encrypted**
Anyone can read it.

---

## 3.2️⃣ Payload (Claims)

```js
const body = Buffer.from(
  JSON.stringify({
    ...payload,
    exp: Math.floor(Date.now() / 1000) + EXPIRES_IN
  })
).toString('base64url')
```

### Payload contains:

* Your data (userId, role, email, etc.)
* `exp` → expiration timestamp (seconds)

Example decoded payload:

```json
{
  "userId": 42,
  "role": "admin",
  "exp": 1700000000
}
```

⚠️ Payload is **readable by anyone**
Never store:

* Passwords
* Secrets
* PII

JWT ≠ encryption.

---

## 3.3️⃣ Signature (MOST IMPORTANT PART)

```js
const signature = crypto
  .createHmac('sha256', SECRET)
  .update(`${header}.${body}`)
  .digest('base64url')
```

### What this does

* Creates a **cryptographic fingerprint**
* Tied to:

  * Header
  * Payload
  * SECRET

Even **1 character change** breaks the signature.

---

### Why HMAC?

HMAC ensures:

* Integrity (no tampering)
* Authenticity (server created it)

Only someone with the **SECRET** can create a valid signature.

---

## 3.4️⃣ Final Token

```js
return `${header}.${body}.${signature}`
```

That’s your JWT 🎉

---

# 4️⃣ TokenService.verify(token)

This **validates** a token.

---

## 4.1️⃣ Split token

```js
const [header, payload, signature] = token.split('.')
if (!header || !payload || !signature) return null
```

Why?

* Invalid format
* Malformed token
* Truncated token

Fail fast.

---

## 4.2️⃣ Recreate expected signature

```js
const expectedSig = crypto
  .createHmac('sha256', SECRET)
  .update(`${header}.${payload}`)
  .digest('base64url')
```

This must produce the **same signature** as when it was signed.

If payload was modified → signature changes.

---

## 4.3️⃣ Timing-safe comparison

```js
crypto.timingSafeEqual(
  Buffer.from(signature),
  Buffer.from(expectedSig)
)
```

### Why timing-safe?

Prevents **timing attacks**.

Without it:

* Attacker could guess signature byte-by-byte
* Measure response times

This is **professional-grade security** 👍

---

## 4.4️⃣ Decode payload

```js
const decoded = JSON.parse(
  Buffer.from(payload, 'base64url').toString()
)
```

At this point:

* Token is authentic
* Data is trustworthy

But not yet valid.

---

## 4.5️⃣ Expiration check

```js
if (decoded.exp < Math.floor(Date.now() / 1000)) {
  return null
}
```

If expired:

* Reject token
* Force re-login

Never skip this step.

---

## 4.6️⃣ Return decoded payload

```js
return decoded
```

This becomes:

```js
req.user = decoded
```

Used for:

* Authorization
* Access control
* Personalization

---

# 5️⃣ What THIS implementation does right ✅

✔ No dependencies
✔ HMAC (secure)
✔ Expiration enforced
✔ Timing-safe comparison
✔ Stateless authentication

This is **solid engineering**.

---

# 6️⃣ What it intentionally does NOT do ❌

❌ No encryption (by design)
❌ No refresh tokens
❌ No token revocation
❌ No issuer (`iss`) / audience (`aud`)
❌ No key rotation

These are **advanced features**.

---

# 7️⃣ JWT vs Sessions (Mental Model)

| Feature               | JWT | Session |
| --------------------- | --- | ------- |
| Stored on server      | ❌   | ✅       |
| Stateless             | ✅   | ❌       |
| Scales easily         | ✅   | ❌       |
| Can be revoked easily | ❌   | ✅       |
| Works across services | ✅   | ❌       |

---

# 8️⃣ Common Mistakes (Very Important)

🚨 Storing sensitive data in JWT
🚨 No expiration
🚨 Using weak secret
🚨 Not validating signature
🚨 Using JWT as encryption

---

# 9️⃣ Production Enhancements (Next Level)

Later you’ll want:

* Refresh tokens
* Key rotation
* RS256 (public/private key)
* Token blacklisting
* `iss`, `aud`, `nbf`

But **master THIS first**.

---

# 🔟 Golden Rules (Memorize)

🔐 JWT is **signed**, not encrypted
🔑 SECRET must never leak
⏱ Always check expiration
🧠 Trust token only after verification

---

