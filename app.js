import _ from 'lodash'
import Koa from 'koa'
import pg from 'pg'

import BuildError, { NOT_FOUND, INTERNAL_SERVER_ERROR } from './responses/error'
import BuildSuccess, { OK } from './responses/success'

import Authenticator from './auth/authentication'
import Authorizer from './auth/authorization'

import Users from './models/users/users'

const app = new Koa()

const APP_NAME = 'build'
const PORT_NUMBER = 3000

const POSTGRES_URL = 'postgres://jhash:@localhost/build'

const NUMBER_OF_SPACES_PER_TAB = 2

let tableNames = []
let tableControllerMap = {}

app.name = APP_NAME
app.context.pg = new pg.Client(POSTGRES_URL)
app.context.authenticator = new Authenticator()
// TODO: remove this?
app.context.authorizer = new Authorizer()
app.context.tableControllerMap = tableControllerMap


function constructWhereParam (tableId) {
  if (_.isUndefined(tableId)) return
  return {
    name: _.toNumber(tableId) == tableId ? 'id' : 'slug',
    value: tableId
  }
}

// Prettify response
app.use(async (ctx, next) => {
  await next()
  // If we are returning an object, stringify and prettify the response
  if (_.isObject(ctx.body)) ctx.body = JSON.stringify(ctx.body, null, NUMBER_OF_SPACES_PER_TAB)
})

// X-response-time
app.use(async (ctx, next) => {
  var start = new Date
  await next()
  var ms = new Date - start
  ctx.set('X-Response-Time', ms + 'ms')
})

// Logger
app.use(async (ctx, next) => {
  var start = new Date
  await next()
  var ms = new Date - start
  console.log('%s %s - %s', ctx.method, ctx.url, ms)
})

// Response
app.use(async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    if (!err) err = {}

    let errorCode = err.status || INTERNAL_SERVER_ERROR

    // TODO: Add description in response to help determine issue
    ctx.body = Object.assign({ status: errorCode }, _.pick(err, ['message', 'errors', 'description']))
    ctx.status = errorCode

    // TODO: Add default message?

    // TODO: Make methods of these checks
    // TODO: Make prettier
    if (String(ctx.status)[0] === '5') console.error(err.stack)
  }
})

// Strip params from the body
// TODO: build/find non-generator version of this
import koaBody from 'koa-body'
app.use(koaBody({
  formidable: {
    uploadDir: __dirname
  }
}))

// Authenticate user
app.use(async(ctx, next) => {
  await ctx.authenticator.authenticateUser(ctx)
  // TODO: If private, reject here
  await next()
})

app.use(async (ctx) => {
  // Remove first slash and split on the rest
  let tableIds = ctx.path.substr(1).split('/')
  let tableNames = _.remove(tableIds, (tableId, index) => {
    return index % 2 === 0
  })

  const requestWithId = tableIds.length === tableNames.length

  const tableName = tableNames.splice(tableNames.length - 1)[0]
  const tableId = requestWithId ? tableIds.splice(tableIds.length - 1)[0] : undefined
  const whereParam = constructWhereParam(tableId)

  console.log(tableName, tableId, whereParam);

  let tableController = _.get(ctx.tableControllerMap, `${tableName}.controller`)
  if (!tableController || !_.isFunction(tableController.run)) throw new BuildError(null, NOT_FOUND)

  let preAuth = {}
  for (let index in tableNames) {
    console.log(tableNames[index]);

    let controller = _.get(ctx.tableControllerMap, `${tableNames[index]}.controller`)
    if (!controller) break

    const authorizedSubmodelMethods = controller.authorizedSubmodelMethods
    if (!authorizedSubmodelMethods) break

    console.log('authorizedSubmodelMethods', authorizedSubmodelMethods);

    const authorizedSubmodelFields = controller.authorizedSubmodelFields
    if (!authorizedSubmodelFields) break

    console.log('authorizedSubmodelFields', authorizedSubmodelFields);

    const authorizedMethodUserLevels = authorizedSubmodelMethods[tableName]
    if (!authorizedMethodUserLevels) break

    console.log('authorizedMethodUserLevels', authorizedMethodUserLevels);

    const authorizedFieldUserLevels = authorizedSubmodelFields[tableName]
    if (!authorizedFieldUserLevels) break

    console.log('authorizedFieldUserLevels', authorizedFieldUserLevels);

    const parentWhereParam = constructWhereParam(tableIds[index])
    if (!parentWhereParam) break

    console.log('parentWhereParam', parentWhereParam);

    const level = await controller.checkUserLevels(ctx, parentWhereParam)
    if (!level) break

    console.log('level', level);

    preAuth = {
      methods: authorizedMethodUserLevels[level],
      fields: authorizedFieldUserLevels[level]
    }
  }

  console.log('preAuth', preAuth);

  // Set default result
  let result = {}

  console.log('result', result);

  result = await tableController.run.call(tableController, ctx, whereParam, preAuth)

  console.log('result', result);

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
    tableNames = _.map(result.rows, 'table_name')
    _.each(tableNames, (tableName) => {
      try {
        const splitTableName = tableName.split('_')
        let controller = require(`./models/${tableName.replace(/_+/g, '/')}/${splitTableName[splitTableName.length - 1]}`)
        tableControllerMap[tableName] = {
          controller: new controller.default()
        }
      } catch (e) {
        // console.error(e);
      }
    })
    console.log('All table names', tableNames)
    console.log('Controllers', tableControllerMap);
  })

  // Launch the server
  // TODO: use async version?
  app.listen(PORT_NUMBER, () => console.log(`server started ${PORT_NUMBER}`))
})


export default app
