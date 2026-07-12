import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Metadata } from 'next'
import PronosticsClient from '@/components/pronostics/PronosticsClient'

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

  const total = pronostics.length
  const corrects = pronostics.filter(p => p.est_correct === true).length
  const scoresExact = pronostics.filter(p => p.score_exact).length
  const totalPoints = pronostics.reduce((sum, p) => sum + (p.points_gagnes || 0), 0)
  const pending = pronostics.filter(p => p.match?.statut !== 'termine').length
  const accuracy = total > 0 ? Math.round((corrects / total) * 100) : 0

  return (
    <div className="page-content">
      <div className="container-app">
        <div style={{ marginBottom: 28 }}>
          <h1 className="section-title" style={{ fontSize: '2rem', marginBottom: 4 }}>🎯 Mes pronostics</h1>
          <p className="section-subtitle">Vos choix, résultats et points gagnés pendant le tournoi.</p>
        </div>

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
