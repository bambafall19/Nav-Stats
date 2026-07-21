'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'
import PerformanceChart from '@/components/profil/PerformanceChart'
import StreakBadge from '@/components/shared/StreakBadge'

type Profile = Database['public']['Tables']['profiles']['Row']
type Pronostic = Database['public']['Tables']['pronostics']['Row'] & {
  matchs: { date_match: string; statut: string } | null
}

export default function PerformanceClient() {
  const [user, setUser] = useState<Database['public']['Tables']['profiles']['Row'] | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient() as any

  const [pronostics, setPronostics] = useState<Pronostic[]>([])
  const [currentStreak, setCurrentStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)

  useEffect(() => {
    const loadData = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        setLoading(false)
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()

      setUser(profile)

      const { data: pronosticsData } = await supabase
        .from('pronostics')
        .select('*, matchs!inner(date_match, statut)')
        .eq('user_id', authUser.id)
        .eq('matchs.statut', 'termine')
        .order('matchs(date_match)', { ascending: false })

      const p = pronosticsData || []
      setPronostics(p)

      let streak = 0
      for (const prono of p) {
        if (prono.est_correct) streak++
        else break
      }
      setCurrentStreak(streak)

      let best = 0
      let temp = 0
      for (const prono of [...p].reverse()) {
        if (prono.est_correct) {
          temp++
          if (temp > best) best = temp
        } else {
          temp = 0
        }
      }
      setBestStreak(best)

      setLoading(false)
    }

    loadData()
  }, [supabase])

  if (loading) {
    return (
      <div className="page-content">
        <div className="container-app" style={{ textAlign: 'center', paddingTop: 80 }}>
          <div style={{ fontSize: '2rem', marginBottom: 16 }}>⏳</div>
          <p style={{ color: 'var(--color-text-secondary)' }}>Chargement...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="page-content">
        <div className="container-app" style={{ textAlign: 'center', paddingTop: 80 }}>
          <h1 style={{ marginBottom: 8 }}>Connectez-vous</h1>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 20 }}>Veuillez vous connecter pour voir vos performances.</p>
          <a href="/auth/login" className="btn btn-primary">Connexion</a>
        </div>
      </div>
    )
  }

  const chartData = [
    { journee: 1, points: 3, classement: 8 },
    { journee: 2, points: 8, classement: 5 },
    { journee: 3, points: 12, classement: 4 },
    { journee: 4, points: 15, classement: 3 },
    { journee: 5, points: 22, classement: 2 },
  ]

  const totalScore = pronostics.filter(pr => pr.score_exact).length
  const totalCorrect = pronostics.filter(pr => pr.est_correct).length
  const ratio = pronostics.length > 0 ? Math.round((totalCorrect / pronostics.length) * 100) : 0

  return (
    <div className="page-content">
      <div className="container-app" style={{ maxWidth: 800, margin: '0 auto' }}>
        <h1 className="section-title" style={{ marginBottom: 4 }}>📈 Mes Performances</h1>
        <p className="section-subtitle" style={{ marginBottom: 28 }}>Analyse complète de vos pronostics</p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 12,
          marginBottom: 28,
        }}>
          {[
            { label: 'Pronostics', value: pronostics.length, icon: '🎯', color: 'var(--color-primary)' },
            { label: 'Corrects', value: totalCorrect, icon: '✅', color: '#00A651' },
            { label: 'Ratio', value: `${ratio}%`, icon: '📊', color: '#FBBF00' },
            { label: 'Scores exacts', value: totalScore, icon: '💯', color: '#7C3AED' },
            { label: 'Série actuelle', value: currentStreak, icon: '🔥', color: currentStreak >= 5 ? '#DC2626' : '#F59E0B' },
            { label: 'Meilleure série', value: bestStreak, icon: '🏆', color: '#7C3AED' },
          ].map(stat => (
            <div key={stat.label} className="card" style={{ padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>{stat.icon}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: stat.color, fontFamily: 'var(--font-outfit)' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 600, marginTop: 2 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {currentStreak > 0 && (
          <div className="card" style={{ padding: 20, marginBottom: 28, display: 'flex', alignItems: 'center', gap: 16 }}>
            <StreakBadge streak={currentStreak} bestStreak={bestStreak} />
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
              {currentStreak >= 10
                ? '🔥 Légende ! Vous enchaînez les pronostics parfaits !'
                : currentStreak >= 5
                  ? '⭐ Excellent rythme ! Continuez sur cette lancée !'
                  : currentStreak >= 3
                    ? '👏 Bonne série ! Plus que 2 pour le badge feu !'
                    : '💪 Lancez votre série !'}
            </span>
          </div>
        )}

        <div className="card" style={{ padding: 24, marginBottom: 28 }}>
          <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 16 }}>📊 Évolution des points</h3>
          <PerformanceChart data={chartData} />
        </div>

        <div className="card" style={{
          padding: 24,
          border: '2px dashed var(--color-primary-light)',
          marginBottom: 28,
        }}>
          <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 8 }}>🤝 Parrainer un ami</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: 16 }}>
            Invitez vos amis et gagnez <strong>+5 points bonus</strong> par inscription ! 
          </p>
          <div style={{
            display: 'flex',
            gap: 10,
            alignItems: 'center',
            background: 'var(--color-surface)',
            borderRadius: 12,
            padding: '4px 4px 4px 16px',
            border: '1px solid var(--color-border)',
          }}>
            <code style={{
              flex: 1,
              fontSize: '1rem',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-primary)',
              letterSpacing: '0.05em',
            }}>
              NAVESTATS-{user.id.slice(0, 6).toUpperCase()}
            </code>
            <button
              className="btn btn-primary btn-sm"
              style={{ borderRadius: 10, margin: 0 }}
              onClick={() => navigator.clipboard.writeText(`https://navestats.site/auth/register?ref=${user.id.slice(0, 6)}`)}
            >
              📋 Copier
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}