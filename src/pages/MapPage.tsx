import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapView } from '../components/MapView'
import { SocialPanel } from '../components/SocialPanel'
import { useOnboardingCheck } from '../hooks/useOnboardingCheck'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase'

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
}

const categories = [
  { id: 'all', label: 'All', emoji: '🌟' },
  { id: 'food_cafe', label: 'Food & Café', emoji: '🍽️' },
  { id: 'activities', label: 'Activities', emoji: '🎯' },
  { id: 'movies', label: 'Movies', emoji: '🎬' },
]

export function MapPage() {
  const navigate = useNavigate()
  const { loading: onboardingLoading } = useOnboardingCheck()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showSocialPanel, setShowSocialPanel] = useState(true)

  useEffect(() => {
    async function fetchPlaces() {
      setLoading(true)
      setError(null)
      try {
        console.log('🔍 Fetching places from Firestore...')
        console.log('Firebase DB initialized:', !!db)
        
        const placesCol = collection(db, 'places')
        
        let q = query(placesCol, where('status', '==', 'published'))
        
        if (selectedCategory !== 'all') {
          q = query(placesCol, where('status', '==', 'published'), where('category', '==', selectedCategory))
        }

        const snapshot = await getDocs(q)
        console.log(`✅ Fetched ${snapshot.size} places from Firestore`)
        
        const fetchedPlaces: Place[] = []
        snapshot.forEach((doc) => {
          const data = doc.data()
          console.log('Place data:', data)
          
          // Flexible data handling - only require placeId
          fetchedPlaces.push({ 
            placeId: doc.id,
            title: data.title || 'Untitled Place',
            description: data.description || '',
            category: data.category || 'other',
            tags: Array.isArray(data.tags) ? data.tags : [],
            location: data.location || { lat: 12.9716, lng: 77.5946 },
            address: data.address || '',
            images: Array.isArray(data.images) ? data.images : [],
            avgRating: typeof data.avgRating === 'number' ? data.avgRating : 0,
            reactionCount: {
              like: data.reactionCount?.like || 0,
              love: data.reactionCount?.love || 0,
              save: data.reactionCount?.save || 0,
            }
          })
        })
        
        setPlaces(fetchedPlaces)
        
        if (fetchedPlaces.length === 0) {
          console.warn('⚠️ No places found. Add places via Firebase Console or check security rules.')
          setError('No places found. Try adding a place in Firebase Console.')
        }
      } catch (error: any) {
        console.error('❌ Error fetching places:', error)
        console.error('Error code:', error?.code)
        console.error('Error message:', error?.message)
        setError(error?.message || 'Failed to load places')
      } finally {
        setLoading(false)
      }
    }

    fetchPlaces()
  }, [selectedCategory])

  // Don't render map until onboarding check completes
  if (onboardingLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="h-12 w-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-7rem)] md:h-[calc(100vh-4rem)] flex-col md:flex-row">
      {/* Mobile category bar */}
      <div className="md:hidden bg-bg-elevated border-b border-primary/10 p-3 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-gradient-warm text-white shadow-glow'
                  : 'bg-bg-warm text-slate-400 border border-primary/20'
              }`}
            >
              <span className="mr-1.5">{cat.emoji}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sidebar with filters and place list - Desktop only */}
      <div className="hidden md:flex w-80 flex-col border-r border-primary/10 bg-bg-elevated lg:w-96 overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-primary/10">
          <h2 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Explore</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-2 rounded-full text-xs font-medium transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-warm text-white shadow-glow'
                    : 'bg-bg-warm text-slate-400 border border-primary/20 hover:bg-primary/10 hover:text-primary'
                }`}
              >
                <span className="mr-1.5">{cat.emoji}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Place list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {places.length} {places.length === 1 ? 'Place' : 'Places'}
            </h2>
          </div>
          
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 rounded-2xl bg-bg-warm animate-pulse" />
              ))}
            </div>
          ) : places.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <p className="text-4xl mb-2">🔍</p>
              <p className="text-sm">{error || 'No places found'}</p>
              <p className="text-xs mt-2 text-slate-600">Add places in Firebase Console</p>
            </div>
          ) : (
            places.map((place) => {
              const likes = (place.reactionCount?.like || 0) + (place.reactionCount?.love || 0)
              const rating = place.avgRating || 0
              const tags = place.tags || []
              
              return (
                <button
                  key={place.placeId}
                  onClick={() => navigate(`/place/${place.placeId}`)}
                  className="w-full text-left card-premium p-4 hover:scale-[1.02] transition-transform"
                >
                  <h3 className="font-semibold text-slate-100 mb-1 text-sm">
                    {place.title || 'Untitled Place'}
                  </h3>
                  {place.description && (
                    <p className="text-xs text-slate-400 mb-2 line-clamp-2">
                      {place.description}
                    </p>
                  )}
                  {tags.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap mb-2">
                      {tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] text-accent-yellow"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    {likes > 0 && <span>❤️ {likes}</span>}
                    {rating > 0 && <span>⭐ {rating.toFixed(1)}</span>}
                    {place.address && (
                      <span className="ml-auto text-[10px] text-slate-500 truncate">
                        {place.address}
                      </span>
                    )}
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 p-2 md:p-4 relative">
        {/* Toggle Social Panel Button */}
        <button
          onClick={() => setShowSocialPanel(!showSocialPanel)}
          className="absolute top-4 right-4 z-10 px-4 py-2 rounded-full bg-gradient-warm text-white text-xs font-semibold shadow-glow hover:scale-105 transition md:hidden lg:block"
        >
          {showSocialPanel ? '👥 Hide Social' : '👥 Show Social'}
        </button>
        
        <MapView selectedCategory={selectedCategory === 'all' ? undefined : selectedCategory} />
      </div>

      {/* Social Panel - Right side */}
      {showSocialPanel && (
        <div className="hidden md:block w-80 lg:w-96">
          <SocialPanel />
        </div>
      )}
    </div>
  )
}
