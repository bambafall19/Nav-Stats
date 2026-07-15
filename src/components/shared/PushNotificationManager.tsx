'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false)
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
      setPermission(Notification.permission)
      checkSubscription()
    }
  }, [])

  const checkSubscription = async () => {
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      setSubscription(sub)
      setIsSubscribed(!!sub)
    } catch (error) {
      console.error('Erreur vérification subscription:', error)
    }
  }

  const subscribeToPush = async () => {
    try {
      const reg = await navigator.serviceWorker.ready
      
      // Demander la permission
      const permission = await Notification.requestPermission()
      setPermission(permission)
      
      if (permission !== 'granted') {
        alert('Vous devez autoriser les notifications pour recevoir les alertes')
        return
      }

      // Convertir la clé VAPID en Uint8Array
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidPublicKey) {
        alert('Les notifications ne sont pas configurées. Contactez l\'administrateur.')
        return
      }

      const vapidKey = new Uint8Array(
        atob(vapidPublicKey.replace(/-/g, '+').replace(/_/g, '/'))
          .split('')
          .map(char => char.charCodeAt(0))
      )

      // Créer la subscription
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey
      })

      setSubscription(sub)
      setIsSubscribed(true)

      // Enregistrer la subscription dans la base de données
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        await (supabase as any).from('push_subscriptions').insert({
          user_id: user.id,
          subscription: sub.toJSON(),
          subscription_endpoint: sub.endpoint,
          user_agent: navigator.userAgent
        })
      }
    } catch (error) {
      console.error('Erreur subscription push:', error)
    }
  }

  const unsubscribeFromPush = async () => {
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      
      if (sub) {
        await sub.unsubscribe()
        setSubscription(null)
        setIsSubscribed(false)

        // Supprimer de la base de données
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user && sub) {
          await (supabase as any)
            .from('push_subscriptions')
            .delete()
            .eq('user_id', user.id)
            .eq('subscription_endpoint', sub.endpoint)
        }
      }
    } catch (error) {
      console.error('Erreur unsubscribe push:', error)
    }
  }

  // Ne pas afficher le composant si les notifications ne sont pas supportées
  if (!isSupported) {
    return null
  }

  return (
    <div className="push-notification-manager" style={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      zIndex: 1000,
      maxWidth: 320
    }}>
      {!isSubscribed ? (
        <div style={{
          background: 'white',
          padding: 16,
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          border: '1px solid var(--color-border)'
        }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', fontWeight: 700 }}>
            🔔 Activer les notifications
          </h4>
          <p style={{ margin: '0 0 12px 0', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
            Recevez les alertes de match en temps réel
          </p>
          <button
            onClick={subscribeToPush}
            className="btn btn-primary"
            style={{ width: '100%', fontSize: '0.85rem' }}
          >
            Activer
          </button>
        </div>
      ) : (
        <div style={{
          background: 'rgba(0,166,81,0.1)',
          padding: 12,
          borderRadius: 12,
          border: '1px solid rgba(0,166,81,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <span style={{ fontSize: '1.2rem' }}>✅</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary)' }}>
            Notifications actives
          </span>
        </div>
      )}
    </div>
  )
}