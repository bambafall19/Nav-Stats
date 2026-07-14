import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Metadata } from 'next'
import PronosticsClient from '@/components/pronostics/PronosticsClient'
import MonEspace from '@/components/home/MonEspace'

export const metadata: Metadata = {
  title: 'Mes pronostics – NavéStats',
  description: 'Suivez vos pronostics, vos points et vos performances sur NavéStats.',
}

export default async function MesPronosticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="page-content">
        <div className="container-app" style={{ maxWidth: 720 }}>
          <div className="card" style={{ padding: 32, textAlign: 'center' }}>
            <div style={{ fontSize: '2.8rem', marginBottom: 12 }}>🎯</div>
            <h1 style={{ fontSize: '1.7rem', marginBottom: 8 }}>Mes pronostics</h1>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 22 }}>
              Connectez-vous pour retrouver vos choix, vos scores exacts et vos points gagnés.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/auth/login" className="btn btn-primary">Connexion</Link>
              <Link href="/auth/register" className="btn btn-outline">S&apos;inscrire</Link>
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
        
        {profile && (
          <MonEspace 
            profile={profile}
            recentPronostics={pronostics.slice(0, 5)}
            pronosticsToMake={pronosticsToMake}
          />
        )}


        <PronosticsClient
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
