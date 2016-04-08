import _ from 'lodash'

export const OK = 200
export const CREATED = 201
export const NO_CONTENT = 204
export const NOT_MODIFIED = 304

const SUCCESS_DEFAULT_MESSAGES = {
  [OK]: 'OK', // Response to a successful GET, PUT, PATCH or DELETE. Can also be used for a POST that doesn't result in a creation.
  [CREATED]: 'Created', // Response to a POST that results in a creation. Should be combined with a Location header pointing to the location of the new resource
  [NO_CONTENT]: 'No Content', // Response to a successful request that won't be returning a body (like a DELETE request)
  [NOT_MODIFIED]: 'Not Modified' // Used when HTTP caching headers are in play
}

export default class BuildSuccess {
  constructor(message, successCode = OK, body) {
    if (!message) message = SUCCESS_DEFAULT_MESSAGES[successCode]
    this.message = message
    this.body = body
    this.status = successCode
  }
}
