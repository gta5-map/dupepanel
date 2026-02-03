import type { Sale, DailySales, LimitStatus } from '@/types'
import { startOfDay, subDays, format, isSameDay } from 'date-fns'

const TWO_HOURS_MS = 2 * 60 * 60 * 1000
const EIGHTEEN_HOURS_MS = 18 * 60 * 60 * 1000
const THIRTY_HOURS_MS = 30 * 60 * 60 * 1000

// Limits
export const TWO_HOUR_LIMIT = 2
export const THIRTY_HOUR_LIMIT = 7

// Sell price percentages based on sales count in 18h window
const SELL_PRICE_PERCENTAGES = [100, 50, 20, 5] // 1st, 2nd, 3rd, 4th+

/**
 * Count sales within the last 2 hours
 */
export function getTwoHourCount(sales: Sale[]): number {
  const now = Date.now()
  return sales.filter((sale) => now - sale.timestamp < TWO_HOURS_MS).length
}

/**
 * Count sales within the last 30 hours
 */
export function getThirtyHourCount(sales: Sale[]): number {
  const now = Date.now()
  return sales.filter((sale) => now - sale.timestamp < THIRTY_HOURS_MS).length
}

/**
 * Get cooldown info for each sale within the last 30 hours
 */
export function getCooldownTimes(sales: Sale[]): Array<{
  sale: Sale
  remainingMs: number
  progress: number
}> {
  const now = Date.now()

  return sales
    .filter((sale) => now - sale.timestamp < THIRTY_HOURS_MS)
    .sort((a, b) => a.timestamp - b.timestamp)
    .map((sale) => {
      const elapsed = now - sale.timestamp
      const remainingMs = Math.max(0, THIRTY_HOURS_MS - elapsed)
      const progress = Math.min(1, elapsed / THIRTY_HOURS_MS)

      return { sale, remainingMs, progress }
    })
}

/**
 * Get sales count per day for the last 7 days
 */
export function getWeeklySales(sales: Sale[]): DailySales[] {
  const today = startOfDay(new Date())
  const days: DailySales[] = []

  for (let i = 6; i >= 0; i--) {
    const date = subDays(today, i)
    const count = sales.filter((sale) =>
      isSameDay(new Date(sale.timestamp), date)
    ).length

    // Use 2-char abbreviations to avoid duplicate labels (Tu/Th, Sa/Su)
    const dayAbbr = format(date, 'EEEEEE') // 'Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'
    days.push({
      day: dayAbbr,
      fullDay: format(date, 'EEEE'),
      date: format(date, 'yyyy-MM-dd'),
      count,
    })
  }

  return days
}

/**
 * Get the limit status for visual indicator
 */
export function getLimitStatus(count: number, limit: number): LimitStatus {
  if (count >= limit) return 'danger'
  if (count >= limit - 1) return 'warning'
  return 'safe'
}

/**
 * Check if a sale is within the active 30-hour cooldown window
 */
export function isInCooldown(sale: Sale): boolean {
  return Date.now() - sale.timestamp < THIRTY_HOURS_MS
}

/**
 * Get the remaining cooldown time in milliseconds for a sale
 * Returns 0 if the sale is no longer in cooldown
 */
export function getRemainingCooldown(sale: Sale): number {
  const elapsed = Date.now() - sale.timestamp
  return Math.max(0, THIRTY_HOURS_MS - elapsed)
}

// ============================================
// 18-Hour Sell Price Degradation System
// ============================================

/**
 * Get the number of sales within the 18-hour window
 * The window resets 18 hours after the LAST sale
 */
export function getEighteenHourCount(sales: Sale[]): number {
  if (sales.length === 0) return 0

  const now = Date.now()
  const sortedSales = [...sales].sort((a, b) => b.timestamp - a.timestamp)
  const lastSale = sortedSales[0]

  // If last sale was more than 18h ago, window has reset
  if (now - lastSale.timestamp >= EIGHTEEN_HOURS_MS) {
    return 0
  }

  // Count sales in the current 18h chain
  // Going backwards from most recent, count sales within 18h of each other
  let count = 0
  let windowStart = now

  for (const sale of sortedSales) {
    if (windowStart - sale.timestamp < EIGHTEEN_HOURS_MS) {
      count++
      windowStart = sale.timestamp // Chain continues from this sale
    } else {
      break // Gap > 18h found, stop counting
    }
  }

  return count
}

/**
 * Get the current sell price percentage for the NEXT sale
 */
export function getNextSellPricePercentage(sales: Sale[]): number {
  const count = getEighteenHourCount(sales)

  if (count === 0) return SELL_PRICE_PERCENTAGES[0] // 100%
  if (count === 1) return SELL_PRICE_PERCENTAGES[1] // 50%
  if (count === 2) return SELL_PRICE_PERCENTAGES[2] // 20%
  return SELL_PRICE_PERCENTAGES[3] // 5%
}

/**
 * Get the timestamp when the 18h window will reset
 * Returns null if already reset or no sales
 */
export function getSellPriceResetTime(sales: Sale[]): number | null {
  if (sales.length === 0) return null

  const sortedSales = [...sales].sort((a, b) => b.timestamp - a.timestamp)
  const lastSale = sortedSales[0]
  const resetTime = lastSale.timestamp + EIGHTEEN_HOURS_MS

  // If already reset, return null
  if (Date.now() >= resetTime) {
    return null
  }

  return resetTime
}

