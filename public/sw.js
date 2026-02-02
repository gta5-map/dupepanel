// Dupepanel Service Worker
const CACHE_NAME = 'dupepanel-v1';
const NOTIFICATION_CHECK_INTERVAL = 60000; // 1 minute

// Install event - cache app shell
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();

  // Start notification check interval
  startNotificationChecker();
});

// Start checking for due notifications
function startNotificationChecker() {
  setInterval(checkScheduledNotifications, NOTIFICATION_CHECK_INTERVAL);
  // Also check immediately
  checkScheduledNotifications();
}

// Check if any notifications are due
function checkScheduledNotifications() {
  const scheduled = getFromStorage('dupepanel_scheduled_notifications') || [];
  const shown = getFromStorage('dupepanel_shown_notifications') || [];
  const settings = getFromStorage('dupepanel_settings') || {};

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
      const shouldNotify =
        (notification.slots === 1 && settings.state?.notifyOneSlot) ||
        (notification.slots === 2 && settings.state?.notifyTwoSlots);

      if (shouldNotify) {
        showNotification(notification);
      }

      newShown.push(notification.id);
      hasChanges = true;
    }
  }

  if (hasChanges) {
    saveToStorage('dupepanel_shown_notifications', newShown);

    // Clean up old shown notifications (keep last 100)
    if (newShown.length > 100) {
      saveToStorage('dupepanel_shown_notifications', newShown.slice(-100));
    }
  }
}

// Show a notification
function showNotification(notification) {
  const title = notification.slots === 2
    ? '2 Sell Slots Available!'
    : '1 Sell Slot Available!';

  const body = notification.slots === 2
    ? 'Your 2-hour cooldown has fully reset. You can sell 2 vehicles.'
    : '1 slot is now available in your 2-hour window.';

  self.registration.showNotification(title, {
    body,
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    tag: `dupepanel-slot-${notification.slots}`,
    renotify: true,
    requireInteraction: false,
    data: {
      url: '/dupepanel/',
    },
  });
}

// Handle notification click
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

// Handle messages from the app
self.addEventListener('message', (event) => {
  if (event.data.type === 'CHECK_NOTIFICATIONS') {
    checkScheduledNotifications();
  }

  if (event.data.type === 'TEST_NOTIFICATION') {
    showNotification({ slots: 2 });
  }
});

// Helper to read from localStorage (via clients)
function getFromStorage(key) {
  try {
    const value = self.__storage?.[key];
    if (value) {
      return JSON.parse(value);
    }
  } catch {
    // Ignore parse errors
  }
  return null;
}

// Helper to save to localStorage (via clients)
function saveToStorage(key, value) {
  self.__storage = self.__storage || {};
  self.__storage[key] = JSON.stringify(value);

  // Broadcast to all clients to sync
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: 'STORAGE_SYNC',
        key,
        value,
      });
    });
  });
}

// Receive storage sync from app
self.addEventListener('message', (event) => {
  if (event.data.type === 'STORAGE_UPDATE') {
    self.__storage = self.__storage || {};
    self.__storage[event.data.key] = event.data.value;
  }
});
