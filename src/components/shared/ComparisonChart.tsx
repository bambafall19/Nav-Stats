'use client'

interface ComparisonData {
  name: string
  points: number
  victoires: number
  defaites: number
  pourcentage: number
  matchsJoues: number
}

interface ComparisonChartProps {
  item1: ComparisonData
  item2: ComparisonData
}

export function ComparisonChart({ item1, item2 }: ComparisonChartProps) {
  const metrics = [
    { label: 'Points', key: 'points', max: Math.max(item1.points, item2.points) },
    { label: 'Victoires', key: 'victoires', max: Math.max(item1.victoires, item2.victoires) },
    { label: 'Défaites', key: 'defaites', max: Math.max(item1.defaites, item2.defaites) },
    { label: 'Pourcentage', key: 'pourcentage', max: 100 },
  ]

  return (
    <div style={{ display: 'grid', gap: 16, marginTop: 20 }}>
      {metrics.map(metric => {
        const value1 = item1[metric.key as keyof ComparisonData] as number
        const value2 = item2[metric.key as keyof ComparisonData] as number
        const percent1 = (value1 / metric.max) * 100
        const percent2 = (value2 / metric.max) * 100

        return (
          <div key={metric.key}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 8,
              fontSize: '0.85rem',
              fontWeight: 600,
            }}>
              <span>{item1.name}</span>
              <span style={{ color: 'var(--color-text-muted)' }}>{metric.label}</span>
              <span>{item2.name}</span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto 1fr',
              gap: 8,
              alignItems: 'center',
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
              }}>
                <div style={{
                  height: 24,
                  background: 'var(--color-primary)',
                  borderRadius: '4px 0 0 4px',
                  width: `${percent1}%`,
                  minWidth: percent1 > 0 ? 4 : 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  paddingRight: 4,
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: 'white',
                }}>
                  {percent1 > 20 && Math.round(value1)}
                </div>
              </div>

              <div style={{
                textAlign: 'center',
                fontSize: '0.75rem',
                color: 'var(--color-text-muted)',
                minWidth: 40,
              }}>
                {value1 > value2 ? '▶' : value1 < value2 ? '◀' : '='}
              </div>

              <div style={{
                display: 'flex',
              }}>
                <div style={{
                  height: 24,
                  background: 'var(--color-primary)',
                  borderRadius: '0 4px 4px 0',
                  width: `${percent2}%`,
                  minWidth: percent2 > 0 ? 4 : 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  paddingLeft: 4,
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: 'white',
                }}>
                  {percent2 > 20 && Math.round(value2)}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
