import type { Nullable } from '../../helpers'

interface LegalUnitPeriod {
  denominationUniteLegale: string
}

export interface LegalUnit {
  siren: string
  periodesUniteLegale: Array<LegalUnitPeriod>
}

export interface SireneResponse {
  unitesLegales: Array<LegalUnit>
}

export interface DatastoreResponse {
  portable: Nullable<string>
  telfixe: Nullable<string>
  tel: Nullable<string>
}
