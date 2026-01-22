# LEARN THE PASSWORD PATTERN SINCE THE APP IS WRITTEN IN CORE NODE.JS

# 1️⃣ Importing crypto

```js
import crypto from 'node:crypto'
```

### What this is

* Node.js built-in cryptography module
* No external library needed

### Why we need it

Passwords **must never** be stored as plain text.
`crypto` gives us:

* Secure random data
* Password hashing functions
* Timing-safe comparisons

---

# 2️⃣ Security constants

```js
const ITERATIONS = 100_000
const KEYLEN = 64
const DIGEST = 'sha512'
```

These define **how strong the hash is**.

---

## 🔁 ITERATIONS (100,000)

### What it means

* Number of times the hash function is run

### Why it matters

* Slows down attackers
* Makes brute-force attacks expensive

💡 If a hacker steals your DB, they can’t try billions of passwords per second.

---

## 🔑 KEYLEN (64 bytes)

### What it means

* Length of the derived key (hash output)

### Why it matters

* Longer output = stronger hash
* 64 bytes = **512 bits**

---

## 🔐 DIGEST ('sha512')

### What it means

* Hash algorithm used internally

### Why sha512?

* Cryptographically strong
* Designed for security, not speed

---

# 3️⃣ The Password class

```js
export class Password {
```

### Why a class?

* Clear responsibility
* Reusable
* Testable
* No need to instantiate (static methods)

---

# 4️⃣ Hashing a password

```js
static hash(password) {
```

This is used when:

* A user registers
* A user changes password

---

## 4.1 Generate a salt

```js
const salt = crypto.randomBytes(16).toString('hex')
```

### What is a salt?

* A random value added to the password before hashing

### Why it’s critical

Without salt:

* Same password → same hash
* Rainbow table attacks become easy

With salt:

* Same password → **different hash every time**

Example:

```txt
password123 → a9f3...
password123 → 91bc...
```

Even though the password is the same.

---

## 4.2 Hash the password

```js
const hash = crypto
  .pbkdf2Sync(password, salt, ITERATIONS, KEYLEN, DIGEST)
  .toString('hex')
```

### pbkdf2Sync explained

PBKDF2 = **Password-Based Key Derivation Function**

It:

1. Takes the password
2. Mixes it with salt
3. Runs it ITERATIONS times
4. Produces a strong derived key

### Why PBKDF2?

* Designed specifically for passwords
* Resistant to GPU attacks
* Industry standard

---

## 4.3 Store salt and hash together

```js
return `${salt}:${hash}`
```

### Why store salt with the hash?

* You need the same salt to verify later
* Salt is **not secret**

Example stored value:

```txt
a3f91c8b...:fbc192d4...
```

This is what goes into your database.

---

# 5️⃣ Verifying a password (login)

```js
static verify(password, stored) {
```

Used when:

* User logs in
* Password needs verification

---

## 5.1 Extract salt and hash

```js
const [salt, originalHash] = stored.split(':')
```

Because we stored it as:

```txt
salt:hash
```

---

## 5.2 Hash the incoming password again

```js
const hash = crypto
  .pbkdf2Sync(password, salt, ITERATIONS, KEYLEN, DIGEST)
  .toString('hex')
```

### Important concept

You **never decrypt** passwords.

Instead:

* Hash the input password
* Compare it to the stored hash

---

# 6️⃣ Timing-safe comparison (VERY IMPORTANT)

```js
return crypto.timingSafeEqual(
  Buffer.from(hash, 'hex'),
  Buffer.from(originalHash, 'hex')
)
```

### Why not `===`?

`===` is vulnerable to **timing attacks**.

Attackers can:

* Measure how long comparisons take
* Guess passwords one byte at a time

---

### timingSafeEqual protects against that

* Always takes the same time
* Prevents side-channel attacks

This is **security-critical**.

---

# 7️⃣ Full flow example

### Registration

```js
const hashedPassword = Password.hash('mypassword')
// store hashedPassword in DB
```

### Login

```js
const isValid = Password.verify('mypassword', user.password)
if (!isValid) throw new Error('Invalid credentials')
```

---

# 8️⃣ Why this approach is correct

✅ Passwords are never stored in plain text
✅ Each password is uniquely salted
✅ Resistant to rainbow tables
✅ Resistant to timing attacks
✅ Uses industry-approved algorithms

This is **how real authentication systems work**.

---

# 9️⃣ One thing to improve later (advanced)

In production, you may want:

* `pbkdf2` (async) instead of `pbkdf2Sync`
* Or `bcrypt`, `argon2`, `scrypt`

But **this is already solid for our simple app and current use case**.

---

