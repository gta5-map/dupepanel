import { NavLink } from 'react-router-dom'
import { LayoutGrid, Clock, Layers, Settings, Plus } from 'lucide-react'

interface MobileNavProps {
  onAddSale: () => void
}

const leftNavItems = [
  {
    to: '/',
    label: 'Dashboard',
    icon: <LayoutGrid className="w-6 h-6" />,
  },
  {
    to: '/history',
    label: 'History',
    icon: <Clock className="w-6 h-6" />,
  },
]

const rightNavItems = [
  {
    to: '/plates',
    label: 'Plates',
    icon: <Layers className="w-6 h-6" />,
  },
  {
    to: '/settings',
    label: 'Settings',
    icon: <Settings className="w-6 h-6" />,
  },
]

export function MobileNav({ onAddSale }: MobileNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-lg border-t border-border md:hidden">
      <div className="flex justify-around items-center h-16 px-2">
        {/* Left nav items */}
        {leftNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `
              flex flex-col items-center justify-center gap-0.5
              min-w-[56px] py-2 px-2 rounded-xl
              transition-all duration-200
              ${
                isActive
                  ? 'text-blue-500 bg-blue-500/10'
                  : 'text-text-secondary hover:text-text-primary active:bg-text-secondary/10'
              }
            `}
          >
            {item.icon}
            <span className="text-[10px] font-semibold">{item.label}</span>
          </NavLink>
        ))}

        {/* Center Add Sale button */}
        <button
          onClick={onAddSale}
          className="
            flex items-center justify-center
            w-14 h-14 -mt-6
            rounded-full
            bg-gradient-to-br from-blue-500 to-indigo-600
            text-white
            shadow-lg shadow-blue-500/40
            transition-all duration-200
            hover:shadow-xl hover:shadow-blue-500/50
            active:scale-95
          "
        >
          <Plus className="w-7 h-7" strokeWidth={2.5} />
        </button>

        {/* Right nav items */}
        {rightNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `
              flex flex-col items-center justify-center gap-0.5
              min-w-[56px] py-2 px-2 rounded-xl
              transition-all duration-200
              ${
                isActive
                  ? 'text-blue-500 bg-blue-500/10'
                  : 'text-text-secondary hover:text-text-primary active:bg-text-secondary/10'
              }
            `}
          >
            {item.icon}
            <span className="text-[10px] font-semibold">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
