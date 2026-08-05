'use client'

import { useState, useEffect, useRef, useCallback, useId } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Bell } from 'lucide-react'

export default function NotificationBell({ userId, variant, badgeColor }: { userId: string; variant?: 'pill' | 'icon'; badgeColor?: string }) {
  const router = useRouter()
  const [unreadCount, setUnreadCount] = useState(0)
  const supabaseRef = useRef(createClient() as any) // eslint-disable-line @typescript-eslint/no-explicit-any
  const channelIdRef = useRef(`notif-bell-${useId().replace(/[^a-zA-Z0-9]/g, '')}`)

  const supabase = supabaseRef.current
  const isIcon = variant === 'icon'
  const badge = badgeColor === 'green' ? 'var(--color-primary)' : (badgeColor ?? 'var(--color-red)')
  const badgeText = badgeColor === 'green' ? '#052e1c' : 'white'

  const fetchUnread = useCallback(async () => {
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('est_lue', false)
    setUnreadCount(count ?? 0)
  }, [supabase, userId])

  useEffect(() => {
    const client = supabaseRef.current
    fetchUnread()
    const channel = client
      .channel(channelIdRef.current)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, () => {
        fetchUnread()
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, () => {
        fetchUnread()
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, () => {
        fetchUnread()
      })
      .subscribe()
    return () => { client.removeChannel(channel) }
  }, [userId, fetchUnread])

  return (
    <button
      id="notification-bell"
      onClick={() => router.push('/notifications')}
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
  )
}
