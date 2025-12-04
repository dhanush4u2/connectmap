import { useState } from 'react'
import { collection, doc, setDoc, Timestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'

const samplePlaces = [
  // Popular Cafes & Restaurants
  {
    placeId: 'cafe-indiranagar-1',
    title: 'Third Wave Coffee Roasters',
    description: 'Specialty coffee with single-origin beans, artisanal brewing methods, and cozy ambiance perfect for work or meetings.',
    category: 'food_cafe',
    subcategory: 'cafe',
    tags: ['coffee', 'wifi', 'work-friendly', 'specialty-coffee', 'brunch'],
    cuisine: ['Coffee', 'Continental'],
    location: { lat: 12.9784, lng: 77.6408 },
    address: '100 Feet Road, Indiranagar',
    city: 'Bengaluru',
    neighbourhood: 'Indiranagar',
    images: [],
    avgRating: 4.6,
    reactionCount: { like: 156, love: 89, save: 134 },
    foodPriceRange: '₹₹',
    timings: '8:00 AM - 11:00 PM',
    createdBy: 'seed',
    contributors: [],
    status: 'published',
    meta: { views: 2145, featuredScore: 453 },
  },
  {
    placeId: 'restaurant-koramangala-1',
    title: 'Truffles',
    description: 'Legendary burgers and American comfort food. Known for massive portions and the famous Truffles burger.',
    category: 'food_restaurant',
    subcategory: 'casual_dining',
    tags: ['burgers', 'american', 'casual', 'comfort-food', 'group-friendly'],
    cuisine: ['American', 'Continental'],
    location: { lat: 12.9352, lng: 77.6245 },
    address: 'St. Marks Road, Koramangala',
    city: 'Bengaluru',
    neighbourhood: 'Koramangala',
    images: [],
    avgRating: 4.4,
    reactionCount: { like: 312, love: 178, save: 245 },
    foodPriceRange: '₹₹',
    timings: '12:00 PM - 11:30 PM',
    createdBy: 'seed',
    contributors: [],
    status: 'published',
    meta: { views: 3856, featuredScore: 687 },
  },
  {
    placeId: 'restaurant-malleshwaram-1',
    title: "Brahmin's Coffee Bar",
    description: 'Iconic South Indian breakfast spot serving authentic idlis, vadas, and filter coffee since 1965.',
    category: 'food_restaurant',
    subcategory: 'casual_dining',
    tags: ['south-indian', 'breakfast', 'authentic', 'traditional', 'budget-friendly'],
    cuisine: ['South Indian'],
    location: { lat: 13.0067, lng: 77.5703 },
    address: '1st Cross Road, Malleshwaram',
    city: 'Bengaluru',
    neighbourhood: 'Malleshwaram',
    images: [],
    avgRating: 4.7,
    reactionCount: { like: 289, love: 234, save: 198 },
    foodPriceRange: '₹',
    timings: '6:30 AM - 11:00 AM, 3:30 PM - 8:30 PM',
    createdBy: 'seed',
    contributors: [],
    status: 'published',
    meta: { views: 2934, featuredScore: 612 },
  },
  {
    placeId: 'brewery-indiranagar-1',
    title: 'Toit Brewpub',
    description: 'Craft microbrewery with wood-fired pizzas, live sports screening, and a vibrant atmosphere.',
    category: 'food_restaurant',
    subcategory: 'brewery',
    tags: ['craft-beer', 'brewery', 'pizza', 'sports-bar', 'nightlife'],
    cuisine: ['Continental', 'Italian'],
    location: { lat: 12.9716, lng: 77.6412 },
    address: '298, 100 Feet Road, Indiranagar',
    city: 'Bengaluru',
    neighbourhood: 'Indiranagar',
    images: [],
    avgRating: 4.5,
    reactionCount: { like: 421, love: 267, save: 356 },
    foodPriceRange: '₹₹₹',
    timings: '12:00 PM - 12:00 AM',
    createdBy: 'seed',
    contributors: [],
    status: 'published',
    meta: { views: 4523, featuredScore: 894 },
  },
  {
    placeId: 'cafe-whitefield-1',
    title: 'Blue Tokai Coffee Roasters',
    description: 'Premium specialty coffee roastery offering pour-overs, cold brews, and coffee workshops.',
    category: 'food_cafe',
    subcategory: 'cafe',
    tags: ['specialty-coffee', 'pour-over', 'coffee-workshop', 'artisanal', 'premium'],
    cuisine: ['Coffee', 'Bakery'],
    location: { lat: 12.9698, lng: 77.7499 },
    address: 'ITPL Main Road, Whitefield',
    city: 'Bengaluru',
    neighbourhood: 'Whitefield',
    images: [],
    avgRating: 4.6,
    reactionCount: { like: 178, love: 123, save: 156 },
    foodPriceRange: '₹₹',
    timings: '8:00 AM - 10:00 PM',
    createdBy: 'seed',
    contributors: [],
    status: 'published',
    meta: { views: 1876, featuredScore: 398 },
  },
  {
    placeId: 'restaurant-church-street-1',
    title: "Koshy's Restaurant",
    description: 'Heritage restaurant since 1940, serving continental cuisine in a nostalgic old-world setting.',
    category: 'food_restaurant',
    subcategory: 'fine_dining',
    tags: ['heritage', 'continental', 'historic', 'old-bangalore', 'classic'],
    cuisine: ['Continental', 'Indian'],
    location: { lat: 12.9716, lng: 77.6033 },
    address: 'St. Marks Road, Church Street',
    city: 'Bengaluru',
    neighbourhood: 'Church Street',
    images: [],
    avgRating: 4.3,
    reactionCount: { like: 234, love: 189, save: 167 },
    foodPriceRange: '₹₹',
    timings: '8:30 AM - 11:00 PM',
    createdBy: 'seed',
    contributors: [],
    status: 'published',
    meta: { views: 2567, featuredScore: 521 },
  },
  {
    placeId: 'restaurant-jayanagar-1',
    title: 'MTR (Mavalli Tiffin Room)',
    description: 'Legendary restaurant serving authentic South Indian vegetarian tiffin since 1924.',
    category: 'food_restaurant',
    subcategory: 'casual_dining',
    tags: ['south-indian', 'vegetarian', 'heritage', 'authentic', 'traditional'],
    cuisine: ['South Indian'],
    location: { lat: 12.9250, lng: 77.5838 },
    address: 'Lalbagh Road, Mavalli',
    city: 'Bengaluru',
    neighbourhood: 'Jayanagar',
    images: [],
    avgRating: 4.5,
    reactionCount: { like: 412, love: 356, save: 289 },
    foodPriceRange: '₹₹',
    timings: '6:30 AM - 11:00 AM, 12:30 PM - 3:30 PM, 3:30 PM - 8:30 PM',
    createdBy: 'seed',
    contributors: [],
    status: 'published',
    meta: { views: 3782, featuredScore: 756 },
  },

  // Activities & Entertainment
  {
    placeId: 'activity-indiranagar-1',
    title: 'Smaaash',
    description: 'High-energy gaming and sports arcade with virtual reality experiences, bowling, and cricket simulators.',
    category: 'activity',
    subcategory: 'gaming',
    tags: ['arcade', 'bowling', 'vr', 'gaming', 'family-friendly', 'sports'],
    location: { lat: 12.9698, lng: 77.6387 },
    address: 'CMH Road, Indiranagar',
    city: 'Bengaluru',
    neighbourhood: 'Indiranagar',
    images: [],
    avgRating: 4.4,
    reactionCount: { like: 298, love: 156, save: 234 },
    timings: '11:00 AM - 11:00 PM',
    createdBy: 'seed',
    contributors: [],
    status: 'published',
    meta: { views: 2145, featuredScore: 489 },
  },
  {
    placeId: 'activity-koramangala-1',
    title: 'Climb Central',
    description: 'Indoor rock climbing and bouldering gym with routes for all skill levels.',
    category: 'activity',
    subcategory: 'sports',
    tags: ['climbing', 'bouldering', 'fitness', 'adventure', 'indoor-sports'],
    location: { lat: 12.9279, lng: 77.6271 },
    address: '7th Block, Koramangala',
    city: 'Bengaluru',
    neighbourhood: 'Koramangala',
    images: [],
    avgRating: 4.6,
    reactionCount: { like: 167, love: 134, save: 178 },
    timings: '6:00 AM - 10:00 PM',
    createdBy: 'seed',
    contributors: [],
    status: 'published',
    meta: { views: 1456, featuredScore: 367 },
  },
  {
    placeId: 'activity-jayanagar-1',
    title: 'Rangashankara Theatre',
    description: 'Premier theatre space showcasing plays in Kannada, English, and Hindi. Hub for performing arts.',
    category: 'activity',
    subcategory: 'arts',
    tags: ['theatre', 'plays', 'performing-arts', 'culture', 'entertainment'],
    location: { lat: 12.9250, lng: 77.5838 },
    address: 'JP Nagar, Near Jayadeva Hospital',
    city: 'Bengaluru',
    neighbourhood: 'JP Nagar',
    images: [],
    avgRating: 4.7,
    reactionCount: { like: 234, love: 198, save: 212 },
    timings: 'Show timings vary',
    createdBy: 'seed',
    contributors: [],
    status: 'published',
    meta: { views: 1876, featuredScore: 423 },
  },
  {
    placeId: 'activity-ulsoor-1',
    title: 'Ulsoor Lake',
    description: 'Scenic urban lake perfect for boating, jogging, and peaceful evening walks.',
    category: 'activity',
    subcategory: 'outdoor',
    tags: ['lake', 'boating', 'jogging', 'outdoor', 'nature', 'peaceful'],
    location: { lat: 12.9813, lng: 77.6196 },
    address: 'Ulsoor, Near MG Road',
    city: 'Bengaluru',
    neighbourhood: 'Ulsoor',
    images: [],
    avgRating: 4.2,
    reactionCount: { like: 312, love: 245, save: 267 },
    timings: '6:00 AM - 6:00 PM',
    createdBy: 'seed',
    contributors: [],
    status: 'published',
    meta: { views: 2934, featuredScore: 598 },
  },
  {
    placeId: 'activity-lalbagh-1',
    title: 'Lalbagh Botanical Garden',
    description: 'Historic 240-acre garden with rare plant species, glasshouse, and iconic rock formation.',
    category: 'activity',
    subcategory: 'outdoor',
    tags: ['garden', 'botanical', 'nature', 'heritage', 'photography', 'picnic'],
    location: { lat: 12.9507, lng: 77.5848 },
    address: 'Mavalli, Near Jayanagar',
    city: 'Bengaluru',
    neighbourhood: 'Mavalli',
    images: [],
    avgRating: 4.6,
    reactionCount: { like: 489, love: 398, save: 423 },
    timings: '6:00 AM - 7:00 PM',
    createdBy: 'seed',
    contributors: [],
    status: 'published',
    meta: { views: 5234, featuredScore: 967 },
  },
  {
    placeId: 'activity-cubbon-park-1',
    title: 'Cubbon Park',
    description: 'Massive urban green lung with walking trails, heritage buildings, and lush greenery.',
    category: 'activity',
    subcategory: 'outdoor',
    tags: ['park', 'jogging', 'cycling', 'nature', 'heritage', 'photography'],
    location: { lat: 12.9762, lng: 77.5929 },
    address: 'MG Road, Shivaji Nagar',
    city: 'Bengaluru',
    neighbourhood: 'MG Road',
    images: [],
    avgRating: 4.5,
    reactionCount: { like: 567, love: 445, save: 501 },
    timings: '6:00 AM - 6:00 PM',
    createdBy: 'seed',
    contributors: [],
    status: 'published',
    meta: { views: 6123, featuredScore: 1089 },
  },

  // Movies & Entertainment
  {
    placeId: 'movie-koramangala-1',
    title: 'PVR Koramangala',
    description: 'Premium multiplex with IMAX, 4DX, and luxury recliners. Latest blockbusters and regional cinema.',
    category: 'movie',
    subcategory: 'multiplex',
    tags: ['imax', '4dx', 'multiplex', 'premium', 'latest-releases'],
    location: { lat: 12.9352, lng: 77.6245 },
    address: 'Forum Mall, Koramangala',
    city: 'Bengaluru',
    neighbourhood: 'Koramangala',
    images: [],
    avgRating: 4.4,
    reactionCount: { like: 445, love: 334, save: 398 },
    timings: 'Show timings vary',
    createdBy: 'seed',
    contributors: [],
    status: 'published',
    meta: { views: 4234, featuredScore: 812 },
  },
  {
    placeId: 'movie-whitefield-1',
    title: 'INOX Whitefield',
    description: 'Modern multiplex with Dolby Atmos, premium seating, and wide food court.',
    category: 'movie',
    subcategory: 'multiplex',
    tags: ['dolby-atmos', 'multiplex', 'premium', 'food-court', 'family-friendly'],
    location: { lat: 12.9698, lng: 77.7499 },
    address: 'Phoenix Marketcity, Whitefield',
    city: 'Bengaluru',
    neighbourhood: 'Whitefield',
    images: [],
    avgRating: 4.3,
    reactionCount: { like: 389, love: 289, save: 334 },
    timings: 'Show timings vary',
    createdBy: 'seed',
    contributors: [],
    status: 'published',
    meta: { views: 3567, featuredScore: 689 },
  },
  {
    placeId: 'movie-rajajinagar-1',
    title: 'Gopalan Cinemas',
    description: 'Affordable multiplex with comfortable seating and great sound system.',
    category: 'movie',
    subcategory: 'multiplex',
    tags: ['affordable', 'multiplex', 'family-friendly', 'comfortable'],
    location: { lat: 12.9916, lng: 77.5571 },
    address: 'Gopalan Mall, Rajajinagar',
    city: 'Bengaluru',
    neighbourhood: 'Rajajinagar',
    images: [],
    avgRating: 4.2,
    reactionCount: { like: 267, love: 198, save: 234 },
    timings: 'Show timings vary',
    createdBy: 'seed',
    contributors: [],
    status: 'published',
    meta: { views: 2456, featuredScore: 512 },
  },
]

export default function SeedDataPage() {
  const [status, setStatus] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [seededCount, setSeededCount] = useState(0)

  const seedPlaces = async () => {
    setLoading(true)
    setStatus('🌱 Starting to seed places...')
    setSeededCount(0)

    try {
      const placesCol = collection(db, 'places')
      
      for (const place of samplePlaces) {
        const ref = doc(placesCol, place.placeId)
        await setDoc(ref, {
          ...place,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        })
        setSeededCount(prev => prev + 1)
        setStatus(`✅ Seeded: ${place.title} (${seededCount + 1}/${samplePlaces.length})`)
      }

      setStatus(`🎉 Success! Seeded ${samplePlaces.length} places to Firebase`)
    } catch (error) {
      console.error('Seeding error:', error)
      setStatus(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">🌱 Seed Places Data</h1>
        <p className="text-gray-600 mb-6">
          Click the button below to upload {samplePlaces.length} sample Bangalore places to Firebase.
        </p>

        <button
          onClick={seedPlaces}
          disabled={loading}
          className={`w-full py-4 px-6 rounded-lg font-semibold text-white text-lg transition-all ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transform hover:scale-105'
          }`}
        >
          {loading ? '⏳ Seeding...' : '🚀 Seed Places Now'}
        </button>

        {status && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-mono whitespace-pre-wrap">{status}</p>
            {seededCount > 0 && (
              <div className="mt-2 bg-blue-100 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(seededCount / samplePlaces.length) * 100}%` }}
                />
              </div>
            )}
          </div>
        )}

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h2 className="font-semibold text-blue-800 mb-2">📍 Places to be seeded:</h2>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>☕ 7 Cafes & Restaurants (Third Wave, Truffles, Brahmin's, Toit, etc.)</li>
            <li>🎮 6 Activities (Smaaash, Climb Central, Lalbagh, Cubbon Park, etc.)</li>
            <li>🎬 3 Movie Theaters (PVR, INOX, Gopalan)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
