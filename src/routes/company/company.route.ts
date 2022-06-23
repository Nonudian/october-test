import axios from 'axios'
import { Router } from 'express'
import { catchAsync } from '../../handlers'
import { CompanyPayloadSchema } from './company.payload'

const CompanyRoute = Router()

CompanyRoute.route('/company').get(
  catchAsync(async (req) => {
    const parsedBody = CompanyPayloadSchema.strict().parse(req.body)

    const test = await axios(`https://catfact.ninja/fact`, {})

    return { data: test.data, body: parsedBody }
  })
)

export { CompanyRoute }
