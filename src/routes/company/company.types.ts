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
  portable: string | null
  telfixe: string | null
  tel: string | null
}
