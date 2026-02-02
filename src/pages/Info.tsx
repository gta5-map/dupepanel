import { Card } from '@/components/ui/Card'
import {
  THIRTY_HOUR_LIMIT,
  TWO_HOUR_LIMIT,
} from '@/utils/calculations'
import { Info, AlertTriangle, Clock, HelpCircle, CircleDollarSign } from 'lucide-react'

export default function InfoPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-text-secondary/10">
          <Info className="w-6 h-6 text-text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-text-primary">Info</h1>
          <p className="text-xs text-text-secondary">How Dupepanel estimates sell-limit rules</p>
        </div>
      </div>

      <Card title="Important disclaimer" icon={<AlertTriangle className="w-5 h-5" />}>
        <div className="space-y-3 text-sm text-text-secondary leading-relaxed">
          <p>
            Rockstar does not publish the exact anti-abuse logic behind sell limits.
            What the community calls the "2-hour / 30-hour limits" are based on long-running
            player testing and match how the game typically enforces selling frequency.
          </p>
          <p>
            Dupepanel shows a best-effort estimate using the rules below, based solely on the
            sales you record here. If you miss a sale, record the wrong time, change characters,
            or switch platforms/accounts, the in-game result can differ.
          </p>
        </div>
      </Card>

      <Card
        title="Core sell limits (rolling windows)"
        subtitle="These are rolling time windows, not calendar days"
        icon={<Clock className="w-5 h-5" />}
      >
        <div className="space-y-4 text-sm text-text-secondary leading-relaxed">
          <div className="space-y-2">
            <p className="text-text-primary font-medium">1) 2-hour window</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                You can sell up to <span className="font-semibold text-text-primary">{TWO_HOUR_LIMIT}</span> vehicles
                in any rolling 2-hour period.
              </li>
              <li>
                Dupepanel counts how many of your recorded sales happened in the last 2 hours
                from "right now".
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <p className="text-text-primary font-medium">2) 30-hour window</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                You can sell up to <span className="font-semibold text-text-primary">{THIRTY_HOUR_LIMIT}</span> vehicles
                in any rolling 30-hour period.
              </li>
              <li>
                Dupepanel counts how many of your recorded sales happened in the last 30 hours.
              </li>
            </ul>
          </div>

          <div className="rounded-xl bg-primary/5 border border-primary/10 p-4">
            <p className="text-text-primary font-semibold flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" />
              How you "get a slot back"
            </p>
            <p className="mt-2">
              Slots open when your oldest sale in a window becomes older than that window.
              Example: if you hit the 30-hour limit, the next slot opens exactly 30 hours
              after the oldest of those counted sales.
            </p>
          </div>
        </div>
      </Card>

      <Card
        title="Why Dupepanel uses rolling windows"
        subtitle='Common confusion: "daily limit" vs. rolling limit'
        icon={<HelpCircle className="w-5 h-5" />}
      >
        <div className="space-y-3 text-sm text-text-secondary leading-relaxed">
          <p>
            Many guides call it a "daily sell limit", but in practice the popular model is time-based.
            That means selling late at night can still count against you the next morning if it&apos;s
            within the last 30 hours.
          </p>
          <p>
            Dupepanel therefore treats limits as rolling windows measured from the current time,
            matching how the game is commonly observed to behave.
          </p>
        </div>
      </Card>

      <Card
        title="Related: 18-hour sell price reduction (estimate)"
        subtitle="Used by the Sell Price card"
        icon={<CircleDollarSign className="w-5 h-5" />}
      >
        <div className="space-y-3 text-sm text-text-secondary leading-relaxed">
          <p>
            Dupepanel also models a separate "sell price degradation" chain: if you keep selling
            within 18 hours of your previous sale, the next sale&apos;s expected payout drops.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>After 0 recent sales: 100% (no reduction)</li>
            <li>After 1 recent sale: 50%</li>
            <li>After 2 recent sales: 20%</li>
            <li>After 3+ recent sales: 5%</li>
          </ul>
          <p>
            This is an approximation intended for planning; actual in-game payouts can vary by vehicle,
            upgrades, and Rockstar-side enforcement.
          </p>
        </div>
      </Card>
    </div>
  )
}
