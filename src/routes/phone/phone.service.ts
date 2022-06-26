import { encodeQueryString, retrieveFromExternalAPI } from '../../helpers'
import type { GetPhoneSchema } from './phone.schema'
import type { DatastoreAPIResponse, SireneAPIResponse } from './phone.types'

/**
 * Replace the 0 zero by +33 code in the given french phone number.
 * @param phone - The string to modify.
 * @returns The formatted phone number.
 */
const prefixPhone = (phone: string) => phone.replace(/^[0]/, '+33')

/* GET phone service, containing all business logic */
export const retrievePhone = async ({ name, siren }: GetPhoneSchema) => {
  /* ------ PHASE 1: Check truthfulness of input data ------ */

  const { unitesLegales: companies } =
    await retrieveFromExternalAPI<SireneAPIResponse>({
      /* Public API from INSEE, about companies */
      baseUrl: 'https://api.insee.fr/entreprises/sirene/V3/siren/',
      params: {
        /* Filter companies by name or siren, that are not under closure */
        q: `(periode(denominationUniteLegale:"${encodeQueryString(name)}")${
          !siren ? '' : `OR siren:${siren}`
        }) AND periode(etatAdministratifUniteLegale:A)`,
        /* Prune null values */
        masquerValeursNulles: 'true',
        /* Extract information, like siren, name or last activity date */
        champs: [
          'siren',
          'denominationUniteLegale',
          'dateDernierTraitementUniteLegale',
        ].join(','),
      },
      /* Temporary token to authorize request */
      authorizationToken: 'dbf00bba-50c4-3bf3-ba97-8768b475346c',
    })

  /* At the end, return only one company */
  const company =
    companies.length === 1
      ? companies[0]
      : /* For multiple companies found, and if no siren is provided by the user */
        companies
          /* Prune all companies where the last period does not correspond to exact denomination */
          .filter(({ periodesUniteLegale: periods }) => {
            const [lastPeriod] = periods

            return lastPeriod.denominationUniteLegale === name
          })
          /* Sort by last company activity date */
          .sort(
            (first, second) =>
              /* Compare date, parse the boolean to number with + operator, and negate the result to sort desc */
              -+(
                new Date(first.dateDernierTraitementUniteLegale) >
                new Date(second.dateDernierTraitementUniteLegale)
              )
          )[0]

  /* ------ PHASE 2: Retrieve phone number based on truthy siren ------ */

  const { telfixe, tel, portable } =
    await retrieveFromExternalAPI<DatastoreAPIResponse>({
      /* Free demo API from API Datastore, about companies that provide phone */
      baseUrl: `https://api.api-datastore.com/api/v1.1/Company/${company.siren}/Siege`,
      /* Temporary token to authorize request */
      authorizationToken:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2YWx1ZSI6eyJBdXRoS2V5IjoidTVXQWI2OElwVW4yM0hnVG05MVMiLCJFeHBpcmVzIjoiMjAyMi0wNi0yN1QwMjo0NDoyMy4zMTQ1NjM3KzAyOjAwIiwiTm9tIjoiV0lMTElBTSIsIlByZW5vbSI6IkNIQVpPVCIsIkVtYWlsIjoid2lsbGlhbS5jaGF6b3RAZ21haWwuY29tIn19.GAXHuueFcMAtd8-aph5sr7bHcYf5Y6tdO9TYH67KPvQ',
    })

  return {
    data: prefixPhone(
      telfixe ?? tel ?? portable ?? 'No phone found for this company.'
    ),
  }
}
