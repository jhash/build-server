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
}
