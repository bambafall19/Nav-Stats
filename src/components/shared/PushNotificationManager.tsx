'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useT } from '@/lib/i18n/LanguageProvider'
import { useToast } from '@/components/shared/Toast'

function isIOS(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

function isStandalone(): boolean {
  return (
    (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches
  )
}

const SW_URL = `/sw.js?v=${process.env.NEXT_PUBLIC_APP_VERSION || '1'}`

export default function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [isIos, setIsIos] = useState(false)
  const [standalone, setStandalone] = useState(false)
  const t = useT()
  const { addToast } = useToast()

  useEffect(() => {
    if (typeof window === 'undefined') return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsSupported('serviceWorker' in navigator && 'PushManager' in window)
    setIsIos(isIOS())
    setStandalone(isStandalone())
    try {
      setDismissed(localStorage.getItem('push_dismissed') === 'true')
    } catch {
      // ignore
    }
  }, [])

  async function checkSubscription() {
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      setIsSubscribed(!!sub)
    } catch {
      console.error('Erreur vérification subscription')
    }
  }

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!isSupported) return

    const refreshStandalone = () => setStandalone(isStandalone())

    // Enregistrer le Service Worker (URL versionnée → mise à jour automatique)
    navigator.serviceWorker.register(SW_URL).then(() => {
      checkSubscription()
    }).catch(() => {
      console.error('Erreur enregistrement Service Worker')
    })

    // Re-vérifier à chaque retour au premier plan (installation PWA, permission…)
    const onVisibility = () => {
      if (document.hidden) return
      refreshStandalone()
      checkSubscription()
    }
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('focus', onVisibility)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('focus', onVisibility)
    }
  }, [isSupported])

  const subscribeToPush = async () => {
    try {
      const reg = await navigator.serviceWorker.ready
      const perm = await Notification.requestPermission()

      if (perm !== 'granted') {
        addToast(t('notifications.permissionDenied'), 'warning')
        return
      }

      // Convertir la clé VAPID en Uint8Array
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

      if (!vapidPublicKey) {
        addToast(t('notifications.notConfigured'), 'error')
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

      setIsSubscribed(true)

      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        await sub.unsubscribe()
        setIsSubscribed(false)
        addToast(t('notifications.authRequired'), 'warning')
        return
      }

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
          console.error('Erreur Supabase enregistrement subscription', insert.error)
          addToast(t('notifications.saveError'), 'error')
          return
        }
      }

      // Dismiss popup and save to localStorage
      localStorage.setItem('push_dismissed', 'true')
      setDismissed(true)

      addToast(t('notifications.enable'), 'success')
    } catch (err) {
      console.error('Erreur subscription push', err)
      addToast(t('notifications.subscribeError'), 'error')
    }
  }

  const unsubscribeFromPush = async () => {
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()

      if (sub) {
        await sub.unsubscribe()
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

  const showInstallGuide = isIos && !standalone

  return (
    <div className="push-notification-manager" style={{
      position: 'fixed',
      bottom: 100,
      right: 20,
      zIndex: 999,
      maxWidth: 320
    }}>
      {isSubscribed ? (
        <div style={{
          background: 'var(--color-surface-elevated)',
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
            {t('notifications.active')}
          </span>
        </div>
      ) : (
        <div style={{
          background: 'var(--color-surface-elevated)',
          padding: 16,
          borderRadius: 16,
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          border: '1px solid var(--color-border)',
          backdropFilter: 'blur(12px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'linear-gradient(135deg, #0dca6b, #0dca6b)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.2rem', flexShrink: 0
            }}>🔔</div>
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, margin: 0 }}>
                {t(showInstallGuide ? 'notifications.iosTitle' : 'notifications.push')}
              </h4>
              <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', margin: '2px 0 0 0' }}>
                {t(showInstallGuide ? 'notifications.iosHint' : 'notifications.alerts')}
              </p>
            </div>
          </div>

          {showInstallGuide ? (
            <>
              <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                  <span>1️⃣</span><span>Appuie sur <strong>Partager</strong> ⬆️ en bas de Safari</span>
                </div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                  <span>2️⃣</span><span>Choisis <strong>{'« Sur l’écran d’accueil »'}</strong> 🏠</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span>3️⃣</span><span>Puis <strong>Ajouter</strong> et ouvre NavéStats depuis ton accueil</span>
                </div>
              </div>
              <button
                onClick={() => {
                  localStorage.setItem('push_dismissed', 'true')
                  setDismissed(true)
                }}
                className="btn btn-ghost btn-sm"
                style={{ width: '100%', justifyContent: 'center', fontSize: '0.75rem' }}
              >
                {t('notifications.later')}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={subscribeToPush}
                className="btn btn-primary btn-sm"
                style={{ width: '100%', justifyContent: 'center', marginBottom: 8 }}
              >
                {t('notifications.activate')} 🔔
              </button>
              <button
                onClick={() => {
                  localStorage.setItem('push_dismissed', 'true')
                  setDismissed(true)
                }}
                className="btn btn-ghost btn-sm"
                style={{ width: '100%', justifyContent: 'center', fontSize: '0.75rem' }}
              >
                {t('notifications.later')}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
