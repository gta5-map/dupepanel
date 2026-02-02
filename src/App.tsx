import { HashRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { InstallPrompt } from './components/InstallPrompt'
import { useTheme } from './hooks/useTheme'
import { useNotifications } from './hooks/useNotifications'
import Dashboard from './pages/Dashboard'
import History from './pages/History'
import Info from './pages/Info'
import Plates from './pages/Plates'
import Settings from './pages/Settings'

function AppContent() {
  // Apply theme on mount and when it changes
  useTheme()

  // Schedule notifications based on sales and settings
  useNotifications()

  return (
    <>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/history" element={<History />} />
          <Route path="/info" element={<Info />} />
          <Route path="/plates" element={<Plates />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
      <InstallPrompt />
    </>
  )
}

function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  )
}

export default App
