import Koa from 'koa'
const app = new Koa()

const APP_NAME = 'build'
const PORT_NUMBER = 3000
app.name = APP_NAME

import pg from 'pg'
const pgURL = 'postgres://jhash:@localhost/build'
app.context.pg = new pg.Client(pgURL)

import BuildError, { NOT_FOUND } from './responses/error'
import BuildSuccess, { OK } from './responses/success'

import Users from './models/users/users'
const userController = new Users(app)

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
    // console.error(err.stack)
    let errorCode = err.status || INTERNAL_SERVER_ERROR
    // TODO: Add description in response to help determine issue
    ctx.body = { status: errorCode, message: err.message }
    ctx.status = errorCode
  }
})

import koaBody from 'koa-body'
app.use(koaBody({
  formidable: {
    uploadDir: __dirname
  }
}))

app.use(async (ctx) => {
  let urlPaths = ctx.path.substr(1).split('/')
  var result
  switch (urlPaths[0]) {
    case `${userController.TABLE_NAME}`:
      result = await userController.run.call(userController, urlPaths.splice(1), ctx)
      break
    default:
      throw new BuildError(null, NOT_FOUND)
  }
  ctx.body = result.body || result
  ctx.status = result.status || OK
})

// Connect db before starting server
app.context.pg.connect(function(err) {
  if (err) {
    return console.error('could not connect to postgres', err);
  }
  app.listen(PORT_NUMBER, () => console.log(`server started ${PORT_NUMBER}`))
})


export default app
