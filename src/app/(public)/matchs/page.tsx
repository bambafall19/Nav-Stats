import { createClient } from '@/lib/supabase/server'
import MatchsClientWrapper from './MatchsClientWrapper'
import type { Metadata } from 'next'

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
        url: 'https://navestats.site/og-matchs.jpg',
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
    images: ['https://navestats.site/og-matchs.jpg'],
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

export default async function MatchsPage() {
  const supabase = await createClient()

  // Fetch all matches with team data
  const { data: rawMatchs } = await supabase
    .from('matchs')
    .select(`*, equipe_a:equipes!matchs_equipe_a_id_fkey(*), equipe_b:equipes!matchs_equipe_b_id_fkey(*)`)
    .order('date_match', { ascending: true })
    .order('heure_match', { ascending: true })

  const matchs = (rawMatchs || []) as any[]

  return (
    <div className="page-content">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container-app">
        <div style={{ marginBottom: 32 }}>
          <h1 className="section-title" style={{ fontSize: '2.2rem', marginBottom: 4, fontFamily: 'var(--font-outfit)' }}>
            ⚽ Calendrier des Matchs
          </h1>
          <p className="section-subtitle">
            Calendrier officiel des phases de poules des Navétanes Zone 6 de Khombole
          </p>
        </div>

        <MatchsClientWrapper initialMatchs={matchs} />
      </div>
    </div>
  )
}
