import _ from 'lodash'

import Model from './base'

import BuildSuccess, { CREATED } from '../responses/success'

export default class Submodel extends Model {
  index (ctx, resolve, reject, paramKeys, paramValues, whereParams, fields, sort = '') {
    // TODO: Add pagination support
    ctx.pg.query(`SELECT ${fields}
      FROM ${this.tableName}
      WHERE ${whereParams.name}=$1
      ${sort.length ? 'ORDER BY ' + sort : ''}
    `, [
      whereParams.value
    ], (error, result) => {
      if (error) return reject(error)

      // Resolve with result
      resolve(result.rows)
    })
  }
  post (ctx, resolve, reject, paramKeys, paramValues, whereParams, fields) {
    paramKeys.push(whereParams.name)
    paramValues.push(whereParams.value)

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
