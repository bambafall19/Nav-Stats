'use client'

import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'

interface RankingNotification {
  id: string
  userId: string
  type: 'up' | 'down'
  oldRank: number
  newRank: number
  message: string
  createdAt: string
}

export function RankingNotificationListener() {
  const [notifications, setNotifications] = useState<RankingNotification[]>([])
  const queryClient = useQueryClient()

  useEffect(() => {
    const eventSource = new EventSource('/api/notifications/ranking/stream')

    eventSource.onmessage = (event) => {
      try {
        const notification = JSON.parse(event.data)
        setNotifications(prev => [notification, ...prev].slice(0, 5))

        // Invalider le cache des classements
        queryClient.invalidateQueries({ queryKey: ['classement'] })

        // Afficher une notification toast
        showNotification(notification)
      } catch (error) {
        console.error('Failed to parse notification:', error)
      }
    }

    eventSource.onerror = () => {
      eventSource.close()
    }

    return () => eventSource.close()
  }, [queryClient])

  return (
    <div style={{
      position: 'fixed',
      top: 20,
      right: 20,
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      maxWidth: 300,
    }}>
      {notifications.map(notif => (
        <div
          key={notif.id}
          style={{
            background: notif.type === 'up' ? '#00A651' : '#E74C3C',
            color: 'white',
            padding: 12,
            borderRadius: 8,
            fontSize: '0.85rem',
            fontWeight: 600,
            animation: 'slideIn 0.3s ease-out',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>{notif.type === 'up' ? '📈' : '📉'}</span>
            <span>{notif.message}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function showNotification(notification: RankingNotification) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('NavéStats', {
      body: notification.message,
      icon: notification.type === 'up' ? '📈' : '📉',
    })
  }
}
