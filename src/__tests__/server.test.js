const request = require('supertest')
const DB = require('better-sqlite3-helper')

const app = require('../server.js')
const DBconfig = require('../config/better-sqlite3-helper.config')

// The first call creates the global instance with your settings
DB(DBconfig)

describe('Test server responses', () => {
  test('it should return 200 for the root path', async () => {
    const response = await request(app).get('/')
    expect(response.statusCode).toBe(200)
  })

  test('it should return 404 for a nonexistent path', async () => {
    const response = await request(app).get('/pterosaur')
    expect(response.statusCode).toBe(404)
  })

  test('it should return security-focused headers in reponses', async () => {
    const response = await request(app).get('/')

    /*
      More documentaion on each of these can be found here:
      - https://helmetjs.github.io/docs/
    */
    expect(response.headers['x-dns-prefetch-control']).toEqual('off')
    expect(response.headers['x-frame-options']).toEqual('SAMEORIGIN')
    expect(response.headers['strict-transport-security']).toEqual(
      'max-age=15552000; includeSubDomains',
    )
    expect(response.headers['x-download-options']).toEqual('noopen')
    expect(response.headers['x-content-type-options']).toEqual('nosniff')
    expect(response.headers['x-xss-protection']).toEqual('0')

    expect(response.headers['x-powered-by']).toBeUndefined()
  })
})
