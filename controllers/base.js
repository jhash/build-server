import _ from 'lodash'

export default class ModelBase {
  async run (subPaths, ctx, next) {
    this.ctx = ctx

    var params = this.ctx.request.body

    return new Promise((resolve, reject) => {
      if (!subPaths.length) {
        if (ctx.method === 'GET') {
          return this.index.call(this, resolve, reject, params)
        } else if (ctx.method === 'POST') {
          return this.post.call(this, resolve, reject, params)
        } else if (ctx.method === 'OPTIONS')  {
          return this.options.call(this, resolve, reject, params)
        }
      } else {
        const slugOrID = _.toNumber(subPaths[0]) == subPaths[0] ? 'id' : 'slug'
        Object.assign(params, { [slugOrID]: subPaths[0] })

        if (ctx.method === 'GET') {
          return this.get.call(this, resolve, reject, params)
        } else if (ctx.method === 'PATCH') {
          return this.patch.call(this, resolve, reject, params)
        } else if (ctx.method === 'PUT') {
          return this.put.call(this, resolve, reject, params)
        } else if (ctx.method === 'DELETE') {
          return this.delete.call(this, resolve, reject, params)
        }
      }

      return this.defaultMethod.call(this, resolve, reject)
    })
  }
  defaultMethod (resolve, reject) {
    reject(new Error(`Method not found.`))
  }
  head () {
    return this.defaultMethod.apply(this, arguments)
  }
  get () {
    return this.defaultMethod.apply(this, arguments)
  }
  index () {
    return this.defaultMethod.apply(this, arguments)
  }
  patch () {
    return this.defaultMethod.apply(this, arguments)
  }
  put () {
    return this.defaultMethod.apply(this, arguments)
  }
  post () {
    return this.defaultMethod.apply(this, arguments)
  }
  delete () {
    return this.defaultMethod.apply(this, arguments)
  }
  options () {
    return this.defaultMethod.apply(this, arguments)
  }
  trace () {
    return this.defaultMethod.apply(this, arguments)
  }
}
