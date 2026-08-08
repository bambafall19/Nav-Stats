import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Target } from 'lucide-react'
import PronosticsClientWrapper from './PronosticsClientWrapper'
import type { Metadata } from 'next'
import MonEspace from '@/components/home/MonEspace'
import PageHero from '@/components/shared/PageHero'

export const metadata: Metadata = {
  title: 'Mes Pronostics – Navétanes Khombole 2026 | NavéStats',
  description: 'Suivez vos pronostics, vos points et vos performances. Consultez vos scores exacts et votre historique de prédictions sur les matchs des Navétanes de Khombole.',
  openGraph: {
    title: 'Mes Pronostics – Navétanes Khombole',
    description: 'Suivez vos pronostics et performances sur NavéStats',
    url: 'https://navestats.site/pronostics',
    siteName: 'NavéStats',
    images: [
      {
        url: 'https://navestats.site/og.png',
        width: 1200,
        height: 630,
        alt: 'NavéStats - Mes Pronostics',
      },
    ],
    type: 'website',
    locale: 'fr_FR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mes Pronostics – Navétanes Khombole',
    description: 'Suivez vos pronostics et vos performances',
    images: ['https://navestats.site/og.png'],
  },
}

export const dynamic = 'force-dynamic'

export default async function MesPronosticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="page-content">
        <div className="container-app">
          <PageHero
            icon={Target}
            title="Mes pronostics"
            subtitle="Retrouvez vos choix, vos scores exacts et vos points gagnés sur les matchs des Navétanes de Khombole."
          />
          <div className="card" style={{ padding: 40, textAlign: 'center' }}>
            <div style={{ fontSize: '2.8rem', marginBottom: 12 }}>🎯</div>
            <h2 style={{ fontSize: '1.3rem', marginBottom: 8 }}>Connectez-vous pour continuer</h2>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 22, fontSize: '0.88rem' }}>
              Créez votre compte gratuit pour pronostiquer et grimper dans le classement.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/auth/login" className="btn btn-primary">Connexion</Link>
              <Link href="/auth/register" className="btn btn-outline">S'inscrire</Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const { data: rawPronostics } = await supabase
    .from('pronostics')
    .select(`
      *,
      premier_buteur:joueurs!pronostics_premier_buteur_id_fkey(nom, prenom),
      homme_du_match:joueurs!pronostics_homme_du_match_predit_id_fkey(nom, prenom),
      match:matchs(
        id, date_match, heure_match, statut, score_a, score_b, homme_du_match_id,
        equipe_a:equipes!matchs_equipe_a_id_fkey(nom, sigle, logo_url, couleur_principale),
        equipe_b:equipes!matchs_equipe_b_id_fkey(nom, sigle, logo_url, couleur_principale)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const pronostics = (rawPronostics || []) as any[]

  // Fetch profile for MonEspace
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url, points, rang, quartier, total_pronostics, pronostics_corrects')
    .eq('id', user.id)
    .single()

  // Calculate pronosticsToMake
  const today = new Date().toISOString().split('T')[0]
  const { data: upcomingMatchs } = await supabase
    .from('matchs')
    .select('id')
    .eq('statut', 'a_venir')
    .gte('date_match', today)

  const pronosMatchIds = new Set(pronostics.map(p => p.match_id))
  const upcomingMatchRows = (upcomingMatchs || []) as { id: string }[]
  const pronosticsToMake = upcomingMatchRows.filter(m => !pronosMatchIds.has(m.id)).length

  const total = pronostics.length
  const corrects = pronostics.filter(p => p.est_correct === true).length
  const scoresExact = pronostics.filter(p => p.score_exact).length
  const totalPoints = pronostics.reduce((sum, p) => sum + (p.points_gagnes || 0), 0)
  const pending = pronostics.filter(p => p.match?.statut !== 'termine').length
  const accuracy = total > 0 ? Math.round((corrects / total) * 100) : 0

  return (
    <div className="page-content">
      <div className="container-app" style={{ paddingTop: 28 }}>
        <PageHero
          icon={Target}
          title="Mes pronostics"
          subtitle="Votre historique de prédictions, vos points et vos scores exacts."
          stats={[
            { value: total, label: 'pronostics' },
            { value: corrects, label: 'corrects' },
            { value: scoresExact, label: 'exacts' },
            { value: totalPoints, label: 'points' },
          ]}
        />

        {profile && (
          <MonEspace 
            profile={profile}
            recentPronostics={pronostics.slice(0, 5)}
            pronosticsToMake={pronosticsToMake}
          />
        )}


        <PronosticsClientWrapper
          pronostics={pronostics}
          totalPoints={totalPoints}
          corrects={corrects}
          scoresExact={scoresExact}
          pending={pending}
          accuracy={accuracy}
        />
      </div>
    </div>
  )
}
