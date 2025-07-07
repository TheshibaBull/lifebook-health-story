
const CACHE_NAME = 'lifebook-health-v1';
const urlsToCache = [
  '/',
  '/dashboard',
  '/upload-record',
  '/health-score',
  '/family',
  '/manifest.json',
  '/favicon.ico'
];

// Install service worker
self.addEventListener('install', (event) => {
  console.log('Service Worker installing');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('Push event received');
  
  const options = {
    body: event.data ? event.data.text() : 'New health update available',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Details',
        icon: '/favicon.ico'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/favicon.ico'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('LifeBook Health', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification click received');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/dashboard')
    );
  }
});

// Background sync
self.addEventListener('sync', (event) => {
  console.log('Background sync event:', event.tag);
  
  if (event.tag === 'health-data-sync') {
    event.waitUntil(syncHealthData());
  }
});

async function syncHealthData() {
  console.log('Syncing health data in background');
  // This would sync offline health data when connection is restored
  return Promise.resolve();
}
