import { execa } from 'execa'
import { deepStrictEqual } from 'node:assert/strict'
import { cp, mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'

test('should generate an openapi schema from a ts app', async t => {
  const cwd = await mkdtemp(join(tmpdir(), 'fastify-rpc-'))
  t.after(() => rm(cwd, { recursive: true }))

  const fixtureDir = join(import.meta.dirname, 'fixtures', 'ts-app-1')
  await cp(fixtureDir, cwd, { recursive: true })

  const schemaPath = join(cwd, 'openapi.json')
  const tsConfigPath = join(cwd, 'tsconfig.json')

  const executablePath = join(import.meta.dirname, '../bin/cli.js')
  await execa('node', [executablePath, '--path', schemaPath, '--ts-config', tsConfigPath], { cwd })

  const openapiSchemaFile = await readFile(schemaPath, 'utf8')
  const openapiSchema = JSON.parse(openapiSchemaFile)

  deepStrictEqual(openapiSchema, {
    openapi: '3.0.0',
    info: {
      title: 'Platformatic RPC',
      version: '1.0.0'
    },
    paths: {
      '/addUser': {
        post: {
          operationId: 'addUser',
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/addUserArgs'
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Success',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/addUserReturnType'
                  }
                }
              }
            }
          }
        }
      },
      '/getUsers': {
        post: {
          operationId: 'getUsers',
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/getUsersArgs'
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Success',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/getUsersReturnType'
                  }
                }
              }
            }
          }
        }
      },
      '/getGroupByName': {
        post: {
          operationId: 'getGroupByName',
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/getGroupByNameArgs'
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Success',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/getGroupByNameReturnType'
                  }
                }
              }
            }
          }
        }
      },
      '/getRecursiveNode': {
        post: {
          operationId: 'getRecursiveNode',
          responses: {
            200: {
              description: 'Success',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/getRecursiveNodeReturnType'
                  }
                }
              }
            }
          }
        }
      }
    },
    components: {
      schemas: {
        addUserArgs: {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                name: {
                  type: 'string'
                },
                age: {
                  type: 'number'
                }
              },
              additionalProperties: false,
              required: ['age', 'name']
            }
          },
          additionalProperties: false,
          required: ['user']
        },
        addUserReturnType: {
          type: 'object',
          properties: {}
        },
        getUsersArgs: {
          type: 'object',
          properties: {
            maxAge: {
              type: 'number'
            }
          },
          additionalProperties: false,
          required: ['maxAge']
        },
        getUsersReturnType: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: {
                type: 'string'
              },
              age: {
                type: 'number'
              }
            },
            additionalProperties: false,
            required: ['age', 'name']
          }
        },
        getGroupByNameArgs: {
          type: 'object',
          properties: {
            name: {
              type: 'string'
            }
          },
          additionalProperties: false,
          required: ['name']
        },
        getGroupByNameReturnType: {
          type: 'object',
          properties: {
            name: {
              type: 'string'
            },
            users: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string'
                  },
                  age: {
                    type: 'number'
                  }
                },
                additionalProperties: false,
                required: ['age', 'name']
              }
            }
          },
          additionalProperties: false,
          required: ['users']
        },
        getRecursiveNodeReturnType: {
          $ref: '#/components/schemas/Node'
        },
        Node: {
          type: 'object',
          properties: {
            id: {
              type: 'string'
            },
            nodes: {
              type: 'array',
              items: {
                anyOf: [
                  {
                    $ref: '#/components/schemas/Node'
                  },
                  {
                    type: 'null'
                  }
                ]
              }
            }
          },
          additionalProperties: false,
          required: ['id', 'nodes']
        }
      }
    }
  })
})
