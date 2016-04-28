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
  async checkUserLevel (ctx, whereParam, userLevel) {
    return new Promise((levelResolve) => {
      // TODO: clean this
      if (whereParam.name === 'users_id' && userLevel === 'owners' && ctx.user.id == whereParam.value) return levelResolve(userLevel)

      ctx.pg.query(`SELECT id
        FROM ${this.tableName}_${userLevel}
        WHERE ${this.tableName}_${whereParam.name}=$1 AND ${userLevel}_id=$2
        LIMIT 1
      `, [
        whereParam.value,
        ctx.user.id
      ], (error, result) => {
        if (error || !result.rows.length) return levelResolve()

        // Resolve with result
        return levelResolve(userLevel)
      })
    })
  }
  async checkUserLevels (ctx, whereParam) {
    return new Promise(async (resolve) => {
      if (!ctx.user) return resolve(PUBLIC)

      if (whereParam) {
        let level
        for (let index in this.possibleUserLevels) {
          level = await this.checkUserLevel(ctx, whereParam, this.possibleUserLevels[index])
          if (level) return resolve(level)
        }
      }

      return resolve(PRIVATE)
    })
  }
  methodAuthorized (ctx, method, methods) {
    // If this userLevel's has access to the specified method
    if (!methods || methods.indexOf(method) === -1) return false
    return true
  }
  async run (ctx, whereParam, preAuth) {
    return new Promise(async (resolve, reject) => {
      let params = ctx.request.body

      let fields = _.get(params, 'fields')
      let sort = _.get(params, 'sort')

      params = _.omit(params, ['fields', 'sort'])

      // TODO: only allow certain method types for certain ctx.methods? (GET or POST)
      const methodType = params.method ? params.method : ctx.method

      // Find a matching method to call
      let method = _.isUndefined(whereParam) ? REQUEST_MAP[methodType] : REQUEST_MAP_WITH_ID[methodType]

      // Return not found error
      if (!method || !_.isFunction(this[method])) return reject(new BuildError(null, NOT_FOUND))

      // Set user level for this model
      ctx.userLevel = await this.checkUserLevels(ctx, whereParam)

      // Authorize this user's ability to call this method
      if (!this.methodAuthorized(ctx, method, preAuth.methods || this.authorizedMethods[ctx.userLevel])) return reject(new BuildError(null, UNAUTHORIZED))

      // Validate the fields requested
      let authorizedFields = preAuth.fields || this.authorizedFields[ctx.userLevel] || []

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

      if (sort) {
        try {
          sort = sort.replace(/\s+/g, '').split(',').map((sortField) => {
            if (!sortField.length) throw new BuildError('Invalid sort parameters', UNPROCESSABLE_ENTITY)

            const descending = sortField[0] === '-'
            sortField = descending ? sortField.substr(1) : sortField

            // TODO: only sort by authorized fields?
            if (this.allFields.indexOf(sortField) === -1) throw new BuildError('Unauthorized to sort by specified fields', UNPROCESSABLE_ENTITY)

            return sortField + (descending ? ' DESC' : ' ASC')
          }).join(', ')
        } catch (error) {
          return reject(error)
        }
      }

      // Validate request data
      let requestValidationSchema = this.requestSchemas[method]
      if (requestValidationSchema) {
        var validate = ajv.compile(requestValidationSchema)
        var valid = validate(params)
        // TODO: Move string to const
        if (!valid) return reject(new BuildError('Invalid parameters', UNPROCESSABLE_ENTITY, _.map(validate.errors, 'message')))
      }

      let paramKeys = _.keys(params)
      let paramValues = _.values(params)

      // Call the method
      return this[method].call(this, ctx, resolve, reject, paramKeys, paramValues, whereParam, fields, sort)
    })
  }
}
