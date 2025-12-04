import 'leaflet/dist/leaflet.css'
import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet'
import { divIcon } from 'leaflet'
import type { LatLngExpression } from 'leaflet'
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { renderToStaticMarkup } from 'react-dom/server'
import { PlaceMarker } from './PlaceMarker'
import { DirectionsSearch } from './DirectionsSearch'
import { GoingDialog } from './GoingDialog'
import { useAuthState } from '../hooks/useAuthState'
import type { PlaceAttendanceStats } from '../types'

// Flexible Place type - all fields except placeId are optional
type Place = {
  placeId: string
  title?: string
  description?: string
  category?: string
  tags?: string[]
  location?: { lat?: number; lng?: number }
  address?: string
  images?: string[]
  avgRating?: number
  reactionCount?: { like?: number; love?: number; save?: number }
  attendanceStats?: PlaceAttendanceStats
}

type MapViewProps = {
  onBoundsChange?: (bounds: any) => void
  selectedCategory?: string
}

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
  const [directionsOpen, setDirectionsOpen] = useState(false)
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [goingDialogOpen, setGoingDialogOpen] = useState(false)
  const [routePath, setRoutePath] = useState<LatLngExpression[] | null>(null)
  const [routeDistance, setRouteDistance] = useState<string | null>(null)
  const [routeDuration, setRouteDuration] = useState<string | null>(null)
  const { user } = useAuthState()

  const handleRouteCalculated = (route: LatLngExpression[], distance: string, duration: string) => {
    setRoutePath(route)
    setRouteDistance(distance)
    setRouteDuration(duration)
  }

  const handleCloseDirections = () => {
    setDirectionsOpen(false)
    setSelectedPlace(null)
    setRoutePath(null)
    setRouteDistance(null)
    setRouteDuration(null)
  }

  // Fetch places from Firestore with flexible data handling
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
          const data = doc.data()
          // Only add places that have valid location coordinates
          if (data.location?.lat && data.location?.lng) {
            fetchedPlaces.push({ 
              placeId: doc.id,
              title: data.title || 'Untitled Place',
              description: data.description || '',
              category: data.category || 'other',
              tags: Array.isArray(data.tags) ? data.tags : [],
              location: data.location,
              address: data.address || '',
              images: Array.isArray(data.images) ? data.images : [],
              avgRating: typeof data.avgRating === 'number' ? data.avgRating : 0,
              reactionCount: {
                like: data.reactionCount?.like || 0,
                love: data.reactionCount?.love || 0,
                save: data.reactionCount?.save || 0,
              }
            })
          } else {
            console.warn(`⚠️ Skipping place ${doc.id} - missing location data`)
          }
        })
        
        // Fetch attendance stats for each place
        const attendanceStatsCol = collection(db, 'place_attendance_stats')
        const statsSnapshot = await getDocs(attendanceStatsCol)
        const statsMap = new Map<string, PlaceAttendanceStats>()
        
        statsSnapshot.forEach((doc) => {
          statsMap.set(doc.id, doc.data() as PlaceAttendanceStats)
        })
        
        // Attach attendance stats to places
        fetchedPlaces.forEach((place) => {
          const stats = statsMap.get(place.placeId)
          if (stats) {
            place.attendanceStats = stats
          }
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
    <div className="h-full w-full rounded-3xl border border-primary/10 bg-bg-warm shadow-card overflow-hidden">
      <MapContainer
        key={mapKey}
        center={[12.9716, 77.5946]} // Bangalore coordinates
        zoom={13}
        scrollWheelZoom={true}
        zoomControl={true}
        style={{ height: '100%', width: '100%' }}
        className="leaflet-container-modern"
      >
        {/* Minimal, clean map tiles */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          maxZoom={19}
        />
        
        <MapBoundsHandler onBoundsChange={onBoundsChange} />
        
        {/* Route Display */}
        {routePath && (
          <Polyline
            positions={routePath}
            pathOptions={{
              color: '#ff6b2c',
              weight: 4,
              opacity: 0.8,
            }}
          />
        )}
        
        {places.map((place) => {
          // Safety check for location
          if (!place.location?.lat || !place.location?.lng) return null
          
          const likes = (place.reactionCount?.like || 0) + (place.reactionCount?.love || 0)
          const rating = place.avgRating || 0
          const tags = place.tags || []
          
          // Get attendance data
          const attendees = place.attendanceStats?.recentAttendees || []
          const totalGoing = place.attendanceStats?.totalGoing || 0
          
          // Create custom icon for this place
          const customIcon = divIcon({
            html: renderToStaticMarkup(
              <PlaceMarker
                attendees={attendees}
                totalGoing={totalGoing}
                category={place.category}
              />
            ),
            className: 'custom-marker-container',
            iconSize: [totalGoing > 0 ? 48 + Math.min(totalGoing * 2, 32) : 40, totalGoing > 0 ? 48 + Math.min(totalGoing * 2, 32) : 40],
            iconAnchor: [totalGoing > 0 ? 24 + Math.min(totalGoing, 16) : 20, totalGoing > 0 ? 24 + Math.min(totalGoing, 16) : 20],
            popupAnchor: [0, -(totalGoing > 0 ? 24 + Math.min(totalGoing, 16) : 20)],
          })
          
          return (
            <Marker
              key={place.placeId}
              position={[place.location.lat, place.location.lng]}
              icon={customIcon}
            >
              <Popup className="modern-popup" maxWidth={360}>
                <div className="popup-content">
                  <h3 className="popup-title">
                    {place.title || 'Untitled Place'}
                  </h3>
                  {place.description && (
                    <p className="popup-description">
                      {place.description}
                    </p>
                  )}
                  {tags.length > 0 && (
                    <div className="popup-tags">
                      {tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="popup-tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="popup-stats">
                    {totalGoing > 0 && <span>👥 {totalGoing} going</span>}
                    {likes > 0 && <span>❤️ {likes}</span>}
                    {rating > 0 && <span>⭐ {rating.toFixed(1)}</span>}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="popup-actions">
                    <button
                      onClick={async () => {
                        if (!user) {
                          alert('Please sign in to save places')
                          return
                        }
                        try {
                          const savesRef = collection(db, 'place_saves')
                          await addDoc(savesRef, {
                            placeId: place.placeId,
                            userId: user.uid,
                            savedAt: serverTimestamp(),
                          })
                          alert('Saved!')
                        } catch (error) {
                          console.error('Error saving:', error)
                        }
                      }}
                      className="popup-btn popup-btn-primary"
                    >
                      💾 Save
                    </button>
                    
                    <button
                      onClick={() => {
                        if (!user) {
                          alert('Please sign in to RSVP')
                          return
                        }
                        setSelectedPlace(place)
                        setGoingDialogOpen(true)
                      }}
                      className="popup-btn popup-btn-primary"
                    >
                      ✅ I'm Going
                    </button>
                    
                    <button
                      onClick={() => {
                        setSelectedPlace(place)
                        setDirectionsOpen(true)
                      }}
                      className="popup-btn popup-btn-secondary"
                    >
                      🧭 Directions
                    </button>
                  </div>
                  
                  <a
                    href={`/place/${place.placeId}`}
                    className="popup-link"
                    onClick={(e) => {
                      e.preventDefault()
                      window.location.href = `/place/${place.placeId}`
                    }}
                  >
                    View Details →
                  </a>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
      
      {/* Route Info Display */}
      {routeDistance && routeDuration && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[999] flex gap-3">
          <div className="bg-bg-elevated/95 backdrop-blur-xl border border-primary/30 rounded-xl px-4 py-2 shadow-lg">
            <p className="text-xs text-slate-400">Distance</p>
            <p className="text-lg font-bold text-primary">{routeDistance}</p>
          </div>
          <div className="bg-bg-elevated/95 backdrop-blur-xl border border-primary/30 rounded-xl px-4 py-2 shadow-lg">
            <p className="text-xs text-slate-400">Est. Time</p>
            <p className="text-lg font-bold text-primary">{routeDuration}</p>
          </div>
          <button
            onClick={handleCloseDirections}
            className="bg-red-500/90 backdrop-blur-xl text-white px-4 py-2 rounded-xl hover:bg-red-600 transition-all font-semibold"
          >
            ✕ Clear Route
          </button>
        </div>
      )}
      
      {/* Directions Search */}
      {selectedPlace && (
        <DirectionsSearch
          isOpen={directionsOpen}
          onClose={handleCloseDirections}
          destination={{
            lat: selectedPlace.location?.lat || 0,
            lng: selectedPlace.location?.lng || 0,
            name: selectedPlace.title || 'Place'
          }}
          onRouteCalculated={handleRouteCalculated}
        />
      )}
      
      {/* Going Dialog */}
      {selectedPlace && (
        <GoingDialog
          isOpen={goingDialogOpen}
          onClose={() => {
            setGoingDialogOpen(false)
            setSelectedPlace(null)
          }}
          placeName={selectedPlace.title || 'Place'}
          onConfirm={async (data) => {
            if (!user) return
            try {
              const userDoc = await getDocs(query(collection(db, 'user_profiles'), where('userId', '==', user.uid)))
              const userData = userDoc.docs[0]?.data()
              await addDoc(collection(db, 'place_attendance'), {
                placeId: selectedPlace.placeId,
                userId: user.uid,
                userName: userData?.displayName || user.displayName || 'Anonymous',
                userAvatar: userData?.avatarEmoji || '👤',
                goingDate: data.date,
                goingTime: data.time,
                visibility: data.visibility,
                status: 'going',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              })
              alert('RSVP confirmed!')
            } catch (error) {
              console.error('Error:', error)
            }
          }}
        />
      )}
    </div>
  )
}
