import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { BarChart3 } from 'lucide-react'
import type { DailySales } from '@/types'

interface WeeklyChartProps {
  data: DailySales[]
}

export function WeeklyChart({ data }: WeeklyChartProps) {
  const maxCount = Math.max(...data.map((d) => d.count), 1)
  const totalSales = data.reduce((sum, d) => sum + d.count, 0)

  return (
    <div className="bg-surface rounded-2xl p-5 md:p-6 border border-border shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-text-primary">Weekly Sales</h3>
            <p className="text-xs text-text-secondary">Last 7 days activity</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-text-primary tabular-nums">{totalSales}</span>
          <p className="text-xs text-text-secondary">total sales</p>
        </div>
      </div>

      <div className="h-44 md:h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={1} />
                <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.7} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--color-text-secondary)', fontSize: 12, fontWeight: 500 }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }}
              allowDecimals={false}
              domain={[0, Math.max(maxCount, 3)]}
              width={30}
            />
            <Tooltip
              cursor={{ fill: 'var(--color-text-secondary)', opacity: 0.05, radius: 6 }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as DailySales
                  return (
                    <div className="bg-surface-elevated border border-border rounded-xl shadow-lg px-4 py-3">
                      <p className="text-sm font-semibold text-text-primary">
                        {item.fullDay}
                      </p>
                      <p className="text-lg font-bold text-primary tabular-nums">
                        {item.count} <span className="text-sm font-normal text-text-secondary">sale{item.count !== 1 ? 's' : ''}</span>
                      </p>
                    </div>
                  )
                }
                return null
              }}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={48}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.count > 0 ? 'url(#barGradient)' : 'var(--color-text-secondary)'}
                  opacity={entry.count > 0 ? 1 : 0.15}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
