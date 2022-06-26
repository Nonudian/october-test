import hash from 'object-hash'
import { cache } from '../../handlers'
import { registerRoutes } from '../../helpers'
import { GetPhoneSchema } from './phone.schema'
import { retrievePhone } from './phone.service'

/* Phone routes, containing all HTTP route setup and controller callback */
export const PhoneRoutes = registerRoutes({
  prefix: '/phone',
  method: 'get',
  validation: GetPhoneSchema,
  callback: async (input) => {
    /* Check for a retrieval from cache (with hashing that guarantees uniqueness) */
    if (cache.has(hash(input))) return cache.get(hash(input))

    /* Otherwise, retrieve data from service call */
    const phone = await retrievePhone(input)

    /* Save the new data in cache before returning it */
    cache.set(hash(input), phone)

    return phone
  },
})
