'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/shared/Toast'

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient() as any
  const { addToast } = useToast()

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('dismissed', false)
        .order('created_at', { ascending: false })

      setNotifications(data || [])
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDismiss = async (notificationId: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ dismissed: true })
        .eq('id', notificationId)

      setNotifications(notifications.filter(n => n.id !== notificationId))
      addToast('Notification supprimée', 'success')
    } catch (error) {
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
    } catch (error) {
      addToast('Erreur', 'error')
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return '#10b981'
      case 'warning':
        return '#f59e0b'
      case 'error':
        return '#ef4444'
      default:
        return 'var(--color-primary)'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✓'
      case 'warning':
        return '⚠️'
      case 'error':
        return '✕'
      case 'match':
        return '⚽'
      default:
        return 'ℹ️'
    }
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
          {notifications.map(notif => (
            <div
              key={notif.id}
              style={{
                background: 'var(--color-surface-card)',
                border: `2px solid ${getTypeColor(notif.type)}`,
                borderRadius: 'clamp(12px, 3vw, 16px)',
                padding: 'clamp(12px, 2vw, 16px)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                animation: 'slideInLeft 0.3s ease',
              }}
            >
              <div style={{
                fontSize: '1.5rem',
                flexShrink: 0,
                color: getTypeColor(notif.type),
              }}>
                {getTypeIcon(notif.type)}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 4 }}>
                  {notif.title}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: 8 }}>
                  {notif.message}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  {new Date(notif.created_at).toLocaleString('fr-FR')}
                </div>
              </div>

              <button
                onClick={() => handleDismiss(notif.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  color: 'var(--color-text-muted)',
                  padding: 0,
                  flexShrink: 0,
                }}
                title="Supprimer"
              >
                ✕
              </button>
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
