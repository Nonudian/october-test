import express, { json } from 'express'
import morgan from 'morgan'
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
app.use(json(), morgan('tiny'))

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
