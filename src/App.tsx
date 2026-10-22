import { Route, Routes } from 'react-router'
import { Toaster } from '@/components/ui/sonner'
import Home from './pages/Home'
import Builder from './pages/Builder'
import Fill from './pages/Fill'
import Responses from './pages/Responses'
import SettingsPage from './pages/Settings'

export default function App() {
  return (
    <>
      <Toaster position="top-center" richColors />
      <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/build/:id" element={<Builder />} />
      <Route path="/fill/:id" element={<Fill />} />
      <Route path="/responses/:id" element={<Responses />} />
      <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </>
  )
}
