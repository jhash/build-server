export const OWNER = 'owner'
export const ADMIN = 'administrator'
export const CONNECTED = 'connected'
export const PRIVATE = 'private'
export const PUBLIC = 'public'

import { AUTHORIZATION } from '../requests/headers'

const DEFAULT_OPTIONS = {}

export default class Authenticator {
  constructor (options) {
    // Extend default options
    this.options = Object.assign({}, DEFAULT_OPTIONS, options)
  }
  user (ctx) {
    var bearerToken = ctx.get(AUTHORIZATION)
    if (!bearerToken) return
    return 'jim'
  }
}
