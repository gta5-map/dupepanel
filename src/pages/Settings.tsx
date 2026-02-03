import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSettingsStore } from '@/store/settingsStore'
import { useSalesStore } from '@/store/salesStore'
import { usePlatesStore } from '@/store/platesStore'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { ConfirmDialog } from '@/components/features/ConfirmDialog'
import { Settings, Palette, ChevronRight, Bell, Database, Info, Github, ExternalLink, BellRing, ShieldAlert, ShieldCheck } from 'lucide-react'
import {
  requestNotificationPermission,
  getNotificationPermission,
  isNotificationSupported,
  sendTestNotification,
} from '@/utils/notifications'
import type { Theme, Settings as SettingsType, Sale, Plate } from '@/types'

interface ExportData {
  version: string
  exportedAt: string
  sales: Omit<Sale, 'id'>[]
  plates: Omit<Plate, 'id'>[]
  settings: SettingsType
}

export default function SettingsPage() {
  const theme = useSettingsStore((s) => s.theme)
  const updateTheme = useSettingsStore((s) => s.updateTheme)
  const notificationsEnabled = useSettingsStore((s) => s.notificationsEnabled)
  const toggleNotifications = useSettingsStore((s) => s.toggleNotifications)
  const notifyOneSlot = useSettingsStore((s) => s.notifyOneSlot)
  const setNotifyOneSlot = useSettingsStore((s) => s.setNotifyOneSlot)
  const notifyTwoSlots = useSettingsStore((s) => s.notifyTwoSlots)
  const setNotifyTwoSlots = useSettingsStore((s) => s.setNotifyTwoSlots)
  const notifyPriceReset = useSettingsStore((s) => s.notifyPriceReset)
  const setNotifyPriceReset = useSettingsStore((s) => s.setNotifyPriceReset)
  const importSettings = useSettingsStore((s) => s.importSettings)
  const resetSettings = useSettingsStore((s) => s.resetSettings)

  const sales = useSalesStore((s) => s.sales)
  const clearSales = useSalesStore((s) => s.clearSales)
  const importSales = useSalesStore((s) => s.importSales)

  const plates = usePlatesStore((s) => s.plates)
  const clearPlates = usePlatesStore((s) => s.clearPlates)
  const importPlates = usePlatesStore((s) => s.importPlates)

  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [importError, setImportError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default')

  // Check notification permission on mount
  useEffect(() => {
    if (isNotificationSupported()) {
      setNotificationPermission(getNotificationPermission())
    }
  }, [])

  const handleRequestPermission = async () => {
    const permission = await requestNotificationPermission()
    setNotificationPermission(permission)
  }

  const handleTestNotification = () => {
    sendTestNotification()
  }

  const handleExport = () => {
    setImportError('')
    setSuccessMessage('')

    try {
      const data: ExportData = {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        sales: sales.map(({ id: _, ...rest }) => rest),
        plates: plates.map(({ id: _, ...rest }) => rest),
        settings: {
          theme,
          notificationsEnabled,
          notifyOneSlot,
          notifyTwoSlots,
          notifyPriceReset,
        },
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `dupepanel-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setSuccessMessage('Data exported successfully')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch {
      setImportError('Failed to export data')
    }
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImportError('')
    setSuccessMessage('')

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string) as ExportData

        if (!data.version || !Array.isArray(data.sales) || !Array.isArray(data.plates)) {
          throw new Error('Invalid backup file format')
        }

        importSales(data.sales)
        importPlates(data.plates)
        if (data.settings) {
          importSettings(data.settings)
        }

        setSuccessMessage(`Imported ${data.sales.length} sales and ${data.plates.length} plates`)
        setTimeout(() => setSuccessMessage(''), 3000)
      } catch {
        setImportError('Failed to import: Invalid file format')
      }
    }
    reader.readAsText(file)

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClearAll = () => {
    clearSales()
    clearPlates()
    resetSettings()
    setShowClearConfirm(false)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-text-secondary/10">
          <Settings className="w-6 h-6 text-text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-text-primary">Settings</h1>
          <p className="text-xs text-text-secondary">Customize your experience</p>
        </div>
      </div>

      {/* Appearance */}
      <Card title="Appearance" icon={<Palette className="w-5 h-5" />}>
        <div className="space-y-4">
          <Select
            label="Theme"
            value={theme}
            onChange={(e) => updateTheme(e.target.value as Theme)}
            options={[
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
              { value: 'system', label: 'System' },
            ]}
          />
          <Link
            to="/plates"
            className="flex items-center justify-between p-3 -mx-3 rounded-lg hover:bg-text-secondary/5 transition-colors"
          >
            <span className="text-text-primary">Manage License Plates</span>
            <ChevronRight className="w-5 h-5 text-text-secondary" />
          </Link>
        </div>
      </Card>

      {/* Notifications */}
      <Card title="Notifications" icon={<Bell className="w-5 h-5" />}>
        <div className="space-y-4">
          {/* Permission Status */}
          {isNotificationSupported() && (
            <div className={`
              flex items-center gap-3 p-3 rounded-xl
              ${notificationPermission === 'granted' ? 'bg-safe/10' : notificationPermission === 'denied' ? 'bg-danger/10' : 'bg-warning/10'}
            `}>
              {notificationPermission === 'granted' ? (
                <ShieldCheck className="w-5 h-5 text-safe" />
              ) : (
                <ShieldAlert className={`w-5 h-5 ${notificationPermission === 'denied' ? 'text-danger' : 'text-warning'}`} />
              )}
              <div className="flex-1">
                <p className={`text-sm font-medium ${notificationPermission === 'granted' ? 'text-safe' : notificationPermission === 'denied' ? 'text-danger' : 'text-warning'}`}>
                  {notificationPermission === 'granted' ? 'Notifications Permitted' :
                   notificationPermission === 'denied' ? 'Notifications Blocked' :
                   'Permission Required'}
                </p>
                {notificationPermission === 'denied' && (
                  <p className="text-xs text-text-secondary mt-0.5">Enable in browser settings</p>
                )}
              </div>
              {notificationPermission === 'default' && (
                <Button variant="primary" size="sm" onClick={handleRequestPermission}>
                  Allow
                </Button>
              )}
            </div>
          )}

          {!isNotificationSupported() && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-danger/10">
              <ShieldAlert className="w-5 h-5 text-danger" />
              <p className="text-sm text-danger">Notifications not supported in this browser</p>
            </div>
          )}

          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-text-primary">Enable Notifications</span>
            <button
              type="button"
              role="switch"
              aria-checked={notificationsEnabled}
              onClick={toggleNotifications}
              className={`
                relative w-11 h-6 rounded-full transition-colors
                ${notificationsEnabled ? 'bg-primary' : 'bg-text-secondary/30'}
              `}
            >
              <span
                className={`
                  absolute top-1 left-1 w-4 h-4 rounded-full bg-white
                  transition-transform
                  ${notificationsEnabled ? 'translate-x-5' : 'translate-x-0'}
                `}
              />
            </button>
          </label>

          {notificationsEnabled && (
            <>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-text-primary">Notify when 1 slot available</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={notifyOneSlot}
                  onClick={() => setNotifyOneSlot(!notifyOneSlot)}
                  className={`
                    relative w-11 h-6 rounded-full transition-colors
                    ${notifyOneSlot ? 'bg-primary' : 'bg-text-secondary/30'}
                  `}
                >
                  <span
                    className={`
                      absolute top-1 left-1 w-4 h-4 rounded-full bg-white
                      transition-transform
                      ${notifyOneSlot ? 'translate-x-5' : 'translate-x-0'}
                    `}
                  />
                </button>
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-text-primary">Notify when 2 slots available</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={notifyTwoSlots}
                  onClick={() => setNotifyTwoSlots(!notifyTwoSlots)}
                  className={`
                    relative w-11 h-6 rounded-full transition-colors
                    ${notifyTwoSlots ? 'bg-primary' : 'bg-text-secondary/30'}
                  `}
                >
                  <span
                    className={`
                      absolute top-1 left-1 w-4 h-4 rounded-full bg-white
                      transition-transform
                      ${notifyTwoSlots ? 'translate-x-5' : 'translate-x-0'}
                    `}
                  />
                </button>
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-text-primary">Notify when price resets to 100%</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={notifyPriceReset}
                  onClick={() => setNotifyPriceReset(!notifyPriceReset)}
                  className={`
                    relative w-11 h-6 rounded-full transition-colors
                    ${notifyPriceReset ? 'bg-primary' : 'bg-text-secondary/30'}
                  `}
                >
                  <span
                    className={`
                      absolute top-1 left-1 w-4 h-4 rounded-full bg-white
                      transition-transform
                      ${notifyPriceReset ? 'translate-x-5' : 'translate-x-0'}
                    `}
                  />
                </button>
              </label>

              {notificationPermission === 'granted' && (
                <Button
                  variant="secondary"
                  onClick={handleTestNotification}
                  className="w-full"
                >
                  <BellRing className="w-4 h-4 mr-2" />
                  Send Test Notification
                </Button>
              )}
            </>
          )}

          <p className="text-xs text-text-secondary">
            Get notified when sell slots become available (2h cooldown) or when your sell price resets to 100% (18h window).
          </p>
        </div>
      </Card>

      {/* Data Management */}
      <Card title="Data Management" icon={<Database className="w-5 h-5" />}>
        <div className="space-y-4">
          <div className="flex gap-3">
            <Button variant="secondary" onClick={handleExport} className="flex-1">
              Export Data
            </Button>
            <Button
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1"
            >
              Import Data
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </div>

          {importError && (
            <p className="text-sm text-danger">{importError}</p>
          )}

          {successMessage && (
            <p className="text-sm text-safe">{successMessage}</p>
          )}

          <Button
            variant="danger"
            onClick={() => setShowClearConfirm(true)}
            className="w-full"
          >
            Clear All Data
          </Button>

          <p className="text-xs text-text-secondary">
            Export creates a JSON backup. Import replaces all current data.
          </p>
        </div>
      </Card>

      {/* About */}
      <Card title="About" icon={<Info className="w-5 h-5" />}>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center p-3 bg-text-secondary/5 rounded-xl">
            <span className="text-text-secondary font-medium">Version</span>
            <a
              href={`https://github.com/gta5-map/dupepanel/commit/${__COMMIT_HASH__}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-primary font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-md text-xs hover:bg-primary/20 transition-colors"
            >
              v1.0.0-{__COMMIT_HASH__}
            </a>
          </div>
          <a
            href="https://github.com/gta5-map/dupepanel"
            target="_blank"
            rel="noopener noreferrer"
            className="flex justify-between items-center p-3 bg-text-secondary/5 rounded-xl hover:bg-text-secondary/10 transition-colors"
          >
            <span className="text-text-secondary font-medium flex items-center gap-2">
              <Github className="w-4 h-4" />
              GitHub
            </span>
            <ExternalLink className="w-4 h-4 text-text-secondary" />
          </a>
          <div className="flex justify-between items-center p-3 bg-text-secondary/5 rounded-xl">
            <span className="text-text-secondary font-medium">Total Sales</span>
            <span className="text-text-primary font-bold tabular-nums">{sales.length}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-text-secondary/5 rounded-xl">
            <span className="text-text-secondary font-medium">Saved Plates</span>
            <span className="text-text-primary font-bold tabular-nums">{plates.length}</span>
          </div>
          <p className="text-text-secondary pt-2">
            Dupepanel Web - GTA Online vehicle sell limit tracker.
            Based on the original Dupepanel Android app.
          </p>
          <p className="text-text-secondary/70 text-xs">
            © {new Date().getFullYear()}{' '}
            <a
              href="https://github.com/frdmn"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-text-primary transition-colors"
            >
              frdmn
            </a>
          </p>
        </div>
      </Card>

      {/* Clear Confirmation */}
      <ConfirmDialog
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={handleClearAll}
        title="Clear All Data"
        message="This will permanently delete all your sales, plates, and settings. This action cannot be undone."
        confirmLabel="Clear All"
        variant="danger"
      />
    </div>
  )
}
