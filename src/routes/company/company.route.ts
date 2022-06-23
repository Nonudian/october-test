import { Router } from 'express'
import { CompanyPayloadSchema } from './company.payload'

const CompanyRoute = Router()

CompanyRoute.route('/company').get((req, res) => {
  const parsedBody = CompanyPayloadSchema.strict().parse(req.body)

  return res.status(200).json(parsedBody)
})

export { CompanyRoute }
