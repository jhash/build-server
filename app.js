import Koa from 'koa'
const app = new Koa()

const APP_NAME = 'build'
const PORT_NUMBER = 3000
app.name = APP_NAME

import pg from 'pg'
const pgURL = 'postgres://jhash:@localhost/build'
app.context.pg = new pg.Client(pgURL)

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
    await next() // next is now a function
  } catch (err) {
    ctx.body = { message: err.message }
    ctx.status = err.status || 500
  }
})

app.use(async (ctx) => {
  const body = await (() => { return 'Pie' })() // await instead of yield
  ctx.body = body // ctx instead of this
})

// Connect db before starting server
app.context.pg.connect(function(err) {
  if (err) {
    return console.error('could not connect to postgres', err);
  }
  app.listen(PORT_NUMBER, () => console.log(`server started ${PORT_NUMBER}`))
})


export default app
