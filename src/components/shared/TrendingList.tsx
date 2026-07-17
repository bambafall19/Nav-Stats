'use client'

interface TrendingItem {
  id: string
  name: string
  avatar?: string
  currentRank: number
  previousRank: number
  points: number
  change: number
  type: 'pronostiqueur' | 'equipe'
}

interface TrendingListProps {
  items: TrendingItem[]
  period: 'semaine' | 'mois'
}

export function TrendingList({ items, period }: TrendingListProps) {
  const sortedItems = [...items].sort((a, b) => b.change - a.change).slice(0, 10)

  return (
    <div style={{
      background: 'var(--color-surface-card)',
      border: '1px solid var(--color-border)',
      borderRadius: 8,
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-surface)',
        fontWeight: 700,
        fontSize: '0.9rem',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <span>🔥 Trending cette {period === 'semaine' ? 'semaine' : 'mois'}</span>
      </div>

      {sortedItems.map((item, idx) => {
        const isRising = item.currentRank < item.previousRank
        const rankChange = Math.abs(item.currentRank - item.previousRank)

        return (
          <div
            key={item.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 16px',
              borderBottom: idx < sortedItems.length - 1 ? '1px solid var(--color-border)' : 'none',
            }}
          >
            <div style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: isRising ? 'rgba(0, 166, 81, 0.1)' : 'rgba(231, 76, 60, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: isRising ? '#00A651' : '#E74C3C',
              flexShrink: 0,
            }}>
              {isRising ? '↑' : '↓'}
            </div>

            {item.avatar ? (
              <img
                src={item.avatar}
                alt=""
                style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
              />
            ) : (
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'var(--color-surface)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8rem',
                flexShrink: 0,
              }}>
                {item.type === 'pronostiqueur' ? '👤' : '⚽'}
              </div>
            )}

            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                {item.previousRank > 0 ? `#${item.previousRank} → #${item.currentRank}` : `Nouveau`}
              </div>
            </div>

            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{
                fontWeight: 700,
                fontSize: '0.9rem',
                color: isRising ? '#00A651' : '#E74C3C',
              }}>
                {isRising ? '+' : '-'}{rankChange}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                {item.points} pts
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
