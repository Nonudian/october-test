import axios from 'axios'
import { encodeQueryString } from '../../helpers'
import type { GetPhoneSchema } from './phone.schema'
import type {
  DatastoreResponse,
  LegalUnit,
  SireneResponse,
} from './phone.types'

const prefixPhone = (phone: string) => phone.replace(/^[0]/, '+33')

export const checkSiren = async (name: string, siren?: string) => {
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

  return unit as LegalUnit
}

export const checkPhone = async (siren: string) => {
  const { data } = await axios.get<DatastoreResponse>(
    `https://api.api-datastore.com/api/v1.1/Company/${siren}/Siege`,
    {
      headers: {
        Authorization:
          'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2YWx1ZSI6eyJBdXRoS2V5IjoidTVXQWI2OElwVW4yM0hnVG05MVMiLCJFeHBpcmVzIjoiMjAyMi0wNi0yNlQyMDo1Nzo1MS43MzgxNjU5KzAyOjAwIiwiTm9tIjoiV0lMTElBTSIsIlByZW5vbSI6IkNIQVpPVCIsIkVtYWlsIjoid2lsbGlhbS5jaGF6b3RAZ21haWwuY29tIn19.3ZU161fMuBLtwKf_nGR7L0lRBc3hL34jgq-MiDnZyFM',
        Accept: 'application/json',
      },
    }
  )

  const phone = {
    portable: data.portable ? prefixPhone(data.portable) : data.portable,
    telfixe: data.telfixe ? prefixPhone(data.telfixe) : data.telfixe,
    tel: data.tel ? prefixPhone(data.tel) : data.tel,
  }

  return phone
}

/* GET phone service, containing all business logic */
export const retrievePhone = async ({ name, siren }: GetPhoneSchema) => {
  /* Make checks on input data. */
  const unit = await checkSiren(name, siren)

  /* Retrieve phone number based on siren. */
  const phone = await checkPhone(unit.siren)

  return phone
}
