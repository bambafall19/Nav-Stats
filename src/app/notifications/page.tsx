import type { Metadata } from 'next'
import NotificationsScreen from '@/components/notifications/NotificationsScreen'

export const metadata: Metadata = {
  title: 'Notifications – NavéStats',
  description: 'Vos notifications NavéStats : résultats, classements, actualités et réactions.',
}

export default function NotificationsPage() {
  return <NotificationsScreen />
}
