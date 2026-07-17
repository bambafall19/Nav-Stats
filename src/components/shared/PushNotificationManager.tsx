'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false)
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Check if user already dismissed the popup
    const dismissedStorage = typeof window !== 'undefined' && localStorage.getItem('push_dismissed')
    if (dismissedStorage === 'true') {
      setDismissed(true)
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
      setPermission(Notification.permission)
      
      // Enregistrer le Service Worker
      navigator.serviceWorker.register('/sw.js').then((reg) => {
        console.log('Service Worker enregistré')
        return checkSubscription()
      }).catch(() => {
        console.error('Erreur enregistrement Service Worker')
      })
    }
  }, [])

  const checkSubscription = async () => {
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      setSubscription(sub)
      setIsSubscribed(!!sub)
    } catch {
      console.error('Erreur vérification subscription')
    }
  }

  const subscribeToPush = async () => {
    try {
      const reg = await navigator.serviceWorker.ready
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

      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const subJson = sub.toJSON()
        const { error } = await (supabase as any)
          .from('push_subscriptions')
          .upsert(
            {
              user_id: user.id,
              subscription: subJson,
              subscription_endpoint: sub.endpoint,
              user_agent: navigator.userAgent,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'subscription_endpoint' }
          )
          .select()

        if (error) {
          const insert = await (supabase as any)
            .from('push_subscriptions')
            .insert({
              user_id: user.id,
              subscription: subJson,
              subscription_endpoint: sub.endpoint,
              user_agent: navigator.userAgent,
            })
            .select()
          if (insert.error) {
            console.error('Erreur Supabase enregistrement subscription')
            alert('Erreur lors de l\'enregistrement')
            return
          }
        }
      } else {
        alert('Connectez-vous pour recevoir les notifications sur tous vos appareils.')
        return
      }

      // Dismiss popup and save to localStorage
      localStorage.setItem('push_dismissed', 'true')
      setDismissed(true)
      
      alert('Notifications activées avec succès !')
    } catch {
      console.error('Erreur subscription push')
      alert('Erreur lors de l\'activation des notifications. Veuillez réessayer.')
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
    } catch {
      console.error('Erreur unsubscribe push')
    }
  }

  // Ne pas afficher le composant si les notifications ne sont pas supportées
  if (!isSupported) {
    return null
  }

  // Don't show if dismissed, already subscribed, or on classements page
  if (dismissed) {
    return null
  }
  if (typeof window !== 'undefined' && window.location.pathname === '/classements') {
    return null
  }

  return (
    <div className="push-notification-manager" style={{
      position: 'fixed',
      bottom: 100,
      right: 20,
      zIndex: 999,
      maxWidth: 320
    }}>
      {!isSubscribed ? (
        <div style={{
          background: 'white',
          padding: 16,
          borderRadius: 16,
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          border: '1px solid var(--color-border)',
          backdropFilter: 'blur(12px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'linear-gradient(135deg, #006233, #00A651)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.2rem', flexShrink: 0
            }}>🔔</div>
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, margin: 0 }}>
                Notifications push
              </h4>
              <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', margin: '2px 0 0 0' }}>
                Alertes matchs en temps réel
              </p>
            </div>
          </div>
          <button
            onClick={subscribeToPush}
            className="btn btn-primary btn-sm"
            style={{ width: '100%', justifyContent: 'center', marginBottom: 8 }}
          >
            Activer 🔔
          </button>
          <button
            onClick={() => {
              localStorage.setItem('push_dismissed', 'true')
              setDismissed(true)
            }}
            className="btn btn-ghost btn-sm"
            style={{ width: '100%', justifyContent: 'center', fontSize: '0.75rem' }}
          >
            Plus tard
          </button>
        </div>
      ) : (
        <div style={{
          background: 'white',
          padding: '10px 16px',
          borderRadius: 100,
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          border: '1px solid rgba(0,166,81,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          cursor: 'pointer'
        }}
        onClick={unsubscribeFromPush}
        title="Désactiver les notifications"
        >
          <span style={{ fontSize: '1rem' }}>✅</span>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-primary)' }}>
            Notifications actives
          </span>
        </div>
      )}
    </div>
  )
}