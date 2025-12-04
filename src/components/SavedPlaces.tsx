import { useEffect, useState } from 'react'
import { collection, query, where, getDocs, deleteDoc, doc, getDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useNavigate } from 'react-router-dom'

interface SavedPlace {
  placeId: string
  saveId: string
  title: string
  category: string
  neighbourhood: string
  avgRating: number
}

interface SavedPlacesProps {
  userId: string
}

export function SavedPlaces({ userId }: SavedPlacesProps) {
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    async function fetchSavedPlaces() {
      try {
        const savesQuery = query(
          collection(db, 'place_saves'),
          where('userId', '==', userId)
        )
        const savesSnapshot = await getDocs(savesQuery)
        
        const places: SavedPlace[] = []
        
        for (const saveDoc of savesSnapshot.docs) {
          const saveData = saveDoc.data()
          const placeDoc = await getDoc(doc(db, 'places', saveData.placeId))
          
          if (placeDoc.exists()) {
            const placeData = placeDoc.data()
            places.push({
              placeId: saveData.placeId,
              saveId: saveDoc.id,
              title: placeData.title || 'Untitled Place',
              category: placeData.category || 'other',
              neighbourhood: placeData.neighbourhood || 'Unknown',
              avgRating: placeData.avgRating || 0,
            })
          }
        }
        
        setSavedPlaces(places)
      } catch (error) {
        console.error('Error fetching saved places:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSavedPlaces()
  }, [userId])

  const handleRemove = async (_saveId: string, placeId: string) => {
    try {
      // Find and delete the save document
      const savesQuery = query(
        collection(db, 'place_saves'),
        where('placeId', '==', placeId),
        where('userId', '==', userId)
      )
      const savesSnapshot = await getDocs(savesQuery)
      
      savesSnapshot.forEach(async (docSnapshot) => {
        await deleteDoc(docSnapshot.ref)
      })
      
      setSavedPlaces((prev) => prev.filter((place) => place.placeId !== placeId))
    } catch (error) {
      console.error('Error removing save:', error)
    }
  }

  const categoryEmoji: Record<string, string> = {
    food_cafe: '☕',
    food_restaurant: '🍽️',
    activity: '🎮',
    movie: '🎬',
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="h-8 w-8 mx-auto rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
      </div>
    )
  }

  if (savedPlaces.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <p className="text-5xl mb-3">🔖</p>
        <p className="text-sm mb-1">No saved places yet</p>
        <p className="text-xs text-slate-600 mt-1">Save places to visit them later!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {savedPlaces.map((place) => (
        <div
          key={place.placeId}
          className="bg-bg-warm rounded-xl border border-primary/20 p-4 hover:border-primary/40 transition-all group"
        >
          <div className="flex items-start gap-3">
            <div className="text-3xl">{categoryEmoji[place.category] || '📍'}</div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-100 truncate">{place.title}</h3>
              <p className="text-xs text-slate-400 mt-1">📍 {place.neighbourhood}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm">⭐ {place.avgRating.toFixed(1)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => navigate(`/place/${place.placeId}`)}
              className="flex-1 py-2 px-4 rounded-lg bg-gradient-warm text-white text-sm font-semibold hover:shadow-glow transition-all"
            >
              View
            </button>
            <button
              onClick={() => handleRemove(place.saveId, place.placeId)}
              className="py-2 px-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-semibold hover:bg-red-500/20 transition-all"
            >
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
