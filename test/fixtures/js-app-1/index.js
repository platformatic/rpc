import fastifyAutoload from '@fastify/autoload'
import fastify from 'fastify'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import fastifyRpc from '../../../lib/index.js'

export const app = fastify()

const openapiSchemaPath = resolve(import.meta.dirname, 'openapi.json')
const openapiSchemaFile = readFileSync(openapiSchemaPath, 'utf8')
const openapiSchema = JSON.parse(openapiSchemaFile)

await app.register(fastifyRpc, { openapi: openapiSchema })
await app.register(fastifyAutoload, { dir: resolve(import.meta.dirname, 'plugins') })
