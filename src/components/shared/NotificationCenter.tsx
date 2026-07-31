'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/shared/Toast'
import Link from 'next/link'

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<any[]>([]) // eslint-disable-line @typescript-eslint/no-explicit-any
  const [loading, setLoading] = useState(true)
  const supabase = createClient() as any // eslint-disable-line @typescript-eslint/no-explicit-any
  const { addToast } = useToast()

  const fetchNotifications = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      setNotifications(data || [])
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 5000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  const markAsRead = async (id: string) => {
    await supabase.from('notifications').update({ est_lue: true }).eq('id', id)
  }

  const handleDismiss = async (notificationId: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ dismissed: true })
        .eq('id', notificationId)

      setNotifications(notifications.filter(n => n.id !== notificationId))
      addToast('Notification supprimée', 'success')
    } catch {
      addToast('Erreur lors de la suppression', 'error')
    }
  }

  const handleDismissAll = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await supabase
        .from('notifications')
        .update({ dismissed: true })
        .eq('user_id', user.id)
        .eq('dismissed', false)

      setNotifications([])
      addToast('Toutes les notifications supprimées', 'success')
    } catch {
      addToast('Erreur', 'error')
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'match': return '⚽'
      case 'resultat': return '🏆'
      case 'classement': return '📊'
      case 'badge': return '🎖️'
      case 'annonce': return '📢'
      default: return 'ℹ️'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'match': return 'var(--color-primary)'
      case 'resultat': return '#FFD700'
      case 'classement': return '#3b82f6'
      case 'badge': return '#a855f7'
      case 'annonce': return '#f59e0b'
      default: return 'var(--color-text-muted)'
    }
  }

  const groupNotifications = (notifs: any[]) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const groups: { [key: string]: any[] } = {} // eslint-disable-line @typescript-eslint/no-explicit-any
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
    const week = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

    notifs.forEach(notif => {
      const date = new Date(notif.created_at)
      const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      let group = 'older'
      if (dateOnly >= today) group = 'today'
      else if (dateOnly >= yesterday) group = 'yesterday'
      else if (date >= week) group = 'week'
      if (!groups[group]) groups[group] = []
      groups[group].push(notif)
    })

    return groups
  }

  if (loading) {
    return <div style={{ padding: 20, textAlign: 'center' }}>Chargement...</div>
  }

  return (
    <div style={{ padding: 'clamp(16px, 3vw, 24px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-outfit)', fontWeight: 900, fontSize: 'clamp(1.3rem, 4vw, 1.8rem)', margin: 0 }}>
          🔔 Notifications ({notifications.length})
        </h1>
        {notifications.length > 0 && (
          <button
            onClick={handleDismissAll}
            style={{
              padding: '8px 14px',
              background: 'var(--color-red)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.8rem',
            }}
          >
            ✕ Tout supprimer
          </button>
        )}
      </div>

      {notifications.length > 0 ? (
        <div style={{ display: 'grid', gap: 'clamp(12px, 2vw, 16px)' }}>
          {Object.entries(groupNotifications(notifications)).map(([group, groupNotifs]) => (
            <div key={group}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                {group === 'today' ? "Aujourd&apos;hui" : group === 'yesterday' ? 'Hier' : group === 'week' ? 'Cette semaine' : 'Plus ancien'}
              </div>
              {groupNotifs.map(notif => (
                <div
                  key={notif.id}
                  style={{
                    background: 'var(--color-surface-card)',
                    border: `1px solid ${getTypeColor(notif.type)}40`,
                    borderLeft: `4px solid ${getTypeColor(notif.type)}`,
                    borderRadius: 'clamp(12px, 3vw, 16px)',
                    padding: 'clamp(12px, 2vw, 16px)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    animation: 'slideInLeft 0.3s ease',
                    marginBottom: 8,
                  }}
                >
                  <div style={{
                    fontSize: '1.5rem',
                    flexShrink: 0,
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                  }}>
                    {getTypeIcon(notif.type)}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 4, color: 'var(--color-text-primary)' }}>
                      {notif.title}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: 8, lineHeight: 1.5 }}>
                      {notif.message}
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        {new Date(notif.created_at).toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {notif.lien && (
                        <Link href={notif.lien} onClick={() => markAsRead(notif.id)} style={{
                          fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)',
                          textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4
                        }}>
                          Voir →
                        </Link>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDismiss(notif.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '1.1rem',
                      color: 'var(--color-text-muted)',
                      padding: '4px',
                      flexShrink: 0,
                      borderRadius: '50%',
                      transition: 'all 0.15s',
                    }}
                    title="Supprimer"
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.05)'; e.currentTarget.style.color = 'var(--color-red)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-muted)' }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          background: 'var(--color-surface-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 'clamp(12px, 3vw, 16px)',
          padding: 'clamp(32px, 5vw, 48px)',
          textAlign: 'center',
          color: 'var(--color-text-muted)',
        }}>
          <div style={{ fontSize: '2rem', marginBottom: 12 }}>📭</div>
          <div style={{ fontSize: '0.95rem' }}>Aucune notification</div>
        </div>
      )}
    </div>
  )
}
