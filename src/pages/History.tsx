import { useState, useMemo } from 'react'
import { useSalesStore } from '@/store/salesStore'
import { isInCooldown, getRemainingCooldown } from '@/utils/calculations'
import { formatTime, formatDateTime } from '@/utils/formatters'
import { ConfirmDialog } from '@/components/features/ConfirmDialog'
import { EditSaleModal } from '@/components/features/EditSaleModal'
import { SalesCalendar } from '@/components/features/SalesCalendar'
import { Card } from '@/components/ui/Card'
import { Clock, List, Calendar, Filter, Truck, Pencil, Trash2 } from 'lucide-react'
import type { Sale } from '@/types'

type ViewMode = 'list' | 'calendar'

const STORAGE_KEY = 'dupepanel_history_view'

function getStoredViewMode(): ViewMode {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === 'calendar' ? 'calendar' : 'list'
}

export default function History() {
  const sales = useSalesStore((state) => state.sales)
  const removeSale = useSalesStore((state) => state.removeSale)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editSale, setEditSale] = useState<Sale | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>(getStoredViewMode)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  // Persist view mode changes
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode)
    localStorage.setItem(STORAGE_KEY, mode)
    if (mode === 'list') {
      setSelectedDate(null)
    }
  }

  const handleDelete = () => {
    if (deleteId) {
      removeSale(deleteId)
      setDeleteId(null)
    }
  }

  // Filter sales by selected date
  const filteredSales = useMemo(() => {
    if (!selectedDate) return sales
    return sales.filter((sale) => sale.date === selectedDate)
  }, [sales, selectedDate])

  // Format selected date for display
  const selectedDateDisplay = useMemo(() => {
    if (!selectedDate) return null
    const date = new Date(selectedDate + 'T00:00:00')
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }, [selectedDate])

  if (sales.length === 0) {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-text-secondary/10">
            <Clock className="w-6 h-6 text-text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">Sales History</h1>
            <p className="text-xs text-text-secondary">Your recorded vehicle sales</p>
          </div>
        </div>
        <Card>
          <div className="text-center py-10">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-text-secondary/10 flex items-center justify-center">
              <Clock className="w-8 h-8 text-text-secondary/50" strokeWidth={1.5} />
            </div>
            <p className="text-text-primary font-medium">No sales recorded yet</p>
            <p className="text-sm text-text-secondary mt-1">
              Add your first sale from the Dashboard to start tracking.
            </p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-text-secondary/10">
            <Clock className="w-6 h-6 text-text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">Sales History</h1>
            <p className="text-xs text-text-secondary">Your recorded vehicle sales</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex bg-text-secondary/10 rounded-lg p-1">
            <button
              onClick={() => handleViewModeChange('list')}
              className={`
                p-2 rounded-md transition-colors
                ${viewMode === 'list' ? 'bg-surface text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'}
              `}
              aria-label="List view"
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleViewModeChange('calendar')}
              className={`
                p-2 rounded-md transition-colors
                ${viewMode === 'calendar' ? 'bg-surface text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'}
              `}
              aria-label="Calendar view"
              title="Calendar view"
            >
              <Calendar className="w-4 h-4" />
            </button>
          </div>
          {/* Sales count */}
          <span className="text-sm font-semibold text-text-primary bg-text-secondary/10 px-3 py-1.5 rounded-full">
            {sales.length} sale{sales.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Calendar view */}
      {viewMode === 'calendar' && (
        <SalesCalendar
          sales={sales}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />
      )}

      {/* Filter indicator */}
      {selectedDate && (
        <div className="flex items-center justify-between bg-primary/10 border border-primary/20 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary font-medium">
              Showing {filteredSales.length} sale{filteredSales.length !== 1 ? 's' : ''} on {selectedDateDisplay}
            </span>
          </div>
          <button
            onClick={() => setSelectedDate(null)}
            className="text-xs text-primary hover:text-primary/80 font-medium"
          >
            Clear filter
          </button>
        </div>
      )}

      {/* Sales list */}
      <div className="space-y-2">
        {filteredSales.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <p className="text-text-secondary">No sales on this date</p>
            </div>
          </Card>
        ) : (
          filteredSales.map((sale) => {
            const inCooldown = isInCooldown(sale)
            return (
              <div
                key={sale.id}
                className={`
                  flex items-center gap-4 p-4 rounded-2xl
                  bg-surface border border-border
                  transition-all duration-200 hover:shadow-md
                  ${inCooldown ? 'border-l-4 border-l-primary' : ''}
                `}
              >
                {/* Icon */}
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    ${inCooldown ? 'bg-primary/10 text-primary' : 'bg-text-secondary/10 text-text-secondary'}
                  `}
                >
                  <Truck className="w-5 h-5" />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary">
                    {formatDateTime(sale.timestamp)}
                  </p>
                  {sale.plate ? (
                    <p className="text-xs text-text-secondary mt-0.5">
                      Plate: {sale.plate}
                    </p>
                  ) : (
                    <p className="text-xs text-text-secondary/50 mt-0.5">
                      No plate
                    </p>
                  )}
                </div>

                {/* Cooldown indicator */}
                {inCooldown && (
                  <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                    {formatTime(getRemainingCooldown(sale))} left
                  </span>
                )}

                {/* Edit button */}
                <button
                  onClick={() => setEditSale(sale)}
                  className="p-2 text-text-secondary hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                  aria-label="Edit sale"
                >
                  <Pencil className="w-5 h-5" />
                </button>

                {/* Delete button */}
                <button
                  onClick={() => setDeleteId(sale.id)}
                  className="p-2 text-text-secondary hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                  aria-label="Delete sale"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            )
          })
        )}
      </div>

      {/* Edit Modal */}
      <EditSaleModal
        isOpen={!!editSale}
        onClose={() => setEditSale(null)}
        sale={editSale}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Sale"
        message="Are you sure you want to delete this sale? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  )
}
