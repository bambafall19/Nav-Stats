import { createClient } from '@/lib/supabase/server'
import MatchsClientWrapper from './MatchsClientWrapper'
import type { Metadata } from 'next'
import { defaultCadetMatches, type CadetEquipe, type CadetMatch } from '@/lib/cadets'
import type { Match } from '@/components/matchs/MatchListClient'

export const metadata: Metadata = {
  title: 'Calendrier des Matchs – Navétanes Khombole 2026 | NavéStats',
  description: 'Consultez tous les matchs des Navétanes de Khombole. Calendrier officiel, scores en direct, et pronostics pour la saison 2026. 17 équipes en compétition.',
  openGraph: {
    title: 'Calendrier des Matchs – Navétanes Khombole 2026',
    description: 'Suivez tous les matchs des Navétanes de Khombole en temps réel. Pronostiquez et gagnez des points !',
    url: 'https://navestats.site/matchs',
    siteName: 'NavéStats',
    images: [
      {
        url: 'https://navestats.site/og.png',
        width: 1200,
        height: 630,
        alt: 'NavéStats - Calendrier des Matchs',
      },
    ],
    type: 'website',
    locale: 'fr_FR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calendrier des Matchs – Navétanes Khombole',
    description: 'Suivez les matchs des Navétanes de Khombole en temps réel sur NavéStats',
    images: ['https://navestats.site/og.png'],
  },
}

export const dynamic = 'force-dynamic'

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SportsEvent',
  name: 'Navétanes de Khombole 2026',
  description: 'Championnat de football des Navétanes Zone 6 de Khombole',
  startDate: '2026-07-01',
  endDate: '2026-09-30',
  location: {
    '@type': 'Place',
    name: 'Stade de Khombole',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Khombole',
      addressCountry: 'SN',
    },
  },
  organizer: {
    '@type': 'Organization',
    name: 'NavéStats',
    url: 'https://navestats.site',
  },
  sport: 'Football',
}

export default async function MatchsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { cat } = await searchParams
  const supabase = await createClient()

  // Fetch all senior matches with team data
  const [{ data: rawMatchs }, { data: dbCadets, error: cadetsError }, { data: cadetEquipes }] = await Promise.all([
    supabase
      .from('matchs')
      .select(`*, equipe_a:equipes!matchs_equipe_a_id_fkey(*), equipe_b:equipes!matchs_equipe_b_id_fkey(*)`)
      .order('date_match', { ascending: true })
      .order('heure_match', { ascending: true }),
    supabase
      .from('cadet_matchs')
      .select(`
        id, journee, date_match, poule, equipe_a_id, equipe_b_id, equipe_a, equipe_b, terrain, ordre, score_a, score_b, statut, forfait,
        equipe_a_info:equipes!cadet_matchs_equipe_a_id_fkey(id, nom, sigle, logo_url, couleur_principale, couleur_secondaire, quartier, asc_nom),
        equipe_b_info:equipes!cadet_matchs_equipe_b_id_fkey(id, nom, sigle, logo_url, couleur_principale, couleur_secondaire, quartier, asc_nom)
      `)
      .order('journee')
      .order('date_match')
      .order('ordre'),
    supabase
      .from('equipes')
      .select('id, nom, sigle, logo_url, couleur_principale, couleur_secondaire, quartier, asc_nom')
      .order('nom'),
  ])

  const matchs = (rawMatchs || []) as Match[]
  const cadetMatches: CadetMatch[] = !cadetsError && dbCadets?.length ? dbCadets as CadetMatch[] : defaultCadetMatches
  const journees = [...new Set(cadetMatches.map(match => match.journee))]
  const equipesList: CadetEquipe[] = (cadetEquipes || []) as CadetEquipe[]
  const catTab = cat === 'cadets' ? 'cadets' : 'senior'

  return (
    <div className="page-content">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container-app">
        <MatchsClientWrapper
          key={catTab}
          initialTab={catTab}
          initialMatchs={matchs}
          cadetMatches={cadetMatches}
          equipesList={equipesList}
          journees={journees}
        />
      </div>
    </div>
  )
}
