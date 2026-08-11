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
        url: 'https://navestats.site/og.png',
        width: 1200,
        height: 630,
        alt: 'NavéStats - Pronostics Football Khombole',
      },
    ],
    type: 'website',
    locale: 'fr_FR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NavéStats – Pronostics Navétanes Khombole',
    description: 'Rejoignez la communauté NavéStats et pronostiquez les matchs des Navétanes de Khombole',
    images: ['https://navestats.site/og.png'],
  },
}

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'NavéStats',
  description: 'Plateforme communautaire de pronostics et statistiques des Navétanes de Khombole',
  url: 'https://navestats.site',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://navestats.site/matchs?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
  publisher: {
    '@type': 'Organization',
    name: 'NavéStats',
    url: 'https://navestats.site',
    logo: {
      '@type': 'ImageObject',
      url: 'https://navestats.site/icons/icon-512.png',
    },
  },
  inLanguage: ['fr-FR', 'wo-SN'],
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

  // Matchs cadets du jour
  const { data: cadetsDuJour } = await supabase
    .from('cadet_matchs')
    .select('*, equipe_a_info:equipes!cadet_matchs_equipe_a_id_fkey(id, nom, sigle, logo_url, couleur_principale, couleur_secondaire), equipe_b_info:equipes!cadet_matchs_equipe_b_id_fkey(id, nom, sigle, logo_url, couleur_principale, couleur_secondaire)')
    .eq('date_match', today)
    .order('journee')
    .order('ordre')

  // Prochains matchs cadets
  const { data: prochainsCadets } = await supabase
    .from('cadet_matchs')
    .select('*, equipe_a_info:equipes!cadet_matchs_equipe_a_id_fkey(id, nom, sigle, logo_url, couleur_principale, couleur_secondaire), equipe_b_info:equipes!cadet_matchs_equipe_b_id_fkey(id, nom, sigle, logo_url, couleur_principale, couleur_secondaire)')
    .gte('date_match', today)
    .order('journee')
    .order('date_match')
    .order('ordre')
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

  // Rang du joueur connecté (basé sur les points)
  let myRank: number | null = null
  if (user) {
    const { data: ranked } = await supabase
      .from('profiles')
      .select('id')
      .order('points', { ascending: false })
    const idx = ((ranked || []) as { id: string }[]).findIndex(p => p.id === user.id)
    if (idx >= 0) myRank = idx + 1
  }

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

  // Top équipes du classement
  const { data: topEquipes } = await supabase
    .from('equipes')
    .select('nom, sigle, logo_url, points_classement, matchs_joues, couleur_principale, couleur_secondaire')
    .order('points_classement', { ascending: false })
    .limit(5)

  // Partenaires / sponsors actifs
  const { data: partenaires } = await supabase
    .from('partenaires')
    .select('*')
    .eq('actif', true)
    .order('ordre')
    .limit(10)

  const displayMatchs = (matchsDuJour && matchsDuJour.length > 0) ? matchsDuJour : (prochainsMatchs || [])
  const displayCadets = (cadetsDuJour && cadetsDuJour.length > 0) ? cadetsDuJour : (prochainsCadets || [])
  const isToday = matchsDuJour && matchsDuJour.length > 0

  const matchAleUne = ((displayMatchs || []) as any[]).find((m: any) => m.statut === 'a_venir') || displayMatchs?.[0] || null

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeClient
      matchCount={displayMatchs.length}
      userCount={totalPronostiqueurs || 0}
      isAuthenticated={!!user}
      myRank={myRank}
      displayMatchs={displayMatchs}
      derniersResultats={((derniersResultats || []) as any[])}
      isToday={isToday || false}
      topPronostiqueurs={(topPronostiqueurs as any[])?.slice(0, 8).map(u => ({
        id: u.id,
        username: u.username || 'Joueur',
        points: u.points || 0,
        total_pronostics: u.total_pronostics || 0,
        pronostics_corrects: u.pronostics_corrects || 0,
        rang: u.rang || 0,
        accuracy: u.total_pronostics > 0 ? Math.round(((u.pronostics_corrects || 0) / u.total_pronostics) * 100) : 0,
        avatar_url: u.avatar_url || undefined,
      }))}
      statsGlobales={{
        totalPronostics: totalPronostics || 0,
        totalUtilisateurs: totalPronostiqueurs || 0,
        totalMatchs: totalMatchs || 0,
        totalPoints: totalPoints,
      }}
      actualites={(actualites || [])}
      topEquipes={((topEquipes as any[]) || []).map(e => ({
        nom: e.nom,
        sigle: e.sigle,
        logo_url: e.logo_url,
        points_classement: e.points_classement || 0,
        matchs_joues: e.matchs_joues || 0,
        couleur_principale: e.couleur_principale,
        couleur_secondaire: e.couleur_secondaire,
      }))}
      displayCadets={displayCadets}
      cadetsToday={!!(cadetsDuJour && cadetsDuJour.length > 0)}
      matchAleUne={matchAleUne}
      partenaires={(partenaires || [])}
    />
    </>
  )
}
