import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapView } from '../components/MapView'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { db } from '../lib/firebase'

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

const categories = [
  { id: 'all', label: 'All', emoji: '🌟' },
  { id: 'food_cafe', label: 'Food & Café', emoji: '🍽️' },
  { id: 'activities', label: 'Activities', emoji: '🎯' },
  { id: 'movies', label: 'Movies', emoji: '🎬' },
]

export function MapPage() {
  const navigate = useNavigate()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPlaces() {
      setLoading(true)
      setError(null)
      try {
        console.log('🔍 Fetching places from Firestore...')
        console.log('Firebase DB initialized:', !!db)
        
        const placesCol = collection(db, 'places')
        
        // Try simple query first without orderBy
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
          fetchedPlaces.push({ ...data, placeId: doc.id } as Place)
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

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar with filters and place list */}
      <div className="hidden w-80 flex-col border-r border-primary/20 bg-bg-elevated md:flex lg:w-[26rem] overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-primary/20">
          <h2 className="text-sm font-semibold text-slate-300 mb-3">Categories</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-warm text-white shadow-glow'
                    : 'bg-bg-warm text-slate-400 border border-primary/20 hover:bg-primary/10 hover:text-primary'
                }`}
              >
                <span className="mr-1">{cat.emoji}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Place list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <h2 className="text-sm font-semibold text-slate-300 mb-2">
            {places.length} {places.length === 1 ? 'Place' : 'Places'}
          </h2>
          
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 rounded-2xl bg-bg-warm animate-pulse" />
              ))}
            </div>
          ) : places.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <p className="text-4xl mb-2">🔍</p>
              <p className="text-sm">{error || 'No places found'}</p>
              <p className="text-xs mt-2 text-slate-600">Add places in Firebase Console</p>
            </div>
          ) : (
            places.map((place) => (
              <button
                key={place.placeId}
                onClick={() => navigate(`/place/${place.placeId}`)}
                className="w-full text-left card-premium p-4 hover:scale-[1.02] transition-transform"
              >
                <h3 className="font-semibold text-slate-100 mb-1 text-sm">{place.title}</h3>
                <p className="text-xs text-slate-400 mb-2 line-clamp-2">{place.description}</p>
                <div className="flex gap-1.5 flex-wrap mb-2">
                  {place.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] text-accent-yellow"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span>❤️ {place.reactionCount.like + place.reactionCount.love}</span>
                  <span>⭐ {place.avgRating.toFixed(1)}</span>
                  <span className="ml-auto text-[10px] text-slate-500">{place.address}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 p-4">
        <MapView selectedCategory={selectedCategory === 'all' ? undefined : selectedCategory} />
      </div>
    </div>
  )
}
