import { createClient } from '@/lib/supabase/server'
import HomeClient from './HomeClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'NavéStats – Pronostics & Statistiques Navétanes Khombole 2026',
  description: 'La première plateforme communautaire de pronostics et statistiques des Navétanes de Khombole. Pronostiquez les matchs, gagnez des points et grimpez dans le classement. 17 équipes, scores en direct.',
  openGraph: {
    title: 'NavéStats – Pronostics Navétanes Khombole 2026',
    description: 'Plateforme communautaire de pronostics et statistiques. Rejoignez des milliers de pronostiqueurs !',
    url: 'https://navestats.site',
    siteName: 'NavéStats',
    images: [
      {
        url: 'https://navestats.site/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'NavéStats - Pronostics Navétanes Khombole',
      },
    ],
    type: 'website',
    locale: 'fr_FR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NavéStats – Pronostics Navétanes Khombole',
    description: 'Rejoignez la communauté NavéStats et pronostiquez les matchs des Navétanes de Khombole',
    images: ['https://navestats.site/og-image.jpg'],
  },
}

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'NavéStats',
  description: 'Plateforme communautaire de pronostics et statistiques des Navétanes de Khombole',
  url: 'https://navestats.site',
  potentialMatch: {
    '@type': 'SportsEvent',
    name: 'Navétanes de Khombole 2026',
    sport: 'Football',
    location: {
      '@type': 'Place',
      name: 'Stade de Khombole',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Khombole',
        addressCountry: 'SN',
      },
    },
  },
  publisher: {
    '@type': 'Organization',
    name: 'NavéStats',
    url: 'https://navestats.site',
    logo: {
      '@type': 'ImageObject',
      url: 'https://navestats.site/logo.png',
    },
  },
  inLanguage: 'fr-FR',
}

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const today = new Date().toISOString().split('T')[0]

  // Matchs du jour
  const { data: matchsDuJour } = await supabase
    .from('matchs')
    .select(`*, equipe_a:equipes!matchs_equipe_a_id_fkey(*), equipe_b:equipes!matchs_equipe_b_id_fkey(*)`)
    .eq('date_match', today)
    .order('heure_match')

  // Derniers résultats (5 derniers matchs terminés)
  const { data: derniersResultats } = await supabase
    .from('matchs')
    .select(`*, equipe_a:equipes!matchs_equipe_a_id_fkey(*), equipe_b:equipes!matchs_equipe_b_id_fkey(*)`)
    .eq('statut', 'termine')
    .order('date_match', { ascending: false })
    .limit(5)

  // Prochains matchs (si pas de matchs aujourd'hui)
  const { data: prochainsMatchs } = await supabase
    .from('matchs')
    .select(`*, equipe_a:equipes!matchs_equipe_a_id_fkey(*), equipe_b:equipes!matchs_equipe_b_id_fkey(*)`)
    .eq('statut', 'a_venir')
    .gte('date_match', today)
    .order('date_match')
    .limit(6)

  // Top pronostiqueurs
  const { data: topPronostiqueurs } = await supabase
    .from('profiles')
    .select('*')
    .order('points', { ascending: false })
    .limit(10)

  const { count: totalPronostiqueurs } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  // Stats globales pour le dashboard
  const { count: totalMatchs } = await supabase
    .from('matchs')
    .select('*', { count: 'exact', head: true })

  const { count: totalPronostics } = await supabase
    .from('pronostics')
    .select('*', { count: 'exact', head: true })

  const { data: pointsData } = await supabase
    .from('pronostics')
    .select('points_gagnes')

  const totalPoints = (pointsData as Array<{ points_gagnes: number | null }> | null)?.reduce((sum, p) => sum + (p.points_gagnes || 0), 0) || 0

  // Actualités
  const { data: actualites } = await supabase
    .from('actualites')
    .select('*')
    .eq('est_publie', true)
    .order('created_at', { ascending: false })
    .limit(4)

  const displayMatchs = (matchsDuJour && matchsDuJour.length > 0) ? matchsDuJour : (prochainsMatchs || [])
  const isToday = matchsDuJour && matchsDuJour.length > 0

  return (
    <HomeClient
      matchCount={displayMatchs.length}
      userCount={totalPronostiqueurs || 0}
      isAuthenticated={!!user}
      displayMatchs={displayMatchs}
      isToday={isToday || false}
      topPronostiqueurs={(topPronostiqueurs as any[])?.slice(0, 5).map(u => ({
        username: u.username,
        points: u.points,
        accuracy: u.total_pronostics > 0 ? Math.round((u.pronostics_corrects / u.total_pronostics) * 100) : 0,
        avatar_url: u.avatar_url,
      }))}
      statsGlobales={{
        totalPronostics: totalPronostics || 0,
        totalUtilisateurs: totalPronostiqueurs || 0,
        totalMatchs: totalMatchs || 0,
        totalPoints: totalPoints,
      }}
    />
  )
}
