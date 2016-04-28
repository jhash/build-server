import _ from 'lodash'

import ModelBase from './base'

import BuildError, { NOT_FOUND, UNPROCESSABLE_ENTITY } from '../responses/error'
import BuildSuccess, { OK, CREATED, NO_CONTENT } from '../responses/success'

export default class Model extends ModelBase {
  index (ctx, resolve, reject, paramKeys, paramValues, whereParam, fields, sort = '') {
    // TODO: Add pagination support
    ctx.pg.query(`SELECT ${fields}
      FROM ${this.tableName}
      ${sort.length ? 'ORDER BY ' + sort : ''}
    `, (error, result) => {
      if (error) return reject(error)

      // Resolve with result
      resolve(result.rows)
    })
  }
  get (ctx, resolve, reject, paramKeys, paramValues, whereParam, fields) {
    ctx.pg.query(`SELECT ${fields}
      FROM ${this.tableName}
      WHERE ${whereParam.name}=$1
      LIMIT 1
    `, [
      whereParam.value
    ], (error, result) => {
      if (error) return reject(error)
      // TODO: This is bad for security - someone can tell if this model exists or not
      if (!result.rows.length) return reject(new BuildError(`${this.modelName} not found`, NOT_FOUND))

      // Resolve with result
      resolve(result.rows[0])
    })
  }
  delete (ctx, resolve, reject, paramKeys, paramValues, whereParam, fields) {
    ctx.pg.query(`DELETE
      FROM ${this.tableName}
      WHERE ${whereParam.name}=$1
      RETURNING ${fields}
    `, [
      whereParam.value
    ], (error, result) => {
      if (error) return reject(error)
      // TODO: This is bad for security - someone can tell if this model exists or not
      if (!result.rows.length) return reject(new BuildError(`${this.modelName} not found`, NOT_FOUND))

      // Return success with proper code and result
      resolve(new BuildSuccess(`${this.modelName} successfully deleted`, NO_CONTENT))
    })
  }
  patch (ctx, resolve, reject, paramKeys, paramValues, whereParam, fields) {
    let paramsList = _.map(paramKeys, (key, index) => {
      return `${key}=$${index + 2}`
    }).join(', ')

    ctx.pg.query(`UPDATE ${this.tableName}
      SET ${paramsList}
      WHERE ${whereParam.name}=$1
      RETURNING ${fields}
    `, [
      whereParam.value
    ].concat(paramValues), (error, result) => {
      // TODO: need better messages for errors like duplicate key errors
      if (error) return reject(error)
      // TODO: This is bad for security - someone can tell if this model exists or not
      if (!result.rows.length) return reject(new BuildError(`${this.modelName} not found`, NOT_FOUND))

      // Return success with proper code and result
      resolve(new BuildSuccess(`${this.modelName} successfully updated`, OK, result.rows[0]))
    })
  }
  put (ctx, resolve, reject, paramKeys, paramValues, whereParam, fields) {
    let paramsList = _.map(paramKeys, (key, index) => {
      return `${key}=$${index + 2}`
    }).join(', ')

    ctx.pg.query(`UPDATE ${this.tableName}
      SET ${paramsList}
      WHERE ${whereParam.name}=$1
      RETURNING ${fields}
    `, [
      whereParam.value
    ].concat(paramValues), (error, result) => {
      if (error) return reject(error)
      // TODO: This is bad for security - someone can tell if this model exists or not
      if (!result.rows.length) return reject(new BuildError(`${this.modelName} not found`, NOT_FOUND))

      // Return success with proper code and result
      resolve(new BuildSuccess(`${this.modelName} successfully updated`, OK, result.rows[0]))
    })
  }
  post (ctx, resolve, reject, paramKeys, paramValues, whereParam, fields) {
    let columnNames = paramKeys.join(', ')
    let columnValues = `$${_.map(paramValues, (value, index) => { return index + 1 }).join(', $')}`

    ctx.pg.query(`INSERT INTO ${this.tableName}(${columnNames})
      VALUES (${columnValues})
      RETURNING ${fields}
    `, paramValues, (error, result) => {
      if (error) return reject(error)
      // Make sure that a model was actually created
      if (!result.rows.length) return reject(new BuildError(`Failed to create ${this.modelName}`))

      // Return success with proper code and result
      resolve(new BuildSuccess(`${this.modelName} successfully added`, CREATED, result.rows[0]))
    })
  }
}
