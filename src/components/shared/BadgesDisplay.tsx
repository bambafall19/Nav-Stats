'use client'

interface Badge {
  id: string
  name: string
  icon: string
  description: string
  earned: boolean
}

interface BadgesDisplayProps {
  badges: Badge[]
}

export function BadgesDisplay({ badges }: BadgesDisplayProps) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
      gap: 12,
      marginTop: 16,
    }}>
      {badges.map(badge => (
        <div
          key={badge.id}
          title={badge.description}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
            padding: 12,
            borderRadius: 8,
            background: badge.earned ? 'var(--color-surface-card)' : 'var(--color-surface)',
            border: badge.earned ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
            opacity: badge.earned ? 1 : 0.5,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            if (badge.earned) {
              e.currentTarget.style.transform = 'scale(1.05)'
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
          }}
        >
          <div style={{ fontSize: '1.5rem' }}>{badge.icon}</div>
          <div style={{
            fontSize: '0.7rem',
            fontWeight: 600,
            textAlign: 'center',
            color: badge.earned ? 'var(--color-text)' : 'var(--color-text-muted)',
          }}>
            {badge.name}
          </div>
        </div>
      ))}
    </div>
  )
}

export const ACHIEVEMENT_BADGES: Badge[] = [
  {
    id: 'top10',
    name: 'Top 10',
    icon: '🏆',
    description: 'Être dans le top 10 du classement',
    earned: false,
  },
  {
    id: 'top3',
    name: 'Top 3',
    icon: '👑',
    description: 'Être dans le top 3 du classement',
    earned: false,
  },
  {
    id: 'perfect_week',
    name: 'Semaine Parfaite',
    icon: '⭐',
    description: 'Avoir 100% de réussite pendant une semaine',
    earned: false,
  },
  {
    id: 'streak_10',
    name: 'Série de 10',
    icon: '🔥',
    description: 'Avoir une série de 10 pronostics corrects',
    earned: false,
  },
  {
    id: 'best_percentage',
    name: 'Meilleur %',
    icon: '📈',
    description: 'Avoir le meilleur pourcentage de réussite',
    earned: false,
  },
  {
    id: 'rising_star',
    name: 'Étoile Montante',
    icon: '⬆️',
    description: 'Monter de 10 places en une semaine',
    earned: false,
  },
]
