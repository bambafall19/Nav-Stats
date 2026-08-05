'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bell, Trophy, BarChart3, Medal, Megaphone, X } from 'lucide-react'
import type { Database } from '@/types/database.types'

type Notification = Database['public']['Tables']['notifications']['Row']

const typeIcon: Record<string, React.ReactNode> = {
  match: <Medal size={16} color="#0dca6b" />,
  resultat: <Trophy size={16} color="#ffc94d" />,
  classement: <BarChart3 size={16} color="#0dca6b" />,
  badge: <Medal size={16} color="#ffc94d" />,
  annonce: <Megaphone size={16} color="#64748b" />,
}

export default function NotificationBell({ userId, variant, badgeColor }: { userId: string; variant?: 'pill' | 'icon'; badgeColor?: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const supabaseRef = useRef(createClient() as any)
  const channelIdRef = useRef(`notifications-${Math.random().toString(36).slice(2, 10)}-${userId}`)

  const supabase = supabaseRef.current
  const unreadCount = notifications.filter(n => !n.est_lue).length
  const isIcon = variant === 'icon'
  const badge = badgeColor === 'green' ? 'var(--color-primary)' : (badgeColor ?? 'var(--color-red)')
  const badgeText = badgeColor === 'green' ? '#052e1c' : 'white'

  useEffect(() => {
    fetchNotifications()
    const channel = supabaseRef.current
      .channel(channelIdRef.current)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, (payload: any) => {
        setNotifications(prev => [payload.new as Notification, ...prev])
      })
      .subscribe()
    return () => { supabaseRef.current.removeChannel(channel) }
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

  return (
    <div style={{ position: 'relative' }}>
      <button
        id="notification-bell"
        onClick={() => setOpen(!open)}
        aria-label={`Notifications (${unreadCount} non lues)`}
        style={{
          width: isIcon ? 44 : 40, height: isIcon ? 44 : 40,
          borderRadius: isIcon ? '50%' : 10,
          border: isIcon ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid var(--color-border-subtle)',
          background: isIcon ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
          color: isIcon ? '#FFFFFF' : undefined,
          boxShadow: isIcon ? '0 1px 4px rgba(0, 0, 0, 0.12)' : 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          transition: 'transform 0.2s ease, background 0.2s ease',
        }}
        onMouseOver={e => (e.currentTarget.style.background = isIcon ? 'rgba(255, 255, 255, 0.10)' : 'var(--color-bg-secondary)')}
        onMouseOut={e => (e.currentTarget.style.background = isIcon ? 'rgba(255, 255, 255, 0.06)' : 'transparent')}
      >
        <Bell size={isIcon ? 22 : 18} color={isIcon ? '#FFFFFF' : 'var(--color-text-secondary)'} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: 2, right: 2,
            minWidth: 18, height: 18,
            background: badge,
            color: badgeText,
            borderRadius: '50%',
            fontSize: '0.6rem', fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid var(--color-bg-primary)',
          }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 150 }} />
          <div id="notifications-panel" style={{
            position: 'absolute', top: 'calc(100% + 8px)', right: 0,
            width: 340, maxHeight: 480,
            background: 'var(--color-surface-elevated)', borderRadius: 16,
            border: '1px solid var(--color-border-subtle)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 200, overflow: 'hidden',
            animation: 'fadeInUp 0.15s ease',
          }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--color-border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, fontFamily: 'var(--font-plus-jakarta)', color: 'var(--color-text-primary)' }}>Notifications</h3>
              {unreadCount > 0 && (
                <button onClick={markAllRead} style={{ fontSize: '0.7rem', color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                  Tout marquer lu
                </button>
              )}
            </div>
            <div style={{ overflowY: 'auto', maxHeight: 400 }}>
              {notifications.length === 0 ? (
                <div style={{ padding: 32, textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  <Bell size={28} style={{ opacity: 0.3, marginBottom: 8 }} />
                  <p style={{ fontSize: '0.85rem' }}>Aucune notification</p>
                </div>
              ) : (
                notifications.map(notif => (
                  <div key={notif.id} style={{
                    padding: '14px 20px',
                    borderBottom: '1px solid var(--color-border-subtle)',
                    background: notif.est_lue ? 'transparent' : 'rgba(42,255,160,0.03)',
                    display: 'flex', gap: 12, alignItems: 'flex-start',
                  }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--color-bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {typeIcon[notif.type] || <Bell size={16} color="var(--color-text-muted)" />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '0.85rem', fontWeight: notif.est_lue ? 400 : 600, color: 'var(--color-text-primary)', marginBottom: 2 }}>
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
