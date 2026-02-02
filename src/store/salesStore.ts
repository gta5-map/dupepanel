import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Sale } from '@/types'

interface SalesState {
  sales: Sale[]
  addSale: (sale: Omit<Sale, 'id'>) => void
  updateSale: (id: string, sale: Omit<Sale, 'id'>) => void
  removeSale: (id: string) => void
  getSales: () => Sale[]
  clearSales: () => void
  importSales: (sales: Sale[]) => void
}

export const useSalesStore = create<SalesState>()(
  persist(
    (set, get) => ({
      sales: [],

      addSale: (saleData) => {
        const sale: Sale = {
          ...saleData,
          id: crypto.randomUUID(),
        }
        set((state) => ({
          sales: [...state.sales, sale].sort((a, b) => b.timestamp - a.timestamp),
        }))
      },

      updateSale: (id, saleData) => {
        set((state) => ({
          sales: state.sales
            .map((sale) => (sale.id === id ? { ...saleData, id } : sale))
            .sort((a, b) => b.timestamp - a.timestamp),
        }))
      },

      removeSale: (id) => {
        set((state) => ({
          sales: state.sales.filter((sale) => sale.id !== id),
        }))
      },

      getSales: () => get().sales,

      clearSales: () => set({ sales: [] }),

      importSales: (sales) => set({
        sales: sales.sort((a, b) => b.timestamp - a.timestamp)
      }),
    }),
    {
      name: 'dupepanel_sales',
    }
  )
)
