import _ from 'lodash'

import ModelBase from './base'

import BuildError, { NOT_FOUND, UNPROCESSABLE_ENTITY } from '../responses/error'
import BuildSuccess, { OK, CREATED, NO_CONTENT } from '../responses/success'

export default class PublicModel extends ModelBase {
  index (resolve, reject, index) {
    // TODO: Add pagination support
    // TODO: Don't use *, return default set of params or params listed in 'fields' param
    this.ctx.pg.query(`SELECT *
      FROM ${this.TABLE_NAME}
    `, (error, result) => {
      if (error) return reject(error)
      resolve(result.rows)
    })
  }
  get (resolve, reject, params) {
    if (_.isUndefined(params.whereParamValue) || _.isUndefined(params.whereParamName)) return reject(new BuildError('Invalid parameters', UNPROCESSABLE_ENTITY))

    // TODO: Don't use *, return default set of params or params listed in 'fields' param
    this.ctx.pg.query(`SELECT *
      FROM ${this.TABLE_NAME}
      WHERE ${params.whereParamName}=$1
      LIMIT 1
    `, [
      params.whereParamValue
    ], (error, result) => {
      if (error) return reject(error)
      // TODO: This is bad for security - someone can tell if this model exists or not
      if (!result.rows.length) return reject(new BuildError(`${this.MODEL_NAME} not found`, NOT_FOUND))
      resolve(result.rows[0])
    })
  }
  delete (resolve, reject, params) {
    if (_.isUndefined(params.whereParamValue) || _.isUndefined(params.whereParamName)) return reject(new BuildError('Invalid parameters', UNPROCESSABLE_ENTITY))

    // TODO: Don't use *, return default set of params or params listed in 'fields' param
    this.ctx.pg.query(`DELETE
      FROM ${this.TABLE_NAME}
      WHERE ${params.whereParamName}=$1
      RETURNING *
    `, [
      params.whereParamValue
    ], (error, result) => {
      if (error) return reject(error)
      // TODO: This is bad for security - someone can tell if this model exists or not
      if (!result.rows.length) return reject(new BuildError(`${this.MODEL_NAME} not found`, NOT_FOUND))
      resolve(new BuildSuccess(`${this.MODEL_NAME} successfully deleted`, NO_CONTENT))
    })
  }
  patch (resolve, reject, params) {
    let setParams = _.omit(params, ['whereParamValue', 'whereParamName'])
    let paramKeys = _.keys(setParams)
    let paramValues = _.values(setParams)

    if (_.isUndefined(params.whereParamValue) || _.isUndefined(params.whereParamName) || !paramKeys.length) return reject(new BuildError('Invalid parameters', UNPROCESSABLE_ENTITY))

    let paramsList = _.map(paramKeys, (key, index) => {
      return `${key}=$${index + 2}`
    }).join(', ')

    // TODO: Don't use *, return default set of params or params listed in 'fields' param
    this.ctx.pg.query(`UPDATE ${this.TABLE_NAME}
      SET ${paramsList}
      WHERE ${params.whereParamName}=$1
      RETURNING *
    `, [
      params.whereParamValue
    ].concat(paramValues), (error, result) => {
      if (error) return reject(new BuildError(`${this.MODEL_NAME} not found`))
      // TODO: This is bad for security - someone can tell if this model exists or not
      if (!result.rows.length) return reject(new BuildError(`${this.MODEL_NAME} not found`, NOT_FOUND))
      resolve(new BuildSuccess(`${this.MODEL_NAME} successfully updated`, OK, result.rows[0]))
    })
  }
  put (resolve, reject, params) {
    let setParams = _.omit(params, ['whereParamValue', 'whereParamName'])
    let paramKeys = _.keys(setParams)
    let paramValues = _.values(setParams)

    // TODO: Make sure the entire set of required fields is included
    if (_.isUndefined(params.whereParamValue) || _.isUndefined(params.whereParamName) || !paramKeys.length) return reject(new BuildError('Invalid parameters', UNPROCESSABLE_ENTITY))

    let paramsList = _.map(paramKeys, (key, index) => {
      return `${key}=$${index + 2}`
    }).join(', ')

    // TODO: Don't use *, return default set of params or params listed in 'fields' param
    this.ctx.pg.query(`UPDATE ${this.TABLE_NAME}
      SET ${paramsList}
      WHERE ${params.whereParamName}=$1
      RETURNING *
    `, [
      params.whereParamValue
    ].concat(paramValues), (error, result) => {
      if (error) return reject(error)
      // TODO: This is bad for security - someone can tell if this model exists or not
      if (!result.rows.length) return reject(new BuildError(`${this.MODEL_NAME} not found`, NOT_FOUND))
      resolve(new BuildSuccess(`${this.MODEL_NAME} successfully updated`, OK, result.rows[0]))
    })
  }
  post (resolve, reject, params) {
    let paramKeys = _.keys(params)
    let paramValues = _.values(params)

    // TODO: Make sure the entire set of required fields is included
    if (!paramKeys.length) return reject(new BuildError('Invalid parameters', UNPROCESSABLE_ENTITY))

    let columnNames = paramKeys.join(', ')
    let columnValues = `$${_.map(paramValues, (value, index) => { return index + 1 }).join(', $')}`

    // TODO: Don't use *, return default set of params or params listed in 'fields' param
    this.ctx.pg.query(`INSERT INTO ${this.TABLE_NAME}(${columnNames})
      VALUES (${columnValues})
      RETURNING *
    `, paramValues, (error, result) => {
      if (error) return reject(error)
      // Make sure that a model was actually created
      if (!result.rows.length) return reject(new BuildError(`Failed to create ${this.MODEL_NAME}`))
      resolve(new BuildSuccess(`${this.MODEL_NAME} successfully added`, CREATED, result.rows[0]))
    })
  }
}
