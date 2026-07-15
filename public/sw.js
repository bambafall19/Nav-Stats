// NavéStats Service Worker - Offline support
const CACHE_NAME = 'navestats-v1'
const STATIC_CACHE = 'navestats-static-v1'
const DYNAMIC_CACHE = 'navestats-dynamic-v1'

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
      data = { ...data, ...payload }
    }
  } catch (error) {
    console.error('Erreur parsing push data:', error)
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    tag: data.tag,
    requireInteraction: data.requireInteraction,
    actions: data.actions,
    data: {
      url: data.url || '/',
      type: data.type,
      matchId: data.matchId
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options).then(() => {
      return self.registration.getNotifications().then((notifications) => {
        // Keep notification visible until user interacts
        console.log('Notification affichée')
      })
    })
  )
})

// Notification click - open app
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const urlToOpen = event.notification.data?.url || '/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus()
        }
      }
      // Otherwise open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen)
      }
    })
  )
})

// Fetch - network first, cache fallback for pages; cache first for static
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
          const clone = response.clone()
          caches.open(DYNAMIC_CACHE).then((cache) => cache.put(event.request, clone))
          return response
        })
      })
    )
    return
  }

  // Pages - network first, fallback to cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone()
        caches.open(DYNAMIC_CACHE).then((cache) => cache.put(event.request, clone))
        return response
      })
      .catch(() => {
        return caches.match(event.request).then((cached) => {
          return cached || caches.match('/')
        })
      })
  )
})