'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

type Notification = Database['public']['Tables']['notifications']['Row']

export default function NotificationBell({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const supabase = createClient() as any

  const unreadCount = notifications.filter(n => !n.est_lue).length

  useEffect(() => {
    fetchNotifications()
    // Subscribe to real-time notifications
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, (payload: any) => {
        setNotifications(prev => [payload.new as Notification, ...prev])
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [userId])

  async function fetchNotifications() {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)
    if (data) setNotifications(data)
  }

  async function markAllRead() {
    await supabase.from('notifications').update({ est_lue: true }).eq('user_id', userId)
    setNotifications(prev => prev.map(n => ({ ...n, est_lue: true })))
  }

  const typeEmoji: Record<string, string> = {
    match: '⚽', resultat: '🏆', classement: '📊', badge: '🏅', annonce: '📢'
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        id="notification-bell"
        onClick={() => setOpen(!open)}
        aria-label={`Notifications (${unreadCount} non lues)`}
        style={{
          width: 40, height: 40,
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--color-border)',
          background: 'transparent',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.1rem',
          position: 'relative',
          transition: 'background 0.2s',
        }}
        onMouseOver={e => (e.currentTarget.style.background = 'rgba(0,98,51,0.06)')}
        onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
      >
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: 4, right: 4,
            width: 16, height: 16,
            background: 'var(--color-red)',
            color: 'white',
            borderRadius: '50%',
            fontSize: '0.6rem',
            fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid white',
          }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 150 }} />
          <div id="notifications-panel" style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: 340,
            maxHeight: 480,
            background: 'white',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 200,
            overflow: 'hidden',
            animation: 'fadeInUp 0.15s ease',
          }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Notifications</h3>
              {unreadCount > 0 && (
                <button onClick={markAllRead} style={{ fontSize: '0.75rem', color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
                  Tout marquer lu
                </button>
              )}
            </div>
            <div style={{ overflowY: 'auto', maxHeight: 400 }}>
              {notifications.length === 0 ? (
                <div style={{ padding: 32, textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  <div style={{ fontSize: '2rem', marginBottom: 8 }}>🔔</div>
                  <p style={{ fontSize: '0.875rem' }}>Aucune notification</p>
                </div>
              ) : (
                notifications.map(notif => (
                  <div key={notif.id} style={{
                    padding: '14px 20px',
                    borderBottom: '1px solid var(--color-border)',
                    background: notif.est_lue ? 'transparent' : 'rgba(0,98,51,0.03)',
                    display: 'flex',
                    gap: 12,
                    alignItems: 'flex-start',
                  }}>
                    <span style={{ fontSize: '1.2rem', flexShrink: 0, marginTop: 2 }}>
                      {typeEmoji[notif.type] || '🔔'}
                    </span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '0.875rem', fontWeight: notif.est_lue ? 400 : 600, color: 'var(--color-text-primary)', marginBottom: 2 }}>
                        {notif.titre}
                      </p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{notif.message}</p>
                      <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
                        {new Date(notif.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {!notif.est_lue && (
                      <div style={{ width: 8, height: 8, background: 'var(--color-primary)', borderRadius: '50%', flexShrink: 0, marginTop: 6 }} />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
