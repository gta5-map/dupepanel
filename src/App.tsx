import { HashRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { useTheme } from './hooks/useTheme'
import Dashboard from './pages/Dashboard'
import History from './pages/History'
import Info from './pages/Info'
import Plates from './pages/Plates'
import Settings from './pages/Settings'

function AppContent() {
  // Apply theme on mount and when it changes
  useTheme()

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/history" element={<History />} />
        <Route path="/info" element={<Info />} />
        <Route path="/plates" element={<Plates />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Layout>
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
