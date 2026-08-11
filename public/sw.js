// NavéStats Service Worker - Offline support
// Version v4 — ajoute un cache-busting par ?v= (voir NEXT_PUBLIC_APP_VERSION)
const CACHE_NAME = 'navestats-v4'
const STATIC_CACHE = 'navestats-static-v4'
const DYNAMIC_CACHE = 'navestats-dynamic-v4'

// Permet de recevoir l'ordre de sauter l'ancienne version (envoyé par l'app)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

const STATIC_URLS = [
  '/',
  '/matchs',
  '/classements',
  '/statistiques',
  '/communaute',
  '/manifest.json',
  '/logo.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
]

// Install - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_URLS).catch(() => {
        // Some URLs might fail, that's ok
        console.log('Static cache partially loaded')
      })
    })
  )
  self.skipWaiting()
})

// Activate - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map((key) => caches.delete(key))
      )
    })
  )
  self.clients.claim()
})

// Push - handle incoming push notifications
self.addEventListener('push', (event) => {
  let data = {
    title: 'NavéStats',
    body: 'Vous avez une nouvelle notification',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: 'navestats-notification',
    requireInteraction: true,
    actions: [
      { action: 'open', title: 'Ouvrir' },
      { action: 'close', title: 'Fermer' }
    ]
  }

  try {
    if (event.data) {
      const payload = event.data.json()
      // Support both FR (titre/message) and EN (title/body) field names
      data = {
        ...data,
        ...payload,
        title: payload.title || payload.titre || data.title,
        body: payload.body || payload.message || data.body,
        url: payload.url || (payload.matchId ? `/matchs/${payload.matchId}` : data.url || '/'),
      }
    }
  } catch (error) {
    console.error('Erreur parsing push data:', error)
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icons/icon-192.png',
    badge: data.badge || '/icons/icon-192.png',
    tag: data.tag || 'navestats-notification',
    requireInteraction: data.requireInteraction !== false,
    actions: data.actions || [
      { action: 'open', title: 'Ouvrir' },
      { action: 'close', title: 'Fermer' },
    ],
    data: {
      url: data.url || '/',
      type: data.type,
      matchId: data.matchId,
    },
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'NavéStats', options)
  )
})

// Notification click - open app
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'close') {
    return
  }

  const urlToOpen = event.notification.data?.url || '/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate?.(urlToOpen)
          return client.focus()
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen)
      }
    })
  )
})

// Key pages served from cache first (instant load) and refreshed in background
// so they remain available offline. Everything else stays network-first.
const CACHE_FIRST_PAGES = ['/classements', '/matchs', '/']

function putInCache(request, response) {
  if (response && response.ok) {
    const clone = response.clone()
    caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, clone))
  }
}

// Fetch - offline-first for key pages, cache fallback otherwise
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  
  // Skip non-GET and external requests
  if (event.request.method !== 'GET') return
  if (!url.origin.includes('navestats')) return

  // API requests - network only
  if (url.pathname.includes('/api/') || url.hostname.includes('supabase')) {
    return
  }

  // Static assets - cache first
  if (
    url.pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff2?)$/) ||
    url.pathname.startsWith('/_next/static/')
  ) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return cached || fetch(event.request).then((response) => {
          putInCache(event.request, response)
          return response
        })
      })
    )
    return
  }

  // Key pages - cache first (stale-while-revalidate), great for offline
  if (CACHE_FIRST_PAGES.includes(url.pathname)) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        const fetchPromise = fetch(event.request).then((response) => {
          putInCache(event.request, response)
          return response
        }).catch(() => null)
        return cached || fetchPromise
      })
    )
    return
  }

  // Other pages - network first, fallback to cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        putInCache(event.request, response)
        return response
      })
      .catch(() => {
        return caches.match(event.request).then((cached) => {
          return cached || caches.match('/')
        })
      })
  )
})
