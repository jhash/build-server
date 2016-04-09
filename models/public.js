import _ from 'lodash'

import ModelBase from './base'

import BuildError, { NOT_FOUND, UNPROCESSABLE_ENTITY } from '../responses/error'
import BuildSuccess, { OK, CREATED, NO_CONTENT } from '../responses/success'

export default class PublicModel extends ModelBase {
  index (resolve, reject, index) {
    // TODO: Add pagination support
    // TODO: Don't use *, return default set of params or params listed in 'fields' param
    this.ctx.pg.query(`SELECT *
      FROM ${this.tableName}
    `, (error, result) => {
      if (error) return reject(error)
      resolve(result.rows)
    })
  }
  get (resolve, reject, params, whereParams) {
    if (_.isUndefined(whereParams.value) || _.isUndefined(whereParams.name)) return reject(new BuildError('Invalid parameters', UNPROCESSABLE_ENTITY))

    // TODO: Don't use *, return default set of params or params listed in 'fields' param
    this.ctx.pg.query(`SELECT *
      FROM ${this.tableName}
      WHERE ${whereParams.name}=$1
      LIMIT 1
    `, [
      whereParams.value
    ], (error, result) => {
      if (error) return reject(error)
      // TODO: This is bad for security - someone can tell if this model exists or not
      if (!result.rows.length) return reject(new BuildError(`${this.modelName} not found`, NOT_FOUND))
      resolve(result.rows[0])
    })
  }
  delete (resolve, reject, params, whereParams) {
    if (_.isUndefined(whereParams.value) || _.isUndefined(whereParams.name)) return reject(new BuildError('Invalid parameters', UNPROCESSABLE_ENTITY))

    // TODO: Don't use *, return default set of params or params listed in 'fields' param
    this.ctx.pg.query(`DELETE
      FROM ${this.tableName}
      WHERE ${whereParams.name}=$1
      RETURNING *
    `, [
      whereParams.value
    ], (error, result) => {
      if (error) return reject(error)
      // TODO: This is bad for security - someone can tell if this model exists or not
      if (!result.rows.length) return reject(new BuildError(`${this.modelName} not found`, NOT_FOUND))
      resolve(new BuildSuccess(`${this.modelName} successfully deleted`, NO_CONTENT))
    })
  }
  patch (resolve, reject, params, whereParams) {
    let paramKeys = _.keys(params)

    if (_.isUndefined(whereParams.value) || _.isUndefined(whereParams.name) || !paramKeys.length) return reject(new BuildError('Invalid parameters', UNPROCESSABLE_ENTITY))

    let paramValues = _.values(params)

    let paramsList = _.map(paramKeys, (key, index) => {
      return `${key}=$${index + 2}`
    }).join(', ')

    // TODO: Don't use *, return default set of params or params listed in 'fields' param
    this.ctx.pg.query(`UPDATE ${this.tableName}
      SET ${paramsList}
      WHERE ${whereParams.name}=$1
      RETURNING *
    `, [
      whereParams.value
    ].concat(paramValues), (error, result) => {
      if (error) return reject(new BuildError(`${this.modelName} not found`))
      // TODO: This is bad for security - someone can tell if this model exists or not
      if (!result.rows.length) return reject(new BuildError(`${this.modelName} not found`, NOT_FOUND))
      resolve(new BuildSuccess(`${this.modelName} successfully updated`, OK, result.rows[0]))
    })
  }
  put (resolve, reject, params, whereParams) {
    let paramKeys = _.keys(params)

    // TODO: Make sure the entire set of required fields is included
    if (_.isUndefined(whereParams.value) || _.isUndefined(whereParams.name) || !paramKeys.length) return reject(new BuildError('Invalid parameters', UNPROCESSABLE_ENTITY))

    let paramValues = _.values(params)

    let paramsList = _.map(paramKeys, (key, index) => {
      return `${key}=$${index + 2}`
    }).join(', ')

    // TODO: Don't use *, return default set of params or params listed in 'fields' param
    this.ctx.pg.query(`UPDATE ${this.tableName}
      SET ${paramsList}
      WHERE ${whereParams.name}=$1
      RETURNING *
    `, [
      whereParams.value
    ].concat(paramValues), (error, result) => {
      if (error) return reject(error)
      // TODO: This is bad for security - someone can tell if this model exists or not
      if (!result.rows.length) return reject(new BuildError(`${this.modelName} not found`, NOT_FOUND))
      resolve(new BuildSuccess(`${this.modelName} successfully updated`, OK, result.rows[0]))
    })
  }
  post (resolve, reject, params) {
    let paramKeys = _.keys(params)

    // TODO: Make sure the entire set of required fields is included
    if (!paramKeys.length) return reject(new BuildError('Invalid parameters', UNPROCESSABLE_ENTITY))

    let paramValues = _.values(params)

    let columnNames = paramKeys.join(', ')
    let columnValues = `$${_.map(paramValues, (value, index) => { return index + 1 }).join(', $')}`

    // TODO: Don't use *, return default set of params or params listed in 'fields' param
    this.ctx.pg.query(`INSERT INTO ${this.tableName}(${columnNames})
      VALUES (${columnValues})
      RETURNING *
    `, paramValues, (error, result) => {
      if (error) return reject(error)
      // Make sure that a model was actually created
      if (!result.rows.length) return reject(new BuildError(`Failed to create ${this.modelName}`))
      resolve(new BuildSuccess(`${this.modelName} successfully added`, CREATED, result.rows[0]))
    })
  }
}
