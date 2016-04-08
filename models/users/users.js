import _ from 'lodash'

import PublicModel from '../public'

const MODEL_NAME = 'User'
const MODEL_NAME_PLURAL = 'Users'
const TABLE_NAME = 'users'

export default class Users extends PublicModel {
  get MODEL_NAME () {
    return MODEL_NAME
  }
  get MODEL_NAME_PLURAL () {
    return MODEL_NAME_PLURAL
  }
  get TABLE_NAME () {
    return TABLE_NAME
  }
}
