import _ from 'lodash'

import BuildError, { FORBIDDEN, NOT_FOUND, UNPROCESSABLE_ENTITY } from '../responses/error'

import Ajv from 'ajv'
let ajv = Ajv()

import { REQUEST_MAP, REQUEST_MAP_WITH_ID } from '../requests/types'

export default class ModelBase {
  async run (subPaths, ctx, next) {
    this.ctx = ctx

    var params = this.ctx.request.body
    var whereParams = {}
    var method = null

    return new Promise((resolve, reject) => {
      // Find a matching method to call
      if (!subPaths.length) {
        method = REQUEST_MAP[ctx.method]
      } else {
        // Add slug or ID to params
        const slugOrID = _.toNumber(subPaths[0]) == subPaths[0] ? 'id' : 'slug'

        Object.assign(whereParams, {
          name: slugOrID,
          value: subPaths[0]
        })

        method = REQUEST_MAP_WITH_ID[ctx.method]
      }

      // If this method is defined
      if (method && _.isFunction(this[method])) {
        // Authenticate this user's ability to call this method
        if (!this.authenticated(method)) return reject(new BuildError(null, FORBIDDEN))

        // Validate request data
        let requestValidationSchema = this[`${method}RequestSchema`]
        if (requestValidationSchema) {
          var validate = ajv.compile(requestValidationSchema)
          var valid = validate(params)
          if (!valid) return reject(new BuildError('Invalid parameters', UNPROCESSABLE_ENTITY, _.map(validate.errors, 'message')))
        }

        // Call the method
        return this[method].call(this, resolve, reject, params, whereParams)
      }

      // TODO: determine if this is the right error or not
      // Return not found error
      return this.defaultMethod.call(this, reject)
    })
  }
  defaultMethod (reject) {
    reject(new BuildError(null, NOT_FOUND))
  }
  authenticated (method) {
    return true
  }
}
