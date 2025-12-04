import { useState, useEffect } from 'react'
import type { LatLngExpression } from 'leaflet'

interface DirectionsSearchProps {
  isOpen: boolean
  onClose: () => void
  destination: {
    lat: number
    lng: number
    name: string
  }
  onRouteCalculated: (route: LatLngExpression[], distance: string, duration: string) => void
}

interface SearchResult {
  name: string
  display_name: string
  lat: number
  lng: number
}

export function DirectionsSearch({ isOpen, onClose, destination, onRouteCalculated }: DirectionsSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [startLocation, setStartLocation] = useState<{ lat: number; lng: number; name: string } | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)

  // Calculate distance using Haversine formula
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

  // Search using OSM Nominatim API
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 3) {
      setSearchResults([])
      return
    }

    const searchTimer = setTimeout(async () => {
      try {
        // Bias search to Bangalore area
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?` +
          `q=${encodeURIComponent(searchQuery + ', Bangalore')}&` +
          `format=json&` +
          `limit=10&` +
          `viewbox=77.4,13.1,77.8,12.8&` + // Bangalore bounds
          `bounded=1&` +
          `countrycodes=in&` +
          `addressdetails=1`,
          {
            headers: {
              'Accept-Language': 'en',
              'User-Agent': 'ConnectBLR/1.0'
            },
          }
        )
        const data = await response.json()
        const results: SearchResult[] = data.map((item: any) => ({
          name: item.name || item.display_name.split(',')[0],
          display_name: item.display_name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
        }))
        setSearchResults(results)
      } catch (error) {
        console.error('Search error:', error)
        setSearchResults([])
      }
    }, 500) // Debounce

    return () => clearTimeout(searchTimer)
  }, [searchQuery])

  const handleSelectLocation = (location: SearchResult) => {
    setStartLocation({
      lat: location.lat,
      lng: location.lng,
      name: location.name,
    })
    setSearchQuery(location.name)
    setShowResults(false)
  }

  const handleUseMyLocation = () => {
    if ('geolocation' in navigator) {
      setLoading(true)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            name: 'Your Location'
          }
          setStartLocation(location)
          setSearchQuery('Your Location')
          setLoading(false)
        },
        (error) => {
          console.error('Error getting location:', error)
          alert('Could not get your location. Please search manually.')
          setLoading(false)
        }
      )
    } else {
      alert('Geolocation is not supported by your browser')
    }
  }

  const handleGetDirections = () => {
    if (!startLocation) return

    setLoading(true)
    const dist = calculateDistance(
      startLocation.lat,
      startLocation.lng,
      destination.lat,
      destination.lng
    )
    
    const distanceText = `${dist.toFixed(1)} km`
    const durationText = estimateDuration(dist)
    
    // Create a simple straight line route
    const path: LatLngExpression[] = [
      [startLocation.lat, startLocation.lng],
      [destination.lat, destination.lng]
    ]
    
    onRouteCalculated(path, distanceText, durationText)
    setLoading(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[1000] w-full max-w-3xl px-4 animate-slide-down">
      <div className="bg-bg-elevated/98 backdrop-blur-xl border border-primary/30 rounded-2xl shadow-2xl">
        <div className="p-4">
          {/* Search Input */}
          <div className="flex gap-2 items-center">
            <button
              onClick={() => {
                onClose()
                setSearchQuery('')
                setStartLocation(null)
                setShowResults(false)
              }}
              className="text-slate-400 hover:text-white transition-colors p-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setShowResults(true)
                }}
                onFocus={() => {
                  if (searchResults.length > 0) setShowResults(true)
                }}
                placeholder="Search starting location..."
                className="w-full bg-bg/50 border border-primary/20 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
              
              {/* Search Results Dropdown */}
              {showResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-bg-elevated border border-primary/20 rounded-xl shadow-xl max-h-80 overflow-y-auto z-10 custom-scrollbar">
                  {searchResults.map((result, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectLocation(result)}
                      className="w-full px-4 py-3 text-left hover:bg-primary/10 transition-colors border-b border-slate-700 last:border-b-0"
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-xl mt-0.5">📍</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-200 font-medium truncate">{result.name}</p>
                          <p className="text-xs text-slate-400 truncate">{result.display_name}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <button
              onClick={handleUseMyLocation}
              disabled={loading}
              className="p-3 bg-primary/10 border border-primary/20 rounded-xl hover:bg-primary/20 transition-all text-primary font-medium disabled:opacity-50 whitespace-nowrap"
              title="Use my location"
            >
              📍 My Location
            </button>
            
            {startLocation && (
              <button
                onClick={handleGetDirections}
                disabled={loading}
                className="px-6 py-3 rounded-xl bg-gradient-warm text-white font-semibold shadow-glow hover:shadow-glow-lg transition-all disabled:opacity-50 whitespace-nowrap"
              >
                Get Directions
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
