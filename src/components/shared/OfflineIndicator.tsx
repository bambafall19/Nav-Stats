'use client'

import { useState, useEffect } from 'react'

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [show, setShow] = useState(false)

  useEffect(() => {
    setIsOnline(navigator.onLine)

    const handleOnline = () => {
      setIsOnline(true)
      setShow(true)
      setTimeout(() => setShow(false), 3000)
    }
    const handleOffline = () => {
      setIsOnline(false)
      setShow(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!show) return null

  return (
    <div style={{
      position: 'fixed',
      top: 'calc(var(--nav-height) + 8px)',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 999,
      padding: '8px 18px',
      borderRadius: 999,
      fontSize: '0.8rem',
      fontWeight: 700,
      fontFamily: 'var(--font-outfit)',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
      animation: 'slideDown 0.3s ease',
      background: isOnline ? 'var(--color-primary)' : '#E8002D',
      color: 'white',
    }}>
      <span>{isOnline ? '✅' : '📡'}</span>
      <span>{isOnline ? 'Connecté' : 'Mode hors-ligne — données en cache'}</span>
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateX(-50%) translateY(-10px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  )
}