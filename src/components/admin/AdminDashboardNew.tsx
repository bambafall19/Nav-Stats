'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

// Couleurs du thème ONCAV
const COLORS = ['#006233', '#f59e0b', '#dc2626', '#3b82f6', '#8b5cf6', '#ec4899', '#10b981']

interface StatsData {
  totalUsers: number
  activeUsers: number
  totalMatchs: number
  totalPronostics: number
  avgPronosticsPerUser: number
  progressionData: { date: string; points: number }[]
  pouleData: { name: string; value: number }[]
  matchsParJour: { jour: string; matchs: number }[]
  repartitionPronostics: { name: string; value: number }[]
}

export default function AdminDashboardNew() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: profiles } = await supabase.from('profiles').select('*')
        const { data: matchs } = await supabase.from('matchs').select('*')
        const { data: pronostics } = await supabase.from('pronostics').select('*')
        const { data: equipes } = await supabase.from('equipes').select('*')

        const totalUsers = profiles?.length || 0
        const activeUsers = profiles?.filter((p: any) =>
          p.last_login && new Date(p.last_login) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).length || 0
        const totalMatchs = matchs?.length || 0
        const totalPronostics = pronostics?.length || 0
        const avgPronosticsPerUser = totalUsers > 0 ? Math.round(totalPronostics / totalUsers) : 0

        // Données par poule
        const poules = equipes?.reduce((acc: any, eq: any) => {
          const poule = eq.poule || 'Sans poule'
          acc[poule] = (acc[poule] || 0) + 1
          return acc
        }, {}) || {}
        const pouleData = Object.entries(poules).map(([name, value]) => ({ name, value: value as number }))

        // Matchs par journée (simulé si pas de données réelles)
        const matchsParJour = matchs?.reduce((acc: any, m: any) => {
          const journee = m.journee || 'J1'
          acc[journee] = (acc[journee] || 0) + 1
          return acc
        }, {}) || { J1: 5, J2: 0, J3: 0, J4: 0 }
        const matchsParJourData = Object.entries(matchsParJour).map(([jour, matchs]) => ({ jour, matchs: matchs as number }))

        // Répartition pronostics
        const repartitionData = [
          { name: 'Vérifiés', value: pronostics?.filter((p: any) => p.statut === 'gagne').length || 0 },
          { name: 'En attente', value: pronostics?.filter((p: any) => p.statut === 'en_attente').length || 0 },
          { name: 'Perdus', value: pronostics?.filter((p: any) => p.statut === 'perdu').length || 0 },
        ].filter(d => d.value > 0)

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
          pouleData,
          matchsParJour: matchsParJourData,
          repartitionPronostics: repartitionData,
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
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '60vh', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>⚽</div>
          <div style={{ fontSize: '1.1rem', color: '#006233', fontWeight: 700 }}>Chargement du tableau de bord...</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: 'clamp(16px, 3vw, 24px)', maxWidth: 1400, margin: '0 auto' }}>
      {/* En-tête avec gradient */}
      <div style={{
        background: 'linear-gradient(135deg, #006233 0%, #004d27 100%)',
        borderRadius: 'clamp(16px, 3vw, 24px)',
        padding: 'clamp(20px, 4vw, 32px)',
        marginBottom: 'clamp(24px, 5vw, 32px)',
        color: 'white',
        boxShadow: '0 10px 30px rgba(0, 98, 51, 0.3)',
      }}>
        <h1 style={{
          fontFamily: 'var(--font-outfit)',
          fontWeight: 900,
          fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
          marginBottom: 8,
          textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
        }}>
          📊 Tableau de Bord Administrateur
        </h1>
        <p style={{ fontSize: 'clamp(0.9rem, 2vw, 1rem)', opacity: 0.9, margin: 0 }}>
          Bienvenue dans l'espace d'administration ONCAV - Zone 6 Khombole
        </p>
      </div>

      {/* Stats Grid avec design amélioré */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 'clamp(16px, 3vw, 20px)',
        marginBottom: 'clamp(24px, 5vw, 32px)'
      }}>
        <StatCard label="👥 Utilisateurs" value={stats?.totalUsers || 0} gradient="from-blue-500 to-blue-600" />
        <StatCard label="🟢 Actifs (7j)" value={stats?.activeUsers || 0} gradient="from-green-500 to-green-600" />
        <StatCard label="⚽ Matchs" value={stats?.totalMatchs || 0} gradient="from-purple-500 to-purple-600" />
        <StatCard label="🎯 Pronostics" value={stats?.totalPronostics || 0} gradient="from-orange-500 to-orange-600" />
        <StatCard label="📈 Moy/Utilisateur" value={stats?.avgPronosticsPerUser || 0} gradient="from-pink-500 to-pink-600" />
      </div>

      {/* Graphiques principaux */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: 'clamp(16px, 3vw, 24px)',
        marginBottom: 'clamp(24px, 5vw, 32px)'
      }}>
        {/* Graphique de progression */}
        <div style={{
          background: 'white',
          borderRadius: 'clamp(12px, 3vw, 16px)',
          padding: 'clamp(16px, 3vw, 20px)',
          border: '1px solid #e5e7eb',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
        }}>
          <h3 style={{
            fontFamily: 'var(--font-outfit)',
            fontWeight: 800,
            fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
            marginBottom: 16,
            color: '#1f2937',
          }}>
            📈 Croissance des Utilisateurs
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={stats?.progressionData || []}>
              <defs>
                <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#006233" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#006233" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" style={{ fontSize: '0.85rem' }} />
              <YAxis style={{ fontSize: '0.85rem' }} />
              <Tooltip
                contentStyle={{
                  background: '#1f2937',
                  border: 'none',
                  borderRadius: 8,
                  color: 'white'
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="points"
                stroke="#006233"
                strokeWidth={3}
                dot={{ fill: '#006233', r: 5 }}
                activeDot={{ r: 7 }}
                name="Utilisateurs"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Graphique en donut - Répartition par poule */}
        <div style={{
          background: 'white',
          borderRadius: 'clamp(12px, 3vw, 16px)',
          padding: 'clamp(16px, 3vw, 20px)',
          border: '1px solid #e5e7eb',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
        }}>
          <h3 style={{
            fontFamily: 'var(--font-outfit)',
            fontWeight: 800,
            fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
            marginBottom: 16,
            color: '#1f2937',
          }}>
            🏆 Répartition par Poule
          </h3>
          {stats?.pouleData && stats.pouleData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={stats.pouleData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.pouleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>
              Pas de données disponibles
            </div>
          )}
        </div>

        {/* Graphique à barres - Matchs par journée */}
        <div style={{
          background: 'white',
          borderRadius: 'clamp(12px, 3vw, 16px)',
          padding: 'clamp(16px, 3vw, 20px)',
          border: '1px solid #e5e7eb',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
        }}>
          <h3 style={{
            fontFamily: 'var(--font-outfit)',
            fontWeight: 800,
            fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
            marginBottom: 16,
            color: '#1f2937',
          }}>
            ⚽ Matchs par Journée
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats?.matchsParJour || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="jour" style={{ fontSize: '0.85rem' }} />
              <YAxis style={{ fontSize: '0.85rem' }} />
              <Tooltip
                contentStyle={{
                  background: '#1f2937',
                  border: 'none',
                  borderRadius: 8,
                  color: 'white'
                }}
                cursor={{ fill: 'rgba(0, 98, 51, 0.1)' }}
              />
              <Bar dataKey="matchs" fill="#006233" radius={[8, 8, 0, 0]} name="Matchs" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Graphique - Répartition pronostics */}
        <div style={{
          background: 'white',
          borderRadius: 'clamp(12px, 3vw, 16px)',
          padding: 'clamp(16px, 3vw, 20px)',
          border: '1px solid #e5e7eb',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
        }}>
          <h3 style={{
            fontFamily: 'var(--font-outfit)',
            fontWeight: 800,
            fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
            marginBottom: 16,
            color: '#1f2937',
          }}>
            🎯 Répartition des Pronostics
          </h3>
          {stats?.repartitionPronostics && stats.repartitionPronostics.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={stats.repartitionPronostics}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.repartitionPronostics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>
              Pas de données disponibles
            </div>
          )}
        </div>
      </div>

      {/* Cartes de navigation rapide */}
      <div style={{
        background: 'white',
        borderRadius: 'clamp(16px, 3vw, 24px)',
        padding: 'clamp(16px, 3vw, 24px)',
        border: '1px solid #e5e7eb',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
      }}>
        <h3 style={{
          fontFamily: 'var(--font-outfit)',
          fontWeight: 800,
          fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
          marginBottom: 20,
          color: '#1f2937',
        }}>
          ⚡ Gestion Rapide
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 'clamp(12px, 2vw, 16px)'
        }}>
          <AdminNavCard title="⚽ Matchs" href="/admin/matchs" gradient="from-blue-500 to-blue-600" />
          <AdminNavCard title="👥 Utilisateurs" href="/admin/utilisateurs" gradient="from-green-500 to-green-600" />
          <AdminNavCard title="🏆 Équipes" href="/admin/equipes" gradient="from-purple-500 to-purple-600" />
          <AdminNavCard title="🛡️ Modération" href="/admin/moderation" gradient="from-red-500 to-red-600" />
          <AdminNavCard title="📋 Logs & Audit" href="/admin/logs" gradient="from-gray-700 to-gray-800" />
          <AdminNavCard title="⚙️ Paramètres" href="/admin/parametres" gradient="from-indigo-500 to-indigo-600" />
        </div>
      </div>
    </div>
  )
}

// Composants utilitaires

function StatCard({ label, value, gradient }: { label: string; value: number; gradient: string }) {
  return (
    <div style={{
      background: 'white',
      borderRadius: 'clamp(12px, 3vw, 16px)',
      padding: 'clamp(16px, 2vw, 20px)',
      border: '1px solid #e5e7eb',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
      transition: 'all 0.3s ease',
      position: 'relative',
      overflow: 'hidden',
    }}
    onMouseOver={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)'
      e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.12)'
    }}
    onMouseOut={(e) => {
      e.currentTarget.style.transform = 'translateY(0)'
      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)'
    }}
    >
      {/* Ligne décorative en haut */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 4,
        background: `linear-gradient(90deg, ${getGradientColors(gradient)})`,
      }} />
      <div style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', marginBottom: 8 }}>{label.split(' ').pop()}</div>
      <div style={{
        fontFamily: 'var(--font-outfit)',
        fontWeight: 900,
        fontSize: 'clamp(1.5rem, 3vw, 2rem)',
        background: `linear-gradient(135deg, ${getGradientColors(gradient)})`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        marginBottom: 4,
      }}>
        {value.toLocaleString()}
      </div>
      <div style={{ fontSize: 'clamp(0.75rem, 1.5vw, 0.85rem)', color: '#6b7280', fontWeight: 500 }}>
        {label.split(' ').slice(0, -1).join(' ')}
      </div>
    </div>
  )
}

function AdminNavCard({ title, href, gradient }: { title: string; href: string; gradient: string }) {
  return (
    <a href={href} style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      padding: 'clamp(16px, 2vw, 20px)',
      background: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: 'clamp(12px, 2vw, 16px)',
      textDecoration: 'none',
      color: 'inherit',
      transition: 'all 0.3s ease',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
    }}
    onMouseOver={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'
      e.currentTarget.style.background = `linear-gradient(135deg, ${getGradientColors(gradient)})`
      e.currentTarget.style.color = 'white'
      e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.15)'
      e.currentTarget.style.border = 'none'
    }}
    onMouseOut={(e) => {
      e.currentTarget.style.transform = 'translateY(0) scale(1)'
      e.currentTarget.style.background = 'white'
      e.currentTarget.style.color = 'inherit'
      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)'
      e.currentTarget.style.border = '1px solid #e5e7eb'
    }}
    >
      <div style={{
        fontSize: 'clamp(2rem, 3vw, 2.5rem)',
        transition: 'transform 0.3s ease',
      }}>
        {title.split(' ').shift()}
      </div>
      <div style={{
        fontWeight: 700,
        fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
        textAlign: 'center',
        color: 'inherit'
      }}>
        {title.split(' ').slice(1).join(' ')}
      </div>
    </a>
  )
}

// Fonction utilitaire pour extraire les couleurs du gradient
function getGradientColors(gradient: string): string {
  const gradients: any = {
    'from-blue-500 to-blue-600': '#3b82f6, #2563eb',
    'from-green-500 to-green-600': '#10b981, #059669',
    'from-purple-500 to-purple-600': '#8b5cf6, #7c3aed',
    'from-orange-500 to-orange-600': '#f59e0b, #d97706',
    'from-pink-500 to-pink-600': '#ec4899, #db2777',
    'from-red-500 to-red-600': '#ef4444, #dc2626',
    'from-gray-700 to-gray-800': '#374151, #1f2937',
    'from-indigo-500 to-indigo-600': '#6366f1, #4f46e5',
  }
  return gradients[gradient] || '#006233, #004d27'
}