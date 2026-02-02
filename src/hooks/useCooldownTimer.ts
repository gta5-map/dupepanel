import { useState, useEffect, useMemo } from 'react'
import { useSalesStore } from '@/store/salesStore'
import { getCooldownTimes } from '@/utils/calculations'

export function useCooldownTimer() {
  const sales = useSalesStore((state) => state.sales)
  const [tick, setTick] = useState(0)

  // Update every minute
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60000)
    return () => clearInterval(interval)
  }, [])

  // Recalculate when sales change or time ticks
  const cooldowns = useMemo(
    () => getCooldownTimes(sales),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sales, tick]
  )

  return cooldowns
}
