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
  authenticated (method, userLevel) {
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

    // TODO: implement auth and use level here
    const USER_LEVEL = 'public'

    // Find a matching method to call
    if (!subPaths.length) {
      method = REQUEST_MAP[ctx.method]
    } else {
      method = REQUEST_MAP_WITH_ID[ctx.method]

      // Add slug or ID to params
      // TODO: add constraint that slug cannot just be a number
      const slugOrID = _.toNumber(subPaths[0]) == subPaths[0] ? 'id' : 'slug'
      Object.assign(whereParams, {
        name: slugOrID,
        value: subPaths[0]
      })
    }

    return new Promise((resolve, reject) => {
      // TODO: determine if this is the right error or not
      // Return not found error
      if (!method || !_.isFunction(this[method])) return reject(new BuildError(null, NOT_FOUND))

      // Authenticate this user's ability to call this method
      // TODO: pass more things to this?
      if (!this.authenticated(method, USER_LEVEL)) return reject(new BuildError(null, UNAUTHORIZED))

      // Validate the fields requested
      // TODO: Make sure that the fields passed are columns on this model - based on user authentication level?
      if (fields) {
        // If fields is not a string or there is a * anywhere in it, reject
        if (!_.isString(fields) || fields.indexOf('*') !== -1) return reject(new BuildError('Invalid fields requested', UNPROCESSABLE_ENTITY))

        // Remove white space in fields
        fields = fields.replace(/\s+/g, '')

        // Split up fields
        let splitFields = fields.split(',')

        // This actually takes care of SQL injection on the fields parameter
        // TODO: Specify which fields are unauthorized in error
        if (!_.isEqual(splitFields, _.intersection(splitFields, this.authorizedFields[USER_LEVEL] || this.allFields))) return reject(new BuildError('Unauthorized to access specified fields', FORBIDDEN))
      } else {
        fields = (this.authorizedFields[USER_LEVEL] || this.allFields).join(',')
      }

      // TODO: should this be an UNPROCESSABLE_ENTITY error?
      if (!fields.length) return reject(new BuildError('No allowed fields present', INTERNAL_SERVER_ERROR))

      // Validate request data
      let requestValidationSchema = this.requestSchemas[method]
      if (requestValidationSchema) {
        var validate = ajv.compile(requestValidationSchema)
        var valid = validate(params)
        if (!valid) return reject(new BuildError('Invalid parameters', UNPROCESSABLE_ENTITY, _.map(validate.errors, 'message')))
      }

      // Call the method
      return new Promise((responseResolve, responseReject) => {
        this[method].call(this, responseResolve, responseReject, params, whereParams, fields)
      }).then((body) => {
        // TODO: maybe this should only be in tests?
        // TODO: Maybe do this async?

        // If we are passed fields, don't bother with response validation for now
        // TODO: add validation that the fields requested are
        if (fields) return resolve(body)

        // Validate response data
        let responseValidationSchema = this.responseSchemas[method]
        if (responseValidationSchema) {
          var validate = ajv.compile(responseValidationSchema)
          var valid = validate(body)
          if (!valid) {
            // TODO: save this validation error somewhere so we can fix it?
            // TODO: should we reject?
            // TODO: remove this
            console.log(validate.errors);
            // return reject(new BuildError('Invalid response format', INTERNAL_SERVER_ERROR, validate.errors, 'message'))
          }
        }

        return resolve(body)
      }).catch(reject)
    })
  }
}
