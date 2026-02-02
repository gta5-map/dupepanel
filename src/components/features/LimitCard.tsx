import type { LimitStatus } from '@/types'
import type { ReactNode } from 'react'
import { getLimitStatus } from '@/utils/calculations'
import { Check, AlertTriangle, X } from 'lucide-react'

interface LimitCardProps {
  count: number
  limit: number
  label: string
  timeWindow: string
}

const statusGradients: Record<LimitStatus, string> = {
  safe: 'from-emerald-400 to-green-500',
  warning: 'from-amber-400 to-orange-500',
  danger: 'from-red-400 to-rose-600',
}

const statusLabels: Record<LimitStatus, string> = {
  safe: 'Safe to sell',
  warning: '1 slot left',
  danger: 'At limit',
}

const statusIcons: Record<LimitStatus, ReactNode> = {
  safe: <Check className="w-5 h-5" />,
  warning: <AlertTriangle className="w-5 h-5" />,
  danger: <X className="w-5 h-5" />,
}

export function LimitCard({ count, limit, label, timeWindow }: LimitCardProps) {
  const status = getLimitStatus(count, limit)

  return (
    <div
      className={`
        bg-gradient-to-br ${statusGradients[status]}
        rounded-2xl p-4 md:p-6 text-white
        shadow-lg hover:shadow-xl
        transition-all duration-300 ease-out
        hover:scale-[1.02] hover:-translate-y-0.5
        relative overflow-hidden
      `}
    >
      {/* Decorative background element */}
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
      <div className="absolute -right-2 -bottom-6 w-20 h-20 bg-black/5 rounded-full" />

      <div className="relative">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl md:text-5xl font-bold tabular-nums tracking-tight drop-shadow-sm">
            {count}
          </span>
          <span className="text-2xl md:text-3xl font-medium text-white/60">/ {limit}</span>
        </div>
        <p className="text-sm md:text-base font-semibold mt-2 text-white/90">{label}</p>
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-white/60 font-medium">{timeWindow}</span>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full">
            {statusIcons[status]}
            {statusLabels[status]}
          </span>
        </div>
      </div>
    </div>
  )
}
