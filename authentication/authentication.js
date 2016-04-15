import _ from 'lodash'

import { AUTHORIZATION } from '../requests/headers'

export const OWNER = 'owner'
export const ADMIN = 'administrator'
export const CONNECTED = 'connected'
export const PRIVATE = 'private'
export const PUBLIC = 'public'

const DEFAULT_OPTIONS = {}
const BEARER_BEGINNING = 'Bearer '
const BEARER_BEGINNING_LENGTH = BEARER_BEGINNING.length

export default class Authenticator {
  constructor (options) {
    // Extend default options
    this.options = Object.assign({}, DEFAULT_OPTIONS, options)
  }
  user (ctx) {
    var bearerToken = ctx.get(AUTHORIZATION)

    if (!_.isString(bearerToken) ||
      bearerToken.substr(0, BEARER_BEGINNING_LENGTH) !== BEARER_BEGINNING
    ) {
      return
    }

    let accessToken = bearerToken.substr(BEARER_BEGINNING_LENGTH).trim()
    console.log('accessToken', accessToken);

    // TODO: find user using accessToken
    let user = 'jim'
    ctx.user = user
    return user
  }
}
