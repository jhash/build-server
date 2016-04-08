import _ from 'lodash'

import BuildError, { FORBIDDEN, NOT_FOUND } from '../responses/error'

export default class ModelBase {
  async run (subPaths, ctx, next) {
    this.ctx = ctx

    var params = this.ctx.request.body
    var method = null

    return new Promise((resolve, reject) => {
      // Find a matching method to call
      if (!subPaths.length) {
        if (ctx.method === 'GET') {
          method = 'index'
        } else if (ctx.method === 'POST') {
          method = 'post'
        } else if (ctx.method === 'OPTIONS')  {
          method = 'options'
        }
      } else {
        // Add slug or ID to params
        const slugOrID = _.toNumber(subPaths[0]) == subPaths[0] ? 'id' : 'slug'
        Object.assign(params, { [slugOrID]: subPaths[0] })

        if (ctx.method === 'GET') {
          method = 'get'
        } else if (ctx.method === 'PATCH') {
          method = 'patch'
        } else if (ctx.method === 'PUT') {
          method = 'put'
        } else if (ctx.method === 'DELETE') {
          method = 'delete'
        }
      }

      // If this method is defined
      if (method && _.isFunction(this[method])) {
        // Authenticate this user's ability to call this method
        let authenticationError = this.authenticate(method)
        if (authenticationError) return reject(authenticationError)

        // Call the method
        return this[method].call(this, resolve, reject, params)
      }

      // TODO: determine if this is the right error or not
      // Return not found error
      return this.defaultMethod.call(this, resolve, reject)
    })
  }
  defaultMethod (resolve, reject) {
    reject(new BuildError(null, NOT_FOUND))
  }
  authenticate (method) {
    if (false) return new BuildError(null, FORBIDDEN)
  }
}
