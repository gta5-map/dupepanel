import { useCooldownTimer } from '@/hooks/useCooldownTimer'
import { formatTime } from '@/utils/formatters'
import { Check, Clock, Info } from 'lucide-react'

export function CooldownTimeline() {
  const cooldowns = useCooldownTimer()

  if (cooldowns.length === 0) {
    return (
      <div className="bg-surface rounded-2xl p-5 md:p-6 border border-border shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-emerald-500/10">
            <Check className="w-5 h-5 text-emerald-500" />
          </div>
          <h3 className="text-base font-semibold text-text-primary">Cooldown Timeline</h3>
        </div>
        <div className="flex items-center gap-3 p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
          <div className="text-3xl font-bold text-emerald-500">7/7</div>
          <div>
            <p className="text-sm font-medium text-text-primary">All slots available</p>
            <p className="text-xs text-text-secondary">No sales in the last 30 hours</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-surface rounded-2xl p-5 md:p-6 border border-border shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Clock className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-base font-semibold text-text-primary">Cooldown Timeline</h3>
        </div>
        <span className="text-xs font-medium text-text-secondary bg-text-secondary/10 px-2.5 py-1 rounded-full">
          {7 - cooldowns.length} slot{7 - cooldowns.length !== 1 ? 's' : ''} free
        </span>
      </div>

      <div className="space-y-3">
        {cooldowns.map((item, index) => {
          const progressPercent = item.progress * 100
          const isAlmostDone = progressPercent > 90

          return (
            <div key={item.sale.id} className="group">
              <div className="flex items-center gap-3">
                <span className={`
                  w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold
                  ${isAlmostDone ? 'bg-emerald-500/20 text-emerald-500' : 'bg-primary/10 text-primary'}
                `}>
                  {index + 1}
                </span>
                <div className="flex-1 h-2.5 bg-text-secondary/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${
                      isAlmostDone
                        ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                        : 'bg-gradient-to-r from-blue-400 to-primary'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className={`
                  text-sm font-semibold tabular-nums min-w-[4.5rem] text-right
                  ${isAlmostDone ? 'text-emerald-500' : 'text-text-secondary'}
                `}>
                  {formatTime(item.remainingMs)}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-xs text-text-secondary mt-4 flex items-center gap-1.5">
        <Info className="w-3.5 h-3.5" />
        Time until each sale slot is freed (30h cooldown)
      </p>
    </div>
  )
}
