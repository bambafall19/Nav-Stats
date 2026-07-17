'use client'

import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface TeamStats {
  name: string
  matchsJoues: number
  victoires: number
  nuls: number
  defaites: number
  butsMarques: number
  butsEncaisses: number
  points: number
  historique: Array<{
    date: string
    points: number
    victoires: number
    defaites: number
  }>
}

interface TeamStatsChartProps {
  stats: TeamStats
}

export function TeamStatsChart({ stats }: TeamStatsChartProps) {
  const performanceData = [
    { name: 'Victoires', value: stats.victoires, color: '#00A651' },
    { name: 'Nuls', value: stats.nuls, color: '#FFB81C' },
    { name: 'Défaites', value: stats.defaites, color: '#E74C3C' },
  ]

  const butsData = [
    { name: 'Marqués', value: stats.butsMarques },
    { name: 'Encaissés', value: stats.butsEncaisses },
  ]

  return (
    <div style={{ display: 'grid', gap: 24, marginTop: 20 }}>
      {/* Résumé */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: 12,
      }}>
        <div style={{
          background: 'var(--color-surface-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 8,
          padding: 12,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>Matchs</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-primary)' }}>{stats.matchsJoues}</div>
        </div>
        <div style={{
          background: 'var(--color-surface-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 8,
          padding: 12,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>Points</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-primary)' }}>{stats.points}</div>
        </div>
        <div style={{
          background: 'var(--color-surface-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 8,
          padding: 12,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>Buts +/-</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: stats.butsMarques - stats.butsEncaisses > 0 ? '#00A651' : '#E74C3C' }}>
            {stats.butsMarques - stats.butsEncaisses > 0 ? '+' : ''}{stats.butsMarques - stats.butsEncaisses}
          </div>
        </div>
      </div>

      {/* Graphique Résultats */}
      <div style={{
        background: 'var(--color-surface-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 8,
        padding: 16,
      }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 12 }}>Résultats</h3>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={performanceData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {performanceData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Graphique Buts */}
      <div style={{
        background: 'var(--color-surface-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 8,
        padding: 16,
      }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 12 }}>Buts</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={butsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="var(--color-primary)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Historique */}
      {stats.historique.length > 0 && (
        <div style={{
          background: 'var(--color-surface-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 8,
          padding: 16,
        }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 12 }}>Évolution des points</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={stats.historique}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="points" stroke="var(--color-primary)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
