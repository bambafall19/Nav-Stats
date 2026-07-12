'use client'

import { useState, useEffect } from 'react'

interface PushNotifButtonProps {
  matchId?: string
  matchLabel?: string
}

export default function PushNotifButton({ matchId, matchLabel }: PushNotifButtonProps) {
  const [status, setStatus] = useState<'idle' | 'subscribed' | 'denied' | 'unsupported' | 'loading'>('idle')

  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setStatus('unsupported')
      return
    }
    if (Notification.permission === 'granted') setStatus('subscribed')
    else if (Notification.permission === 'denied') setStatus('denied')
  }, [])

  const subscribe = async () => {
    if (!('Notification' in window)) return
    setStatus('loading')
    try {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        setStatus('subscribed')
        // Register service worker
        if ('serviceWorker' in navigator) {
          await navigator.serviceWorker.register('/sw.js')
        }
        // Show confirmation notification
        new Notification('🔔 NavéStats – Notifications activées !', {
          body: matchLabel
            ? `Tu seras alerté avant le match ${matchLabel}`
            : 'Tu seras alerté avant chaque match de Khombole.',
          icon: '/logo.png',
          badge: '/favicon.png',
        })
      } else {
        setStatus('denied')
      }
    } catch {
      setStatus('idle')
    }
  }

  const unsubscribe = () => {
    // Can't revoke, guide user
    setStatus('idle')
    alert('Pour désactiver les notifications, modifie les paramètres de ton navigateur.')
  }

  if (status === 'unsupported') return null

  return (
    <button
      id={matchId ? `push-notif-match-${matchId}` : 'push-notif-global-btn'}
      onClick={status === 'subscribed' ? unsubscribe : subscribe}
      disabled={status === 'loading' || status === 'denied'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 18px',
        borderRadius: 'var(--radius-full)',
        border: '1.5px solid',
        borderColor: status === 'subscribed' ? 'var(--color-primary)' : status === 'denied' ? 'var(--color-border)' : 'var(--color-primary)',
        background: status === 'subscribed' ? 'rgba(0,98,51,0.08)' : 'transparent',
        color: status === 'denied' ? 'var(--color-text-muted)' : 'var(--color-primary)',
        fontWeight: 700,
        fontSize: '0.85rem',
        cursor: status === 'loading' || status === 'denied' ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s',
        fontFamily: 'var(--font-outfit)',
        opacity: status === 'denied' ? 0.6 : 1,
      }}
      onMouseOver={e => {
        if (status !== 'loading' && status !== 'denied') {
          (e.currentTarget as HTMLElement).style.background = 'rgba(0,98,51,0.1)'
        }
      }}
      onMouseOut={e => {
        if (status !== 'subscribed') {
          (e.currentTarget as HTMLElement).style.background = 'transparent'
        }
      }}
    >
      {status === 'loading' && <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</span>}
      {status === 'subscribed' && '🔔'}
      {status === 'idle' && '🔕'}
      {status === 'denied' && '🚫'}
      {status === 'loading' ? 'Activation...' : status === 'subscribed' ? 'Notifications ON' : status === 'denied' ? 'Notifications bloquées' : 'M\'alerter avant le match'}
    </button>
  )
}
