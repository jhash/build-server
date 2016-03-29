import app from '../app'
import supertest from 'supertest'

const request = supertest.agent(app.listen())

describe('Pie', function () {
  it('should say "Pie"', function (done) {
    request
      .get('/')
      .expect(200)
      .expect('Pie', done)
  })
})
