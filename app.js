import Koa from 'koa'
const app = new Koa()

const APP_NAME = 'build'
const PORT_NUMBER = 3000
app.name = APP_NAME

import pg from 'pg'
const pgURL = 'postgres://jhash:@localhost/build'
app.context.pg = new pg.Client(pgURL)

import BuildError, { NOT_FOUND, INTERNAL_SERVER_ERROR } from './responses/error'
import BuildSuccess, { OK } from './responses/success'

import Users from './models/users/users'
const userController = new Users(app)

import _ from 'lodash'
const NUMBER_OF_SPACES_PER_TAB = 2

import Authenticator from './authentication/authentication'
let auth = new Authenticator()

// prettify response
app.use(async (ctx, next) => {
  await next()
  // If we are returning an object, stringify and prettify the response
  if (_.isObject(ctx.body)) ctx.body = JSON.stringify(ctx.body, null, NUMBER_OF_SPACES_PER_TAB)
})

// x-response-time
app.use(async (ctx, next) => {
  var start = new Date
  await next()
  var ms = new Date - start
  ctx.set('X-Response-Time', ms + 'ms')
})

// logger
app.use(async (ctx, next) => {
  var start = new Date
  await next()
  var ms = new Date - start
  console.log('%s %s - %s', ctx.method, ctx.url, ms)
})

// response
app.use(async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    let errorCode = err.status || INTERNAL_SERVER_ERROR
    // TODO: Add description in response to help determine issue
    ctx.body = Object.assign({ status: errorCode }, _.pick(err, ['message', 'errors', 'description']))
    ctx.status = errorCode

    // TODO: Make methods of these checks
    // TODO: Make prettier
    if (String(ctx.status)[0] === '5') console.error(err.stack)
  }
})

import koaBody from 'koa-body'
app.use(koaBody({
  formidable: {
    uploadDir: __dirname
  }
}))

app.use(async(ctx, next) => {
  console.log('user', auth.user(ctx))
  await next()
})

app.use(async (ctx) => {
  let urlPaths = ctx.path.substr(1).split('/')
  var result = {}
  switch (urlPaths[0]) {
    case `${userController.tableName}`:
      result = await userController.run.call(userController, urlPaths.splice(1), ctx)
      break
    default:
      throw new BuildError(null, NOT_FOUND)
  }
  ctx.body = result.body || result
  ctx.status = result.status || OK
})

// Connect db before starting server
// TODO: use async version?
app.context.pg.connect(function(err) {
  if (err) return console.error('Could not connect to postgres', err)

  // TODO: use something like this to build the possible routes?
  app.context.pg.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE';", function (err, result) {
    if (err) return console.error('Failed to fetch tables', err)
    console.log('All table names', _.map(result.rows, 'table_name'))
  })

  // Launch the server
  // TODO: use async version?
  app.listen(PORT_NUMBER, () => console.log(`server started ${PORT_NUMBER}`))
})


export default app
