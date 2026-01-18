import http from 'node:http'
import { router } from './routes/routers.js'
// import { loadEnvFile } from 'node:process'
// import { modelTools } from './model/model-tools.js'
import path from 'node:path'
import url from 'node:url'
import { httpUtils } from './utils/http.utils.js'

const PORT = process.env.PORT || 3001
const HOST = process.env.HOST || '127.0.0.1'

const server = http.createServer((req, res) => {

async function attatchPayloadToReq() {
  req.body = await httpUtils.parseRequestBody(req, { maxSize: 5 })
}
attatchPayloadToReq()


  // res.writeHead(200, { 'Content-Type': 'application/json' })
  // res.end(JSON.stringify('Hello developers!'))
})

//const url = router._getURL('https://nexaalearnsystems.com/users')
// const builtUrl = new URL('https://nexaalearnsystems.com/users/creates?page=1&limit=10')
// const pathnames = builtUrl.pathname //.split('/')
// const parsed = path.parse(pathnames)
// console.log('BUILT URL PATHNAME:', pathnames, 'PARSED:', parsed)
// console.log('BUILT URL:', builtUrl)

//const filePath = './model/db/test-user.json'
//const product = [
// {
//   name: 'iPhone',
//   price: 'NGN500000',
//   buyer: 'Sholola Oke'
// },
// {
//   _id: 78,
//   name: 'LapTop Sec100',
//   price: 'NGN90',
//   buyer: 'Abby TIJANI Mobolaji'
// },
// ]
// async function testModelTools() {
//   //const data = await modelTools.update(filePath, product, 3)
//   const data = await modelTools.delete(filePath, 4)
//   console.log('RETURN', data)
// }
// testModelTools()

server.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`)
})


