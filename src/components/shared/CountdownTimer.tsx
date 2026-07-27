'use client'

import { useState, useEffect } from 'react'

interface CountdownTimerProps {
  targetDate: string  // format YYYY-MM-DD
  targetTime: string  // format HH:mm:ss
  onZero?: () => void
}

function getTimeRemaining(targetDate: string, targetTime: string) {
  const [hours, minutes] = targetTime.split(':').map(Number)
  const target = new Date(`${targetDate}T${targetTime}`)
  const now = new Date()

  // Handle timezone: parse as local
  const localTarget = new Date(
    target.getFullYear(),
    target.getMonth(),
    target.getDate(),
    hours || 0,
    minutes || 0,
    0
  )

  const diff = localTarget.getTime() - now.getTime()

  if (diff <= 0) return { total: 0, hours: 0, minutes: 0, seconds: 0 }

  return {
    total: diff,
    hours: Math.floor(diff / (1000 * 60 * 60)),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

export default function CountdownTimer({ targetDate, targetTime }: CountdownTimerProps) {
  const [mounted, setMounted] = useState(false)
  const [remaining, setRemaining] = useState({ total: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    setMounted(true)

    function tick() {
      const r = getTimeRemaining(targetDate, targetTime)
      setRemaining(r)
      return r
    }

    const initial = tick()
    if (initial.total <= 0) return

    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [targetDate, targetTime])

  // Don't render anything during SSR to avoid hydration mismatch
  if (!mounted) return null

  // Only show countdown within 24 hours before the match
  if (remaining.total <= 0 || remaining.total > 24 * 60 * 60 * 1000) return null

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      fontSize: '0.72rem',
      fontWeight: 700,
      color: 'var(--color-primary)',
      background: 'rgba(0,166,81,0.08)',
      padding: '4px 10px',
      borderRadius: 20,
      whiteSpace: 'nowrap',
      fontFamily: 'var(--font-outfit)',
      letterSpacing: '0.02em',
      fontVariantNumeric: 'tabular-nums',
    }}>
      <span>⏱️</span>
      <span>
        {String(remaining.hours).padStart(2, '0')}h{' '}
        {String(remaining.minutes).padStart(2, '0')}m{' '}
        {String(remaining.seconds).padStart(2, '0')}s
      </span>
    </div>
  )
}