export type CadetMatch = {
  id?: string
  journee: number
  date_match: string
  poule: string
  equipe_a_id?: string | null
  equipe_b_id?: string | null
  equipe_a: string
  equipe_b: string
  terrain: string
  ordre: string | null
  equipe_a_info?: CadetEquipe | null
  equipe_b_info?: CadetEquipe | null
}

export type CadetEquipe = {
  id: string
  nom: string
  sigle: string | null
  logo_url: string | null
  couleur_principale: string
  couleur_secondaire: string
  quartier: string | null
  asc_nom: string | null
}

export const defaultCadetMatches: CadetMatch[] = [
  { journee: 1, date_match: '2026-08-08', poule: 'A', equipe_a: 'ASC BOKK-JOM', equipe_b: 'ASC ENTENTE C.S', terrain: 'RAIL', ordre: null },
  { journee: 1, date_match: '2026-08-08', poule: 'A', equipe_a: 'ASC MAGG-DANE', equipe_b: 'ASC MANKO', terrain: 'JAPPO', ordre: null },
  { journee: 1, date_match: '2026-08-08', poule: 'B', equipe_a: 'ASC ESPOIRS', equipe_b: 'ASC JUBBO', terrain: 'DIAMBAR', ordre: null },
  { journee: 1, date_match: '2026-08-08', poule: 'B', equipe_a: 'ASC WALYDANE', equipe_b: 'ASC RAIL', terrain: 'MAAG-DAAN', ordre: null },
  { journee: 1, date_match: '2026-08-09', poule: 'B&C', equipe_a: 'ASC KAIRE', equipe_b: 'ASC LAT-DIOR', terrain: 'DIAPPO', ordre: null },
  { journee: 1, date_match: '2026-08-09', poule: 'B&C', equipe_a: 'ASC KHAIGUI', equipe_b: 'ASC THILLA', terrain: 'RAIL', ordre: null },
  { journee: 1, date_match: '2026-08-09', poule: 'C', equipe_a: 'ASC DIAMBARS', equipe_b: 'YAKAAR', terrain: 'MAAG-DAAN', ordre: null },
  { journee: 1, date_match: '2026-08-09', poule: 'C', equipe_a: 'ASC RAKADIOU', equipe_b: 'ASC JAPPO', terrain: 'DIAMBARS', ordre: null },
  { journee: 2, date_match: '2026-08-11', poule: 'A', equipe_a: 'ASC MANKO', equipe_b: 'ASC ENTENTE C.S', terrain: 'MAAG-DAAN', ordre: null },
  { journee: 2, date_match: '2026-08-11', poule: 'A', equipe_a: 'ASC MAGG-DANE', equipe_b: 'ASC BOKK-JOM', terrain: 'RAIL', ordre: null },
  { journee: 2, date_match: '2026-08-11', poule: 'B', equipe_a: 'ASC JUBBO', equipe_b: 'ASC KHAIGUI', terrain: 'JAPPO', ordre: null },
  { journee: 2, date_match: '2026-08-11', poule: 'B', equipe_a: 'ASC ESPOIRS', equipe_b: 'ASC WALYDANE', terrain: 'MAAG-DAAN', ordre: null },
  { journee: 2, date_match: '2026-08-12', poule: 'B&C', equipe_a: 'ASC GUINAW RAIL', equipe_b: 'ASC THILLA', terrain: 'MAAG-DAAN', ordre: null },
  { journee: 2, date_match: '2026-08-12', poule: 'B&C', equipe_a: 'ASC KAIRE', equipe_b: 'ASC DIAMBARS', terrain: 'JAPPO', ordre: null },
  { journee: 2, date_match: '2026-08-12', poule: 'C', equipe_a: 'ASC LAT-DIOR', equipe_b: 'RAKADIOU', terrain: 'DIAMBARS', ordre: null },
  { journee: 2, date_match: '2026-08-12', poule: 'C', equipe_a: 'ASC YAKAAR', equipe_b: 'ASC JAPPO', terrain: 'MAAG-DAAN', ordre: null },
  { journee: 3, date_match: '2026-08-15', poule: 'A', equipe_a: 'ASC MAGG-DANE', equipe_b: 'ASC ENTENTE C.S', terrain: 'RAIL', ordre: null },
  { journee: 3, date_match: '2026-08-15', poule: 'A', equipe_a: 'ASC BOKK-JOM', equipe_b: 'ASC MANKO', terrain: 'DIAMBARS', ordre: null },
  { journee: 3, date_match: '2026-08-15', poule: 'B', equipe_a: 'ASC JUBBO', equipe_b: 'ASC THILLA', terrain: 'MAAG-DAAN', ordre: null },
  { journee: 3, date_match: '2026-08-15', poule: 'B', equipe_a: 'ASC RAIL', equipe_b: 'ASC ESPOIRS', terrain: 'JAPPO', ordre: null },
  { journee: 3, date_match: '2026-08-16', poule: 'B&C', equipe_a: 'WALYDANE', equipe_b: 'ASC KHAIGUI', terrain: 'MAAG-DAAN', ordre: null },
  { journee: 3, date_match: '2026-08-16', poule: 'B&C', equipe_a: 'ASC YAKAAR', equipe_b: 'ASC KAIRE', terrain: 'JAPPO', ordre: null },
  { journee: 3, date_match: '2026-08-16', poule: 'C', equipe_a: 'ASC LAT-DIOR', equipe_b: 'ASC JAPPO', terrain: 'DIAMBARS', ordre: null },
  { journee: 3, date_match: '2026-08-16', poule: 'C', equipe_a: 'ASC DIAMBARS', equipe_b: 'ASC RAKADIOU', terrain: 'RAIL', ordre: null },
  { journee: 4, date_match: '2026-08-19', poule: 'B', equipe_a: 'ASC ESPOIRS', equipe_b: 'ASC THILLA', terrain: 'DIAMBARS', ordre: '1ere H' },
  { journee: 4, date_match: '2026-08-19', poule: 'B', equipe_a: 'ASC WALYDANE', equipe_b: 'ASC JUBBO', terrain: 'DIAMBARS', ordre: '2e H' },
  { journee: 4, date_match: '2026-08-19', poule: 'B&C', equipe_a: 'ASC RAKADIOU', equipe_b: 'ASC YAKAAR', terrain: 'JAPPO', ordre: '1ere H' },
  { journee: 4, date_match: '2026-08-19', poule: 'B&C', equipe_a: 'ASC RAIL', equipe_b: 'ASC KHAIGUI', terrain: 'JAPPO', ordre: '2e H' },
  { journee: 4, date_match: '2026-08-19', poule: 'C', equipe_a: 'ASC LAT-DIOR', equipe_b: 'ASC DIAMBARS', terrain: 'MAAG-DAAN', ordre: '1ere H' },
  { journee: 4, date_match: '2026-08-19', poule: 'C', equipe_a: 'ASC JAPPO', equipe_b: 'ASC KAIRE', terrain: 'MAAG-DAAN', ordre: '2e H' },
  { journee: 5, date_match: '2026-08-22', poule: 'B', equipe_a: 'ASC KHAIGUI', equipe_b: 'ASC ESPOIRS', terrain: 'DIAMBARS', ordre: '1ere H' },
  { journee: 5, date_match: '2026-08-22', poule: 'B', equipe_a: 'ASC RAIL', equipe_b: 'ASC JUBBO', terrain: 'DIAMBARS', ordre: '2e H' },
  { journee: 5, date_match: '2026-08-22', poule: 'B&C', equipe_a: 'ASC WALYDANE', equipe_b: 'ASC THILLA', terrain: 'JAPPO', ordre: '1ere H' },
  { journee: 5, date_match: '2026-08-22', poule: 'B&C', equipe_a: 'ASC RAKADIOU', equipe_b: 'ASC KAIRE', terrain: 'JAPPO', ordre: '2e H' },
  { journee: 5, date_match: '2026-08-22', poule: 'C', equipe_a: 'ASC LAT-DIOR', equipe_b: 'ASC YAKAAR', terrain: 'RAIL', ordre: '1ere H' },
  { journee: 5, date_match: '2026-08-22', poule: 'C', equipe_a: 'ASC DIAMBARS', equipe_b: 'ASC JAPPO', terrain: 'RAIL', ordre: '2e H' },
]

export function normalizeAscName(name: string) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/^asc\s+/, '')
    .replace(/[^a-z0-9]/g, '')
}
