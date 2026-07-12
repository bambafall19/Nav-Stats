// NavéStats – Service Worker (PWA Push Notifications)
// public/sw.js

const CACHE_NAME = 'navestats-v1'

// Install event
self.addEventListener('install', (event) => {
  self.skipWaiting()
})

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

// Push event – display notification from push server
self.addEventListener('push', (event) => {
  let data = { title: '⚽ NavéStats', body: 'Un match commence bientôt à Khombole !' }
  try { data = event.data.json() } catch (e) {}

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/logo.png',
      badge: '/favicon.png',
      vibrate: [200, 100, 200],
      tag: 'navestats-match',
      renotify: true,
      data: { url: data.url || '/matchs' },
    })
  )
})

// Notification click – open the app
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/matchs'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url)
          return client.focus()
        }
      }
      if (clients.openWindow) return clients.openWindow(url)
    })
  )
})
