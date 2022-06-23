import cors from 'cors'
import express, { json } from 'express'
import { APPLICATION_PORT } from './config'
import { error } from './handlers'
import { routes } from './routes'

/**
 * Setup express application
 */
const app = express()

/**
 * Setup middlewares
 */
app.use(json(), cors())

/**
 * Setup routes
 */
app.use(routes)

/**
 * Setup error handler (should be the last!)
 */
app.use(error)

/**
 * Setup server listening
 */
app.listen(APPLICATION_PORT, () => console.log('Server is launched!'))
