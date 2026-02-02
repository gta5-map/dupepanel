import { Link } from 'react-router-dom'
import { useSalesStore } from '@/store/salesStore'
import {
  getTwoHourCount,
  getThirtyHourCount,
  getWeeklySales,
  TWO_HOUR_LIMIT,
  THIRTY_HOUR_LIMIT,
} from '@/utils/calculations'
import { LimitCard } from '@/components/features/LimitCard'
import { SellPriceCard } from '@/components/features/SellPriceCard'
import { WeeklyChart } from '@/components/features/WeeklyChart'
import { CooldownTimeline } from '@/components/features/CooldownTimeline'
import { Zap, Info } from 'lucide-react'

export default function Dashboard() {
  const sales = useSalesStore((state) => state.sales)

  const twoHourCount = getTwoHourCount(sales)
  const thirtyHourCount = getThirtyHourCount(sales)
  const weeklySales = getWeeklySales(sales)

  return (
    <div className="space-y-5">
      {/* Header - Mobile only */}
      <div className="md:hidden flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
          <Zap className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-text-primary tracking-tight">Dupepanel</h1>
          <p className="text-xs text-text-secondary">GTA Online Sell Tracker</p>
        </div>
        <Link
          to="/info"
          className="p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-text-secondary/10 transition-colors"
        >
          <Info className="w-6 h-6" />
        </Link>
      </div>

      {/* Limit Cards */}
      <div className="grid grid-cols-2 gap-4">
        <LimitCard
          count={twoHourCount}
          limit={TWO_HOUR_LIMIT}
          label="2-Hour Limit"
          timeWindow="Rolling 2h window"
        />
        <LimitCard
          count={thirtyHourCount}
          limit={THIRTY_HOUR_LIMIT}
          label="30-Hour Limit"
          timeWindow="Rolling 30h window"
        />
      </div>

      {/* Sell Price Degradation Card */}
      <SellPriceCard />

      {/* Weekly Chart */}
      <WeeklyChart data={weeklySales} />

      {/* Cooldown Timeline */}
      <CooldownTimeline />
    </div>
  )
}
