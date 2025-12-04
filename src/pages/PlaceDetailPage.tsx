import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc, collection, addDoc, serverTimestamp, query, where, getDocs, deleteDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuthState } from '../hooks/useAuthState'
import { GoingDialog } from '../components/GoingDialog'
import { SharePanel } from '../components/SharePanel'
import type { PlaceAttendance } from '../types'

type Place = {
  placeId: string
  title: string
  description: string
  category: string
  subcategory?: string
  tags: string[]
  location: { lat: number; lng: number }
  address: string
  neighbourhood: string
  city?: string
  images: string[]
  avgRating: number
  reactionCount: { like: number; love: number; save: number }
  timings?: string
  cuisine?: string[]
  foodPriceRange?: string
  createdBy: string
}

export function PlaceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthState()
  
  const [place, setPlace] = useState<Place | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  
  // Feature states
  const [isSaved, setIsSaved] = useState(false)
  const [isGoing, setIsGoing] = useState(false)
  const [goingCount, setGoingCount] = useState(0)
  const [saveCount, setSaveCount] = useState(0)
  
  // Dialog states
  const [showGoingDialog, setShowGoingDialog] = useState(false)
  const [showDirections, setShowDirections] = useState(false)
  const [showShare, setShowShare] = useState(false)

  useEffect(() => {
    async function fetchPlace() {
      if (!id) return
      
      try {
        const docRef = doc(db, 'places', id)
        const docSnap = await getDoc(docRef)
        
        if (docSnap.exists()) {
          setPlace({ ...docSnap.data(), placeId: docSnap.id } as Place)
        } else {
          console.error('Place not found')
          navigate('/')
        }
        
        // Fetch save and going status if user is logged in
        if (user) {
          // Check if saved
          const savesQuery = query(
            collection(db, 'place_saves'),
            where('placeId', '==', id),
            where('userId', '==', user.uid)
          )
          const savesSnapshot = await getDocs(savesQuery)
          setIsSaved(!savesSnapshot.empty)
          
          // Check if going
          const attendanceQuery = query(
            collection(db, 'place_attendance'),
            where('placeId', '==', id),
            where('userId', '==', user.uid),
            where('status', '==', 'going')
          )
          const attendanceSnapshot = await getDocs(attendanceQuery)
          setIsGoing(!attendanceSnapshot.empty)
        }
        
        // Get total counts
        const allSavesQuery = query(collection(db, 'place_saves'), where('placeId', '==', id))
        const allSavesSnapshot = await getDocs(allSavesQuery)
        setSaveCount(allSavesSnapshot.size)
        
        const allGoingQuery = query(
          collection(db, 'place_attendance'),
          where('placeId', '==', id),
          where('status', '==', 'going')
        )
        const allGoingSnapshot = await getDocs(allGoingQuery)
        setGoingCount(allGoingSnapshot.size)
        
      } catch (error) {
        console.error('Error fetching place:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPlace()
  }, [id, user, navigate])

  const handleSave = async () => {
    if (!user || !place) {
      navigate('/profile')
      return
    }

    try {
      if (isSaved) {
        // Remove save
        const savesQuery = query(
          collection(db, 'place_saves'),
          where('placeId', '==', place.placeId),
          where('userId', '==', user.uid)
        )
        const savesSnapshot = await getDocs(savesQuery)
        savesSnapshot.forEach(async (docSnapshot) => {
          await deleteDoc(docSnapshot.ref)
        })
        setIsSaved(false)
        setSaveCount((prev) => Math.max(0, prev - 1))
      } else {
        // Add save
        await addDoc(collection(db, 'place_saves'), {
          saveId: `${user.uid}_${place.placeId}_${Date.now()}`,
          placeId: place.placeId,
          userId: user.uid,
          createdAt: serverTimestamp(),
        })
        setIsSaved(true)
        setSaveCount((prev) => prev + 1)
      }
    } catch (error) {
      console.error('Error toggling save:', error)
    }
  }

  const handleGoingConfirm = async (data: {
    date?: string
    time?: string
    visibility: 'friends' | 'public'
  }) => {
    if (!user || !place) return

    try {
      const userDoc = await getDoc(doc(db, 'user_profiles', user.uid))
      const userData = userDoc.data()

      await addDoc(collection(db, 'place_attendance'), {
        attendanceId: `${user.uid}_${place.placeId}_${Date.now()}`,
        placeId: place.placeId,
        userId: user.uid,
        userName: userData?.displayName || user.displayName || 'Anonymous',
        userAvatar: userData?.avatarEmoji || '👤',
        goingDate: data.date,
        goingTime: data.time,
        visibility: data.visibility,
        status: 'going',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      } as Omit<PlaceAttendance, 'createdAt' | 'updatedAt'>)

      setIsGoing(true)
      setGoingCount((prev) => prev + 1)
    } catch (error) {
      console.error('Error marking as going:', error)
    }
  }

  const handleCancelGoing = async () => {
    if (!user || !place) return

    try {
      const attendanceQuery = query(
        collection(db, 'place_attendance'),
        where('placeId', '==', place.placeId),
        where('userId', '==', user.uid),
        where('status', '==', 'going')
      )
      const attendanceSnapshot = await getDocs(attendanceQuery)
      attendanceSnapshot.forEach(async (docSnapshot) => {
        await deleteDoc(docSnapshot.ref)
      })
      setIsGoing(false)
      setGoingCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error cancelling going:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">📍</div>
          <p className="text-slate-400">Loading place...</p>
        </div>
      </div>
    )
  }

  if (!place) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-slate-400">Place not found</p>
        </div>
      </div>
    )
  }

  const categoryEmoji: Record<string, string> = {
    food_cafe: '☕',
    food_restaurant: '🍽️',
    activity: '🎮',
    movie: '🎬',
  }

  return (
    <div className="min-h-screen bg-bg pb-20">
      {/* Hero Image Section */}
      <div className="relative h-80 md:h-96 bg-gradient-warm">
        {place.images && place.images.length > 0 ? (
          <>
            <div className="relative w-full h-full">
              <img
                src={place.images[currentImageIndex]}
                alt={place.title}
                className="w-full h-full object-cover"
              />
              {/* Dark gradient overlay to protect text */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70"></div>
            </div>
            {place.images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                {place.images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`h-2 rounded-full transition-all ${
                      idx === currentImageIndex ? 'w-8 bg-white shadow-lg' : 'w-2 bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-8xl bg-gradient-to-br from-bg-warm to-bg">
            {categoryEmoji[place.category] || '📍'}
          </div>
        )}
        
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white p-3 rounded-full hover:bg-black/80 transition-all shadow-lg z-20"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 -mt-16">
        {/* Card Container */}
        <div className="bg-bg-elevated rounded-3xl border border-primary/20 shadow-2xl overflow-hidden relative z-10">
          {/* Header Section */}
          <div className="p-6 md:p-8">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold text-gradient mb-2">{place.title}</h1>
                <p className="text-slate-400 flex items-center gap-2">
                  <span>📍</span>
                  <span>{place.neighbourhood}, {place.city || 'Bengaluru'}</span>
                </p>
                {place.timings && (
                  <p className="text-slate-400 flex items-center gap-2 mt-1">
                    <span>🕐</span>
                    <span>{place.timings}</span>
                  </p>
                )}
              </div>
              
              {/* Quick Stats */}
              <div className="flex flex-col gap-2 items-end">
                <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full">
                  <span className="text-xl">⭐</span>
                  <span className="font-bold text-primary">{place.avgRating.toFixed(1)}</span>
                </div>
                {place.foodPriceRange && (
                  <div className="flex items-center gap-2 bg-green-500/10 px-3 py-1.5 rounded-full">
                    <span className="font-bold text-green-500">{place.foodPriceRange}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-slate-300 leading-relaxed mb-6">{place.description}</p>

            {/* Tags */}
            {place.tags && place.tags.length > 0 && (
              <div className="flex gap-2 flex-wrap mb-6">
                {place.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm text-accent-yellow font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Primary Action Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={handleSave}
                className={`py-4 px-6 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 text-lg ${
                  isSaved
                    ? 'bg-gradient-warm text-white shadow-glow'
                    : 'bg-primary/10 border-2 border-primary/30 text-primary hover:bg-primary/20 hover:border-primary/50'
                }`}
              >
                {isSaved ? '✓ Saved' : '🔖 Save'}
                {saveCount > 0 && <span className="text-sm opacity-90">({saveCount})</span>}
              </button>
              
              <button
                onClick={isGoing ? handleCancelGoing : () => setShowGoingDialog(true)}
                className={`py-4 px-6 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 text-lg ${
                  isGoing
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-gradient-warm text-white shadow-glow hover:shadow-glow-lg hover:scale-[1.02]'
                }`}
              >
                {isGoing ? '✓ Going' : `👥 I'm Going`}
                {goingCount > 0 && <span className="text-sm opacity-90">({goingCount})</span>}
              </button>
            </div>

            {/* Secondary Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowDirections(true)}
                className="py-3 px-4 rounded-xl bg-bg/50 border border-primary/20 hover:bg-primary/10 hover:border-primary/30 transition-all flex items-center justify-center gap-2 font-semibold text-slate-300"
              >
                <span className="text-xl">🗺️</span>
                <span>Directions</span>
              </button>
              
              <button
                onClick={() => setShowShare(true)}
                className="py-3 px-4 rounded-xl bg-bg/50 border border-primary/20 hover:bg-primary/10 hover:border-primary/30 transition-all flex items-center justify-center gap-2 font-semibold text-slate-300"
              >
                <span className="text-xl">📤</span>
                <span>Share</span>
              </button>
            </div>
          </div>

          {/* Additional Info Section */}
          <div className="border-t border-primary/10 p-6 md:p-8 bg-bg/30">
            <h2 className="text-xl font-bold text-gradient mb-4">Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-bg-elevated/50 rounded-xl p-4 border border-primary/10">
                <p className="text-sm text-slate-400 mb-1">Category</p>
                <p className="text-lg font-bold text-primary capitalize">
                  {place.category.replace('_', ' & ')}
                </p>
              </div>
              
              {place.cuisine && place.cuisine.length > 0 && (
                <div className="bg-bg-elevated/50 rounded-xl p-4 border border-primary/10">
                  <p className="text-sm text-slate-400 mb-1">Cuisine</p>
                  <p className="text-lg font-bold text-primary">
                    {place.cuisine.join(', ')}
                  </p>
                </div>
              )}
              
              <div className="bg-bg-elevated/50 rounded-xl p-4 border border-primary/10">
                <p className="text-sm text-slate-400 mb-1">Address</p>
                <p className="text-sm font-medium text-slate-300">
                  {place.address}
                </p>
              </div>
              
              <div className="bg-bg-elevated/50 rounded-xl p-4 border border-primary/10">
                <p className="text-sm text-slate-400 mb-1">Reactions</p>
                <div className="flex items-center gap-3">
                  <span className="text-sm">❤️ {place.reactionCount.like}</span>
                  <span className="text-sm">😍 {place.reactionCount.love}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <GoingDialog
        isOpen={showGoingDialog}
        onClose={() => setShowGoingDialog(false)}
        onConfirm={handleGoingConfirm}
        placeName={place.title}
      />
      
      {/* Note: Directions opens in map view, not here */}
      {showDirections && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-bg-elevated rounded-2xl p-6 max-w-md w-full border border-primary/20 shadow-2xl">
            <h3 className="text-xl font-bold text-gradient mb-3">Get Directions</h3>
            <p className="text-slate-300 mb-6">
              Directions feature works best on the map view. Click a place marker on the map and use the Directions button to see the route.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDirections(false)
                  navigate('/')
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-warm text-white font-semibold shadow-glow hover:shadow-glow-lg transition-all"
              >
                Go to Map
              </button>
              <button
                onClick={() => setShowDirections(false)}
                className="py-3 px-4 rounded-xl bg-primary/10 border border-primary/20 text-slate-300 font-semibold hover:bg-primary/20 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      <SharePanel
        isOpen={showShare}
        onClose={() => setShowShare(false)}
        placeId={place.placeId}
        placeName={place.title}
      />
    </div>
  )
}
