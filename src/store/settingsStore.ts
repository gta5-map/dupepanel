import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Settings, Theme } from '@/types'

interface SettingsState extends Settings {
  updateTheme: (theme: Theme) => void
  toggleNotifications: () => void
  setNotifyOneSlot: (enabled: boolean) => void
  setNotifyTwoSlots: (enabled: boolean) => void
  setNotifyPriceReset: (enabled: boolean) => void
  importSettings: (settings: Settings) => void
  resetSettings: () => void
}

const defaultSettings: Settings = {
  theme: 'system',
  notificationsEnabled: true,
  notifyOneSlot: true,
  notifyTwoSlots: true,
  notifyPriceReset: true,
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,

      updateTheme: (theme) => set({ theme }),

      toggleNotifications: () =>
        set((state) => ({ notificationsEnabled: !state.notificationsEnabled })),

      setNotifyOneSlot: (enabled) => set({ notifyOneSlot: enabled }),

      setNotifyTwoSlots: (enabled) => set({ notifyTwoSlots: enabled }),

      setNotifyPriceReset: (enabled) => set({ notifyPriceReset: enabled }),

      importSettings: (settings) => set(settings),

      resetSettings: () => set(defaultSettings),
    }),
    {
      name: 'dupepanel_settings',
    }
  )
)
