import { z } from 'zod'

export const CompanyPayloadSchema = z.object({
  name: z.string().min(1),
  siren: z
    .string()
    .regex(/\d{9}|\d{3}[\s]\d{3}[\s]\d{3}/)
    .optional(),
  postalCode: z
    .string()
    .regex(/(\d{5})\s([A-Z]+(?:[\s-][A-Z]+)*)+/i)
    .optional(),
})
