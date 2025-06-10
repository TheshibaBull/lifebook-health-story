
const CACHE_NAME = 'lifebook-health-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/favicon.ico'
];

// Install service worker
self.addEventListener('install', (event) => {
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

// Push event - handle push notifications
self.addEventListener('push', (event) => {
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
        icon: '/placeholder.svg'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/placeholder.svg'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Lifebook Health', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    // Open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Background sync for offline data
self.addEventListener('sync', (event) => {
  if (event.tag === 'health-data-sync') {
    event.waitUntil(syncHealthData());
  }
});

async function syncHealthData() {
  // This would sync offline health data when connection is restored
  console.log('Syncing health data...');
  
  // Get offline data from IndexedDB
  const offlineData = await getOfflineData();
  
  if (offlineData && offlineData.length > 0) {
    try {
      // Sync with server (would be actual API call in production)
      console.log('Syncing', offlineData.length, 'offline records');
      
      // Clear offline data after successful sync
      await clearOfflineData();
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }
}

async function getOfflineData() {
  // This would get data from IndexedDB in a real implementation
  return JSON.parse(localStorage.getItem('offline-health-data') || '[]');
}

async function clearOfflineData() {
  localStorage.removeItem('offline-health-data');
}
