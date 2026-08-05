'use client'

import { Flame } from 'lucide-react'

interface StreakBadgeProps {
  streak: number
  bestStreak?: number
}

export default function StreakBadge({ streak, bestStreak }: StreakBadgeProps) {
  if (streak === 0) return null

  const getColor = (s: number) => {
    if (s >= 10) return { bg: '#7C3AED', text: 'white', glow: 'rgba(124,58,237,0.3)' }
    if (s >= 5) return { bg: '#EF4444', text: 'white', glow: 'rgba(239,68,68,0.3)' }
    return { bg: '#F59E0B', text: '#1a0a00', glow: 'rgba(255,201,77,0.3)' }
  }

  const color = getColor(streak)

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '4px 10px', borderRadius: 20,
      background: color.bg, color: color.text,
      fontSize: '0.75rem', fontWeight: 800,
      fontFamily: 'var(--font-plus-jakarta)',
      boxShadow: `0 2px 10px ${color.glow}`,
      whiteSpace: 'nowrap',
    }}>
      <Flame size={12} />
      <span>{streak}</span>
      {bestStreak && bestStreak > streak && (
        <span style={{ opacity: 0.7, fontSize: '0.65rem', marginLeft: 4 }}>(Meilleure: {bestStreak})</span>
      )}
    </div>
  )
}
