import type { PersonaDefinition, PersonaType } from '../types'

export const PERSONAS: Record<PersonaType, PersonaDefinition> = {
  neon_nomad: {
    type: 'neon_nomad',
    label: 'Neon Nomad',
    emoji: '🌃',
    description: 'Late-night explorer, nightlife & street food',
    traits: ['Night owl', 'Street food lover', 'Urban explorer']
  },
  biscotti_botanist: {
    type: 'biscotti_botanist',
    label: 'Biscotti Botanist',
    emoji: '☕',
    description: 'Café-first, cozy aesthetics, photo lover',
    traits: ['Café enthusiast', 'Aesthetic curator', 'Photo lover']
  },
  budget_ranger: {
    type: 'budget_ranger',
    label: 'Budget Ranger',
    emoji: '💰',
    description: 'Finds cheap gems, high frequency, low spend',
    traits: ['Value seeker', 'Frequent explorer', 'Hidden gems finder']
  },
  sunrise_cartographer: {
    type: 'sunrise_cartographer',
    label: 'Sunrise Cartographer',
    emoji: '🌅',
    description: 'Morning explorer, parks & breakfasts',
    traits: ['Early bird', 'Nature lover', 'Breakfast specialist']
  },
  quiet_curator: {
    type: 'quiet_curator',
    label: 'Quiet Curator',
    emoji: '🎨',
    description: 'Introverted, niche places, gallery/craft shops',
    traits: ['Introvert', 'Niche explorer', 'Arts & crafts lover']
  },
  spontaneity_engine: {
    type: 'spontaneity_engine',
    label: 'Spontaneity Engine',
    emoji: '⚡',
    description: 'Loves sudden plans, flexible, group-friendly',
    traits: ['Spontaneous', 'Group activities', 'Adventure ready']
  },
  tactile_foodsmith: {
    type: 'tactile_foodsmith',
    label: 'Tactile Foodsmith',
    emoji: '🍽️',
    description: 'High foodie %, cares about sensations & plating',
    traits: ['Food connoisseur', 'Plating aesthete', 'Sensory explorer']
  },
  photo_pilgrim: {
    type: 'photo_pilgrim',
    label: 'Photo Pilgrim',
    emoji: '📸',
    description: 'Places for snaps, aesthetic-first, medium budget',
    traits: ['Instagram ready', 'Visual curator', 'Aesthetic hunter']
  }
}

export const FOOD_STYLES = [
  'Desi Delights',
  'Street Food',
  'Café Brunch',
  'Asian Fusion',
  'Bakeries & Desserts',
  'Fine Dining',
  'Fast Food',
  'Continental',
  'Seafood',
  'Vegetarian',
  'BBQ & Grills',
  'Italian',
  'Chinese',
  'South Indian',
  'North Indian',
  'Thai',
  'Japanese',
  'Mexican'
]

export const AMBIANCE_OPTIONS = [
  { value: 'rooftop', label: 'Rooftop', emoji: '🏙️' },
  { value: 'cozy_cafe', label: 'Cozy Café', emoji: '☕' },
  { value: 'lofi_study', label: 'Lofi Study Space', emoji: '📚' },
  { value: 'lively_pub', label: 'Lively Pub', emoji: '🍺' },
  { value: 'nature_spot', label: 'Nature Spot', emoji: '🌳' },
  { value: 'aesthetic_minimal', label: 'Aesthetic Minimal', emoji: '✨' }
]

export const ACTIVITY_OPTIONS = [
  { value: 'eat', label: 'Eat', emoji: '🍽️' },
  { value: 'walk', label: 'Walk', emoji: '🚶' },
  { value: 'chill', label: 'Chill', emoji: '😌' },
  { value: 'party', label: 'Party', emoji: '🎉' },
  { value: 'explore', label: 'Explore', emoji: '🗺️' },
  { value: 'shoot_photos', label: 'Shoot Photos', emoji: '📸' }
]

export const HANGOUT_ENERGY_OPTIONS = [
  { value: 'chill', label: 'Chill', emoji: '🌙' },
  { value: 'balanced', label: 'Balanced', emoji: '⚖️' },
  { value: 'lively', label: 'Lively', emoji: '🔥' },
  { value: 'electric', label: 'Electric', emoji: '⚡' }
]

export const GROUP_SIZE_OPTIONS = [
  { value: 'solo', label: 'Solo', emoji: '🧘' },
  { value: '1-2', label: '1-2 People', emoji: '👥' },
  { value: '3-5', label: '3-5 People', emoji: '👨‍👩‍👧' },
  { value: 'crowd', label: 'Crowd', emoji: '🎊' }
]

export const DAY_PREFERENCE_OPTIONS = [
  { value: 'morning_runner', label: 'Morning Runner', emoji: '🌅' },
  { value: 'coffee_hours', label: 'Coffee Hours', emoji: '☕' },
  { value: 'sunset_explorer', label: 'Sunset Explorer', emoji: '🌇' },
  { value: 'night_owl', label: 'Night Owl', emoji: '🦉' }
]

export const TRAVEL_MODE_OPTIONS = [
  { value: 'walk', label: 'Walk', emoji: '🚶' },
  { value: 'bike', label: 'Bike', emoji: '🚴' },
  { value: 'cab', label: 'Cab', emoji: '🚕' },
  { value: 'public_transport', label: 'Public Transport', emoji: '🚌' }
]

export const WEEKEND_TYPE_OPTIONS = [
  { value: 'plan_ahead', label: 'Plan Ahead', emoji: '📅' },
  { value: 'spontaneous', label: 'Spontaneous', emoji: '⚡' },
  { value: 'mix', label: 'Mix of Both', emoji: '🎲' }
]

export const BUDGET_TIERS = [
  { value: 'cheap', label: '₹ Budget', description: 'Under ₹500' },
  { value: 'mid', label: '₹₹ Mid-Range', description: '₹500 - ₹1500' },
  { value: 'treat', label: '₹₹₹ Treat Yourself', description: '₹1500+' }
]
