/**
 * Service Worker pour le cache offline
 * Généré automatiquement par vite-plugin-pwa
 */

// Ce fichier est généré automatiquement
// Pour personnaliser, utiliser la configuration dans vite.config.ts

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...')
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...')
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  // Le cache est géré par Workbox dans vite.config.ts
})
