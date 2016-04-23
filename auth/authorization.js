import _ from 'lodash'

export const OWNERS = 'owners'
export const MANAGERS = 'managers'
export const CONNECTIONS = 'connections'
export const PRIVATE = 'private'
export const PUBLIC = 'public'

const DEFAULT_OPTIONS = {}

export default class Authorizer {
  constructor (options) {
    // Extend default options
    this.options = Object.assign({}, DEFAULT_OPTIONS, options)
  }
  async methodAuthorized (ctx, method, allowedMethods, modelName) {
    // TODO: Find the user's actual connection to the requested model - need to pass model?
    ctx.userLevel = 'public'
    let methods = allowedMethods[ctx.userLevel]
    if (!methods || !methods[method]) return false
    return true
  }
}
