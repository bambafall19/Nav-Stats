'use client'

import { useEffect, useRef, useState } from 'react'
import { Bell } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/shared/Toast'
import { useT } from '@/lib/i18n/LanguageProvider'

interface MatchReminderBellProps {
  matchId: string
  dateMatch: string
  heureMatch: string
}

type ReminderRow = {
  match_id: string
  remind_at: string
  sent: boolean
}

const OPTIONS = [
  { key: 'kickoff', offsetMinutes: 0 },
  { key: '30', offsetMinutes: 30 },
  { key: '60', offsetMinutes: 60 },
] as const

export default function MatchReminderBell({ matchId, dateMatch, heureMatch }: MatchReminderBellProps) {
  const [active, setActive] = useState(false)
  const [checked, setChecked] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { addToast } = useToast()
  const t = useT()
  const router = useRouter()

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/notifications/reminder')
        if (res.ok) {
          const data = await res.json()
          const found = (data.reminders || []).find((r: ReminderRow) => r.match_id === matchId && !r.sent)
          setActive(!!found)
        }
      } catch {
        // ignore
      } finally {
        setChecked(true)
      }
    })()
  }, [matchId])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    if (menuOpen) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  const computeRemindAt = (offsetMinutes: number): string => {
    const [h, m] = (heureMatch || '18:00').split(':').map(Number)
    const dt = new Date(`${dateMatch}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`)
    dt.setMinutes(dt.getMinutes() - offsetMinutes)
    return dt.toISOString()
  }

  const isUpcoming = (): boolean => {
    const now = Date.now()
    const kickoff = new Date(`${dateMatch}T${heureMatch || '18:00'}:00`).getTime()
    return kickoff > now
  }

  const setReminder = async (offsetMinutes: number) => {
    setBusy(true)
    try {
      const res = await fetch('/api/notifications/reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, remindAt: computeRemindAt(offsetMinutes) }),
      })
      const data = await res.json()
      if (res.ok) {
        setActive(true)
        setMenuOpen(false)
        addToast(t('matchs.reminderOn'), 'success')
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission !== 'granted') {
          addToast(t('notifications.enableHint'), 'warning', 4000)
        }
      } else if (res.status === 401) {
        addToast(t('notifications.authRequired'), 'warning')
        router.push('/auth/login')
      } else {
        addToast(data.error || t('common.error'), 'error')
      }
    } catch {
      addToast(t('common.error'), 'error')
    } finally {
      setBusy(false)
    }
  }

  const removeReminder = async () => {
    setBusy(true)
    try {
      const res = await fetch('/api/notifications/reminder', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId }),
      })
      if (res.ok) {
        setActive(false)
        addToast(t('matchs.reminderOff'), 'success')
      }
    } catch {
      addToast(t('common.error'), 'error')
    } finally {
      setBusy(false)
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (busy) return
    if (active) {
      removeReminder()
    } else if (!isUpcoming()) {
      addToast(t('matchs.reminderOff'), 'info')
    } else {
      setMenuOpen(!menuOpen)
    }
  }

  if (!checked) return null

  return (
    <div ref={menuRef} style={{ position: 'relative', flexShrink: 0 }}>
      <button
        type="button"
        onClick={handleClick}
        aria-label={active ? t('matchs.reminderOn') : t('matchs.reminder')}
        title={active ? t('matchs.reminderOn') : t('matchs.reminder')}
        style={{
          width: 32,
          height: 32,
          borderRadius: 9,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: active
            ? '1px solid rgba(42,255,160,0.5)'
            : '1px solid var(--color-border-subtle)',
          background: active ? 'rgba(42,255,160,0.14)' : 'var(--color-bg-primary)',
          color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
          cursor: 'pointer',
          transition: 'all 0.15s',
        }}
      >
        {active ? <Bell size={13} fill="currentColor" /> : <Bell size={13} />}
      </button>

      {menuOpen && (
        <div style={{
          position: 'absolute',
          right: 0,
          top: 'calc(100% + 8px)',
          zIndex: 50,
          minWidth: 170,
          padding: 6,
          background: 'var(--color-surface-elevated)',
          borderRadius: 12,
          border: '1px solid var(--color-border-subtle)',
          boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
          animation: 'slideDown 0.15s ease',
        }}>
          <div style={{
            padding: '6px 10px 4px',
            fontSize: '0.62rem',
            fontWeight: 800,
            color: 'var(--color-text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            {t('matchs.reminder')}
          </div>
          {OPTIONS.map(opt => (
            <button
              key={opt.key}
              type="button"
              onClick={(e) => { e.stopPropagation(); setReminder(opt.offsetMinutes) }}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '8px 10px',
                borderRadius: 8,
                border: 'none',
                background: 'transparent',
                color: 'var(--color-text-primary)',
                fontSize: '0.74rem',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'var(--font-plus-jakarta)',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {opt.key === 'kickoff'
                ? t('matchs.reminderKickoff')
                : opt.key === '30'
                  ? t('matchs.reminder30')
                  : t('matchs.reminder60')}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
