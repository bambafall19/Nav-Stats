'use client'

interface ProgressionChartProps {
  data: { date: string; points: number }[]
  title: string
}

export function ProgressionChart({ data, title }: ProgressionChartProps) {
  if (!data || data.length === 0) {
    return (
      <div style={{
        background: 'var(--color-surface-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'clamp(12px, 3vw, 16px)',
        padding: 'clamp(16px, 3vw, 20px)',
        textAlign: 'center',
        color: 'var(--color-text-muted)',
      }}>
        Pas de données disponibles
      </div>
    )
  }

  const maxPoints = Math.max(...data.map(d => d.points))
  const chartHeight = 150

  return (
    <div style={{
      background: 'var(--color-surface-card)',
      border: '1px solid var(--color-border)',
      borderRadius: 'clamp(12px, 3vw, 16px)',
      padding: 'clamp(16px, 3vw, 20px)',
    }}>
      <h3 style={{
        fontFamily: 'var(--font-outfit)',
        fontWeight: 800,
        fontSize: 'clamp(0.9rem, 2vw, 1rem)',
        marginBottom: 16,
        marginTop: 0,
      }}>
        {title}
      </h3>

      <svg
        width="100%"
        height={chartHeight}
        style={{ marginBottom: 16 }}
        viewBox={`0 0 ${data.length * 40} ${chartHeight}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {data.map((item, idx) => {
          const barHeight = (item.points / maxPoints) * (chartHeight - 20)
          const x = idx * 40 + 10
          const y = chartHeight - barHeight - 10

          return (
            <g key={idx}>
              <rect
                x={x}
                y={y}
                width={30}
                height={barHeight}
                fill="var(--color-primary)"
                rx={4}
                style={{ opacity: 0.8 }}
              />
              <text
                x={x + 15}
                y={chartHeight - 2}
                textAnchor="middle"
                fontSize="10"
                fill="var(--color-text-muted)"
              >
                {item.date}
              </text>
            </g>
          )
        })}
      </svg>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 12,
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>
            Minimum
          </div>
          <div style={{ fontFamily: 'var(--font-outfit)', fontWeight: 900, fontSize: '1rem', color: 'var(--color-primary)' }}>
            {Math.min(...data.map(d => d.points))}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>
            Moyenne
          </div>
          <div style={{ fontFamily: 'var(--font-outfit)', fontWeight: 900, fontSize: '1rem', color: 'var(--color-primary)' }}>
            {Math.round(data.reduce((a, b) => a + b.points, 0) / data.length)}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>
            Maximum
          </div>
          <div style={{ fontFamily: 'var(--font-outfit)', fontWeight: 900, fontSize: '1rem', color: 'var(--color-primary)' }}>
            {Math.max(...data.map(d => d.points))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function StatsGrid({ stats }: { stats: { label: string; value: string | number; icon: string }[] }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
      gap: 'clamp(12px, 2vw, 16px)',
      marginBottom: 'clamp(16px, 3vw, 20px)',
    }}>
      {stats.map((stat, idx) => (
        <div
          key={idx}
          style={{
            background: 'var(--color-surface-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'clamp(12px, 3vw, 16px)',
            padding: 'clamp(12px, 2vw, 16px)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>{stat.icon}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>
            {stat.label}
          </div>
          <div style={{ fontFamily: 'var(--font-outfit)', fontWeight: 900, fontSize: 'clamp(0.9rem, 2vw, 1.1rem)', color: 'var(--color-primary)' }}>
            {stat.value}
          </div>
        </div>
      ))}
    </div>
  )
}
