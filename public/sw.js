// Dupepanel Service Worker
const CACHE_NAME = 'dupepanel-v1';
const NOTIFICATION_CHECK_INTERVAL = 60000; // 1 minute
const DB_NAME = 'dupepanel-sw';
const DB_VERSION = 1;
const STORE_NAME = 'storage';

// In-memory cache for performance (also serves as fallback)
let memoryCache = {};

// ============================================
// IndexedDB Helpers (Persistent Storage)
// ============================================

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };
  });
}

async function getFromIndexedDB(key) {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.value : null);
      };

      transaction.oncomplete = () => db.close();
    });
  } catch (error) {
    console.error('IndexedDB read error:', error);
    return null;
  }
}

async function saveToIndexedDB(key, value) {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put({ key, value });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();

      transaction.oncomplete = () => db.close();
    });
  } catch (error) {
    console.error('IndexedDB write error:', error);
  }
}

// ============================================
// Storage API (with IndexedDB persistence)
// ============================================

async function getFromStorage(key) {
  // Try memory cache first
  if (memoryCache[key] !== undefined) {
    try {
      return JSON.parse(memoryCache[key]);
    } catch {
      return null;
    }
  }

  // Fall back to IndexedDB
  const value = await getFromIndexedDB(key);
  if (value !== null) {
    // Update memory cache
    memoryCache[key] = JSON.stringify(value);
    return value;
  }

  return null;
}

async function saveToStorage(key, value) {
  // Update memory cache
  memoryCache[key] = JSON.stringify(value);

  // Persist to IndexedDB
  await saveToIndexedDB(key, value);

  // Broadcast to all clients to sync localStorage
  const allClients = await self.clients.matchAll();
  allClients.forEach((client) => {
    client.postMessage({
      type: 'STORAGE_SYNC',
      key,
      value,
    });
  });
}

// ============================================
// Service Worker Events
// ============================================

// Install event - cache app shell
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate event - clean old caches and start notification checker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Clean old caches
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );

      // Claim all clients
      await self.clients.claim();

      // Load data from IndexedDB into memory cache
      await loadCacheFromIndexedDB();

      // Start notification check interval
      startNotificationChecker();
    })()
  );
});

// Load persisted data into memory cache on startup
async function loadCacheFromIndexedDB() {
  const keys = [
    'dupepanel_scheduled_notifications',
    'dupepanel_shown_notifications',
    'dupepanel_settings',
  ];

  for (const key of keys) {
    const value = await getFromIndexedDB(key);
    if (value !== null) {
      memoryCache[key] = JSON.stringify(value);
    }
  }
}

// ============================================
// Notification Logic
// ============================================

// Start checking for due notifications
function startNotificationChecker() {
  setInterval(() => checkScheduledNotifications(), NOTIFICATION_CHECK_INTERVAL);
  // Also check immediately
  checkScheduledNotifications();
}

// Check if any notifications are due
async function checkScheduledNotifications() {
  try {
    const scheduled = (await getFromStorage('dupepanel_scheduled_notifications')) || [];
    const shown = (await getFromStorage('dupepanel_shown_notifications')) || [];
    const settings = (await getFromStorage('dupepanel_settings')) || {};

    // Check if notifications are enabled
    if (!settings.state?.notificationsEnabled) {
      return;
    }

    const now = Date.now();
    const newShown = [...shown];
    let hasChanges = false;

    for (const notification of scheduled) {
      // Skip if already shown
      if (shown.includes(notification.id)) {
        continue;
      }

      // Check if notification is due
      if (notification.time <= now) {
        // Check user preferences for this notification type
        let shouldNotify = false;

        if (notification.type === 'price-reset') {
          shouldNotify = settings.state?.notifyPriceReset !== false;
        } else {
          // Slot notifications (default type for backwards compatibility)
          shouldNotify =
            (notification.slots === 1 && settings.state?.notifyOneSlot) ||
            (notification.slots === 2 && settings.state?.notifyTwoSlots);
        }

        if (shouldNotify) {
          showNotification(notification);
        }

        newShown.push(notification.id);
        hasChanges = true;
      }
    }

    if (hasChanges) {
      // Clean up old shown notifications (keep last 100)
      const trimmedShown = newShown.length > 100 ? newShown.slice(-100) : newShown;
      await saveToStorage('dupepanel_shown_notifications', trimmedShown);
    }
  } catch (error) {
    console.error('Error checking notifications:', error);
  }
}

// Show a notification
function showNotification(notification) {
  let title, body, tag;

  if (notification.type === 'price-reset') {
    title = 'Full Sell Price Available!';
    body = 'Your 18-hour window has reset. You can now sell at 100% price.';
    tag = 'dupepanel-price-reset';
  } else {
    // Slot notifications
    title = notification.slots === 2 ? '2 Sell Slots Available!' : '1 Sell Slot Available!';
    body =
      notification.slots === 2
        ? 'Your 2-hour cooldown has fully reset. You can sell 2 vehicles.'
        : '1 slot is now available in your 2-hour window.';
    tag = `dupepanel-slot-${notification.slots}`;
  }

  self.registration.showNotification(title, {
    body,
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    tag,
    renotify: true,
    requireInteraction: false,
    data: {
      url: '/dupepanel/',
    },
  });
}

// ============================================
// Notification Click Handler
// ============================================

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing window if available
      for (const client of clientList) {
        if (client.url.includes('/dupepanel') && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open new window
      if (clients.openWindow) {
        return clients.openWindow('/dupepanel/');
      }
    })
  );
});

// ============================================
// Message Handlers
// ============================================

self.addEventListener('message', (event) => {
  if (event.data.type === 'CHECK_NOTIFICATIONS') {
    checkScheduledNotifications();
  }

  if (event.data.type === 'TEST_NOTIFICATION') {
    showNotification({ slots: 2 });
  }

  if (event.data.type === 'STORAGE_UPDATE') {
    // Update memory cache immediately
    memoryCache[event.data.key] = event.data.value;

    // Persist to IndexedDB asynchronously
    try {
      const value = event.data.value ? JSON.parse(event.data.value) : null;
      if (value !== null) {
        saveToIndexedDB(event.data.key, value);
      }
    } catch (error) {
      console.error('Error persisting storage update:', error);
    }
  }
});
