import { modelTools } from "../model/model-tools.js"

class HttpUtils {

    parseRequestBody(req, options = {}) {
        return new Promise((resolve, reject) => {
            const contentType = req.headers['content-type']
            if (!contentType || !contentType.includes('application/json')) {
                return reject(new Error('Invalid content type'))
            }

            let body = ''
            let bytesRead = 0
            const maxSize = options?.maxSize ?? 10
            const MAX_SIZE = maxSize * 1024 * 1024

            req.on('data', chunk => {
                bytesRead += chunk.length
                if (bytesRead > MAX_SIZE) {
                    reject(new Error('Payload too large'))
                    req.destroy()
                    return
                }
                body += chunk
            })

            req.on('end', () => {
                try {
                    resolve(body ? JSON.parse(body) : {})
                } catch (error) {
                    reject(new Error('Error parsing request payload'))
                }
            })

            req.on('error', error => reject(error))
        })
    }

    sendResponse(res, { status, data, message, error }) {
        res.statusCode = status ?? 200
        res.setHeader('Content-Type', 'application/json')

        const _serialize = (d) => 
            modelTools._isSerialized(d) ? d : modelTools._serialize(d)

        let payload
        if (error) {
            payload = {
                success: false,
                error: error.message || String(error),
                data: null,
                message: message || null
            }
        } else {
            payload = {
                success: true,
                data: _serialize(data),
                message
            }
        }

        res.end(_serialize(payload))
    }
    
}

export const httpUtils = new HttpUtils()
