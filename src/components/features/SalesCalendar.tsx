import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Sale } from '@/types'

// Format date as YYYY-MM-DD in local timezone
function formatDateLocal(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

interface SalesCalendarProps {
  sales: Sale[]
  selectedDate: string | null
  onSelectDate: (date: string | null) => void
}

export function SalesCalendar({ sales, selectedDate, onSelectDate }: SalesCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })

  // Group sales by date
  const salesByDate = useMemo(() => {
    const map = new Map<string, number>()
    sales.forEach((sale) => {
      const count = map.get(sale.date) || 0
      map.set(sale.date, count + 1)
    })
    return map
  }, [sales])

  // Get calendar days for current month view
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    // First day of the month
    const firstDay = new Date(year, month, 1)
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0)

    // Start from Sunday of the week containing the first day
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - startDate.getDay())

    // End on Saturday of the week containing the last day
    const endDate = new Date(lastDay)
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()))

    const days: { date: Date; isCurrentMonth: boolean; dateStr: string }[] = []
    const current = new Date(startDate)

    while (current <= endDate) {
      const dateStr = formatDateLocal(current)
      days.push({
        date: new Date(current),
        isCurrentMonth: current.getMonth() === month,
        dateStr,
      })
      current.setDate(current.getDate() + 1)
    }

    return days
  }, [currentMonth])

  const goToPrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const goToToday = () => {
    const now = new Date()
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1))
    onSelectDate(null)
  }

  const monthYear = currentMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  const today = formatDateLocal(new Date())

  return (
    <div className="bg-surface border border-border rounded-2xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPrevMonth}
          className="p-2 text-text-secondary hover:text-text-primary hover:bg-text-secondary/10 rounded-lg transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-text-primary">{monthYear}</h3>
          <button
            onClick={goToToday}
            className="text-xs text-text-secondary hover:text-primary px-2 py-1 rounded transition-colors"
          >
            Today
          </button>
        </div>

        <button
          onClick={goToNextMonth}
          className="p-2 text-text-secondary hover:text-text-primary hover:bg-text-secondary/10 rounded-lg transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-text-secondary py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map(({ date, isCurrentMonth, dateStr }) => {
          const salesCount = salesByDate.get(dateStr) || 0
          const isSelected = selectedDate === dateStr
          const isToday = dateStr === today
          const hasSales = salesCount > 0

          return (
            <button
              key={dateStr}
              onClick={() => onSelectDate(isSelected ? null : dateStr)}
              className={`
                relative aspect-square flex flex-col items-center justify-center rounded-lg
                transition-all duration-200
                ${!isCurrentMonth ? 'text-text-secondary/30' : 'text-text-primary'}
                ${isSelected ? 'bg-primary text-white' : hasSales ? 'bg-primary/10 hover:bg-primary/20' : 'hover:bg-text-secondary/10'}
                ${isToday && !isSelected ? 'ring-2 ring-primary/50' : ''}
              `}
            >
              <span className={`text-sm ${isSelected ? 'font-bold' : ''}`}>
                {date.getDate()}
              </span>
              {hasSales && (
                <span
                  className={`
                    text-[10px] font-medium leading-none
                    ${isSelected ? 'text-white/80' : 'text-primary'}
                  `}
                >
                  {salesCount}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-border">
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <div className="w-3 h-3 rounded bg-primary/10" />
          <span>Has sales</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <div className="w-3 h-3 rounded ring-2 ring-primary/50" />
          <span>Today</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <div className="w-3 h-3 rounded bg-primary" />
          <span>Selected</span>
        </div>
      </div>
    </div>
  )
}
