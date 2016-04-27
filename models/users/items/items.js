import _ from 'lodash'

import Submodel from '../../submodel'

import { POST, PUT, PATCH, GET, INDEX, DELETE } from '../../../requests/types'
import { STRING, NUMBER, OBJECT, ARRAY } from '../../field_types'
import { OWNERS } from '../../../auth/authorization'

const MODEL_NAME = 'Item'
const MODEL_NAME_PLURAL = 'Items'
const TABLE_NAME = 'users_items'

// User message columns
const TITLE = 'title'
const ID = 'id'

// User message fields
const ALL_FIELDS = [TITLE, ID]

// User message methods
const ALL_METHODS = [GET, POST, PUT, PATCH, INDEX, DELETE]

// Schemas

// POST Requests
const ITEMS_POST_PUT_PATCH_REQUEST_SCHEMA = {
  type: OBJECT,
  properties: {
    [TITLE]: { type: STRING }
  },
  required: [TITLE],
  additionalProperties: false
}

// Full Response
const ITEMS_FULL_RESPONSE_SCHEMA = {
  type: OBJECT,
  properties: {
    [TITLE]: { type: STRING },
    [ID]: { type: NUMBER }
  },
  required: ALL_FIELDS,
  additionalProperties: true
}

const ITEMS_FULL_RESPONSE_LIST_SCHEMA = {
  type: ARRAY,
  items: [ITEMS_FULL_RESPONSE_SCHEMA]
}

export default class Items extends Submodel {
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
      [OWNERS]: ALL_FIELDS
    }
  }
  get allFields () {
    return ALL_FIELDS
  }
  get authorizedMethods () {
    return {
      [OWNERS]: ALL_METHODS
    }
  }
  get possibleUserLevels () {
    return [OWNERS]
  }
}
