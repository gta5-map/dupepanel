import { useState, type ReactNode } from 'react'
import { MobileNav } from './MobileNav'
import { DesktopSidebar } from './DesktopSidebar'
import { AddSaleModal } from '@/components/features/AddSaleModal'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const openAddModal = () => setIsAddModalOpen(true)

  return (
    <div className="min-h-screen bg-background">
      <DesktopSidebar onAddSale={openAddModal} />
      <MobileNav onAddSale={openAddModal} />

      {/* Main content */}
      <main className="md:ml-64 pb-20 md:pb-0">
        <div className="max-w-4xl mx-auto p-4 md:p-6">
          {children}
        </div>
      </main>

      {/* Global Add Sale Modal */}
      <AddSaleModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  )
}
