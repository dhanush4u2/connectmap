import 'leaflet/dist/leaflet.css'
import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { Icon, divIcon } from 'leaflet'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { renderToStaticMarkup } from 'react-dom/server'

type Place = {
  placeId: string
  title: string
  description: string
  category: string
  tags: string[]
  location: { lat: number; lng: number }
  address: string
  images: string[]
  avgRating: number
  reactionCount: { like: number; love: number; save: number }
}

type MapViewProps = {
  onBoundsChange?: (bounds: any) => void
  selectedCategory?: string
}

// Custom marker component
const CustomMarker = () => (
  <div
    style={{
      width: '32px',
      height: '32px',
      background: 'linear-gradient(135deg, #ff6b2c 0%, #ffb340 100%)',
      borderRadius: '50% 50% 50% 0',
      transform: 'rotate(-45deg)',
      border: '3px solid #fff',
      boxShadow: '0 4px 12px rgba(255, 107, 44, 0.5)',
    }}
  />
)

// Create custom icon
const customIcon = divIcon({
  html: renderToStaticMarkup(<CustomMarker />),
  className: 'custom-marker',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
})

function MapBoundsHandler({ onBoundsChange }: { onBoundsChange?: (bounds: any) => void }) {
  const map = useMap()

  useEffect(() => {
    if (!onBoundsChange) return

    const handleMoveEnd = () => {
      const bounds = map.getBounds()
      onBoundsChange(bounds)
    }

    map.on('moveend', handleMoveEnd)
    return () => {
      map.off('moveend', handleMoveEnd)
    }
  }, [map, onBoundsChange])

  return null
}

export function MapView({ onBoundsChange, selectedCategory }: MapViewProps) {
  const [places, setPlaces] = useState<Place[]>([])
  const [mapKey, setMapKey] = useState(0)

  // Fetch places from Firestore
  useEffect(() => {
    async function fetchPlaces() {
      try {
        console.log('🗺️ MapView: Fetching places for category:', selectedCategory || 'all')
        
        const placesCol = collection(db, 'places')
        let q = query(placesCol, where('status', '==', 'published'))
        
        if (selectedCategory) {
          q = query(q, where('category', '==', selectedCategory))
        }

        const snapshot = await getDocs(q)
        console.log(`🗺️ MapView: Found ${snapshot.size} places`)
        
        const fetchedPlaces: Place[] = []
        snapshot.forEach((doc) => {
          fetchedPlaces.push({ ...doc.data(), placeId: doc.id } as Place)
        })
        
        setPlaces(fetchedPlaces)
      } catch (error) {
        console.error('❌ MapView error:', error)
      }
    }

    fetchPlaces()
  }, [selectedCategory])

  // Force remount when component updates (fixes React StrictMode double-render issue)
  useEffect(() => {
    setMapKey(prev => prev + 1)
  }, [])

  return (
    <div className="h-full w-full rounded-3xl border border-primary/20 bg-bg-warm shadow-card overflow-hidden">
      <MapContainer
        key={mapKey}
        center={[12.9716, 77.5946]}
        zoom={12}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
        className="leaflet-container"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapBoundsHandler onBoundsChange={onBoundsChange} />
        
        {places.map((place) => (
          <Marker
            key={place.placeId}
            position={[place.location.lat, place.location.lng]}
            icon={customIcon}
          >
            <Popup>
              <div style={{ padding: '8px', minWidth: '200px' }}>
                <h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: '700', color: '#ff6b2c' }}>
                  {place.title}
                </h3>
                <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#64748b', lineHeight: '1.4' }}>
                  {place.description}
                </p>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                  {place.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      style={{
                        padding: '2px 8px',
                        background: 'rgba(255, 107, 44, 0.1)',
                        border: '1px solid rgba(255, 107, 44, 0.3)',
                        borderRadius: '12px',
                        fontSize: '11px',
                        color: '#ff6b2c',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>
                  <span>❤️ {place.reactionCount.like + place.reactionCount.love}</span>
                  <span>⭐ {place.avgRating.toFixed(1)}</span>
                </div>
                <a
                  href={`/place/${place.placeId}`}
                  style={{
                    display: 'inline-block',
                    padding: '6px 14px',
                    background: 'linear-gradient(135deg, #ff6b2c 0%, #ffb340 100%)',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                  }}
                >
                  View Details
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
