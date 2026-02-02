import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useSalesStore } from '@/store/salesStore'
import { usePlatesStore } from '@/store/platesStore'
import { formatDateISO, formatTime24 } from '@/utils/formatters'

interface AddSaleModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AddSaleModal({ isOpen, onClose }: AddSaleModalProps) {
  const addSale = useSalesStore((state) => state.addSale)
  const plates = usePlatesStore((state) => state.plates)

  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [plate, setPlate] = useState('')
  const [error, setError] = useState('')

  // Reset form when modal opens - intentional pattern for modal state reset
  useEffect(() => {
    if (isOpen) {
      const now = new Date()
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDate(formatDateISO(now))
      setTime(formatTime24(now))
      setPlate('')
      setError('')
    }
  }, [isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate date/time
    const timestamp = new Date(`${date}T${time}`).getTime()
    if (isNaN(timestamp)) {
      setError('Invalid date or time')
      return
    }

    if (timestamp > Date.now()) {
      setError('Cannot add future sales')
      return
    }

    addSale({
      date,
      time,
      plate,
      timestamp,
    })

    onClose()
  }

  const plateOptions = plates.map((p) => ({
    value: p.license,
    label: p.license,
  }))

  const today = formatDateISO(new Date())

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Sale">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="License Plate"
          options={plateOptions}
          placeholder="No plate (optional)"
          value={plate}
          onChange={(e) => setPlate(e.target.value)}
        />

        <Input
          label="Date"
          type="date"
          value={date}
          max={today}
          onChange={(e) => setDate(e.target.value)}
          required
        />

        <Input
          label="Time"
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          required
        />

        {error && (
          <p className="text-sm text-danger">{error}</p>
        )}

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button type="submit" className="flex-1">
            Add Sale
          </Button>
        </div>
      </form>
    </Modal>
  )
}
