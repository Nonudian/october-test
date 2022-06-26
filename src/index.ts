import express, { json } from 'express'
import morgan from 'morgan'
import { APPLICATION_PORT } from './config'
import { error } from './handlers'
import { routes } from './routes'

/* Setup express application */
const app = express()

/* Connect basic middlewares */
app.use(json(), morgan('tiny'))

/* Connect routes */
app.use(routes)

/* Connect error handler (should be the last for 'next' calls!) */
app.use(error)

/* Launch server */
app.listen(APPLICATION_PORT, () => console.log('🚀 Server is launched!'))
