import { useState, useMemo } from 'react'
import { usePlatesStore } from '@/store/platesStore'
import { useSalesStore } from '@/store/salesStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/features/ConfirmDialog'
import { Layers, Square, Trash2 } from 'lucide-react'

export default function Plates() {
  const plates = usePlatesStore((state) => state.plates)
  const addPlate = usePlatesStore((state) => state.addPlate)
  const removePlate = usePlatesStore((state) => state.removePlate)
  const sales = useSalesStore((state) => state.sales)

  const plateUsageCount = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const sale of sales) {
      if (sale.plate) {
        counts[sale.plate] = (counts[sale.plate] || 0) + 1
      }
    }
    return counts
  }, [sales])

  const [newPlate, setNewPlate] = useState('')
  const [error, setError] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const trimmed = newPlate.trim().toUpperCase()

    if (!trimmed) {
      setError('Please enter a license plate')
      return
    }

    if (trimmed.length > 8) {
      setError('License plate cannot exceed 8 characters')
      return
    }

    if (!/^[A-Z0-9]+$/.test(trimmed)) {
      setError('Only letters and numbers are allowed')
      return
    }

    const success = addPlate(trimmed)
    if (!success) {
      setError('This plate already exists')
      return
    }

    setNewPlate('')
  }

  const handleDelete = () => {
    if (deleteId) {
      removePlate(deleteId)
      setDeleteId(null)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-text-secondary/10">
            <Layers className="w-6 h-6 text-text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">License Plates</h1>
            <p className="text-xs text-text-secondary">Manage your vehicle plates</p>
          </div>
        </div>
        {plates.length > 0 && (
          <span className="text-sm font-semibold text-text-primary bg-text-secondary/10 px-3 py-1.5 rounded-full">
            {plates.length} plate{plates.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Add Plate Form */}
      <Card>
        <form onSubmit={handleAdd} className="flex gap-3">
          <div className="flex-1">
            <Input
              placeholder="Enter plate (e.g., ABC123)"
              value={newPlate}
              onChange={(e) => setNewPlate(e.target.value.toUpperCase())}
              maxLength={8}
              error={error}
            />
          </div>
          <Button type="submit" className="shrink-0">
            Add
          </Button>
        </form>
        <p className="text-xs text-text-secondary mt-3">
          Max 8 characters, letters and numbers only
        </p>
      </Card>

      {/* Plates List */}
      {plates.length === 0 ? (
        <Card>
          <div className="text-center py-10">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-text-secondary/10 flex items-center justify-center">
              <Layers className="w-8 h-8 text-text-secondary/50" strokeWidth={1.5} />
            </div>
            <p className="text-text-primary font-medium">No plates saved yet</p>
            <p className="text-sm text-text-secondary mt-1">
              Add license plates to organize your sales.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-2">
          {plates.map((plate) => (
            <div
              key={plate.id}
              className="flex items-center justify-between p-4 rounded-2xl bg-surface border border-border transition-all duration-200 hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Square className="w-5 h-5 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="font-mono font-bold text-lg text-text-primary tracking-wider">
                    {plate.license}
                  </span>
                  <span className="text-xs text-text-secondary">
                    {plateUsageCount[plate.license] || 0} sale{(plateUsageCount[plate.license] || 0) !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setDeleteId(plate.id)}
                className="p-2.5 text-text-secondary hover:text-danger hover:bg-danger/10 rounded-xl transition-all"
                aria-label={`Delete ${plate.license}`}
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Plate"
        message="Are you sure you want to delete this license plate?"
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  )
}
