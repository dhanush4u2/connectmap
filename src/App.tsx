import { Routes, Route } from 'react-router-dom'
import { TopNav } from './components/TopNav'
import { MapPage } from './pages/MapPage'
import { PlaceDetailPage } from './pages/PlaceDetailPage'
import { AdminDashboardPage } from './pages/AdminDashboardPage'
import { SubmitPage } from './pages/SubmitPage'
import { ProfilePage } from './pages/ProfilePage'
import { OnboardingPage } from './pages/OnboardingPage'
import SeedDataPage from './pages/SeedDataPage'
import { useAuthProfileSetup } from './hooks/useAuthProfileSetup'

function App() {
  console.log('🚀 App component rendered')
  
  // Initialize auth profile setup listener
  useAuthProfileSetup()
  
  return (
    <div className="min-h-screen bg-bg text-slate-100">
      <TopNav />
      <main className="pt-16 md:pt-16">
        <Routes>
          <Route path="/" element={<MapPage />} />
          <Route path="/place/:id" element={<PlaceDetailPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/submit" element={<SubmitPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/seed" element={<SeedDataPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
