import { NavLink } from 'react-router-dom'
import { LayoutGrid, Clock, Layers, Settings, Info, Plus, Github, ExternalLink } from 'lucide-react'

interface DesktopSidebarProps {
  onAddSale: () => void
}

const navItems = [
  {
    to: '/',
    label: 'Dashboard',
    icon: <LayoutGrid className="w-5 h-5" />,
  },
  {
    to: '/history',
    label: 'History',
    icon: <Clock className="w-5 h-5" />,
  },
  {
    to: '/plates',
    label: 'License Plates',
    icon: <Layers className="w-5 h-5" />,
  },
  {
    to: '/settings',
    label: 'Settings',
    icon: <Settings className="w-5 h-5" />,
  },
  {
    to: '/info',
    label: 'Info',
    icon: <Info className="w-5 h-5" />,
  },
]

export function DesktopSidebar({ onAddSale }: DesktopSidebarProps) {
  return (
    <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 flex-col bg-surface border-r border-border">
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <img src={`${import.meta.env.BASE_URL}icon.svg`} alt="Dupepanel logo" className="w-10 h-10 rounded-xl shadow-lg" />
          <div>
            <h1 className="text-lg font-bold text-text-primary tracking-tight">Dupepanel</h1>
            <p className="text-[10px] text-text-secondary font-medium uppercase tracking-wider">GTA Sell Tracker</p>
          </div>
        </div>
      </div>

      {/* Add Sale Button */}
      <div className="px-3 mb-4">
        <button
          onClick={onAddSale}
          className="
            w-full flex items-center justify-center gap-2
            px-4 py-3 rounded-xl
            bg-gradient-to-r from-blue-500 to-indigo-600
            text-white font-semibold
            shadow-lg shadow-blue-500/30
            transition-all duration-200
            hover:shadow-xl hover:shadow-blue-500/40
            hover:from-blue-600 hover:to-indigo-700
            active:scale-[0.98]
          "
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} />
          Add Sale
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-xl
                  transition-all duration-200 font-medium text-sm
                  ${
                    isActive
                      ? 'bg-blue-500/10 text-blue-500'
                      : 'text-text-secondary hover:bg-text-secondary/10 hover:text-text-primary'
                  }
                `}
              >
                {item.icon}
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="mx-3 mb-3 pt-3 border-t border-border">
        <div className="rounded-xl bg-text-secondary/5 p-3">
          <div className="flex items-center justify-between mb-2">
            <a
              href="https://github.com/gta5-map/dupepanel"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              <span className="font-medium">GitHub</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href={`https://github.com/gta5-map/dupepanel/commit/${__COMMIT_HASH__}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-text-primary bg-text-secondary/10 px-2 py-0.5 rounded-md hover:bg-text-secondary/20 transition-colors"
            >
              v1.0.0-{__COMMIT_HASH__}
            </a>
          </div>
          <div className="text-[10px] text-text-secondary/70 text-center">
            © {new Date().getFullYear()}{' '}
            <a
              href="https://github.com/frdmn"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-text-primary transition-colors"
            >
              frdmn
            </a>
          </div>
        </div>
      </div>
    </aside>
  )
}
