import _ from 'lodash'

import BuildError, { FORBIDDEN, NOT_FOUND, UNPROCESSABLE_ENTITY, UNAUTHORIZED, INTERNAL_SERVER_ERROR } from '../responses/error'

// TODO: put on app context?
import Ajv from 'ajv'
let ajv = Ajv()

import { REQUEST_MAP, REQUEST_MAP_WITH_ID } from '../requests/types'
import { PUBLIC, PRIVATE } from '../auth/authorization'

export default class ModelBase {
  get requestSchemas () {
    return {}
  }
  get responseSchemas () {
    return {}
  }
  get authorizedFields () {
    return {}
  }
  get allFields () {
    return []
  }
  get possibleUserLevels () {
    return []
  }
  get authorizedMethods () {
    // TODO: Allow owners to do everything by default?
    return {}
  }
  async checkUserLevel (ctx, whereParams, userLevel) {
    return new Promise((levelResolve) => {
      ctx.pg.query(`SELECT id
        FROM ${this.tableName}_${userLevel}
        WHERE ${this.tableName}_${whereParams.name}=$1 AND ${userLevel}_id=$2
        LIMIT 1
      `, [
        whereParams.value,
        ctx.user.id
      ], (error, result) => {
        if (error || !result.rows.length) return levelResolve()

        // Resolve with result
        return levelResolve(userLevel)
      })
    })
  }
  async checkUserLevels (ctx, whereParams) {
    return new Promise(async (resolve) => {
      if (!ctx.user) return resolve('public')

      if (whereParams) {
        let level
        for (let index in this.possibleUserLevels) {
          level = await this.checkUserLevel(ctx, whereParams, this.possibleUserLevels[index])
          if (level) return resolve(level)
        }
      }

      return resolve('private')
    })
  }
  async methodAuthorized (ctx, method, whereParams) {
    return new Promise(async (resolve) => {
      ctx.userLevel = await this.checkUserLevels(ctx, whereParams)

      let methods = this.authorizedMethods[ctx.userLevel]
      if (!methods || methods.indexOf(method) === -1) return resolve(false)
      return resolve(true)
    })
  }
  async run (subPaths, ctx, next) {
    return new Promise(async (resolve, reject) => {
      var params = ctx.request.body
      var whereParams = {}
      var method

      var fields
      if (params && params.fields) {
        fields = params.fields
        params = _.omit(params, 'fields')
      }

      let paramKeys = _.keys(params)
      let paramValues = _.values(params)

      // Find a matching method to call
      if (!subPaths.length) {
        method = REQUEST_MAP[ctx.method]
      } else {
        // TODO: Move string to const
        if (!subPaths[0].length) return reject(new BuildError('Invalid parameters', UNPROCESSABLE_ENTITY))

        method = REQUEST_MAP_WITH_ID[ctx.method]

        // Add slug or ID to params
        // TODO: add constraint that slug cannot just be a number
        const slugOrID = _.toNumber(subPaths[0]) == subPaths[0] ? 'id' : 'slug'
        Object.assign(whereParams, {
          name: slugOrID,
          value: subPaths[0]
        })
      }

      // TODO: determine if this is the right error or not
      // Return not found error
      if (!method || !_.isFunction(this[method])) return reject(new BuildError(null, NOT_FOUND))

      let authorized = await this.methodAuthorized(ctx, method, whereParams)

      // Authenticate this user's ability to call this method
      // TODO: pass more things to this?
      if (!authorized) return reject(new BuildError(null, UNAUTHORIZED))

      // Validate the fields requested
      let authorizedFields = this.authorizedFields[ctx.userLevel] || []

      if (fields) {
        // If fields is not a string or there is a * anywhere in it, reject
        // TODO: Move string to const
        if (!_.isString(fields) || fields.indexOf('*') !== -1) return reject(new BuildError('Invalid fields requested', UNPROCESSABLE_ENTITY))

        // Remove white space in fields
        fields = fields.replace(/\s+/g, '')

        // Split up fields
        let splitFields = fields.split(',')

        // This actually takes care of SQL injection on the fields parameter
        // TODO: Specify which fields are unauthorized in error
        // TODO: Move string to const
        if (!_.isEqual(splitFields, _.intersection(splitFields, authorizedFields))) return reject(new BuildError('Unauthorized to access specified fields', FORBIDDEN))
      } else {
        fields = authorizedFields.join(',')
      }

      // TODO: Move string to const
      if (!fields.length) return reject(new BuildError('No allowed fields present', FORBIDDEN))

      // Validate request data
      let requestValidationSchema = this.requestSchemas[method]
      if (requestValidationSchema) {
        var validate = ajv.compile(requestValidationSchema)
        var valid = validate(params)
        // TODO: Move string to const
        if (!valid) return reject(new BuildError('Invalid parameters', UNPROCESSABLE_ENTITY, _.map(validate.errors, 'message')))
      }

      // Call the method
      return this[method].call(this, ctx, resolve, reject, paramKeys, paramValues, whereParams, fields)
    })
  }
}
