import { useEffect } from 'react'
import { useSettingsStore } from '@/store/settingsStore'

export function useTheme() {
  const theme = useSettingsStore((state) => state.theme)
  const updateTheme = useSettingsStore((state) => state.updateTheme)

  useEffect(() => {
    const root = document.documentElement

    const applyTheme = (isDark: boolean) => {
      if (isDark) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      applyTheme(mediaQuery.matches)

      const handler = (e: MediaQueryListEvent) => applyTheme(e.matches)
      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    } else {
      applyTheme(theme === 'dark')
    }
  }, [theme])

  return { theme, updateTheme }
}
