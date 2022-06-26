import axios from 'axios'
import { cache } from '../../handlers'
import { encodeQueryString, registerRoutes } from '../../helpers'
import { CompanyPayloadSchema } from './company.payload'
import type {
  DatastoreResponse,
  LegalUnit,
  SireneResponse,
} from './company.types'

const prefixPhone = (phone: string) => phone.replace(/^[0]/, '+33')

const checkSiren = async (name: string, siren?: string) => {
  const encodedName = encodeQueryString(name)

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
    portable: data.portable ? prefixPhone(data.portable) : data.portable,
    telfixe: data.telfixe ? prefixPhone(data.telfixe) : data.telfixe,
    tel: data.tel ? prefixPhone(data.tel) : data.tel,
  }

  cache.set(`${name}:${siren}`, { phone })

  return phone
}

export const CompanyRoute = registerRoutes({
  prefix: '/company',
  method: 'get',
  callback: async (req) => {
    const { name, siren } = CompanyPayloadSchema.strict().parse(req.body)

    /* PHASE 1: Make checks on input data. */
    const unit = cache.has(`${name}:${siren}`)
      ? (cache.get(`${name}:${siren}`) as LegalUnit)
      : await checkSiren(name, siren)

    /* PHASE 2: Retrieve phone number based on siren. */
    // const phone = cache.has(`${name}:${siren}`)
    //   ? (cache.get(`${name}:${siren}`) as string)
    //   : await checkPhone(name, unit.siren)

    /* PHASE 3: Check back retrieved data to provide. */
    //TODO: analyze output data (PHASE 3)

    //TODO: cache by property (because now it returns not phone but unit in cache)
    //TODO: better handle types and structure
    //TODO: move code into service file

    return { ...unit }
  },
})
