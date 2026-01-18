
---

## 🛠️ Step 1: Define middleware functions
Middleware are just functions that take `(req, res, next)`:

```js
function logger(req, res, next) {
  console.log(`${req.method} ${req.url}`)
  next() // pass control
}

function auth(req, res, next) {
  if (req.headers['authorization'] === 'secret') {
    next()
  } else {
    res.statusCode = 401
    res.end('Unauthorized')
  }
}
```

---

## 🛠️ Step 2: Create a middleware runner
We need something that calls each middleware in sequence and provides `next`:

```js
function runMiddleware(req, res, middlewares, finalHandler) {
  let i = 0

  function next() {
    const middleware = middlewares[i++]
    if (middleware) {
      middleware(req, res, next)
    } else {
      finalHandler(req, res) // when no middleware left
    }
  }

  next()
}
```

---

## 🛠️ Step 3: Use it in a Node.js server
```js
const http = require('http')

const server = http.createServer((req, res) => {
  runMiddleware(req, res, [logger, auth], (req, res) => {
    res.end('Hello from core Node.js!')
  })
})

server.listen(3000, () => console.log('Server running on port 3000'))
```

---

## ✅ How it works
- Each middleware gets `(req, res, next)`.
- Calling `next()` moves to the next middleware.
- If no middleware left, the **final handler** runs.
- This mimics Express’s `app.use`.

---

### 🔑 Key Takeaway
- In **core Node.js**, `next` doesn’t exist by default.
- You can **implement your own `next`** by writing a runner like above.
- This gives you an Express‑style middleware chain without needing Express.

---
