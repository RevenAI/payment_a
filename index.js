import http from 'node:http'
import { router } from './routes/routers.js'
import { httpUtils } from './utils/http.utils.js'
import { Auth } from './middleware/auth/auth.middleware.js'
import { userRouter } from './routes/users/users.route.js' 
import { Config } from './config/config.js'
import { productRouter } from './routes/products/products.route.js'
import { paymentRouter } from './routes/payments/payments.route.js'

const PORT = Config.server.port
const HOST = Config.server.host

/**
 * Central server
 */
const server = http.createServer(async (req, res) => {
    try {
        
        // PARSE REQUEST BODY
        req.body = await httpUtils.parseRequestBody(req, { maxSize: 5 })

        // ATTACH QUERY & PATH PARAMETERS
        req.params = router.getPathParams(req, false)
        req.query = router.getQueryParams(req)

        // USER ROUTES
        const handledUser = await userRouter(req, res)
        if (handledUser) return // route handled successfully

        // PRODUCT ROUTES
        const handledProduct = await productRouter(req, res)
        if (handledProduct) return

        //PAYMENT ROUTES
        const handledPayment = await paymentRouter(req,res)
        if (handledPayment) return

        // NO MATCHED ROUTE → 404
        httpUtils.sendResponse(res, {
            status: 404,
            message: 'Route not found',
            success: false
        })

    } catch (error) {
        // GLOBAL ERROR HANDLING → 500
        httpUtils.sendResponse(res, {
            status: 500,
            message: error.message || 'Unexpected server error',
            error
        })
    }
})

server.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`)
})
