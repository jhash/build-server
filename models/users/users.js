import _ from 'lodash'

import PublicModel from '../public'

const MODEL_NAME = 'User'
const MODEL_NAME_PLURAL = 'Users'
const TABLE_NAME = 'users'
const POST_SCHEMA = {
  type: 'object',
  properties: {
    
  }
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
  get postSchema () {
    return POST_SCHEMA
  }
}
