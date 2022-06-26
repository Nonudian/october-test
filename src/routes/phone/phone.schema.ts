import { z } from 'zod'

/* Input/payload schema for our company phone GET request */
export const GetPhoneSchema = z.object({
  name: z.string().min(1),
  siren: z
    .string()
    .regex(/^(\d{9}|\d{3}[\s]\d{3}[\s]\d{3})$/ /* siren (9 numbers) regex */)
    .optional(),
  postalCode: z
    .string()
    .regex(
      /^((\d{5})\s([A-Z]+(?:[\s-][A-Z]+)*)+)$/ /* zipcode and city regex */
    )
    .optional(),
})

export type GetPhoneSchema = z.infer<typeof GetPhoneSchema>
