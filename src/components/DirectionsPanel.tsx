import { useState } from 'react'

interface DirectionsPanelProps {
  isOpen: boolean
  onClose: () => void
  destination: {
    lat: number
    lng: number
    name: string
  }
}

export function DirectionsPanel({ isOpen, onClose, destination }: DirectionsPanelProps) {
  const [startLocation, setStartLocation] = useState('')
  const [distance, setDistance] = useState<string | null>(null)
  const [duration, setDuration] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Calculate distance using Haversine formula (approximate)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371 // Radius of Earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // Estimate travel time (assuming average speed of 30 km/h in city)
  const estimateDuration = (distanceKm: number) => {
    const avgSpeedKmh = 30
    const hours = distanceKm / avgSpeedKmh
    const minutes = Math.round(hours * 60)
    if (minutes < 60) return `${minutes} min`
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return `${h}h ${m}m`
  }

  const handleCalculate = async () => {
    if (!startLocation.trim()) return

    setLoading(true)
    try {
      // Try to geocode the start location
      // For now, use Bangalore center as fallback
      const bangaloreCenter = { lat: 12.9716, lng: 77.5946 }
      
      const dist = calculateDistance(
        bangaloreCenter.lat,
        bangaloreCenter.lng,
        destination.lat,
        destination.lng
      )
      
      setDistance(`${dist.toFixed(1)} km`)
      setDuration(estimateDuration(dist))
    } catch (error) {
      console.error('Error calculating distance:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGetDirections = () => {
    // Open Google Maps with directions
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination.lat},${destination.lng}&destination_place_id=${destination.name}`
    window.open(mapsUrl, '_blank')
  }

  const handleUseMyLocation = () => {
    if ('geolocation' in navigator) {
      setLoading(true)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          const dist = calculateDistance(latitude, longitude, destination.lat, destination.lng)
          setDistance(`${dist.toFixed(1)} km`)
          setDuration(estimateDuration(dist))
          setStartLocation('Your current location')
          setLoading(false)
        },
        (error) => {
          console.error('Error getting location:', error)
          setLoading(false)
        }
      )
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 w-full max-w-2xl px-4 animate-slide-down">
      <div className="bg-bg-elevated/95 backdrop-blur-xl border border-primary/30 rounded-2xl shadow-2xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gradient flex items-center gap-2">
            <span className="text-2xl">🗺️</span>
            Get Directions
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Start Location Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Starting location
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={startLocation}
              onChange={(e) => setStartLocation(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCalculate()}
              placeholder="Enter your starting point..."
              className="flex-1 bg-bg/50 border border-primary/20 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
            <button
              onClick={handleUseMyLocation}
              disabled={loading}
              className="px-4 py-3 bg-primary/10 border border-primary/20 rounded-xl hover:bg-primary/20 transition-all text-primary font-medium"
              title="Use my location"
            >
              📍
            </button>
          </div>
        </div>

        {/* Distance & Time Display */}
        {(distance || duration) && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-gradient-warm/10 border border-primary/20 rounded-xl p-4">
              <p className="text-xs text-slate-400 mb-1">Distance</p>
              <p className="text-2xl font-bold text-primary">{distance}</p>
            </div>
            <div className="bg-gradient-warm/10 border border-primary/20 rounded-xl p-4">
              <p className="text-xs text-slate-400 mb-1">Est. Time</p>
              <p className="text-2xl font-bold text-primary">{duration}</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleCalculate}
            disabled={loading || !startLocation.trim()}
            className="flex-1 py-3 px-6 rounded-full border-2 border-primary/40 bg-bg-elevated/80 text-primary font-semibold hover:bg-primary/10 hover:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Calculating...' : 'Calculate'}
          </button>
          <button
            onClick={handleGetDirections}
            className="flex-1 py-3 px-6 rounded-full bg-gradient-warm text-white font-semibold shadow-glow hover:shadow-glow-lg hover:scale-105 transition-all flex items-center justify-center gap-2"
          >
            <span>Get Directions</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
