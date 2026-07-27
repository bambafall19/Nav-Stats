'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface PerformanceChartProps {
  data: { journee: number; points: number; classement: number }[]
}

export default function PerformanceChart({ data }: PerformanceChartProps) {
  if (!data || data.length === 0) {
    return (
      <div style={{
        padding: 40,
        textAlign: 'center',
        color: 'var(--color-text-muted)',
        fontSize: '0.9rem',
      }}>
        Pas encore assez de données pour afficher le graphique.
      </div>
    )
  }

  return (
    <div style={{ width: '100%', height: 280 }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis
            dataKey="journee"
            tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
            tickLine={false}
            label={{ value: 'Journée', position: 'insideBottom', offset: -5, style: { fill: 'var(--color-text-muted)', fontSize: 12 } }}
          />
          <YAxis
            tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--color-surface-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 12,
              boxShadow: 'var(--shadow-md)',
            }}
            labelStyle={{ fontWeight: 700, fontFamily: 'var(--font-outfit)' }}
          />
          <Line
            type="monotone"
            dataKey="points"
            stroke="var(--color-primary-light)"
            strokeWidth={3}
            dot={{ fill: 'var(--color-primary-light)', strokeWidth: 2, r: 5 }}
            activeDot={{ r: 7, strokeWidth: 0 }}
            name="Points"
          />
          <Line
            type="monotone"
            dataKey="classement"
            stroke="#FBBF00"
            strokeWidth={2}
            dot={{ fill: '#FBBF00', strokeWidth: 2, r: 4 }}
            name="Classement"
            strokeDasharray="5 5"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}