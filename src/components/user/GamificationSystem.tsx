'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Streak {
  current: number
  best: number
  lastDate: string
}

interface Badge {
  id: string
  name: string
  description: string
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  unlocked: boolean
}

interface Challenge {
  id: string
  name: string
  description: string
  icon: string
  progress: number
  target: number
  reward: number
  completed: boolean
}

export function GamificationSystem({ userId }: { userId: string }) {
  const [streak, setStreak] = useState<Streak>({ current: 0, best: 0, lastDate: '' })
  const [badges, setBadges] = useState<Badge[]>([])
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient() as any

  useEffect(() => {
    const fetchGamification = async () => {
      try {
        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', userId).single()
        const { data: pronosticsData } = await supabase.from('pronostics').select('*').eq('user_id', userId)

        // Calculate streak
        const today = new Date().toISOString().split('T')[0]
        const lastPronosticDate = pronosticsData?.[0]?.created_at?.split('T')[0]
        const currentStreak = lastPronosticDate === today ? (profileData?.streak || 0) + 1 : 0

        setStreak({
          current: currentStreak,
          best: profileData?.best_streak || 0,
          lastDate: lastPronosticDate || '',
        })

        // Generate badges
        const totalPronostics = pronosticsData?.length || 0
        const correctPronostics = pronosticsData?.filter((p: any) => p.is_correct).length || 0
        const successRate = totalPronostics > 0 ? Math.round((correctPronostics / totalPronostics) * 100) : 0

        const generatedBadges: Badge[] = [
          {
            id: 'novice',
            name: 'Novice',
            description: 'Faire 5 pronostics',
            icon: '🌱',
            rarity: 'common',
            unlocked: totalPronostics >= 5,
          },
          {
            id: 'expert',
            name: 'Expert',
            description: 'Faire 50 pronostics',
            icon: '⭐',
            rarity: 'rare',
            unlocked: totalPronostics >= 50,
          },
          {
            id: 'master',
            name: 'Maître',
            description: 'Faire 100 pronostics',
            icon: '👑',
            rarity: 'epic',
            unlocked: totalPronostics >= 100,
          },
          {
            id: 'lucky',
            name: 'Chanceux',
            description: 'Atteindre 70% de réussite',
            icon: '🍀',
            rarity: 'rare',
            unlocked: successRate >= 70,
          },
          {
            id: 'legendary',
            name: 'Légendaire',
            description: 'Atteindre 80% de réussite',
            icon: '💎',
            rarity: 'legendary',
            unlocked: successRate >= 80,
          },
          {
            id: 'streak_master',
            name: 'Maître des Streaks',
            description: 'Atteindre 7 jours de streak',
            icon: '🔥',
            rarity: 'epic',
            unlocked: currentStreak >= 7,
          },
        ]

        setBadges(generatedBadges)

        // Generate challenges
        const generatedChallenges: Challenge[] = [
          {
            id: 'weekly_5',
            name: 'Défi Hebdomadaire',
            description: 'Faire 5 pronostics cette semaine',
            icon: '🎯',
            progress: Math.min(totalPronostics % 5, 5),
            target: 5,
            reward: 50,
            completed: (totalPronostics % 5) >= 5,
          },
          {
            id: 'accuracy_60',
            name: 'Précision 60%',
            description: 'Atteindre 60% de réussite',
            icon: '🎪',
            progress: successRate,
            target: 60,
            reward: 100,
            completed: successRate >= 60,
          },
          {
            id: 'streak_3',
            name: 'Streak de 3 jours',
            description: 'Faire des pronostics 3 jours consécutifs',
            icon: '🔥',
            progress: currentStreak,
            target: 3,
            reward: 75,
            completed: currentStreak >= 3,
          },
        ]

        setChallenges(generatedChallenges)
      } catch (error) {
        console.error('Error fetching gamification:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchGamification()
  }, [userId])

  if (loading) {
    return <div style={{ padding: 20, textAlign: 'center' }}>Chargement...</div>
  }

  return (
    <div style={{ padding: 'clamp(16px, 3vw, 24px)' }}>
      {/* Streak */}
      <div style={{
        background: 'linear-gradient(135deg, #FF6B6B, #FF8E72)',
        borderRadius: 'clamp(12px, 3vw, 16px)',
        padding: 'clamp(16px, 3vw, 20px)',
        marginBottom: 'clamp(24px, 5vw, 32px)',
        color: 'white',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🔥</div>
        <div style={{ fontFamily: 'var(--font-outfit)', fontWeight: 900, fontSize: 'clamp(1.5rem, 4vw, 2rem)', marginBottom: 4 }}>
          {streak.current} jours
        </div>
        <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
          Meilleur: {streak.best} jours
        </div>
      </div>

      {/* Badges */}
      <div style={{ marginBottom: 'clamp(24px, 5vw, 32px)' }}>
        <h2 style={{ fontFamily: 'var(--font-outfit)', fontWeight: 800, fontSize: 'clamp(0.95rem, 3vw, 1.1rem)', marginBottom: 16 }}>
          🏅 Badges ({badges.filter(b => b.unlocked).length}/{badges.length})
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
          gap: 'clamp(12px, 2vw, 16px)',
        }}>
          {badges.map(badge => (
            <div
              key={badge.id}
              style={{
                background: badge.unlocked ? 'var(--color-surface-card)' : 'rgba(0,0,0,0.05)',
                border: `2px solid ${badge.unlocked ? 'var(--color-primary)' : 'var(--color-border)'}`,
                borderRadius: 'clamp(12px, 3vw, 16px)',
                padding: 'clamp(12px, 2vw, 16px)',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                opacity: badge.unlocked ? 1 : 0.5,
              }}
            >
              <div style={{ fontSize: '2rem', filter: badge.unlocked ? 'none' : 'grayscale(100%)' }}>
                {badge.icon}
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.8rem' }}>
                {badge.name}
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>
                {badge.rarity}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Challenges */}
      <div style={{ marginBottom: 'clamp(24px, 5vw, 32px)' }}>
        <h2 style={{ fontFamily: 'var(--font-outfit)', fontWeight: 800, fontSize: 'clamp(0.95rem, 3vw, 1.1rem)', marginBottom: 16 }}>
          🎯 Défis Actifs
        </h2>
        <div style={{ display: 'grid', gap: 'clamp(12px, 2vw, 16px)' }}>
          {challenges.map(challenge => (
            <div
              key={challenge.id}
              style={{
                background: 'var(--color-surface-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 'clamp(12px, 3vw, 16px)',
                padding: 'clamp(12px, 2vw, 16px)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ fontSize: '1.5rem' }}>{challenge.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                    {challenge.name}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    {challenge.description}
                  </div>
                </div>
                <div style={{
                  background: 'var(--color-primary)',
                  color: 'white',
                  borderRadius: 'var(--radius-full)',
                  padding: '6px 12px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                }}>
                  +{challenge.reward}
                </div>
              </div>

              {/* Progress bar */}
              <div style={{
                background: 'rgba(0,98,51,0.1)',
                borderRadius: 'var(--radius-full)',
                height: 8,
                overflow: 'hidden',
              }}>
                <div
                  style={{
                    background: challenge.completed ? 'var(--color-primary)' : 'var(--color-primary)',
                    height: '100%',
                    width: `${Math.min((challenge.progress / challenge.target) * 100, 100)}%`,
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                <span>{challenge.progress}/{challenge.target}</span>
                <span>{challenge.completed ? '✓ Complété' : `${Math.round((challenge.progress / challenge.target) * 100)}%`}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
