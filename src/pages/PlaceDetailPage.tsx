import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc, collection, addDoc, serverTimestamp, updateDoc, increment } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuthState } from '../hooks/useAuthState'

type Place = {
  placeId: string
  title: string
  description: string
  category: string
  tags: string[]
  location: { lat: number; lng: number }
  address: string
  neighbourhood: string
  images: string[]
  avgRating: number
  reactionCount: { like: number; love: number; save: number }
  createdBy: string
  contributors: any[]
}

export function PlaceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthState()
  const [place, setPlace] = useState<Place | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewText, setReviewText] = useState('')
  const [rating, setRating] = useState(5)

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
        }
      } catch (error) {
        console.error('Error fetching place:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPlace()
  }, [id])

  const handleReaction = async (type: 'like' | 'love' | 'save') => {
    if (!user || !place) {
      navigate('/profile')
      return
    }

    try {
      // Add reaction
      await addDoc(collection(db, 'reactions'), {
        placeId: place.placeId,
        userId: user.uid,
        type,
        createdAt: serverTimestamp(),
      })

      // Update reaction count
      const placeRef = doc(db, 'places', place.placeId)
      await updateDoc(placeRef, {
        [`reactionCount.${type}`]: increment(1),
      })

      // Update local state
      setPlace({
        ...place,
        reactionCount: {
          ...place.reactionCount,
          [type]: place.reactionCount[type] + 1,
        },
      })
    } catch (error) {
      console.error('Error adding reaction:', error)
    }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !place) {
      navigate('/profile')
      return
    }

    try {
      await addDoc(collection(db, 'reviews'), {
        placeId: place.placeId,
        userId: user.uid,
        rating,
        text: reviewText,
        images: [],
        createdAt: serverTimestamp(),
      })

      setShowReviewForm(false)
      setReviewText('')
      alert('Review submitted! 🎉')
    } catch (error) {
      console.error('Error submitting review:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="h-12 w-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
      </div>
    )
  }

  if (!place) {
    return (
      <div className="mx-auto max-w-4xl p-6 text-center">
        <p className="text-4xl mb-4">🤷</p>
        <p className="text-slate-400 mb-4">Place not found</p>
        <button onClick={() => navigate('/')} className="btn-primary">
          Back to Map
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <button
        onClick={() => navigate('/')}
        className="mb-4 text-sm text-slate-400 hover:text-slate-100 transition flex items-center gap-2"
      >
        ← Back to Map
      </button>

      <div className="card-premium overflow-hidden">
        {/* Image Carousel */}
        {place.images.length > 0 ? (
          <div className="relative aspect-[21/9] bg-bg-warm">
            <img
              src={place.images[currentImageIndex]}
              alt={place.title}
              className="w-full h-full object-cover"
            />
            {place.images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? place.images.length - 1 : prev - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white hover:bg-black/70 transition"
                >
                  ←
                </button>
                <button
                  onClick={() => setCurrentImageIndex((prev) => (prev === place.images.length - 1 ? 0 : prev + 1))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white hover:bg-black/70 transition"
                >
                  →
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {place.images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`h-2 rounded-full transition-all ${
                        idx === currentImageIndex ? 'w-8 bg-primary' : 'w-2 bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="aspect-[21/9] bg-gradient-warm flex items-center justify-center text-white text-6xl">
            {place.category === 'food_cafe' ? '🍽️' : place.category === 'activities' ? '🎯' : '🎬'}
          </div>
        )}

        {/* Content */}
        <div className="p-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gradient mb-2">{place.title}</h1>
              <p className="text-slate-400 text-sm">
                📍 {place.neighbourhood}, {place.address}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleReaction('like')}
                className="px-4 py-2 rounded-full bg-primary/10 border border-primary/20 hover:bg-primary/20 transition"
              >
                ❤️ {place.reactionCount.like}
              </button>
              <button
                onClick={() => handleReaction('love')}
                className="px-4 py-2 rounded-full bg-primary/10 border border-primary/20 hover:bg-primary/20 transition"
              >
                😍 {place.reactionCount.love}
              </button>
              <button
                onClick={() => handleReaction('save')}
                className="px-4 py-2 rounded-full bg-primary/10 border border-primary/20 hover:bg-primary/20 transition"
              >
                🔖 {place.reactionCount.save}
              </button>
            </div>
          </div>

          <p className="text-slate-300 mb-6 leading-relaxed">{place.description}</p>

          <div className="flex gap-2 flex-wrap mb-6">
            {place.tags.map((tag) => (
              <span
                key={tag}
                className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm text-accent-yellow"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
              <p className="text-xs text-slate-400 mb-1">Rating</p>
              <p className="text-2xl font-bold text-gradient">⭐ {place.avgRating.toFixed(1)}</p>
            </div>
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
              <p className="text-xs text-slate-400 mb-1">Category</p>
              <p className="text-lg font-bold text-primary capitalize">{place.category.replace('_', ' & ')}</p>
            </div>
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
              <p className="text-xs text-slate-400 mb-1">Reactions</p>
              <p className="text-2xl font-bold text-gradient">
                {place.reactionCount.like + place.reactionCount.love + place.reactionCount.save}
              </p>
            </div>
          </div>

          <div className="border-t border-primary/20 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-100">Reviews</h2>
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="btn-secondary text-xs"
              >
                {showReviewForm ? 'Cancel' : '✍️ Write Review'}
              </button>
            </div>

            {showReviewForm && (
              <form onSubmit={handleSubmitReview} className="mb-6 p-6 rounded-xl bg-bg-warm border border-primary/20">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`text-2xl transition ${star <= rating ? 'text-primary' : 'text-slate-600'}`}
                      >
                        ⭐
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Your Review</label>
                  <textarea
                    rows={3}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    required
                    className="w-full rounded-xl border border-primary/30 bg-bg px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Share your experience..."
                  />
                </div>
                <button type="submit" className="btn-primary">
                  Submit Review
                </button>
              </form>
            )}

            <div className="text-center py-8 text-slate-500">
              <p className="text-3xl mb-2">💬</p>
              <p className="text-sm">No reviews yet</p>
              <p className="text-xs text-slate-600 mt-1">Be the first to share your experience!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
