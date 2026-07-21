'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('navestats-theme')
    if (saved) {
      setIsDark(saved === 'dark')
    }
  }, [])

  useEffect(() => {
    if (!mounted) return
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
    localStorage.setItem('navestats-theme', isDark ? 'dark' : 'light')
  }, [isDark, mounted])

  if (!mounted) return null

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      style={{
        width: 44,
        height: 44,
        borderRadius: '50%',
        border: '1px solid var(--color-border)',
        background: 'var(--color-surface-card)',
        color: 'var(--color-text-primary)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.2rem',
        transition: 'all 0.2s ease',
        boxShadow: 'var(--shadow-sm)',
      }}
      aria-label={isDark ? 'Basculer vers le thème clair' : 'Basculer vers le thème sombre'}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'scale(1.1)'
        e.currentTarget.style.boxShadow = 'var(--shadow-green)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'scale(1)'
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
      }}
    >
      <AnimatePresence mode="wait">
        {isDark ? (
          <motion.span
            key="dark"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            🌙
          </motion.span>
        ) : (
          <motion.span
            key="light"
            initial={{ rotate: 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            ☀️
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}