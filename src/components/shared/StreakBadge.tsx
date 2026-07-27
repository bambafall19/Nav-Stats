'use client'

interface StreakBadgeProps {
  streak: number
  bestStreak?: number
}

export default function StreakBadge({ streak, bestStreak }: StreakBadgeProps) {
  if (streak === 0) return null

  const getColor = (s: number) => {
    if (s >= 10) return { bg: '#7C3AED', text: 'white', glow: 'rgba(124,58,237,0.3)' }
    if (s >= 5) return { bg: '#DC2626', text: 'white', glow: 'rgba(220,38,38,0.3)' }
    return { bg: '#F59E0B', text: '#1a0a00', glow: 'rgba(245,158,11,0.3)' }
  }

  const color = getColor(streak)

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      padding: '4px 12px',
      borderRadius: 999,
      background: color.bg,
      color: color.text,
      fontSize: '0.78rem',
      fontWeight: 800,
      fontFamily: 'var(--font-outfit)',
      boxShadow: `0 2px 12px ${color.glow}`,
      whiteSpace: 'nowrap',
    }}>
      <span>🔥</span>
      <span>{streak}</span>
      {bestStreak && bestStreak > streak && (
        <span style={{ opacity: 0.7, fontSize: '0.68rem', marginLeft: 4 }}>
          (Meilleure: {bestStreak})
        </span>
      )}
    </div>
  )
}