import _ from 'lodash'

import { AUTHORIZATION } from '../requests/headers'

import BuildError, { BAD_REQUEST } from '../responses/error'

export const OWNERS = 'owners'
export const MANAGERS = 'managers'
export const CONNECTIONS = 'connections'
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
  authenticateUser (ctx) {
    return new Promise((resolve, reject) => {
      var bearerToken = ctx.get(AUTHORIZATION) || ''
      // If no token passed, this is a public request
      if (!bearerToken.length) return resolve()

      let bearerTokenBeginning = bearerToken.substr(0, BEARER_BEGINNING_LENGTH)
      let accessToken = bearerToken.substr(0, BEARER_BEGINNING_LENGTH).trim()

      if (!accessToken.length || bearerTokenBeginning !== BEARER_BEGINNING) {
        return reject(new BuildError('Invalid Authorization header', BAD_REQUEST))
      }

      console.log('accessToken', accessToken);

      // TODO: find user using accessToken
      let user = 'jim'
      ctx.user = user

      return resolve(user)
    })
  }
}
