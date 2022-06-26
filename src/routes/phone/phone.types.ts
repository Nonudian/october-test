import type { Nullable } from '../../helpers'

/* Sirene API response, with their used french terms as strings */
export interface SireneAPIResponse {
  ['header']: { ['nombre']: number }
  ['unitesLegales']: Array<Company>
}

export interface Company {
  ['siren']: string
  ['dateDernierTraitementUniteLegale']: string
  ['periodesUniteLegale']: Array<{
    ['denominationUniteLegale']: string
  }>
}

/* Datastore API response, with their used french terms as strings */
export interface DatastoreAPIResponse {
  ['portable']: Nullable<string>
  ['telfixe']: Nullable<string>
  ['tel']: Nullable<string>
}
