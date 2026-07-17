'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { StatsGrid, ProgressionChart } from '@/components/shared/Statistics'
import Link from 'next/link'

export default function AdminDashboardNew() {
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

  const adminSections = [
    { title: 'Gestion Matchs', icon: '⚽', href: '/admin/matchs', color: '#FF6B6B', description: 'Créer et gérer les matchs' },
    { title: 'Gestion Utilisateurs', icon: '👥', href: '/admin/utilisateurs', color: '#4ECDC4', description: 'Gérer les utilisateurs' },
    { title: 'Gestion Équipes', icon: '🏆', href: '/admin/equipes', color: '#FFE66D', description: 'Gérer les équipes' },
    { title: 'Notifications', icon: '📢', href: '/admin/notifications', color: '#95E1D3', description: 'Envoyer des notifications' },
    { title: 'Paramètres', icon: '⚙️', href: '/admin/parametres', color: '#A8E6CF', description: 'Configurer le système' },
    { title: 'Rapports', icon: '📊', href: '/admin/rapports', color: '#FFD3B6', description: 'Exporter les données' },
  ]

  return (
    <div style={{ padding: 0, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: 'clamp(24px, 5vw, 40px)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'var(--font-outfit)', fontWeight: 900, fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', margin: 0, marginBottom: 8 }}>
            🎛️ Tableau de Bord Admin
          </h1>
          <p style={{ margin: 0, opacity: 0.9, fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>
            Bienvenue dans le centre de contrôle NavéStats
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: 'clamp(24px, 5vw, 40px)', maxWidth: 1200, margin: '0 auto' }}>
        {/* Stats Cards */}
        <div style={{ marginBottom: 'clamp(32px, 5vw, 48px)' }}>
          <h2 style={{ fontFamily: 'var(--font-outfit)', fontWeight: 800, fontSize: 'clamp(1.1rem, 3vw, 1.3rem)', color: 'white', marginBottom: 16, marginTop: 0 }}>
            📈 Statistiques Globales
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'clamp(16px, 3vw, 20px)',
          }}>
            {[
              { label: 'Utilisateurs', value: stats?.totalUsers || 0, icon: '👥', color: '#4ECDC4' },
              { label: 'Actifs (7j)', value: stats?.activeUsers || 0, icon: '🟢', color: '#95E1D3' },
              { label: 'Matchs', value: stats?.totalMatchs || 0, icon: '⚽', color: '#FF6B6B' },
              { label: 'Pronostics', value: stats?.totalPronostics || 0, icon: '🎯', color: '#FFE66D' },
            ].map((stat, idx) => (
              <div
                key={idx}
                style={{
                  background: 'white',
                  borderRadius: 'clamp(12px, 3vw, 16px)',
                  padding: 'clamp(16px, 3vw, 20px)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                }}
              >
                <div style={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: stat.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.8rem',
                  flexShrink: 0,
                }}>
                  {stat.icon}
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>
                    {stat.label}
                  </div>
                  <div style={{ fontFamily: 'var(--font-outfit)', fontWeight: 900, fontSize: 'clamp(1.2rem, 3vw, 1.5rem)', color: stat.color }}>
                    {stat.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Admin Sections */}
        <div style={{ marginBottom: 'clamp(32px, 5vw, 48px)' }}>
          <h2 style={{ fontFamily: 'var(--font-outfit)', fontWeight: 800, fontSize: 'clamp(1.1rem, 3vw, 1.3rem)', color: 'white', marginBottom: 16, marginTop: 0 }}>
            🛠️ Gestion
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 'clamp(16px, 3vw, 20px)',
          }}>
            {adminSections.map((section, idx) => (
              <Link
                key={idx}
                href={section.href}
                style={{
                  background: 'white',
                  borderRadius: 'clamp(12px, 3vw, 16px)',
                  padding: 'clamp(20px, 3vw, 24px)',
                  textDecoration: 'none',
                  color: 'inherit',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  borderLeft: `4px solid ${section.color}`,
                  cursor: 'pointer',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.transform = 'translateY(-8px)'
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)'
                }}
                onMouseOut={e => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 50,
                    height: 50,
                    borderRadius: '50%',
                    background: section.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                  }}>
                    {section.icon}
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: '0.95rem', margin: 0, marginBottom: 2 }}>
                      {section.title}
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>
                      {section.description}
                    </p>
                  </div>
                </div>
                <div style={{ fontSize: '1.2rem', marginLeft: 'auto' }}>→</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div style={{
          background: 'white',
          borderRadius: 'clamp(12px, 3vw, 16px)',
          padding: 'clamp(20px, 3vw, 24px)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        }}>
          <ProgressionChart
            data={stats?.progressionData || []}
            title="Croissance des Utilisateurs"
          />
        </div>
      </div>
    </div>
  )
}
