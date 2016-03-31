import _ from 'lodash'

import ModelBase from './base'

const MODEL_NAME = 'User'
const MODEL_NAME_PLURAL = 'Users'
const TABLE_NAME = 'users'

export default class Users extends ModelBase {
  get MODEL_NAME() {
    return MODEL_NAME
  }
  get MODEL_NAME_PLURAL() {
    return MODEL_NAME_PLURAL
  }
  get TABLE_NAME() {
    return TABLE_NAME
  }
  get (resolve, reject, params) {
    if (_.isUndefined(params.id) && _.isUndefined(params.slug)) return reject(new Error('Invalid parameters.'))

    let whereParam = params.id ? 'id' : 'slug'
    let slugOrID = params.id ? params.id : params.slug

    this.ctx.pg.query(`SELECT * FROM ${this.TABLE_NAME} WHERE ${whereParam}=$1`, [
      slugOrID
    ], (error, result) => {
      if (error) return reject(new Error(`${this.MODEL_NAME} not found.`))
      resolve(result.rows[0])
    })
  }
  put (resolve, reject, params) {
    if (_.isUndefined(params.id) && _.isUndefined(params.slug)) return reject(new Error('Invalid parameters.'))

    let whereParam = params.id ? 'id' : 'slug'
    let slugOrID = params.id ? params.id : params.slug

    this.ctx.pg.query(`UPDATE ${this.TABLE_NAME} SET last_name=$2 WHERE ${whereParam}=$1`, [
      slugOrID,
      params.lastName
    ], (error, result) => {
      if (error) return reject(new Error(`${this.MODEL_NAME} not found.`))
      resolve(`${this.MODEL_NAME} successfully updated.`)
    })
  }
  post (resolve, reject, params) {
    let paramKeys = _.keys(params)
    let paramValues = _.values(params)

    if (!paramKeys.length) return reject(new Error('Invalid parameters.'))

    let columnNames = paramKeys.join(', ')
    let columnValues = `$${_.map(paramValues, (value, index) => { return index + 1 }).join(', $')}`

    this.ctx.pg.query(`INSERT INTO ${this.TABLE_NAME}(${columnNames}) VALUES (${columnValues})`, paramValues, (error, result) => {
      if (error) return reject(new Error(`${this.MODEL_NAME} not found.`))
      resolve(`${this.MODEL_NAME} successfully added.`)
    })
  }
  index (resolve, reject) {
    this.ctx.pg.query(`SELECT * FROM ${this.TABLE_NAME}`, (error, result) => {
      if (error) return reject(new Error(`No ${this.MODEL_NAME_PLURAL} found.`))
      resolve(result.rows)
    })
  }
}
