import _ from 'lodash'

import { AUTHORIZATION } from '../requests/headers'

import BuildError, { BAD_REQUEST, UNAUTHORIZED } from '../responses/error'

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
      let accessToken = bearerToken.substr(BEARER_BEGINNING_LENGTH).trim()

      if (!accessToken.length || bearerTokenBeginning !== BEARER_BEGINNING) {
        return reject(new BuildError('Invalid Authorization header', BAD_REQUEST))
      }

      ctx.pg.query(`SELECT users_id, valid
        FROM users_access_tokens
        WHERE access_token=$1
        LIMIT 1
      `, [
        accessToken
      ], (error, result) => {
        if (error) return reject(error)

        if (!result.rows.length) return reject(new BuildError('Invalid access token', UNAUTHORIZED))
        if (!result.rows[0].valid) return reject(new BuildError('Access token expired', UNAUTHORIZED))

        ctx.user = _.mapKeys(_.pick(result.rows[0], 'users_id'), _.constant('id'))

        // Resolve
        resolve()
      })
    })
  }
}
