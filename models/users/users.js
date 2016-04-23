import _ from 'lodash'

import PublicModel from '../public'

import { POST, PUT, PATCH, GET, INDEX, DELETE } from '../../requests/types'
import { OWNERS, MANAGERS, CONNECTIONS, PRIVATE, PUBLIC } from '../../auth/authorization'

const MODEL_NAME = 'User'
const MODEL_NAME_PLURAL = 'Users'
const TABLE_NAME = 'users'

// Property types
const STRING = 'string'
const NUMBER = 'number'
const OBJECT = 'object'
const ARRAY = 'array'

// User columns
const FIRST_NAME = 'first_name'
const LAST_NAME = 'last_name'
const SLUG = 'slug'
const EMAIL = 'email'
const ID = 'id'

// User fields
const ALL_FIELDS = [FIRST_NAME, LAST_NAME, SLUG, EMAIL, ID]
const CONNECTIONS_FIELDS = [FIRST_NAME, LAST_NAME, SLUG, ID]
const PRIVATE_FIELDS = [FIRST_NAME, LAST_NAME, SLUG, ID]
const PUBLIC_FIELDS = [ID, SLUG]

// Schemas

// POST and PUT Requests
const USERS_POST_PUT_REQUEST_SCHEMA = {
  type: OBJECT,
  properties: {
    [FIRST_NAME]: { type: STRING },
    [LAST_NAME]: { type: STRING },
    [EMAIL]: { type: STRING },
    [SLUG]: { type: STRING }
  },
  required: [FIRST_NAME, LAST_NAME, EMAIL, SLUG],
  additionalProperties: false
}

// PATCH Request
const USERS_PATCH_REQUEST_SCHEMA = {
  type: OBJECT,
  properties: {
    [FIRST_NAME]: { type: STRING },
    [LAST_NAME]: { type: STRING },
    [EMAIL]: { type: STRING },
    [SLUG]: { type: STRING },
  },
  anyOf: [
    { required: [FIRST_NAME] },
    { required: [LAST_NAME] },
    { required: [EMAIL] },
    { required: [SLUG] }
  ],
  additionalProperties: false
}

// Full Response
const USERS_FULL_RESPONSE_SCHEMA = {
  type: OBJECT,
  properties: {
    [FIRST_NAME]: { type: STRING },
    [LAST_NAME]: { type: STRING },
    [EMAIL]: { type: STRING },
    [SLUG]: { type: STRING },
    [ID]: { type: NUMBER }
  },
  required: [FIRST_NAME, LAST_NAME, EMAIL, SLUG, ID],
  additionalProperties: true
}

const USERS_FULL_RESPONSE_LIST_SCHEMA = {
  type: ARRAY,
  items: [USERS_FULL_RESPONSE_SCHEMA]
}

export default class Users extends PublicModel {
  get modelName () {
    return MODEL_NAME
  }
  get modelNamePlural () {
    return MODEL_NAME_PLURAL
  }
  get tableName () {
    return TABLE_NAME
  }
  get requestSchemas () {
    return {
      [POST]: USERS_POST_PUT_REQUEST_SCHEMA,
      [PUT]: USERS_POST_PUT_REQUEST_SCHEMA,
      [PATCH]: USERS_PATCH_REQUEST_SCHEMA
    }
  }
  get responseSchemas () {
    return {
      [GET]: USERS_FULL_RESPONSE_SCHEMA,
      [INDEX]: USERS_FULL_RESPONSE_LIST_SCHEMA
    }
  }
  get authorizedFields () {
    return {
      [OWNERS]: ALL_FIELDS,
      [MANAGERS]: ALL_FIELDS,
      [CONNECTIONS]: CONNECTIONS_FIELDS,
      [PRIVATE]: PRIVATE_FIELDS,
      [PUBLIC]: PUBLIC_FIELDS
    }
  }
  get allFields () {
    return ALL_FIELDS
  }
  get authorizedMethods () {
    return {
      [OWNERS]: {
        [PUT]: true,
        [GET]: true,
        [POST]: true,
        [PATCH]: true,
        [INDEX]: true,
        [DELETE]: true
      },
      [MANAGERS]: {
        [PUT]: true,
        [GET]: true,
        [POST]: true,
        [PATCH]: true,
        [INDEX]: true,
        [DELETE]: true
      },
      [CONNECTIONS]: {
        [GET]: true,
        [POST]: true,
        [INDEX]: true,
      },
      [PRIVATE]: {
        [GET]: true,
        [POST]: true,
        [INDEX]: true
      },
      [PUBLIC]: {
        [GET]: true,
        [POST]: true,
        [INDEX]: true
      }
    }
  }
}
