'use client'

import { useEffect } from 'react'

export function MatchNotificationService() {
  useEffect(() => {
    // Check for match notifications every minute
    const checkNotifications = async () => {
      try {
        await fetch('/api/notifications/match-check', { method: 'POST' })
      } catch (error) {
        console.error('Error checking match notifications:', error)
      }
    }

    // Check immediately on mount
    checkNotifications()

    // Then check every minute
    const interval = setInterval(checkNotifications, 60000)

    return () => clearInterval(interval)
  }, [])

  return null
}
