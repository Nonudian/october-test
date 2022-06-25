import axios from 'axios'
import { Router } from 'express'
import { cache, catchAsync } from '../../handlers'
import { CompanyPayloadSchema } from './company.payload'

const CompanyRoute = Router()

interface LegalUnitPeriod {
  denominationUniteLegale: string
}

interface LegalUnit {
  siren: string
  periodesUniteLegale: Array<LegalUnitPeriod>
}

interface SireneResponse {
  unitesLegales: Array<LegalUnit>
}

/**
 * Encode given string by replacing all spaces by '+'.
 * Useful for URL query params.
 *
 * @param string - The string to encode.
 * @returns The encoded string.
 */
const encodeSpaces = (string: string) => string.replace(/\s/g, '+')

CompanyRoute.route('/company').get(
  catchAsync(async (req) => {
    const { name, siren } = CompanyPayloadSchema.strict().parse(req.body)

    /* PHASE 0: Check on cache if the data has been already queried. */

    if (cache.has(name)) return cache.get(name)

    /* PHASE 1: Make checks on input data. */

    const encodedName = encodeSpaces(name)

    const params = new URLSearchParams({
      q: `(periode(denominationUniteLegale:*${encodedName}*) OR siren:${siren}) AND -periode(etatAdministratifUniteLegale:C)`,
      masquerValeursNulles: 'true',
      champs: ['siren', 'denominationUniteLegale'].join(','),
    })

    const {
      data: { unitesLegales: legalUnits },
    } = await axios.get<SireneResponse>(
      `https://api.insee.fr/entreprises/sirene/V3/siren/?${params.toString()}`,
      {
        headers: {
          Authorization: 'Bearer dbf00bba-50c4-3bf3-ba97-8768b475346c',
          Accept: 'application/json',
        },
      }
    )

    const unit = legalUnits.find(({ periodesUniteLegale }) =>
      periodesUniteLegale.some(
        ({ denominationUniteLegale }) => denominationUniteLegale === name
      )
    )

    /* PHASE 2: Retrieve phone number based on siren. */

    /* PHASE 3: Check back retrieved data to provide. */

    cache.set(name, unit)

    return { ...unit }
  })
)

export { CompanyRoute }
