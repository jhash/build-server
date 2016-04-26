import _ from 'lodash'

import Submodel from '../../submodel'

import { POST, PATCH, GET, INDEX, DELETE } from '../../../requests/types'
import { STRING, NUMBER, OBJECT, ARRAY, DATE_TIME } from '../../field_types'

const MODEL_NAME = 'Message'
const MODEL_NAME_PLURAL = 'Messages'
const TABLE_NAME = 'users_messages'

// User message columns
const RECEIVERS_ID = 'receivers_id'
const SENDERS_ID = 'senders_id'
const CREATED_AT = 'created_at'
const MESSAGE = 'message'
const ID = 'id'

const RECEIVERS = 'receivers'
const SENDERS = 'senders'

// User message fields
const ALL_FIELDS = [SENDERS_ID, RECEIVERS_ID, MESSAGE, ID]
const PRIVATE_FIELDS = [ID]

// User message methods
const ALL_METHODS = [GET, POST, PATCH, INDEX, DELETE]

// Schemas

// POST Requests
const MESSAGES_POST_REQUEST_SCHEMA = {
  type: OBJECT,
  properties: {
    [RECEIVERS_ID]: { type: NUMBER },
    [SENDERS_ID]: { type: NUMBER },
    [MESSAGE]: { type: STRING }
  },
  required: [SENDERS_ID, RECEIVERS_ID, MESSAGE],
  additionalProperties: false
}

// PATCH Request
const MESSAGES_PATCH_REQUEST_SCHEMA = {
  type: OBJECT,
  properties: {
    [MESSAGE]: { type: STRING }
  },
  required: [MESSAGE],
  additionalProperties: false
}

// Full Response
const MESSAGES_FULL_RESPONSE_SCHEMA = {
  type: OBJECT,
  properties: {
    [RECEIVERS_ID]: { type: NUMBER },
    [SENDERS_ID]: { type: NUMBER },
    [CREATED_AT]: { type: DATE_TIME },
    [MESSAGE]: { type: STRING },
    [ID]: { type: NUMBER }
  },
  required: ALL_FIELDS,
  additionalProperties: true
}

const MESSAGES_FULL_RESPONSE_LIST_SCHEMA = {
  type: ARRAY,
  items: [MESSAGES_FULL_RESPONSE_SCHEMA]
}

export default class Messages extends Submodel {
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
      [POST]: MESSAGES_POST_REQUEST_SCHEMA,
      [PATCH]: MESSAGES_PATCH_REQUEST_SCHEMA
    }
  }
  get responseSchemas () {
    return {
      [GET]: MESSAGES_FULL_RESPONSE_SCHEMA,
      [INDEX]: MESSAGES_FULL_RESPONSE_LIST_SCHEMA
    }
  }
  get authorizedFields () {
    return {
      [RECEIVERS]: ALL_METHODS,
      [SENDERS]: ALL_METHODS
    }
  }
  get allFields () {
    return ALL_FIELDS
  }
  get authorizedMethods () {
    return {
      [RECEIVERS]: ALL_METHODS,
      [SENDERS]: ALL_METHODS
    }
  }
  get possibleUserLevels () {
    return [SENDERS, RECEIVERS]
  }
}
