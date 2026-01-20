
---

# 💳 Core Node.js Payment Application

A **framework-free payment application** built with **pure Node.js** to demonstrate how backend systems work **from first principles** — routing, controllers, authentication, validation, persistence, and payments — without Express, NestJS, or any external libraries.

This project is designed for **learners** who want to **understand backend engineering deeply**, not just use abstractions.

---

## 🎯 Project Goals

* Teach **how backend frameworks work internally**
* Build a **realistic payment system** using:

  * Core Node.js (`http`, `fs`, `crypto`)
  * Custom routing
  * Token-based authentication
  * File-based persistence (JSON)
* Keep everything **explicit**, readable, and debuggable

---

## 🧱 Tech Stack

| Area             | Technology                                   |
| ---------------- | -------------------------------------------- |
| Runtime          | Node.js (Core APIs only)                     |
| Server           | `http.createServer`                          |
| Storage          | JSON files (`fs/promises`)                   |
| Auth             | Custom JWT-like tokens (`crypto`)            |
| Architecture     | MVC-inspired (Controllers, Services, Models) |
| Validation       | Custom Validators                            |
| Password Hashing | `crypto.pbkdf2`                              |
| Payments         | Simulated payment workflow                   |

> ❌ No Express
> ❌ No ORMs
> ❌ No third-party auth libraries

---

## 📁 Project Structure

```
src/
│
├── index.js                # Entry point (http server)
│
├── routes/
│   ├── routers.js           # Custom router & route matcher
│
├── controllers/
│   ├── base.controller.js   # Shared response & sanitization logic
│   ├── users/
│   │   └── users.controller.js
│   ├── products/
│   │   └── products.controller.js
│   └── payments/
│       └── payments.controller.js
│
├── services/
│   ├── auth/
│   │   └── token.service.js # Token sign / verify
│   └── payments/
│       └── payment.service.js
│
├── middleware/
│   └── auth.guard.js        # Authentication guard
│
├── model/
│   db |---
├──  model-tools.js       # File-based CRUD engine
│     ├── users/
│     │   └── users.json
│     ├── products/
│     │   └── products.json
│     └── payments/
│         └── payments.json
│
└── utils/
    └── helpers.js
    ├── validator.js         # Email, phone, DOB, gender, etc.
```

---

## 🔁 Request Lifecycle (How It Works)

1. **HTTP request hits `index.js`**
2. Request is passed to **custom router**
3. Router matches:

   * HTTP method
   * Path
   * Route parameters
4. Controller is executed
5. Controller:

   * Sanitizes input
   * Validates payload
   * Authenticates user (if needed)
   * Calls model/service
6. Response is manually written using `res.writeHead()` and `res.end()`

---

## 🧭 Routing System (No Express)

Routes are matched manually using:

* `req.method`
* `req.url`
* Regex-based path matching

Example:

```js
router.isPostRoute(req, '/users/register') {
    //Can do some API calls here
    //for eample
    return usersController.registerUser
}
```

Route params like:

```
/users/3
```

are extracted manually inside the router.

---

## 🔐 Authentication

### Token-Based Authentication (JWT-like)

* Tokens are signed using Node’s `crypto`
* No external JWT libraries
* Tokens contain:

  * user ID
  * role
  * expiry timestamp

### Authentication Guard

```js
const user = authenticate(req, res)
if (!user) return
req.user = user
```

✔ Explicit
✔ Framework-independent
✔ Easy to reason about

---

## 🧪 Validation Strategy

Validation is **centralized** and **reusable**.

### Supported Validations

* Email format
* Phone digits & length
* Date of birth (must be valid & in the past)
* Gender (allowed values)

Example:

```js
Validator.validateUserPayload(payload)
```

Errors are returned early to keep controllers clean.

---

## 🧼 Sanitization

All incoming strings are:

* Trimmed
* Normalized
* Stripped of unsafe values

Handled in:

```
BaseController._validateAndSanitizeString()
```

Sanitization **always runs before validation**.

---

## 💾 Data Persistence (ModelTools)

Instead of a database, the app uses **JSON files** to teach:

* How CRUD works internally
* How IDs are generated
* How updates & deletes affect storage

### Features

* Auto-creates directories/files
* Safe `_id` handling
* Prevents `_id` mutation on updates
* Always returns arrays for consistency

Example:

```js
modelTools.create('./model/users/users.json', [user])
```

---

## 💰 Payments Module

Payments are **simulated**, but structured like real systems:

* User initiates payment
* Payment record is stored
* Status transitions:

  * `pending`
  * `success`
  * `failed`

This prepares learners for:

* Stripe
* Paystack
* Flutterwave
* PayPal

---

## 📌 Error Handling Philosophy

* No silent failures
* Explicit HTTP status codes
* Centralized error responses
* No swallowed exceptions

Example:

```js
this._handleCatchBlockError(res, error)
```

---

## 🧠 Who This Project Is For

✔ Beginners who want to understand Node.js deeply
✔ Backend engineers tired of “magic frameworks”
✔ Developers preparing for system design interviews
✔ Anyone learning how Express / Nest actually work

---

## 🚀 How to Run

```bash
node src/server.js
```

Ensure:

* Node.js v18+
* Project folders exist (auto-created if missing)

---

## 📚 Learning Outcomes

By studying this project, you will understand:

* How routing frameworks work internally
* How authentication is implemented from scratch
* How file-based persistence works
* How to structure scalable Node.js apps
* Why abstractions exist — and when to avoid them

---

## ⚠️ Disclaimer

This project is **for learning purposes**.

For production systems:

* Use a real database
* Use battle-tested auth libraries
* Use HTTPS
* Implement rate limiting

---

## 🙌 Final Note

> “Frameworks make you productive.
> Understanding fundamentals makes you powerful.”

This project gives you **power**.

### I am glad I took some 3 days to write this!
### YOU CAN CHECK MORE OF MY REAL PROJECTS @ [MY SITE](https://www.nexalearnsystems.com/portfolio)

---

