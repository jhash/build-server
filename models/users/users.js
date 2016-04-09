import _ from 'lodash'

import PublicModel from '../public'

const MODEL_NAME = 'User'
const MODEL_NAME_PLURAL = 'Users'
const TABLE_NAME = 'users'

// Property types
const STRING = 'string'
const NUMBER = 'number'
const OBJECT = 'object'

// User columns
const FIRST_NAME = 'first_name'
const LAST_NAME = 'last_name'
const SLUG = 'slug'
const EMAIL = 'email'
const ID = 'id'

// Schemas

// Post Request
const POST_PUT_REQUEST_SCHEMA = {
  type: OBJECT,
  properties: {
    [FIRST_NAME]: { type: STRING },
    [LAST_NAME]: { type: STRING },
    [EMAIL]: { type: STRING }
  },
  required: [FIRST_NAME, LAST_NAME, EMAIL],
  additionalProperties: false
}

// Put Request
// === POST_RESPONSE_SCHEMA

// Patch Request
const PATCH_REQUEST_SCHEMA = {
  type: OBJECT,
  properties: {
    [FIRST_NAME]: { type: STRING },
    [LAST_NAME]: { type: STRING },
    [EMAIL]: { type: STRING }
  },
  anyOf: [
    { required: [FIRST_NAME] },
    { required: [LAST_NAME] },
    { required: [EMAIL] }
  ],
  additionalProperties: false
}

// Get and Delete Requests
const EMPTY_REQUEST_SCHEMA = {
  additionalProperties: false
}

// Full Response
const FULL_RESPONSE_SCHEMA = {
  type: OBJECT,
  properties: {
    [FIRST_NAME]: { type: STRING },
    [LAST_NAME]: { type: STRING },
    [EMAIL]: { type: STRING },
    [SLUG]: { type: STRING },
    [ID]: { type: NUMBER }
  },
  required: [FIRST_NAME, LAST_NAME, EMAIL, SLUG, ID],
  additionalProperties: false
}

// Delete Response
const EMPTY_RESPONSE_SCHEMA = {
  additionalProperties: false
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
  get postRequestSchema () {
    return POST_PUT_REQUEST_SCHEMA
  }
  get putRequestSchema () {
    return POST_PUT_REQUEST_SCHEMA
  }
  get patchRequestSchema () {
    return PATCH_REQUEST_SCHEMA
  }
  get getRequestSchema () {
    return EMPTY_REQUEST_SCHEMA
  }
  get indexRequestSchema () {
    return EMPTY_REQUEST_SCHEMA
  }
  get deleteRequestSchema () {
    return EMPTY_REQUEST_SCHEMA
  }
}
