'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { StatsGrid, ProgressionChart } from '@/components/shared/Statistics'

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient() as any

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: profiles } = await supabase.from('profiles').select('*')
        const { data: matchs } = await supabase.from('matchs').select('*')
        const { data: pronostics } = await supabase.from('pronostics').select('*')

        const totalUsers = profiles?.length || 0
        const activeUsers = profiles?.filter((p: any) => p.last_login && new Date(p.last_login) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length || 0
        const totalMatchs = matchs?.length || 0
        const totalPronostics = pronostics?.length || 0
        const avgPronosticsPerUser = totalUsers > 0 ? Math.round(totalPronostics / totalUsers) : 0

        setStats({
          totalUsers,
          activeUsers,
          totalMatchs,
          totalPronostics,
          avgPronosticsPerUser,
          progressionData: [
            { date: 'Sem 1', points: totalUsers * 0.2 },
            { date: 'Sem 2', points: totalUsers * 0.4 },
            { date: 'Sem 3', points: totalUsers * 0.7 },
            { date: 'Sem 4', points: totalUsers },
          ],
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return <div style={{ padding: 20, textAlign: 'center' }}>Chargement...</div>
  }

  return (
    <div style={{ padding: 'clamp(16px, 3vw, 24px)' }}>
      <h1 style={{ fontFamily: 'var(--font-outfit)', fontWeight: 900, fontSize: 'clamp(1.5rem, 4vw, 2rem)', marginBottom: 24 }}>
        📊 Dashboard Admin
      </h1>

      <StatsGrid stats={[
        { label: 'Utilisateurs', value: stats?.totalUsers || 0, icon: '👥' },
        { label: 'Actifs (7j)', value: stats?.activeUsers || 0, icon: '🟢' },
        { label: 'Matchs', value: stats?.totalMatchs || 0, icon: '⚽' },
        { label: 'Pronostics', value: stats?.totalPronostics || 0, icon: '🎯' },
        { label: 'Moy/Utilisateur', value: stats?.avgPronosticsPerUser || 0, icon: '📈' },
      ]} />

      <div style={{ marginTop: 'clamp(24px, 5vw, 32px)' }}>
        <ProgressionChart
          data={stats?.progressionData || []}
          title="Croissance des Utilisateurs"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'clamp(16px, 3vw, 20px)', marginTop: 'clamp(24px, 5vw, 32px)' }}>
        <AdminCard title="Gestion Matchs" icon="⚽" href="/admin/matchs" />
        <AdminCard title="Gestion Utilisateurs" icon="👥" href="/admin/utilisateurs" />
        <AdminCard title="Gestion Équipes" icon="🏆" href="/admin/equipes" />
        <AdminCard title="Modération" icon="🛡️" href="/admin/moderation" />
        <AdminCard title="Logs & Audit" icon="📋" href="/admin/logs" />
        <AdminCard title="Paramètres" icon="⚙️" href="/admin/parametres" />
      </div>
    </div>
  )
}

function AdminCard({ title, icon, href }: { title: string; icon: string; href: string }) {
  return (
    <a href={href} style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      padding: 'clamp(20px, 4vw, 24px)',
      background: 'var(--color-surface-card)',
      border: '1px solid var(--color-border)',
      borderRadius: 'clamp(12px, 3vw, 16px)',
      textDecoration: 'none',
      color: 'inherit',
      transition: 'all 0.2s',
      cursor: 'pointer',
    }}
      onMouseOver={e => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = 'var(--shadow-lg)'
      }}
      onMouseOut={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <div style={{ fontSize: '2rem' }}>{icon}</div>
      <div style={{ fontWeight: 700, fontSize: 'clamp(0.9rem, 2vw, 1rem)', textAlign: 'center' }}>
        {title}
      </div>
    </a>
  )
}
