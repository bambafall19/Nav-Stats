'use client'

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface PersonalStats {
  bestMonth: {
    month: string
    points: number
    predictions: number
  }
  bestStreak: number
  currentStreak: number
  monthlyData: Array<{
    month: string
    points: number
    predictions: number
    accuracy: number
  }>
  weeklyData: Array<{
    week: string
    points: number
    predictions: number
  }>
}

interface PersonalStatsProps {
  stats: PersonalStats
}

export function PersonalStatsDisplay({ stats }: PersonalStatsProps) {
  return (
    <div style={{ display: 'grid', gap: 20, marginTop: 20 }}>
      {/* Résumé */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 12,
      }}>
        <div style={{
          background: 'var(--color-surface-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 8,
          padding: 16,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 8 }}>
            Meilleur mois
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--color-primary)', marginBottom: 4 }}>
            {stats.bestMonth.month}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            {stats.bestMonth.points} pts
          </div>
        </div>

        <div style={{
          background: 'var(--color-surface-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 8,
          padding: 16,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 8 }}>
            Meilleure série
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#FFB81C', marginBottom: 4 }}>
            🔥 {stats.bestStreak}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            pronostics
          </div>
        </div>

        <div style={{
          background: 'var(--color-surface-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 8,
          padding: 16,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 8 }}>
            Série actuelle
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#00A651', marginBottom: 4 }}>
            {stats.currentStreak}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            en cours
          </div>
        </div>
      </div>

      {/* Graphique mensuel */}
      {stats.monthlyData.length > 0 && (
        <div style={{
          background: 'var(--color-surface-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 8,
          padding: 16,
        }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 12 }}>
            📊 Performance mensuelle
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="points" fill="var(--color-primary)" name="Points" />
              <Bar dataKey="predictions" fill="#FFB81C" name="Pronostics" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Graphique hebdomadaire */}
      {stats.weeklyData.length > 0 && (
        <div style={{
          background: 'var(--color-surface-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 8,
          padding: 16,
        }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 12 }}>
            📈 Évolution hebdomadaire
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={stats.weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="points"
                stroke="var(--color-primary)"
                strokeWidth={2}
                name="Points"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
