'use client'

import { useState, useEffect } from 'react'
import { Sun, Moon } from 'lucide-react'

const THEME_COOKIE = 'navestats_theme'

export default function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    let applied = document.documentElement.getAttribute('data-theme')
    if (applied !== 'light') {
      try {
        if (localStorage.getItem(THEME_COOKIE) === 'light') {
          applied = 'light'
        }
      } catch {
        // ignore
      }
    }
    if (applied === 'light') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTheme('light')
      try {
        document.cookie = `${THEME_COOKIE}=light; path=/; max-age=31536000; samesite=lax`
      } catch {
        // ignore
      }
    }
  }, [])

  const toggle = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    try {
      document.cookie = `${THEME_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`
    } catch {
      // ignore
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Activer le mode clair' : 'Activer le mode sombre'}
      title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
      className="theme-toggle-btn"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: compact ? 36 : 40,
        width: compact ? 36 : 40,
        borderRadius: 999,
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.1)',
        color: 'var(--color-text-primary)',
        cursor: 'pointer',
        transition: 'background 0.15s, transform 0.15s',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(42,255,160,0.12)'}
      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
    >
      {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  )
}
