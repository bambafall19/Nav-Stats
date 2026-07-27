'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { StatsGrid, ProgressionChart } from '@/components/shared/Statistics'
import { ShareButtons } from '@/components/shared/ShareButtons'

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
}

export function UserProfileEnhanced({ userId }: { userId: string }) {
  const [profile, setProfile] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient() as any

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', userId).single()
        const { data: pronosticsData } = await supabase.from('pronostics').select('*').eq('user_id', userId)

        setProfile(profileData)

        const totalPronostics = pronosticsData?.length || 0
        const correctPronostics = pronosticsData?.filter((p: any) => p.is_correct).length || 0
        const successRate = totalPronostics > 0 ? Math.round((correctPronostics / totalPronostics) * 100) : 0

        setStats({
          totalPronostics,
          correctPronostics,
          successRate,
          points: profileData?.points || 0,
          progressionData: [
            { date: 'Sem 1', points: (profileData?.points || 0) * 0.2 },
            { date: 'Sem 2', points: (profileData?.points || 0) * 0.4 },
            { date: 'Sem 3', points: (profileData?.points || 0) * 0.7 },
            { date: 'Sem 4', points: profileData?.points || 0 },
          ],
        })

        // Unlock achievements
        const unlockedAchievements: Achievement[] = []
        if (totalPronostics >= 1) unlockedAchievements.push({ id: '1', name: 'Premier Pronostic', description: 'Faire son premier pronostic', icon: '🎯', unlocked: true })
        if (totalPronostics >= 10) unlockedAchievements.push({ id: '2', name: 'Débutant', description: 'Faire 10 pronostics', icon: '🌱', unlocked: true })
        if (totalPronostics >= 50) unlockedAchievements.push({ id: '3', name: 'Régulier', description: 'Faire 50 pronostics', icon: '⭐', unlocked: true })
        if (totalPronostics >= 100) unlockedAchievements.push({ id: '4', name: 'Expert', description: 'Faire 100 pronostics', icon: '🏆', unlocked: true })
        if (successRate >= 60) unlockedAchievements.push({ id: '5', name: 'Précis', description: 'Atteindre 60% de réussite', icon: '🎯', unlocked: true })
        if (successRate >= 70) unlockedAchievements.push({ id: '6', name: 'Maître', description: 'Atteindre 70% de réussite', icon: '👑', unlocked: true })
        if ((profileData?.points || 0) >= 500) unlockedAchievements.push({ id: '7', name: 'Riche', description: 'Accumuler 500 points', icon: '💰', unlocked: true })
        if ((profileData?.points || 0) >= 1000) unlockedAchievements.push({ id: '8', name: 'Millionnaire', description: 'Accumuler 1000 points', icon: '💎', unlocked: true })

        setAchievements(unlockedAchievements)
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userId])

  if (loading) {
    return <div style={{ padding: 20, textAlign: 'center' }}>Chargement...</div>
  }

  if (!profile) {
    return <div style={{ padding: 20, textAlign: 'center', color: 'var(--color-text-muted)' }}>Profil non trouvé</div>
  }

  return (
    <div style={{ padding: 'clamp(16px, 3vw, 24px)' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #004d27 0%, #006233 50%, #008a44 100%)',
        borderRadius: 'clamp(16px, 4vw, 24px)',
        padding: 'clamp(20px, 5vw, 32px)',
        marginBottom: 'clamp(24px, 5vw, 32px)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: 'clamp(16px, 3vw, 20px)',
      }}>
        <div style={{
          width: 'clamp(60px, 12vw, 80px)',
          height: 'clamp(60px, 12vw, 80px)',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 'clamp(1.5rem, 4vw, 2rem)',
          flexShrink: 0,
        }}>
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            profile.username?.charAt(0).toUpperCase()
          )}
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 'clamp(1.3rem, 4vw, 1.8rem)', fontFamily: 'var(--font-outfit)', fontWeight: 900 }}>
            {profile.username}
          </h1>
          <p style={{ margin: '4px 0 0 0', opacity: 0.9, fontSize: 'clamp(0.8rem, 2vw, 0.95rem)' }}>
            {profile.quartier || 'Khombole'} • {profile.asc_nom || 'ASC'}
          </p>
        </div>
      </div>

      {/* Stats */}
      <StatsGrid stats={[
        { label: 'Points', value: stats?.points || 0, icon: '🏆' },
        { label: 'Pronostics', value: stats?.totalPronostics || 0, icon: '🎯' },
        { label: 'Réussis', value: stats?.correctPronostics || 0, icon: '✓' },
        { label: 'Taux', value: `${stats?.successRate || 0}%`, icon: '📊' },
      ]} />

      {/* Progression */}
      <div style={{ marginBottom: 'clamp(24px, 5vw, 32px)' }}>
        <ProgressionChart
          data={stats?.progressionData || []}
          title="Progression des Points"
        />
      </div>

      {/* Achievements */}
      <div style={{ marginBottom: 'clamp(24px, 5vw, 32px)' }}>
        <h2 style={{ fontFamily: 'var(--font-outfit)', fontWeight: 800, fontSize: 'clamp(0.95rem, 3vw, 1.1rem)', marginBottom: 16 }}>
          🏅 Achievements ({achievements.length})
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
          gap: 'clamp(12px, 2vw, 16px)',
        }}>
          {achievements.map(achievement => (
            <div
              key={achievement.id}
              style={{
                background: 'var(--color-surface-card)',
                border: '2px solid var(--color-primary)',
                borderRadius: 'clamp(12px, 3vw, 16px)',
                padding: 'clamp(12px, 2vw, 16px)',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <div style={{ fontSize: '2rem' }}>{achievement.icon}</div>
              <div style={{ fontWeight: 700, fontSize: '0.8rem' }}>
                {achievement.name}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                {achievement.description}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Share */}
      <div style={{ marginBottom: 'clamp(24px, 5vw, 32px)' }}>
        <h2 style={{ fontFamily: 'var(--font-outfit)', fontWeight: 800, fontSize: 'clamp(0.95rem, 3vw, 1.1rem)', marginBottom: 16 }}>
          📤 Partager
        </h2>
        <ShareButtons
          title={`Profil de ${profile.username}`}
          text={`Rejoins-moi sur NavéStats! Je suis classé avec ${profile.points} points 🏆`}
        />
      </div>
    </div>
  )
}
