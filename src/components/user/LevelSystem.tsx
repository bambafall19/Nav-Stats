'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Level {
  level: number
  name: string
  minPoints: number
  maxPoints: number
  icon: string
  unlockedFeatures: string[]
  reward: number
}

const LEVELS: Level[] = [
  {
    level: 1,
    name: 'Novice',
    minPoints: 0,
    maxPoints: 100,
    icon: '🌱',
    unlockedFeatures: ['Pronostics basiques'],
    reward: 0,
  },
  {
    level: 2,
    name: 'Apprenti',
    minPoints: 100,
    maxPoints: 300,
    icon: '📚',
    unlockedFeatures: ['Prédictions avancées'],
    reward: 50,
  },
  {
    level: 3,
    name: 'Confirmé',
    minPoints: 300,
    maxPoints: 600,
    icon: '⭐',
    unlockedFeatures: ['Ligues privées', 'Chat avec amis'],
    reward: 100,
  },
  {
    level: 4,
    name: 'Expert',
    minPoints: 600,
    maxPoints: 1000,
    icon: '🏆',
    unlockedFeatures: ['Statistiques avancées', 'Rapports personnalisés'],
    reward: 200,
  },
  {
    level: 5,
    name: 'Maître',
    minPoints: 1000,
    maxPoints: 2000,
    icon: '👑',
    unlockedFeatures: ['Tous les avantages', 'Badge spécial'],
    reward: 500,
  },
]

export function LevelSystem({ userId }: { userId: string }) {
  const [profile, setProfile] = useState<any>(null)
  const [currentLevel, setCurrentLevel] = useState<Level | null>(null)
  const [nextLevel, setNextLevel] = useState<Level | null>(null)
  const [progressPercent, setProgressPercent] = useState(0)
  const [loading, setLoading] = useState(true)
  const supabase = createClient() as any

  useEffect(() => {
    fetchProfile()
  }, [userId])

  const fetchProfile = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      setProfile(data)

      // Calculate level
      const level = LEVELS.find(
        l => data.points >= l.minPoints && data.points < l.maxPoints
      ) || LEVELS[LEVELS.length - 1]

      const nextLvl = LEVELS[LEVELS.indexOf(level) + 1] || level

      setCurrentLevel(level)
      setNextLevel(nextLvl)

      // Calculate progress
      const levelRange = level.maxPoints - level.minPoints
      const pointsInLevel = data.points - level.minPoints
      const progress = (pointsInLevel / levelRange) * 100
      setProgressPercent(Math.min(progress, 100))
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !currentLevel) {
    return <div style={{ padding: 20, textAlign: 'center' }}>Chargement...</div>
  }

  return (
    <div style={{ padding: 'clamp(16px, 3vw, 24px)' }}>
      <h1 style={{ fontFamily: 'var(--font-outfit)', fontWeight: 900, fontSize: 'clamp(1.3rem, 4vw, 1.8rem)', marginBottom: 24 }}>
        🎮 Système de Niveaux
      </h1>

      {/* Current Level */}
      <div style={{
        background: 'linear-gradient(135deg, var(--color-primary), #00A651)',
        borderRadius: 'clamp(12px, 3vw, 16px)',
        padding: 'clamp(20px, 3vw, 24px)',
        color: 'white',
        marginBottom: 'clamp(24px, 5vw, 32px)',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '3rem', marginBottom: 12 }}>{currentLevel.icon}</div>
        <div style={{ fontFamily: 'var(--font-outfit)', fontWeight: 900, fontSize: 'clamp(1.5rem, 4vw, 2rem)', marginBottom: 8 }}>
          Niveau {currentLevel.level}: {currentLevel.name}
        </div>
        <div style={{ fontSize: '0.95rem', opacity: 0.9 }}>
          {profile?.points} / {currentLevel.maxPoints} points
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ marginBottom: 'clamp(24px, 5vw, 32px)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Progression vers le niveau suivant</span>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            {Math.round(progressPercent)}%
          </span>
        </div>
        <div style={{
          background: 'var(--color-border)',
          borderRadius: 'var(--radius-full)',
          height: 12,
          overflow: 'hidden',
        }}>
          <div
            style={{
              background: 'linear-gradient(90deg, var(--color-primary), #00A651)',
              height: '100%',
              width: `${progressPercent}%`,
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      {/* Unlocked Features */}
      <div style={{ marginBottom: 'clamp(24px, 5vw, 32px)' }}>
        <h2 style={{ fontFamily: 'var(--font-outfit)', fontWeight: 800, fontSize: '1rem', marginBottom: 12 }}>
          🔓 Fonctionnalités Débloquées
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'clamp(12px, 2vw, 16px)',
        }}>
          {currentLevel.unlockedFeatures.map((feature, idx) => (
            <div
              key={idx}
              style={{
                background: 'var(--color-surface-card)',
                border: '2px solid var(--color-primary)',
                borderRadius: 'var(--radius-lg)',
                padding: 'clamp(12px, 2vw, 16px)',
                textAlign: 'center',
                fontWeight: 600,
                fontSize: '0.9rem',
              }}
            >
              ✓ {feature}
            </div>
          ))}
        </div>
      </div>

      {/* All Levels */}
      <div>
        <h2 style={{ fontFamily: 'var(--font-outfit)', fontWeight: 800, fontSize: '1rem', marginBottom: 12 }}>
          📊 Tous les Niveaux
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 'clamp(12px, 2vw, 16px)',
        }}>
          {LEVELS.map(level => (
            <div
              key={level.level}
              style={{
                background: 'var(--color-surface-card)',
                border: level.level === currentLevel.level ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: 'clamp(12px, 2vw, 16px)',
                textAlign: 'center',
                opacity: level.level <= currentLevel.level ? 1 : 0.5,
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>{level.icon}</div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 4 }}>
                Niveau {level.level}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 8 }}>
                {level.name}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                {level.minPoints} - {level.maxPoints} pts
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
