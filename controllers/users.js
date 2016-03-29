import ModelBase from './base'

const MODEL_NAME = 'User'
const TABLE_NAME = 'users'

export default class Users extends ModelBase {
  static get TABLE_NAME() {
    return TABLE_NAME
  }
  get (resolve, reject, id) {
    // TODO: vulnerable to SQL injection?
    this.ctx.pg.query(`SELECT * FROM ${TABLE_NAME} WHERE id=$1`, [id], (error, result) => {
      if (error) return reject(new Error(`${MODEL_NAME} not found.`))
      resolve(result.rows[0])
    })
  }
  put (resolve, reject, id) {
    // TODO: vulnerable to SQL injection?
    this.ctx.pg.query(`UPDATE ${TABLE_NAME} SET last_name=$1 WHERE id=${$2}`, ["'; DROP TABLE user;", id], (error, result) => {
      if (error) return reject(new Error(`${MODEL_NAME} not found.`))
      resolve(`${MODEL_NAME} successfully updated.`)
    })
  }
  index (resolve, reject) {
    this.ctx.pg.query(`SELECT * FROM ${TABLE_NAME}`, (error, result) => {
      if (error) return reject(new Error(`No ${MODEL_NAME}s found.`))
      resolve(result.rows)
    })
  }
}
