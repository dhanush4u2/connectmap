# Implementation Guide for New Features

## Overview
This guide will help you implement the following features:
1. Google Maps link parsing for easy location input
2. Admin role system with admin dashboard access control
3. Category-specific form fields (Food/Cafe, Movies, Activities)
4. Subcategory system with unique map icons
5. Click-to-measure distance on map
6. Dynamic category management by admins

## Step 1: Google Maps Link Parsing ✅

The maps parser utility has been created at `src/lib/mapsParser.ts`. This file contains functions to:
- Parse various Google Maps URL formats
- Extract coordinates, names, and addresses
- Fetch additional details using reverse geocoding

**Usage in SubmitPage:**
```tsx
import { processMapLink, isGoogleMapsLink } from '../lib/mapsParser'

// Add to form state
const [formData, setFormData] = useState({
  // ... existing fields
  mapLink: '',
})

// Handle map link paste
const handleMapLinkPaste = async (value: string) => {
  setFormData({ ...formData, mapLink: value })
  
  if (isGoogleMapsLink(value)) {
    setParsingLink(true)
    const parsed = await processMapLink(value)
    if (parsed) {
      setFormData(prev => ({
        ...prev,
        lat: parsed.lat.toString(),
        lng: parsed.lng.toString(),
        title: parsed.name || prev.title,
        address: parsed.address || prev.address,
      }))
    }
    setParsingLink(false)
  }
}
```

## Step 2: Admin Role System

### 2.1 Create Admin Roles Collection in Firestore

In Firebase Console, create a new collection called `admin_roles`:

```json
{
  "uid": "user_firebase_uid",
  "email": "admin@example.com",
  "role": "admin", // or "moderator"
  "displayName": "Admin User",
  "photoURL": "url_to_photo",
  "createdAt": "timestamp",
  "createdBy": "creator_uid"
}
```

### 2.2 Create Admin Check Hook

Create `src/hooks/useAdminCheck.ts`:

```typescript
import { useState, useEffect } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuthState } from './useAuthState'

export function useAdminCheck() {
  const { user } = useAuthState()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAdmin() {
      if (!user) {
        setIsAdmin(false)
        setLoading(false)
        return
      }

      try {
        const adminDoc = await getDoc(doc(db, 'admin_roles', user.uid))
        setIsAdmin(adminDoc.exists() && adminDoc.data()?.role === 'admin')
      } catch (error) {
        console.error('Error checking admin status:', error)
        setIsAdmin(false)
      } finally {
        setLoading(false)
      }
    }

    checkAdmin()
  }, [user])

  return { isAdmin, loading }
}
```

### 2.3 Update TopNav to Show Admin Button

In `src/components/TopNav.tsx`, add:

```tsx
import { useAdminCheck } from '../hooks/useAdminCheck'

// Inside component:
const { isAdmin } = useAdminCheck()

// In the nav bar (after user profile button):
{isAdmin && (
  <button
    onClick={() => navigate('/admin')}
    className="btn-secondary text-xs px-3 py-2"
  >
    ⚙️ Admin
  </button>
)}
```

### 2.4 Protect Admin Route

In `src/pages/AdminDashboardPage.tsx`:

```tsx
import { useAdminCheck } from '../hooks/useAdminCheck'

export function AdminDashboardPage() {
  const { isAdmin, loading: adminLoading } = useAdminCheck()
  const navigate = useNavigate()

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      navigate('/')
    }
  }, [isAdmin, adminLoading, navigate])

  if (adminLoading) {
    return <LoadingSpinner />
  }

  // Rest of component...
}
```

## Step 3: Category-Specific Form Fields

The types file has been created at `src/types/index.ts` with all necessary types.

### Update SubmitPage.tsx

Replace the current SubmitPage with category-specific forms. Key changes:

1. **Food & Cafe Fields:**
   - Subcategory (cafe, restaurant, dhaba, stall)
   - Cuisine (comma-separated)
   - Price range
   - Timings
   - Contact number
   - Google Maps link input

2. **Movies Fields:**
   - Theater/Area instead of address
   - Release date
   - Director
   - Cast
   - Duration
   - IMDB rating
   - Genre
   - No location coordinates needed

3. **Activities Fields:**
   - Activity type selector
   - Duration
   - Price range
   - Contact number
   - Google Maps link input

## Step 4: Subcategory Icons on Map

### 4.1 Create Icon Components

Create `src/lib/mapIcons.tsx`:

```tsx
import { divIcon } from 'leaflet'
import { renderToStaticMarkup } from 'react-dom/server'

// Food subcategory icons
export const foodIcons = {
  cafe: divIcon({
    html: renderToStaticMarkup(
      <div className="marker-wrapper">
        <div className="marker-pulse" style={{ background: 'rgba(139, 69, 19, 0.3)' }} />
        <div className="marker-dot" style={{ background: 'linear-gradient(135deg, #8B4513 0%, #D2691E 100%)' }}>
          ☕
        </div>
      </div>
    ),
    className: 'custom-marker-container',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  }),
  
  restaurant: divIcon({
    html: renderToStaticMarkup(
      <div className="marker-wrapper">
        <div className="marker-pulse" style={{ background: 'rgba(255, 107, 44, 0.3)' }} />
        <div className="marker-dot" style={{ background: 'linear-gradient(135deg, #ff6b2c 0%, #ffb340 100%)' }}>
          🍽️
        </div>
      </div>
    ),
    className: 'custom-marker-container',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  }),

  dhaba: divIcon({
    html: renderToStaticMarkup(
      <div className="marker-wrapper">
        <div className="marker-pulse" style={{ background: 'rgba(255, 140, 0, 0.3)' }} />
        <div className="marker-dot" style={{ background: 'linear-gradient(135deg, #FF8C00 0%, #FFA500 100%)' }}>
          🏪
        </div>
      </div>
    ),
    className: 'custom-marker-container',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  }),

  stall: divIcon({
    html: renderToStaticMarkup(
      <div className="marker-wrapper">
        <div className="marker-pulse" style={{ background: 'rgba(255, 215, 0, 0.3)' }} />
        <div className="marker-dot" style={{ background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' }}>
          🛒
        </div>
      </div>
    ),
    className: 'custom-marker-container',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  }),
}

// Activity icons
export const activityIcons = {
  go_karting: divIcon({
    html: renderToStaticMarkup(
      <div className="marker-wrapper">
        <div className="marker-pulse" style={{ background: 'rgba(255, 0, 0, 0.3)' }} />
        <div className="marker-dot" style={{ background: 'linear-gradient(135deg, #FF0000 0%, #FF4500 100%)' }}>
          🏎️
        </div>
      </div>
    ),
    className: 'custom-marker-container',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  }),

  university: divIcon({
    html: renderToStaticMarkup(
      <div className="marker-wrapper">
        <div className="marker-pulse" style={{ background: 'rgba(0, 100, 200, 0.3)' }} />
        <div className="marker-dot" style={{ background: 'linear-gradient(135deg, #0064C8 0%, #4A90E2 100%)' }}>
          🎓
        </div>
      </div>
    ),
    className: 'custom-marker-container',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  }),

  sports: divIcon({
    html: renderToStaticMarkup(
      <div className="marker-wrapper">
        <div className="marker-pulse" style={{ background: 'rgba(0, 200, 100, 0.3)' }} />
        <div className="marker-dot" style={{ background: 'linear-gradient(135deg, #00C864 0%, #00E676 100%)' }}>
          ⚽
        </div>
      </div>
    ),
    className: 'custom-marker-container',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  }),

  // Add more activity types...
}

export function getMarkerIcon(category: string, subcategory?: string) {
  if (category === 'food_cafe' && subcategory && foodIcons[subcategory as keyof typeof foodIcons]) {
    return foodIcons[subcategory as keyof typeof foodIcons]
  }
  
  if (category === 'activities' && subcategory && activityIcons[subcategory as keyof typeof activityIcons]) {
    return activityIcons[subcategory as keyof typeof activityIcons]
  }
  
  // Default icon
  return foodIcons.restaurant
}
```

### 4.2 Update MapView to Use Dynamic Icons

In `src/components/MapView.tsx`:

```tsx
import { getMarkerIcon } from '../lib/mapIcons'

// In the marker rendering:
<Marker
  key={place.placeId}
  position={[place.location.lat, place.location.lng]}
  icon={getMarkerIcon(place.category, place.subcategory)}
>
  {/* popup content */}
</Marker>
```

## Step 5: Click-to-Measure Distance

### 5.1 Add Click Handler to Map

In `src/components/MapView.tsx`:

```tsx
import { useMapEvents } from 'react-leaflet'

function MapClickHandler({ onMapClick }: { onMapClick: (latlng: any) => void }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng)
    },
  })
  return null
}

// In MapView component:
const [referencePoint, setReferencePoint] = useState<{ lat: number; lng: number } | null>(null)
const [showDistances, setShowDistances] = useState(false)

const handleMapClick = (latlng: any) => {
  setReferencePoint({ lat: latlng.lat, lng: latlng.lng })
  setShowDistances(true)
}

// Calculate distance function (Haversine formula)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371 // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return (R * c).toFixed(2) // Distance in km
}

// In the map container:
<MapContainer>
  {/* ... existing layers */}
  <MapClickHandler onMapClick={handleMapClick} />
  
  {referencePoint && (
    <Marker position={[referencePoint.lat, referencePoint.lng]}>
      <Popup>
        <div>
          <h3>Reference Point</h3>
          <button onClick={() => setReferencePoint(null)}>Clear</button>
        </div>
      </Popup>
    </Marker>
  )}
  
  {places.map((place) => {
    const distance = referencePoint && place.location?.lat && place.location?.lng
      ? calculateDistance(referencePoint.lat, referencePoint.lng, place.location.lat, place.location.lng)
      : null
    
    return (
      <Marker key={place.placeId} /* ... */>
        <Popup>
          {/* existing popup content */}
          {distance && (
            <div className="mt-2 pt-2 border-t border-primary/20">
              <p className="text-xs text-slate-400">
                📏 Distance: {distance} km from selected point
              </p>
            </div>
          )}
        </Popup>
      </Marker>
    )
  })}
</MapContainer>
```

## Step 6: Dynamic Category Management

### 6.1 Create Categories Collection in Firestore

Structure:
```json
{
  "id": "food_cafe",
  "label": "Food & Café",
  "emoji": "🍽️",
  "createdAt": "timestamp",
  "createdBy": "admin_uid"
}
```

### 6.2 Add Category Management to Admin Dashboard

Create `src/components/CategoryManager.tsx`:

```tsx
import { useState, useEffect } from 'react'
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuthState } from '../hooks/useAuthState'
import type { Category } from '../types'

export function CategoryManager() {
  const { user } = useAuthState()
  const [categories, setCategories] = useState<Category[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [newCategory, setNewCategory] = useState({ id: '', label: '', emoji: '' })

  useEffect(() => {
    fetchCategories()
  }, [])

  async function fetchCategories() {
    const snapshot = await getDocs(collection(db, 'categories'))
    const cats: Category[] = []
    snapshot.forEach((doc) => {
      cats.push({ id: doc.id, ...doc.data() } as Category)
    })
    setCategories(cats)
  }

  async function handleAddCategory() {
    if (!newCategory.id || !newCategory.label || !newCategory.emoji) {
      alert('Please fill all fields')
      return
    }

    try {
      await addDoc(collection(db, 'categories'), {
        ...newCategory,
        createdAt: serverTimestamp(),
        createdBy: user?.uid,
      })
      
      setNewCategory({ id: '', label: '', emoji: '' })
      setIsAdding(false)
      fetchCategories()
      alert('Category added successfully!')
    } catch (error) {
      console.error('Error adding category:', error)
      alert('Failed to add category')
    }
  }

  async function handleDeleteCategory(id: string) {
    if (!confirm('Are you sure you want to delete this category?')) return

    try {
      await deleteDoc(doc(db, 'categories', id))
      fetchCategories()
      alert('Category deleted successfully!')
    } catch (error) {
      console.error('Error deleting category:', error)
      alert('Failed to delete category')
    }
  }

  return (
    <div className="card-premium p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gradient">Manage Categories</h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="btn-primary text-sm px-4 py-2"
        >
          {isAdding ? 'Cancel' : '+ Add Category'}
        </button>
      </div>

      {isAdding && (
        <div className="mb-6 p-4 rounded-xl bg-bg-warm border border-primary/20">
          <div className="grid grid-cols-3 gap-3 mb-3">
            <input
              type="text"
              placeholder="ID (e.g., food_cafe)"
              value={newCategory.id}
              onChange={(e) => setNewCategory({ ...newCategory, id: e.target.value })}
              className="rounded-xl border border-primary/30 bg-bg px-3 py-2 text-sm text-slate-100"
            />
            <input
              type="text"
              placeholder="Label (e.g., Food & Café)"
              value={newCategory.label}
              onChange={(e) => setNewCategory({ ...newCategory, label: e.target.value })}
              className="rounded-xl border border-primary/30 bg-bg px-3 py-2 text-sm text-slate-100"
            />
            <input
              type="text"
              placeholder="Emoji (e.g., 🍽️)"
              value={newCategory.emoji}
              onChange={(e) => setNewCategory({ ...newCategory, emoji: e.target.value })}
              className="rounded-xl border border-primary/30 bg-bg px-3 py-2 text-sm text-slate-100"
            />
          </div>
          <button
            onClick={handleAddCategory}
            className="btn-primary w-full text-sm"
          >
            Add Category
          </button>
        </div>
      )}

      <div className="space-y-3">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="flex items-center justify-between p-4 rounded-xl bg-bg-warm border border-primary/20"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{cat.emoji}</span>
              <div>
                <p className="font-semibold text-slate-100">{cat.label}</p>
                <p className="text-xs text-slate-400">{cat.id}</p>
              </div>
            </div>
            <button
              onClick={() => handleDeleteCategory(cat.id)}
              className="px-4 py-2 rounded-full text-xs font-semibold text-red-400 border border-red-500/30 hover:bg-red-500/10 transition"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### 6.3 Add to Admin Dashboard

In `src/pages/AdminDashboardPage.tsx`, add a new tab for category management:

```tsx
import { CategoryManager } from '../components/CategoryManager'

// Add tab state
const [activeTab, setActiveTab] = useState<'submissions' | 'categories' | 'admins'>('submissions')

// Add tab navigation
<div className="flex gap-2 p-4 border-b border-primary/20">
  <button
    onClick={() => setActiveTab('submissions')}
    className={`px-4 py-2 rounded-xl text-sm font-medium ${
      activeTab === 'submissions' ? 'bg-gradient-warm text-white' : 'text-slate-400'
    }`}
  >
    Submissions
  </button>
  <button
    onClick={() => setActiveTab('categories')}
    className={`px-4 py-2 rounded-xl text-sm font-medium ${
      activeTab === 'categories' ? 'bg-gradient-warm text-white' : 'text-slate-400'
    }`}
  >
    Categories
  </button>
  <button
    onClick={() => setActiveTab('admins')}
    className={`px-4 py-2 rounded-xl text-sm font-medium ${
      activeTab === 'admins' ? 'bg-gradient-warm text-white' : 'text-slate-400'
    }`}
  >
    Admins
  </button>
</div>

// Render appropriate content
{activeTab === 'submissions' && /* existing submission moderation */}
{activeTab === 'categories' && <CategoryManager />}
{activeTab === 'admins' && <AdminManager />}
```

## Implementation Order

1. ✅ Implement maps parser (already done)
2. Add admin role check hook and update TopNav
3. Set up admin_roles collection in Firestore and add yourself as admin
4. Update SubmitPage with category-specific forms
5. Create map icons for subcategories
6. Update MapView to use dynamic icons
7. Add click-to-measure distance feature
8. Implement category management in admin dashboard

## Firebase Security Rules

Update your Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Admin roles - only admins can read/write
    match /admin_roles/{userId} {
      allow read: if request.auth != null && 
                  exists(/databases/$(database)/documents/admin_roles/$(request.auth.uid));
      allow write: if request.auth != null && 
                   exists(/databases/$(database)/documents/admin_roles/$(request.auth.uid));
    }
    
    // Categories - anyone can read, only admins can write
    match /categories/{categoryId} {
      allow read: if true;
      allow write: if request.auth != null && 
                   exists(/databases/$(database)/documents/admin_roles/$(request.auth.uid));
    }
    
    // Places - published places are public, others require auth
    match /places/{placeId} {
      allow read: if resource.data.status == 'published' || request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
                            exists(/databases/$(database)/documents/admin_roles/$(request.auth.uid));
    }
    
    // Moderation queue - only authenticated users can read their own, admins can read all
    match /moderation_queue/{submissionId} {
      allow read: if request.auth != null && 
                  (resource.data.submittedBy == request.auth.uid || 
                   exists(/databases/$(database)/documents/admin_roles/$(request.auth.uid)));
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
                            exists(/databases/$(database)/documents/admin_roles/$(request.auth.uid));
    }
  }
}
```

## Testing Checklist

- [ ] Google Maps link parsing works with various URL formats
- [ ] Admin button only appears for admin users
- [ ] Admin dashboard is protected and only accessible to admins
- [ ] Food/Cafe form shows subcategory selection and relevant fields
- [ ] Movies form shows movie-specific fields (no coordinates)
- [ ] Activities form shows activity type and relevant fields
- [ ] Different icons appear on map based on subcategory
- [ ] Clicking map creates reference point for distance measurement
- [ ] Distances are calculated and displayed in popups
- [ ] Admins can add/delete categories
- [ ] New categories appear dynamically in forms and filters
- [ ] All submissions go to moderation queue regardless of category

## Next Steps

Once you implement these features, you can enhance further with:
- Admin management panel to add/remove admins
- Bulk import of universities and landmarks
- Advanced filtering and search
- User distance-based recommendations
- Routing/directions integration with Google Maps
