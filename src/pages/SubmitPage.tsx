import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthState } from '../hooks/useAuthState'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../lib/firebase'

const categories = [
  { id: 'food_cafe', label: 'Food & Café', emoji: '🍽️' },
  { id: 'activities', label: 'Activities', emoji: '🎯' },
  { id: 'movies', label: 'Movies', emoji: '🎬' },
]

export function SubmitPage() {
  const navigate = useNavigate()
  const { user } = useAuthState()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'food_cafe',
    tags: '',
    address: '',
    neighbourhood: '',
    lat: '',
    lng: '',
  })
  
  const [images, setImages] = useState<File[]>([])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files).slice(0, 5))
    }
  }

  const handleGetLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            lat: position.coords.latitude.toFixed(6),
            lng: position.coords.longitude.toFixed(6),
          }))
        },
        (error) => {
          console.error('Geolocation error:', error)
          setError('Unable to get your location. Please enter manually.')
        }
      )
    } else {
      setError('Geolocation is not supported by your browser')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      setError('Please sign in to submit a place')
      navigate('/profile')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Upload images to Firebase Storage
      const imageUrls: string[] = []
      for (const image of images) {
        const imageRef = ref(storage, `submissions/${Date.now()}_${image.name}`)
        await uploadBytes(imageRef, image)
        const url = await getDownloadURL(imageRef)
        imageUrls.push(url)
      }

      // Create submission in moderation queue
      const submissionData = {
        payload: {
          title: formData.title,
          description: formData.description,
          category: formData.category,
          tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
          location: {
            lat: parseFloat(formData.lat),
            lng: parseFloat(formData.lng),
          },
          address: formData.address,
          city: 'Bengaluru',
          neighbourhood: formData.neighbourhood,
          images: imageUrls,
          avgRating: 0,
          reactionCount: { like: 0, love: 0, save: 0 },
          contributors: [],
          meta: { views: 0, featuredScore: 0 },
        },
        submittedBy: user.uid,
        status: 'pending',
        submittedAt: serverTimestamp(),
      }

      await addDoc(collection(db, 'moderation_queue'), submissionData)
      
      // Show success message
      alert('🎉 Submission successful! Your place will be reviewed by our team.')
      navigate('/')
    } catch (error: any) {
      console.error('Submission error:', error)
      setError(error.message || 'Failed to submit. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="card-premium p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gradient mb-2">Share a Spot</h1>
          <p className="text-sm text-slate-400">
            Help the community discover amazing places in Bengaluru
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-2">
              Place Name *
            </label>
            <input
              id="title"
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded-xl border border-primary/30 bg-bg-warm px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="e.g., Indiranagar Night Café"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-xl border border-primary/30 bg-bg-warm px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="What makes this place special?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Category *
            </label>
            <div className="grid grid-cols-3 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: cat.id })}
                  className={`p-3 rounded-xl text-sm font-medium transition-all ${
                    formData.category === cat.id
                      ? 'bg-gradient-warm text-white shadow-glow'
                      : 'bg-bg-warm text-slate-400 border border-primary/20 hover:bg-primary/10'
                  }`}
                >
                  <div className="text-2xl mb-1">{cat.emoji}</div>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-slate-300 mb-2">
              Tags (comma-separated)
            </label>
            <input
              id="tags"
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full rounded-xl border border-primary/30 bg-bg-warm px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="e.g., late-night, coffee, vibes"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-slate-300 mb-2">
                Address *
              </label>
              <input
                id="address"
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full rounded-xl border border-primary/30 bg-bg-warm px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Full address"
              />
            </div>

            <div>
              <label htmlFor="neighbourhood" className="block text-sm font-medium text-slate-300 mb-2">
                Neighbourhood *
              </label>
              <input
                id="neighbourhood"
                type="text"
                required
                value={formData.neighbourhood}
                onChange={(e) => setFormData({ ...formData, neighbourhood: e.target.value })}
                className="w-full rounded-xl border border-primary/30 bg-bg-warm px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="e.g., Indiranagar"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Location *
            </label>
            <div className="flex gap-3">
              <input
                type="number"
                step="any"
                required
                value={formData.lat}
                onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                className="flex-1 rounded-xl border border-primary/30 bg-bg-warm px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Latitude"
              />
              <input
                type="number"
                step="any"
                required
                value={formData.lng}
                onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                className="flex-1 rounded-xl border border-primary/30 bg-bg-warm px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Longitude"
              />
              <button
                type="button"
                onClick={handleGetLocation}
                className="btn-secondary whitespace-nowrap"
              >
                📍 Get Location
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="images" className="block text-sm font-medium text-slate-300 mb-2">
              Images (up to 5)
            </label>
            <input
              id="images"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="w-full rounded-xl border border-primary/30 bg-bg-warm px-4 py-2.5 text-sm text-slate-100 file:mr-4 file:rounded-full file:border-0 file:bg-primary/20 file:px-4 file:py-1 file:text-xs file:font-semibold file:text-primary hover:file:bg-primary/30"
            />
            {images.length > 0 && (
              <p className="mt-2 text-xs text-slate-400">{images.length} file(s) selected</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              {loading ? 'Submitting...' : '🚀 Submit for Review'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-6 py-2.5 rounded-full border border-primary/30 text-sm font-semibold text-slate-400 hover:text-slate-100 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
