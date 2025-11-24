import { Routes, Route } from 'react-router-dom'
import { TopNav } from './components/TopNav'
import { MapPage } from './pages/MapPage'
import { PlaceDetailPage } from './pages/PlaceDetailPage'
import { AdminDashboardPage } from './pages/AdminDashboardPage'
import { SubmitPage } from './pages/SubmitPage'
import { ProfilePage } from './pages/ProfilePage'

function App() {
  console.log('🚀 App component rendered')
  
  return (
    <div className="min-h-screen bg-bg text-slate-100">
      <TopNav />
      <main className="pt-16">
        <Routes>
          <Route path="/" element={<MapPage />} />
          <Route path="/place/:id" element={<PlaceDetailPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/submit" element={<SubmitPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
