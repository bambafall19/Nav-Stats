import webpush from 'web-push'

export type StoredPushSubscription = {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export type PushPayload = {
  title: string
  body: string
  type?: string
  matchId?: string | null
  url?: string | null
}

export function isVapidConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY &&
    process.env.VAPID_PRIVATE_KEY
  )
}

export function configureVapid(): boolean {
  try {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    const privateKey = process.env.VAPID_PRIVATE_KEY

    if (!publicKey || !privateKey) {
      return false
    }

    webpush.setVapidDetails(
      'mailto:contact@navestats.site',
      publicKey,
      privateKey
    )
    return true
  } catch (error) {
    console.warn('VAPID non configuré:', error)
    return false
  }
}

export function normalizeSubscription(
  raw: unknown
): StoredPushSubscription | null {
  if (!raw || typeof raw !== 'object') return null
  const sub = raw as Record<string, unknown>
  const endpoint = typeof sub.endpoint === 'string' ? sub.endpoint : null
  const keys = sub.keys as Record<string, unknown> | undefined
  const p256dh = keys && typeof keys.p256dh === 'string' ? keys.p256dh : null
  const auth = keys && typeof keys.auth === 'string' ? keys.auth : null

  if (!endpoint || !p256dh || !auth) return null

  return {
    endpoint,
    keys: { p256dh, auth },
  }
}

/**
 * Send a web push to many subscriptions.
 * Returns counts and endpoints that should be removed (expired / invalid).
 */
export async function sendWebPushToSubscriptions(
  subscriptions: StoredPushSubscription[],
  payload: PushPayload
): Promise<{ sent: number; failed: number; staleEndpoints: string[] }> {
  if (!configureVapid()) {
    return { sent: 0, failed: subscriptions.length, staleEndpoints: [] }
  }

  const body = JSON.stringify({
    title: payload.title,
    body: payload.body,
    type: payload.type,
    matchId: payload.matchId ?? undefined,
    url: payload.url || '/',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: 'navestats-notification',
    requireInteraction: true,
    actions: [
      { action: 'open', title: 'Ouvrir' },
      { action: 'close', title: 'Fermer' },
    ],
  })

  const staleEndpoints: string[] = []
  let sent = 0
  let failed = 0

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(sub, body)
        sent += 1
      } catch (error: unknown) {
        failed += 1
        const statusCode =
          error && typeof error === 'object' && 'statusCode' in error
            ? Number((error as { statusCode?: number }).statusCode)
            : undefined

        // 404 / 410 = subscription expired or unsubscribed
        if (statusCode === 404 || statusCode === 410) {
          staleEndpoints.push(sub.endpoint)
        } else {
          console.error('Erreur envoi push:', error)
        }
      }
    })
  )

  return { sent, failed, staleEndpoints }
}
