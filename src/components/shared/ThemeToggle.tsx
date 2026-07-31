'use client'

import { useState, useEffect } from 'react'

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
    try {
      const saved = localStorage.getItem('navestats-theme')
      if (saved) {
        setIsDark(saved === 'dark')
      } else if (typeof window !== 'undefined') {
        setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches)
      }
    } catch {
      // localStorage not available
    }
  }, [])

  useEffect(() => {
    if (!mounted) return
    try {
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
      localStorage.setItem('navestats-theme', isDark ? 'dark' : 'light')
    } catch {
      // storage not available
    }
  }, [isDark, mounted])

  if (!mounted) {
    return (
      <div style={{ width: 44, height: 44 }} />
    )
  }

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      style={{
        width: 44,
        height: 44,
        borderRadius: 'var(--radius-full)',
        border: '1px solid var(--color-border)',
        background: 'var(--color-surface-card)',
        color: 'var(--color-text-primary)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.1rem',
        transition: 'all 0.2s ease',
        boxShadow: 'var(--shadow-sm)',
      }}
      aria-label={isDark ? 'Basculer vers le thème clair' : 'Basculer vers le thème sombre'}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'scale(1.08)'
        e.currentTarget.style.boxShadow = 'var(--shadow-green)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'scale(1)'
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
      }}
    >
      {isDark ? '🌙' : '☀️'}
    </button>
  )
}
