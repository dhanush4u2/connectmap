import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ErrorBoundary } from './components/ErrorBoundary'
import './index.css'
import App from './App.tsx'

const queryClient = new QueryClient()

console.log('🎯 Starting Connect BLR app...')
console.log('Root element:', document.getElementById('root'))

createRoot(document.getElementById('root')!).render(
  // Temporarily disable StrictMode to fix Leaflet double-initialization issue
  // <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  // </StrictMode>,
)

console.log('✅ App mounted')
