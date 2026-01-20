import http from 'node:http'
import { router } from './routes/routers.js'
import { httpUtils } from './utils/http.utils.js'
import { Auth } from './middleware/auth/auth.middleware.js'
import usersController from './controller/users/users.controller.js'
import { Config } from './config/config.js'


const PORT = Config.server.port
const HOST = Config.server.host


const server = http.createServer((req, res) => {


//ensure authentication security layer
//Auth.isAuthenticated(req, res)

//always to avoid repeatition calls
async function attatchPayloadToRequest() {
  req.body = await httpUtils.parseRequestBody(req, { maxSize: 5 })
}
attatchPayloadToRequest()

//attatch other important values early
const params = router.getPathParams(req, false)
req.params = params

const queries = router.getQueryParams(req)
req.query = queries

//===================================
// ROUTERS HERE
//===================================
async function getUsers() {
 await router.get(req, res, '/users', usersController.getUsers)
}
getUsers()

  // res.writeHead(200, { 'Content-Type': 'application/json' })
  // res.end(JSON.stringify('Hello developers!'))
})

//const url = router._getURL('https://nexaalearnsystems.com/users')
// const builtUrl = new URL('https://nexaalearnsystems.com/users/creates/63746?page=1&limit=10')
// const pathnames = builtUrl.pathname //.split('/')
// const parsed = path.parse(pathnames)
// console.log('BUILT URL PATHNAME:', pathnames, 'PARSED:', parsed)
// console.log('BUILT URL:', builtUrl)


// function getRoueParams() {
//   const params = pathnames.split('/').filter(Boolean)
//   const paramObj = Object.entries(params)

//   let realObj = {}
//   for (const param of params) {
//      realObj[param] = param
//   }

//   const IDs = {}

//   for (const r of route.split('/').filter(Boolean)) {
//     if (r.startsWith(':')) {
//       IDs[r] = r
//     }
//   }
//   console.log('GOTTE IDs', IDs)

//   // let i = 0
//   // while (i < params.length) {
//   //   realObj[params[i]] = params[i]
//   //   i++
//   // }
//   console.log('Constructed Params:', params)
//   console.log('Constructed Params REAL OBJECTS:', realObj)
//   console.log('Constructed Params OBJECTS:', paramObj)
// }
// getRoueParams()


// const route = '/users/:id/updates/:bookId'
// const simulatedPathnames = '/users/64587/updates/89754'
// function getIdFromParams() {
//   const track = {}
//   let ROUTE = route.split('/')
//   let PATHNAME = simulatedPathnames.split('/')

//   if (PATHNAME.length !== ROUTE.length) {
//   throw new Error('Path does not match route');
//   }

//   for (let i =0; i < ROUTE.length; i++) {
//     if (ROUTE[i].startsWith(':')) {
//       track[ROUTE[i].slice(1)] = PATHNAME[i]
//     }
//   }
//   console.log('route TESTING', track)
// }
// getIdFromParams()

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



// let QUERY = {}
// function getQuery() {
//   for (const [key, value] of builtUrl.searchParams) {
//     QUERY[key] = value
//   }
//   console.log('QUERY PARAMS:', QUERY)
//   console.log('QUERY PARAMS PIECE:', {
//     first: QUERY.page,
//     second: QUERY.limit,
//   })
// }
// getQuery()

server.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`)
})


