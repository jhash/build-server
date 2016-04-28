import _ from 'lodash'

import Model from '../model'

import { POST, PUT, PATCH, GET, INDEX, DELETE } from '../../requests/types'
import { STRING, NUMBER, OBJECT, ARRAY } from '../field_types'
import { OWNERS, PUBLIC } from '../../auth/authorization'

const MODEL_NAME = 'Item'
const MODEL_NAME_PLURAL = 'Items'
export const TABLE_NAME = 'items'

// User message columns
const DESCRIPTION = 'description'
const NAME = 'name'
const SLUG = 'slug'
const ID = 'id'

// User message fields
export const ALL_FIELDS = [DESCRIPTION, NAME, SLUG, ID]

// User message methods
export const ALL_METHODS = [GET, POST, PUT, PATCH, INDEX, DELETE]
export const VIEW_METHODS = [GET, INDEX]

// Schemas

// POST Requests
const ITEMS_POST_PUT_PATCH_REQUEST_SCHEMA = {
  type: OBJECT,
  properties: {
    [DESCRIPTION]: { type: STRING },
    [NAME]: { type: STRING },
    [SLUG]: { type: STRING }
  },
  required: [NAME, SLUG],
  additionalProperties: false
}

// Full Response
const ITEMS_FULL_RESPONSE_SCHEMA = {
  type: OBJECT,
  properties: {
    [DESCRIPTION]: { type: STRING },
    [NAME]: { type: STRING },
    [SLUG]: { type: STRING },
    [ID]: { type: NUMBER }
  },
  required: ALL_FIELDS,
  additionalProperties: true
}

const ITEMS_FULL_RESPONSE_LIST_SCHEMA = {
  type: ARRAY,
  items: [ITEMS_FULL_RESPONSE_SCHEMA]
}

export default class Items extends Model {
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
      [POST]: ITEMS_POST_PUT_PATCH_REQUEST_SCHEMA,
      [PUT]: ITEMS_POST_PUT_PATCH_REQUEST_SCHEMA,
      [PATCH]: ITEMS_POST_PUT_PATCH_REQUEST_SCHEMA
    }
  }
  get responseSchemas () {
    return {
      [GET]: ITEMS_FULL_RESPONSE_SCHEMA,
      [INDEX]: ITEMS_FULL_RESPONSE_LIST_SCHEMA
    }
  }
  get authorizedFields () {
    return {
      [OWNERS]: ALL_FIELDS,
      [PUBLIC]: ALL_FIELDS
    }
  }
  get authorizedMethods () {
    return {
      [OWNERS]: ALL_METHODS,
      [PUBLIC]: ALL_METHODS
    }
  }
  get allFields () {
    return ALL_FIELDS
  }
  get possibleUserLevels () {
    return [OWNERS]
  }
}
