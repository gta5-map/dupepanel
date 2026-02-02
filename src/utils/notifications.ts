import type { Sale } from '@/types'

const TWO_HOURS_MS = 2 * 60 * 60 * 1000
const STORAGE_KEY_SCHEDULED = 'dupepanel_scheduled_notifications'
const STORAGE_KEY_SHOWN = 'dupepanel_shown_notifications'

export interface ScheduledNotification {
  id: string
  time: number // timestamp when notification should fire
  slots: 1 | 2 // number of slots becoming available
  saleId: string // which sale's cooldown is expiring
}

/**
 * Request browser notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied'
  }

  if (Notification.permission === 'granted') {
    return 'granted'
  }

  if (Notification.permission === 'denied') {
    return 'denied'
  }

  const permission = await Notification.requestPermission()
  return permission
}

/**
 * Get current notification permission status
 */
export function getNotificationPermission(): NotificationPermission {
  if (!('Notification' in window)) {
    return 'denied'
  }
  return Notification.permission
}

/**
 * Check if notifications are supported
 */
export function isNotificationSupported(): boolean {
  return 'Notification' in window && 'serviceWorker' in navigator
}

/**
 * Schedule notifications based on current sales and settings
 */
export function scheduleNotifications(
  sales: Sale[],
  options: { notifyOneSlot: boolean; notifyTwoSlots: boolean }
): void {
  const now = Date.now()

  // Get sales within the 2-hour window (these affect the limit)
  const recentSales = sales
    .filter((sale) => now - sale.timestamp < TWO_HOURS_MS)
    .sort((a, b) => a.timestamp - b.timestamp)

  const scheduled: ScheduledNotification[] = []

  // Calculate when each sale's 2-hour cooldown expires
  for (let i = 0; i < recentSales.length; i++) {
    const sale = recentSales[i]
    const expiryTime = sale.timestamp + TWO_HOURS_MS

    // Only schedule if in the future
    if (expiryTime > now) {
      // Determine how many slots will be available after this cooldown expires
      // Count how many sales will still be in the window after this one expires
      const remainingAfter = recentSales.filter(
        (s) => s.timestamp > sale.timestamp && expiryTime - s.timestamp < TWO_HOURS_MS
      ).length

      const slotsAfter = 2 - remainingAfter

      if (slotsAfter >= 1 && slotsAfter <= 2) {
        // Check if user wants this notification type
        if ((slotsAfter === 1 && options.notifyOneSlot) || (slotsAfter === 2 && options.notifyTwoSlots)) {
          scheduled.push({
            id: `${sale.id}-${slotsAfter}`,
            time: expiryTime,
            slots: slotsAfter as 1 | 2,
            saleId: sale.id,
          })
        }
      }
    }
  }

  // Save to localStorage
  localStorage.setItem(STORAGE_KEY_SCHEDULED, JSON.stringify(scheduled))

  // Sync to service worker
  syncToServiceWorker()
}

/**
 * Clear all scheduled notifications
 */
export function clearScheduledNotifications(): void {
  localStorage.removeItem(STORAGE_KEY_SCHEDULED)
  localStorage.removeItem(STORAGE_KEY_SHOWN)
  syncToServiceWorker()
}

/**
 * Get scheduled notifications
 */
export function getScheduledNotifications(): ScheduledNotification[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_SCHEDULED)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

/**
 * Sync storage to service worker
 */
function syncToServiceWorker(): void {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    // Sync scheduled notifications
    navigator.serviceWorker.controller.postMessage({
      type: 'STORAGE_UPDATE',
      key: STORAGE_KEY_SCHEDULED,
      value: localStorage.getItem(STORAGE_KEY_SCHEDULED),
    })

    // Sync shown notifications
    navigator.serviceWorker.controller.postMessage({
      type: 'STORAGE_UPDATE',
      key: STORAGE_KEY_SHOWN,
      value: localStorage.getItem(STORAGE_KEY_SHOWN),
    })

    // Sync settings
    navigator.serviceWorker.controller.postMessage({
      type: 'STORAGE_UPDATE',
      key: 'dupepanel_settings',
      value: localStorage.getItem('dupepanel_settings'),
    })

    // Trigger immediate check
    navigator.serviceWorker.controller.postMessage({
      type: 'CHECK_NOTIFICATIONS',
    })
  }
}

/**
 * Send test notification
 */
export function sendTestNotification(): void {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'TEST_NOTIFICATION',
    })
  } else {
    // Fallback to regular notification
    if (Notification.permission === 'granted') {
      new Notification('2 Sell Slots Available!', {
        body: 'This is a test notification from Dupepanel.',
        icon: '/dupepanel/icon.svg',
      })
    }
  }
}

/**
 * Register service worker
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.log('Service workers not supported')
    return null
  }

  try {
    const registration = await navigator.serviceWorker.register('/dupepanel/sw.js', {
      scope: '/dupepanel/',
    })

    console.log('Service worker registered:', registration.scope)

    // Wait for the service worker to be ready
    await navigator.serviceWorker.ready

    // Initial sync
    syncToServiceWorker()

    return registration
  } catch (error) {
    console.error('Service worker registration failed:', error)
    return null
  }
}
