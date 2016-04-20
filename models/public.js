import _ from 'lodash'

import ModelBase from './base'

import BuildError, { NOT_FOUND, UNPROCESSABLE_ENTITY } from '../responses/error'
import BuildSuccess, { OK, CREATED, NO_CONTENT } from '../responses/success'

export default class PublicModel extends ModelBase {
  index (resolve, reject, paramKeys, paramValues, whereParams, fields) {
    // TODO: Add pagination support
    this.ctx.pg.query(`SELECT ${fields}
      FROM ${this.tableName}
    `, (error, result) => {
      if (error) return reject(error)

      // Resolve with result
      resolve(result.rows)
    })
  }
  get (resolve, reject, paramKeys, paramValues, whereParams, fields) {
    this.ctx.pg.query(`SELECT ${fields}
      FROM ${this.tableName}
      WHERE ${whereParams.name}=$1
      LIMIT 1
    `, [
      whereParams.value
    ], (error, result) => {
      if (error) return reject(error)
      // TODO: This is bad for security - someone can tell if this model exists or not
      if (!result.rows.length) return reject(new BuildError(`${this.modelName} not found`, NOT_FOUND))

      // Resolve with result
      resolve(result.rows[0])
    })
  }
  delete (resolve, reject, paramKeys, paramValues, whereParams, fields) {
    this.ctx.pg.query(`DELETE
      FROM ${this.tableName}
      WHERE ${whereParams.name}=$1
      RETURNING ${fields}
    `, [
      whereParams.value
    ], (error, result) => {
      if (error) return reject(error)
      // TODO: This is bad for security - someone can tell if this model exists or not
      if (!result.rows.length) return reject(new BuildError(`${this.modelName} not found`, NOT_FOUND))

      // Return success with proper code and result
      resolve(new BuildSuccess(`${this.modelName} successfully deleted`, NO_CONTENT))
    })
  }
  patch (resolve, reject, paramKeys, paramValues, whereParams, fields) {
    let paramsList = _.map(paramKeys, (key, index) => {
      return `${key}=$${index + 2}`
    }).join(', ')

    this.ctx.pg.query(`UPDATE ${this.tableName}
      SET ${paramsList}
      WHERE ${whereParams.name}=$1
      RETURNING ${fields}
    `, [
      whereParams.value
    ].concat(paramValues), (error, result) => {
      // TODO: need better messages for errors like duplicate key errors
      if (error) return reject(error)
      // TODO: This is bad for security - someone can tell if this model exists or not
      if (!result.rows.length) return reject(new BuildError(`${this.modelName} not found`, NOT_FOUND))

      // Return success with proper code and result
      resolve(new BuildSuccess(`${this.modelName} successfully updated`, OK, result.rows[0]))
    })
  }
  put (resolve, reject, paramKeys, paramValues, whereParams, fields) {
    let paramsList = _.map(paramKeys, (key, index) => {
      return `${key}=$${index + 2}`
    }).join(', ')

    this.ctx.pg.query(`UPDATE ${this.tableName}
      SET ${paramsList}
      WHERE ${whereParams.name}=$1
      RETURNING ${fields}
    `, [
      whereParams.value
    ].concat(paramValues), (error, result) => {
      if (error) return reject(error)
      // TODO: This is bad for security - someone can tell if this model exists or not
      if (!result.rows.length) return reject(new BuildError(`${this.modelName} not found`, NOT_FOUND))

      // Return success with proper code and result
      resolve(new BuildSuccess(`${this.modelName} successfully updated`, OK, result.rows[0]))
    })
  }
  post (resolve, reject, paramKeys, paramValues, whereParams, fields) {
    let columnNames = paramKeys.join(', ')
    let columnValues = `$${_.map(paramValues, (value, index) => { return index + 1 }).join(', $')}`

    this.ctx.pg.query(`INSERT INTO ${this.tableName}(${columnNames})
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
