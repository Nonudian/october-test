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

interface DatastoreResponse {
  portable: string | null
  telfixe: string | null
  tel: string | null
}

/**
 * Encode given string by replacing all spaces by '+'.
 * Useful for URL query params.
 *
 * @param string - The string to encode.
 * @returns The encoded string.
 */
const encodeSpaces = (string: string) => string.replace(/\s/g, '+')

const checkSiren = async (name: string, siren?: string) => {
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

  cache.set(`${name}:${siren}`, { unit })

  return unit as LegalUnit
}

const checkPhone = async (name: string, siren: string) => {
  const { data } = await axios.get<DatastoreResponse>(
    `https://api.api-datastore.com/api/v1.1/Company/${siren}/Siege`,
    {
      headers: {
        Authorization:
          'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2YWx1ZSI6eyJBdXRoS2V5IjoidTVXQWI2OElwVW4yM0hnVG05MVMiLCJFeHBpcmVzIjoiMjAyMi0wNi0yNVQyMjoyNzo1OS43MTYxNzA4KzAyOjAwIiwiTm9tIjoiV0lMTElBTSIsIlByZW5vbSI6IkNIQVpPVCIsIkVtYWlsIjoid2lsbGlhbS5jaGF6b3RAZ21haWwuY29tIn19.4xti_b_sXTQc0hBklfEf2KoCnv0k4vXkLvDJ17gXslc',
        Accept: 'application/json',
      },
    }
  )

  const phone = {
    portable: data.portable,
    telfixe: data.telfixe,
    tel: data.tel,
  }

  cache.set(`${name}:${siren}`, { phone })

  return phone
}

CompanyRoute.route('/company').get(
  catchAsync(async (req) => {
    const { name, siren } = CompanyPayloadSchema.strict().parse(req.body)

    /* PHASE 1: Make checks on input data. */
    const unit = cache.has(`${name}:${siren}`)
      ? (cache.get(`${name}:${siren}`) as LegalUnit)
      : await checkSiren(name, siren)

    /* PHASE 2: Retrieve phone number based on siren. */
    const phone = cache.has(`${name}:${siren}`)
      ? (cache.get(`${name}:${siren}`) as string)
      : await checkPhone(name, unit.siren)

    /* PHASE 3: Check back retrieved data to provide. */

    //TODO: change 0 to +33
    //TODO: analyze output data (PHASE 3)
    //TODO: cache by property (because now it returns not phone but unit in cache)
    //TODO: better handle types and structure
    //TODO: move code into service file

    return phone
  })
)

export { CompanyRoute }
