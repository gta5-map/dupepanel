import { useEffect, useCallback } from 'react'
import { useSalesStore } from '@/store/salesStore'
import { useSettingsStore } from '@/store/settingsStore'
import {
  scheduleNotifications,
  getNotificationPermission,
  isNotificationSupported,
} from '@/utils/notifications'

/**
 * Hook to manage notification scheduling based on sales and settings
 */
export function useNotifications() {
  const sales = useSalesStore((state) => state.sales)
  const notificationsEnabled = useSettingsStore((state) => state.notificationsEnabled)
  const notifyOneSlot = useSettingsStore((state) => state.notifyOneSlot)
  const notifyTwoSlots = useSettingsStore((state) => state.notifyTwoSlots)
  const notifyPriceReset = useSettingsStore((state) => state.notifyPriceReset)

  const updateSchedule = useCallback(() => {
    // Only schedule if notifications are enabled and permitted
    if (!notificationsEnabled) {
      return
    }

    if (!isNotificationSupported()) {
      return
    }

    const permission = getNotificationPermission()
    if (permission !== 'granted') {
      return
    }

    // Schedule notifications based on current sales
    scheduleNotifications(sales, {
      notifyOneSlot,
      notifyTwoSlots,
      notifyPriceReset,
    })
  }, [sales, notificationsEnabled, notifyOneSlot, notifyTwoSlots, notifyPriceReset])

  // Update schedule when dependencies change
  useEffect(() => {
    updateSchedule()
  }, [updateSchedule])

  // Also update schedule periodically (every minute) to catch any drift
  useEffect(() => {
    const interval = setInterval(updateSchedule, 60000)
    return () => clearInterval(interval)
  }, [updateSchedule])

  // Listen for messages from service worker
  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      return
    }

    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'STORAGE_SYNC') {
        // Service worker is syncing storage, update localStorage
        localStorage.setItem(event.data.key, JSON.stringify(event.data.value))
      }
    }

    navigator.serviceWorker.addEventListener('message', handleMessage)
    return () => navigator.serviceWorker.removeEventListener('message', handleMessage)
  }, [])

  return { updateSchedule }
}
