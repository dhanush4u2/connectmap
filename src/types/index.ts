// Common types used across the application

export interface Category {
  id: string
  label: string
  emoji: string
  subcategories?: Subcategory[]
}

export interface Subcategory {
  id: string
  label: string
  icon: string
}

export interface Place {
  placeId: string
  title?: string
  description?: string
  category?: string
  subcategory?: string // For food_cafe: cafe, restaurant, dhaba, stall
  tags?: string[]
  location?: { lat?: number; lng?: number }
  address?: string
  city?: string
  neighbourhood?: string
  images?: string[]
  avgRating?: number
  reactionCount?: { like?: number; love?: number; save?: number }
  
  // Movie-specific fields
  releaseDate?: string
  director?: string
  cast?: string[]
  movieDuration?: number // in minutes
  imdbRating?: number
  genre?: string[]
  
  // Activity-specific fields
  activityType?: string // go-karting, university, etc.
  activityDuration?: number // in minutes
  activityPriceRange?: string
  
  // Food-specific fields
  cuisine?: string[]
  foodPriceRange?: string
  timings?: string
  contactNumber?: string
  
  // Metadata
  createdBy?: string
  status?: 'published' | 'pending' | 'rejected'
  createdAt?: any
  updatedAt?: any
  meta?: {
    views?: number
    featuredScore?: number
  }
}

export interface UserRole {
  uid: string
  email: string
  role: 'admin' | 'moderator' | 'user'
  displayName?: string
  photoURL?: string
  createdAt?: any
}

export interface UserProfile {
  uid: string
  email: string
  displayName?: string
  photoURL?: string
  avatarEmoji?: string // Preset emoji avatar
  username?: string // Searchable unique username
  bio?: string
  createdAt?: any
  updatedAt?: any
  savedPlaces?: string[] // Array of placeIds
  friends?: string[] // Array of friend UIDs
  friendCount?: number
  placesCount?: number
  tasteProfileId?: string // Reference to taste_profiles
  connectScore?: number // Gamification score
  hasCompletedOnboarding?: boolean
  privacy?: {
    showPlacesToFriends?: boolean
    publicProfile?: boolean
    anonymousMode?: boolean
  }
  // XP and Level System
  xp?: number // Total XP earned
  level?: number // Overall level (100 XP = 1 level)
  foodieLevel?: number // Food-specific level
  explorerLevel?: number // Exploration level
  curatorLevel?: number // Curation/review level
  socialLevel?: number // Social interaction level
  // Achievements
  achievements?: string[] // Array of achievement IDs
  unlockedAchievements?: number // Count of unlocked achievements
  totalAchievements?: number // Total available achievements
  // Admin
  isAdmin?: boolean
}

export interface FriendRequest {
  id: string
  fromUserId: string
  toUserId: string
  fromUserName?: string
  fromUserPhoto?: string
  status: 'pending' | 'accepted' | 'rejected'
  createdAt?: any
}

export interface Friendship {
  id: string
  user1Id: string
  user2Id: string
  createdAt?: any
}

export interface MutualSave {
  id: string
  placeId: string
  userIds: string[] // Users who saved this place
  notifiedAt?: any
}

// Onboarding & Taste Profile Types

export type HangoutEnergy = 'chill' | 'balanced' | 'lively' | 'electric'
export type GroupSize = 'solo' | '1-2' | '3-5' | 'crowd'
export type DayPreference = 'morning_runner' | 'coffee_hours' | 'sunset_explorer' | 'night_owl'
export type Ambiance = 'rooftop' | 'cozy_cafe' | 'lofi_study' | 'lively_pub' | 'nature_spot' | 'aesthetic_minimal'
export type Activity = 'eat' | 'walk' | 'chill' | 'party' | 'explore' | 'shoot_photos'
export type BudgetTier = 'cheap' | 'mid' | 'treat'
export type TravelMode = 'walk' | 'bike' | 'cab' | 'public_transport'
export type WeekendType = 'plan_ahead' | 'spontaneous' | 'mix'
export type PhotoPreference = 'post_photos' | 'keep_private'

export type PersonaType = 
  | 'neon_nomad' 
  | 'biscotti_botanist' 
  | 'budget_ranger' 
  | 'sunrise_cartographer' 
  | 'quiet_curator' 
  | 'spontaneity_engine' 
  | 'tactile_foodsmith' 
  | 'photo_pilgrim'

export interface OnboardingSheet1 {
  hangoutEnergy: HangoutEnergy
  socialBattery: number // 0-100
  groupSize: GroupSize[]
  dayPreferences: DayPreference[]
}

export interface OnboardingSheet2 {
  topFoodStyles: string[] // Up to 3
  favoriteAmbiances: Ambiance[]
  activityPreferences: Activity[]
  budgetTier: BudgetTier
}

export interface OnboardingSheet3 {
  travelMode: TravelMode[]
  weekendType: WeekendType
  newPlaceFrequency: number // 0-100 slider
  photoPreference: PhotoPreference
}

export interface OnboardingSheet4 {
  personaKeyword: PersonaType
  freeTags: string[] // Up to 6
  privacy: {
    showPlacesToFriends: boolean
    publicProfile: boolean
    anonymousMode: boolean
  }
}

export interface OnboardingResponses {
  userId: string
  sheet1: OnboardingSheet1
  sheet2: OnboardingSheet2
  sheet3: OnboardingSheet3
  sheet4: OnboardingSheet4
  createdAt: any
  processed?: boolean
  profileId?: string
}

export interface TasteVector {
  foodie: number // 0-1
  explorer: number // 0-1
  aesthetic: number // 0-1
  introvert: number // 0-1 (0=extrovert, 1=introvert)
  nightOwl: number // 0-1
  budgetSensitivity: number // 0-1 (0=low, 1=high)
}

export interface TasteProfile {
  id: string
  userId: string
  persona: PersonaType
  personaLabel: string // Human-readable name
  vector: TasteVector
  tags: string[]
  topFoodStyles: string[]
  favoriteAmbiances: Ambiance[]
  activityPrefs: Activity[]
  createdAt: any
  updatedAt: any
  sourceOnboardingVersion: number
  explanation?: string[] // 3 bullet points explaining persona
  refinedDescription?: string // AI-generated 2-3 sentence description (optional)
}

export interface PersonaDefinition {
  type: PersonaType
  label: string
  emoji: string
  description: string
  traits: string[]
}

// Achievement System
export interface Achievement {
  id: string
  title: string
  description: string
  emoji: string
  category: 'foodie' | 'explorer' | 'curator' | 'social'
  xpReward: number
  unlockedAt?: any
  isSecret?: boolean
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_place',
    title: 'First Steps',
    description: 'Added your first place to the map',
    emoji: '🎯',
    category: 'explorer',
    xpReward: 100
  },
  {
    id: 'first_review',
    title: 'Taste Tester',
    description: 'Shared your first review',
    emoji: '✍️',
    category: 'curator',
    xpReward: 50
  },
  {
    id: 'foodie_10',
    title: 'Food Explorer',
    description: 'Reviewed 10 food places',
    emoji: '🍕',
    category: 'foodie',
    xpReward: 500
  },
  {
    id: 'explorer_25',
    title: 'City Navigator',
    description: 'Added 25 places to the map',
    emoji: '🗺️',
    category: 'explorer',
    xpReward: 1000
  },
  {
    id: 'social_5',
    title: 'Connector',
    description: 'Made 5 friends on ConnectMap',
    emoji: '🤝',
    category: 'social',
    xpReward: 300
  }
]

// Place Attendance - tracks who's going to a place/event
export interface PlaceAttendance {
  attendanceId: string // auto-generated
  placeId: string
  userId: string
  userName: string // cached for display
  userAvatar: string // cached emoji avatar
  goingDate?: string // ISO date string when user plans to go
  goingTime?: string // time string (e.g., "7:00 PM")
  visibility: 'friends' | 'public' // who can see this
  status: 'going' | 'interested' | 'cancelled'
  createdAt: any
  updatedAt: any
}

// Place Saves - tracks who saved a place
export interface PlaceSave {
  saveId: string // auto-generated
  placeId: string
  userId: string
  createdAt: any
}

// Aggregated attendance data for a place (for efficient querying)
export interface PlaceAttendanceStats {
  placeId: string
  totalGoing: number // total count of people going
  publicGoing: number // count visible to everyone
  recentAttendees: Array<{
    userId: string
    userName: string
    userAvatar: string
    goingDate?: string
    goingTime?: string
  }> // last 3-5 attendees for marker display
  upcomingEvents: Array<{
    date: string
    time: string
    count: number // number of people going at this time
  }> // upcoming event times
  updatedAt: any
}
