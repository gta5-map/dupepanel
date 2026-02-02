import { format } from 'date-fns'

/**
 * Format milliseconds to "Xh Ym" format
 */
export function formatTime(ms: number): string {
  if (ms <= 0) return '0m'

  const totalMinutes = Math.floor(ms / (1000 * 60))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours === 0) {
    return `${minutes}m`
  }

  if (minutes === 0) {
    return `${hours}h`
  }

  return `${hours}h ${minutes}m`
}

/**
 * Format full date and time (e.g., "Jan 15, 2026 at 2:30 PM")
 */
export function formatDateTime(timestamp: number): string {
  return format(new Date(timestamp), "MMM d, yyyy 'at' h:mm a")
}

/**
 * Format date as ISO string (YYYY-MM-DD)
 */
export function formatDateISO(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

/**
 * Format time as 24-hour string (HH:mm)
 */
export function formatTime24(date: Date): string {
  return format(date, 'HH:mm')
}
