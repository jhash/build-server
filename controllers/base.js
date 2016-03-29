export default class ModelBase {
  async run (path, ctx, next) {
    if (path[0] === '/') path = path.substr(1)

    this.ctx = ctx

    return new Promise((resolve, reject) => {
      if (path === '') {
        if (ctx.method === 'GET') {
          return this.index.call(this, resolve, reject)
        } else if (ctx.method === 'POST') {
          return this.post.call(this, resolve, reject)
        } else {
          return this.options.call(this, resolve, reject)
        }
      } else if (!path.match('/')) {
        const id = path.trim()
        if (ctx.method === 'GET') {
          return this.get.call(this, resolve, reject, id)
        } else if (ctx.method === 'PUT') {
          return this.put.call(this, resolve, reject, id)
        } else if (ctx.method === 'DELETE') {
          return this.delete.call(this, resolve, reject, id)
        }
      }

      return this.defaultMethod.call(this, resolve, reject)
    })
  }
  defaultMethod (resolve, reject) {
    reject(new Error(`Method not allowed.`))
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
  trace (resolve, reject) {
    this.body = "Smart! But you can't trace."
  }
}
