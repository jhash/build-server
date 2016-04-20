import _ from 'lodash'

import BuildError, { FORBIDDEN, NOT_FOUND, UNPROCESSABLE_ENTITY, UNAUTHORIZED, INTERNAL_SERVER_ERROR } from '../responses/error'

import Ajv from 'ajv'
let ajv = Ajv()

import { REQUEST_MAP, REQUEST_MAP_WITH_ID } from '../requests/types'

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
  get methodRestrictions () {
    return {}
  }
  authorized (method, userLevel) {
    let restrictions = this.methodRestrictions[userLevel]
    if (restrictions && restrictions[method]) return false
    return true
  }
  async run (subPaths, ctx, next) {
    this.ctx = ctx

    var params = this.ctx.request.body
    var whereParams = {}
    var method

    var fields
    if (params && params.fields) {
      fields = params.fields
      params = _.omit(params, 'fields')
    }

    let paramKeys = _.keys(params)
    let paramValues = _.values(params)

    // TODO: implement auth and use level here
    const USER_LEVEL = 'public'

    return new Promise((resolve, reject) => {
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

      // Authenticate this user's ability to call this method
      // TODO: pass more things to this?
      if (!this.authorized(method, USER_LEVEL)) return reject(new BuildError(null, UNAUTHORIZED))

      // Validate the fields requested
      // TODO: This should probably be the opposite - no fields if no authorized fields are found
      let authorizedFields = this.authorizedFields[USER_LEVEL] || this.allFields

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
      return this[method].call(this, resolve, reject, paramKeys, paramValues, whereParams, fields)
    })
  }
}
