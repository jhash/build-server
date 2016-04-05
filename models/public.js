import _ from 'lodash'

import ModelBase from './base'

export default class PublicModel extends ModelBase {
  get (resolve, reject, params) {
    if (_.isUndefined(params.id) && _.isUndefined(params.slug)) return reject(new Error('Invalid parameters.'))

    let whereParam = params.id ? 'id' : 'slug'
    let slugOrID = params.id ? params.id : params.slug

    this.ctx.pg.query(`SELECT *
      FROM ${this.TABLE_NAME}
      WHERE ${whereParam}=$1
      LIMIT 1
    `, [
      slugOrID
    ], (error, result) => {
      if (error) return reject(new Error(`${this.MODEL_NAME} not found.`))
      resolve(result.rows[0])
    })
  }
  patch (resolve, reject, params) {
    let setParams = _.omit(params, 'id')
    let paramKeys = _.keys(setParams)
    let paramValues = _.values(setParams)

    if ((_.isUndefined(params.id) && _.isUndefined(params.slug)) || !paramKeys.length) return reject(new Error('Invalid parameters.'))

    let whereParam = params.id ? 'id' : 'slug'
    let slugOrID = params.id ? params.id : params.slug

    let paramsList = _.map(paramKeys, (key, index) => {
      return `${key}=$${index + 2}`
    }).join(', ')

    this.ctx.pg.query(`UPDATE ${this.TABLE_NAME}
      SET ${paramsList}
      WHERE ${whereParam}=$1
    `, [
      slugOrID
    ].concat(paramValues), (error, result) => {
      if (error) return reject(new Error(`${this.MODEL_NAME} not found.`))
      resolve(`${this.MODEL_NAME} successfully updated.`)
    })
  }
  put (resolve, reject, params) {
    let setParams = _.omit(params, 'id')
    let paramKeys = _.keys(setParams)
    let paramValues = _.values(setParams)

    if ((_.isUndefined(params.id) && _.isUndefined(params.slug)) || !paramKeys.length) return reject(new Error('Invalid parameters.'))

    let whereParam = params.id ? 'id' : 'slug'
    let slugOrID = params.id ? params.id : params.slug

    let paramsList = _.map(paramKeys, (key, index) => {
      return `${key}=$${index + 2}`
    }).join(', ')

    this.ctx.pg.query(`UPDATE ${this.TABLE_NAME}
      SET ${paramsList}
      WHERE ${whereParam}=$1
    `, [
      slugOrID
    ].concat(paramValues), (error, result) => {
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

    this.ctx.pg.query(`INSERT INTO ${this.TABLE_NAME}(${columnNames})
      VALUES (${columnValues})
    `, paramValues, (error, result) => {
      if (error) return reject(new Error(`${this.MODEL_NAME} not found.`))
      resolve(`${this.MODEL_NAME} successfully added.`)
    })
  }
  index (resolve, reject, index) {
    this.ctx.pg.query(`SELECT *
      FROM ${this.TABLE_NAME}
    `, (error, result) => {
      if (error) return reject(new Error(`No ${this.MODEL_NAME_PLURAL} found.`))
      resolve(result.rows)
    })
  }
}
