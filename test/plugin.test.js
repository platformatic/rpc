import { deepStrictEqual, strictEqual } from 'node:assert'
import { resolve } from 'node:path'
import { test } from 'node:test'

test('should generate an openapi schema from a ts app', async t => {
  const { app } = await import(resolve(import.meta.dirname, 'fixtures/js-app-1/index.js'))
  await app.ready()

  t.after(() => app.close())

  {
    const { statusCode, body } = await app.inject({
      method: 'POST',
      url: '/rpc/getUsers',
      body: JSON.stringify({ maxAge: 30 }),
      headers: {
        'content-type': 'application/json'
      }
    })
    strictEqual(statusCode, 200)

    const users = JSON.parse(body)
    deepStrictEqual(users, [
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 }
    ])
  }

  {
    const { statusCode, body } = await app.inject({
      method: 'POST',
      url: '/rpc/getUsers',
      body: JSON.stringify({ maxAge: 'string' }),
      headers: {
        'content-type': 'application/json'
      }
    })
    strictEqual(statusCode, 400)

    const error = JSON.parse(body)
    deepStrictEqual(error, {
      code: 'FST_ERR_VALIDATION',
      error: 'Bad Request',
      message: 'body/maxAge must be number',
      statusCode: 400
    })
  }

  {
    const { statusCode, body } = await app.inject({
      method: 'POST',
      url: '/rpc/getRecursiveNode',
      body: JSON.stringify({}),
      headers: {
        'content-type': 'application/json'
      }
    })
    strictEqual(statusCode, 200, body)

    const users = JSON.parse(body)
    deepStrictEqual(users, {
      id: 'root',
      nodes: [null, { id: 'node-1', nodes: [null, { id: 'node-2', nodes: [] }] }, { id: 'node-3', nodes: [] }]
    })
  }
})
