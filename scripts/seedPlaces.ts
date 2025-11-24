import { collection, doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from './firebase.node'

const samplePlaces = [
  {
    placeId: 'cafe-indiranagar-1',
    title: 'Indiranagar Night Café',
    description: 'Late-night coffee & conversations with soft lighting and cozy vibes.',
    category: 'food_cafe',
    tags: ['late-night', 'coffee', 'vibes', 'wifi'],
    location: { lat: 12.9784, lng: 77.6408 },
    address: '100 Feet Road, Indiranagar',
    city: 'Bengaluru',
    neighbourhood: 'Indiranagar',
    images: [],
    avgRating: 4.6,
    reactionCount: { like: 23, love: 12, save: 18 },
    createdBy: 'seed',
    contributors: [],
    status: 'published',
    meta: { views: 145, featuredScore: 53 },
  },
  {
    placeId: 'activity-koramangala-1',
    title: 'Go-Karting Arena',
    description: 'Thrilling indoor go-kart racing with professional tracks and safety gear.',
    category: 'activities',
    tags: ['adrenaline', 'sports', 'friends', 'racing'],
    location: { lat: 12.9352, lng: 77.6245 },
    address: 'Koramangala 4th Block',
    city: 'Bengaluru',
    neighbourhood: 'Koramangala',
    images: [],
    avgRating: 4.8,
    reactionCount: { like: 45, love: 28, save: 32 },
    createdBy: 'seed',
    contributors: [],
    status: 'published',
    meta: { views: 256, featuredScore: 105 },
  },
  {
    placeId: 'movie-whitefield-1',
    title: 'Cineplex IMAX',
    description: 'State-of-the-art IMAX theater with premium seating and Dolby Atmos sound.',
    category: 'movies',
    tags: ['imax', 'cinema', 'date', 'premium'],
    location: { lat: 12.9698, lng: 77.7499 },
    address: 'ITPL Main Road, Whitefield',
    city: 'Bengaluru',
    neighbourhood: 'Whitefield',
    images: [],
    avgRating: 4.7,
    reactionCount: { like: 67, love: 41, save: 55 },
    createdBy: 'seed',
    contributors: [],
    status: 'published',
    meta: { views: 389, featuredScore: 163 },
  },
  {
    placeId: 'cafe-mg-road-1',
    title: 'Artisan Coffee House',
    description: 'Specialty coffee roasted in-house with artisanal pastries and brunch menu.',
    category: 'food_cafe',
    tags: ['brunch', 'coffee', 'artisan', 'instagram'],
    location: { lat: 12.9756, lng: 77.6068 },
    address: 'MG Road, Brigade Road',
    city: 'Bengaluru',
    neighbourhood: 'MG Road',
    images: [],
    avgRating: 4.5,
    reactionCount: { like: 34, love: 19, save: 28 },
    createdBy: 'seed',
    contributors: [],
    status: 'published',
    meta: { views: 198, featuredScore: 81 },
  },
  {
    placeId: 'activity-hsr-1',
    title: 'Urban Climbing Wall',
    description: 'Indoor rock climbing facility with routes for all skill levels and expert instructors.',
    category: 'activities',
    tags: ['fitness', 'climbing', 'adventure', 'training'],
    location: { lat: 12.9121, lng: 77.6446 },
    address: 'HSR Layout Sector 1',
    city: 'Bengaluru',
    neighbourhood: 'HSR Layout',
    images: [],
    avgRating: 4.9,
    reactionCount: { like: 52, love: 38, save: 44 },
    createdBy: 'seed',
    contributors: [],
    status: 'published',
    meta: { views: 312, featuredScore: 134 },
  },
]

async function main() {
  const placesCol = collection(db, 'places')

  for (const p of samplePlaces) {
    const ref = doc(placesCol, p.placeId)
    await setDoc(ref, {
      ...p,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    console.log('Seeded', p.placeId)
  }
}

main().then(
  () => {
    console.log('✅ Seeding complete!')
    process.exit(0)
  },
  (err) => {
    console.error('❌ Seeding failed:', err)
    process.exit(1)
  },
)
