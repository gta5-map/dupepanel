import { useState, useEffect } from 'react'
import { useSalesStore } from '@/store/salesStore'
import {
  getEighteenHourCount,
  getNextSellPricePercentage,
  getSellPriceResetTime,
} from '@/utils/calculations'
import { formatTime } from '@/utils/formatters'
import { CircleDollarSign, Clock, Check } from 'lucide-react'

export function SellPriceCard() {
  const sales = useSalesStore((state) => state.sales)
  const [now, setNow] = useState(() => Date.now())

  // Update every minute
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000)
    return () => clearInterval(interval)
  }, [])

  const salesIn18h = getEighteenHourCount(sales)
  const nextPercentage = getNextSellPricePercentage(sales)
  const resetTime = getSellPriceResetTime(sales)
  const timeUntilReset = resetTime ? Math.max(0, resetTime - now) : null

  const getStatusStyles = () => {
    if (nextPercentage === 100) return { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20' }
    if (nextPercentage === 50) return { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20' }
    return { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20' }
  }

  const getStatusText = () => {
    if (nextPercentage === 100) return 'Full price'
    if (nextPercentage === 50) return 'Half price'
    if (nextPercentage === 20) return 'Reduced'
    return 'Minimum'
  }

  const statusStyles = getStatusStyles()

  const priceSteps = [
    { sale: 1, percentage: 100, label: '1st sale', color: 'emerald' },
    { sale: 2, percentage: 50, label: '2nd sale', color: 'amber' },
    { sale: 3, percentage: 20, label: '3rd sale', color: 'orange' },
    { sale: 4, percentage: 5, label: '4th+', color: 'red' },
  ]

  return (
    <div className="bg-surface rounded-2xl p-5 md:p-6 border border-border shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${statusStyles.bg}`}>
            <CircleDollarSign className={`w-5 h-5 ${statusStyles.text}`} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-text-primary">Sell Price</h3>
            <p className="text-xs text-text-secondary">18-hour degradation window</p>
          </div>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyles.bg} ${statusStyles.text}`}>
          {getStatusText()}
        </span>
      </div>

      {/* Main percentage display */}
      <div className="flex items-center gap-4 mb-5">
        <div className={`text-5xl md:text-6xl font-bold tabular-nums tracking-tight ${statusStyles.text}`}>
          {nextPercentage}%
        </div>
        <div className="text-sm text-text-secondary">
          <span className="block font-medium text-text-primary">Next sell price</span>
          <span>{salesIn18h} sale{salesIn18h !== 1 ? 's' : ''} in window</span>
        </div>
      </div>

      {/* Price breakdown with visual indicator */}
      <div className="space-y-2 mb-5">
        {priceSteps.map((step, index) => {
          const isActive = salesIn18h === index
          const isPast = salesIn18h > index

          return (
            <div
              key={step.sale}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                isActive ? `${statusStyles.bg} ${statusStyles.border} border` : ''
              }`}
            >
              <div className={`
                w-2.5 h-2.5 rounded-full transition-all
                ${isPast ? 'bg-text-secondary/20' : ''}
                ${isActive ? `bg-${step.color}-500 ring-4 ring-${step.color}-500/20` : ''}
                ${!isPast && !isActive ? 'bg-text-secondary/20' : ''}
              `} style={isActive ? { backgroundColor: step.color === 'emerald' ? '#10b981' : step.color === 'amber' ? '#f59e0b' : step.color === 'orange' ? '#f97316' : '#ef4444' } : {}} />
              <span className={`flex-1 text-sm font-medium ${
                isPast ? 'text-text-secondary/40 line-through' :
                isActive ? 'text-text-primary' : 'text-text-secondary/60'
              }`}>
                {step.label}
              </span>
              <span className={`text-sm tabular-nums font-semibold ${
                isPast ? 'text-text-secondary/40' :
                isActive ? statusStyles.text : 'text-text-secondary/60'
              }`}>
                {step.percentage}%
              </span>
            </div>
          )
        })}
      </div>

      {/* Reset timer */}
      <div className="pt-4 border-t border-border">
        {timeUntilReset ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-text-secondary" />
              <span className="text-sm text-text-secondary">Resets in</span>
            </div>
            <span className="text-sm font-bold text-text-primary tabular-nums bg-text-secondary/10 px-2.5 py-1 rounded-lg">
              {formatTime(timeUntilReset)}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-emerald-500">
            <Check className="w-4 h-4" />
            <span className="text-sm font-medium">Price at full rate</span>
          </div>
        )}
      </div>
    </div>
  )
}
