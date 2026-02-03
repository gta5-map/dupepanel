import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Plate } from '@/types'

interface PlatesState {
  plates: Plate[]
  addPlate: (license: string) => boolean
  removePlate: (id: string) => void
  getPlates: () => Plate[]
  clearPlates: () => void
  importPlates: (plates: Omit<Plate, 'id'>[]) => void
}

export const usePlatesStore = create<PlatesState>()(
  persist(
    (set, get) => ({
      plates: [],

      addPlate: (license) => {
        const normalizedLicense = license.toUpperCase().trim()

        // Check for duplicates
        if (get().plates.some((p) => p.license === normalizedLicense)) {
          return false
        }

        const plate: Plate = {
          id: crypto.randomUUID(),
          license: normalizedLicense,
        }

        set((state) => ({
          plates: [...state.plates, plate],
        }))

        return true
      },

      removePlate: (id) => {
        set((state) => ({
          plates: state.plates.filter((plate) => plate.id !== id),
        }))
      },

      getPlates: () => get().plates,

      clearPlates: () => set({ plates: [] }),

      importPlates: (plates) => set({
        plates: plates.map((plate) => ({ ...plate, id: crypto.randomUUID() }))
      }),
    }),
    {
      name: 'dupepanel_plates',
    }
  )
)
