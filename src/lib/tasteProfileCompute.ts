import type {
  OnboardingResponses,
  TasteVector,
  TasteProfile,
  PersonaType
} from '../types'
import { PERSONAS } from './onboardingData'

/**
 * Computes taste vector from onboarding responses
 * Each dimension is normalized to 0-1 scale
 */
export function computeTasteVector(responses: OnboardingResponses): TasteVector {
  const { sheet1, sheet2, sheet3 } = responses

  // Foodie score (0-1): based on food styles, ambiances, and eat activity
  const foodie = Math.min(1, (
    (sheet2.topFoodStyles.length / 3) * 0.4 +
    (sheet2.activityPreferences.includes('eat') ? 0.3 : 0) +
    (sheet2.favoriteAmbiances.filter(a => ['cozy_cafe', 'rooftop'].includes(a)).length / 6) * 0.3
  ))

  // Explorer score (0-1): based on new place frequency and spontaneity
  const explorer = Math.min(1, (
    (sheet3.newPlaceFrequency / 100) * 0.6 +
    (sheet3.weekendType === 'spontaneous' ? 0.4 : sheet3.weekendType === 'mix' ? 0.2 : 0)
  ))

  // Aesthetic score (0-1): based on photo preference and certain ambiances
  const aesthetic = Math.min(1, (
    (sheet3.photoPreference === 'post_photos' ? 0.5 : 0.2) +
    (sheet2.activityPreferences.includes('shoot_photos') ? 0.3 : 0) +
    (sheet2.favoriteAmbiances.filter(a => ['aesthetic_minimal', 'cozy_cafe'].includes(a)).length / 6) * 0.2
  ))

  // Introvert score (0-1): 0 = extrovert, 1 = introvert
  // Based on inverted social battery and group size preferences
  const introvert = Math.min(1, (
    (1 - (sheet1.socialBattery / 100)) * 0.6 +
    (sheet1.groupSize.includes('solo') ? 0.3 : 0) +
    (sheet1.groupSize.includes('crowd') ? -0.2 : 0.1)
  ))

  // Night owl score (0-1): based on day preferences and energy
  const nightOwl = Math.min(1, (
    (sheet1.dayPreferences.includes('night_owl') ? 0.5 : 0) +
    (sheet1.hangoutEnergy === 'electric' ? 0.3 : sheet1.hangoutEnergy === 'lively' ? 0.2 : 0) +
    (sheet1.dayPreferences.includes('morning_runner') ? -0.3 : 0.2)
  ))

  // Budget sensitivity (0-1): 0 = low sensitivity (spends freely), 1 = high sensitivity (budget conscious)
  const budgetSensitivity = 
    sheet2.budgetTier === 'cheap' ? 0.8 :
    sheet2.budgetTier === 'mid' ? 0.5 :
    0.2

  return {
    foodie: Math.max(0, Math.min(1, foodie)),
    explorer: Math.max(0, Math.min(1, explorer)),
    aesthetic: Math.max(0, Math.min(1, aesthetic)),
    introvert: Math.max(0, Math.min(1, introvert)),
    nightOwl: Math.max(0, Math.min(1, nightOwl)),
    budgetSensitivity: Math.max(0, Math.min(1, budgetSensitivity))
  }
}

/**
 * Determines the best-fit persona based on taste vector and responses
 */
export function classifyPersona(vector: TasteVector, responses: OnboardingResponses): PersonaType {
  const { sheet1, sheet2, sheet3, sheet4 } = responses

  // If user explicitly selected a persona in sheet4, prioritize it
  if (sheet4.personaKeyword) {
    return sheet4.personaKeyword
  }

  // Score each persona based on vector alignment
  const scores: Record<PersonaType, number> = {
    neon_nomad: vector.nightOwl * 0.4 + vector.foodie * 0.3 + vector.explorer * 0.3,
    biscotti_botanist: vector.aesthetic * 0.4 + (1 - vector.nightOwl) * 0.3 + vector.foodie * 0.3,
    budget_ranger: vector.budgetSensitivity * 0.5 + vector.explorer * 0.3 + vector.foodie * 0.2,
    sunrise_cartographer: (1 - vector.nightOwl) * 0.5 + vector.explorer * 0.3 + (1 - vector.introvert) * 0.2,
    quiet_curator: vector.introvert * 0.5 + vector.aesthetic * 0.3 + (1 - vector.foodie) * 0.2,
    spontaneity_engine: vector.explorer * 0.4 + (1 - vector.introvert) * 0.4 + (1 - vector.budgetSensitivity) * 0.2,
    tactile_foodsmith: vector.foodie * 0.6 + vector.aesthetic * 0.3 + (1 - vector.budgetSensitivity) * 0.1,
    photo_pilgrim: vector.aesthetic * 0.5 + (sheet3.photoPreference === 'post_photos' ? 0.3 : 0) + vector.explorer * 0.2
  }

  // Additional scoring based on specific answers
  if (sheet1.dayPreferences.includes('night_owl')) scores.neon_nomad += 0.2
  if (sheet2.favoriteAmbiances.includes('cozy_cafe')) scores.biscotti_botanist += 0.15
  if (sheet2.budgetTier === 'cheap') scores.budget_ranger += 0.2
  if (sheet1.dayPreferences.includes('morning_runner')) scores.sunrise_cartographer += 0.2
  if (sheet1.groupSize.includes('solo')) scores.quiet_curator += 0.15
  if (sheet3.weekendType === 'spontaneous') scores.spontaneity_engine += 0.2
  if (sheet2.topFoodStyles.length === 3) scores.tactile_foodsmith += 0.15
  if (sheet2.activityPreferences.includes('shoot_photos')) scores.photo_pilgrim += 0.2

  // Find persona with highest score
  return (Object.entries(scores) as [PersonaType, number][])
    .reduce((best, [persona, score]) => score > best[1] ? [persona, score] : best, ['neon_nomad' as PersonaType, 0])[0]
}

/**
 * Generates explanation bullets for why the persona was chosen
 */
export function generatePersonaExplanation(
  persona: PersonaType,
  vector: TasteVector,
  responses: OnboardingResponses
): string[] {
  const explanations: Record<PersonaType, string[]> = {
    neon_nomad: [
      `Your night owl score (${(vector.nightOwl * 100).toFixed(0)}%) shows you thrive after sunset`,
      `Love for ${responses.sheet1.hangoutEnergy} energy and street food vibes`,
      `High explorer tendency means you're always hunting for the next spot`
    ],
    biscotti_botanist: [
      `Strong aesthetic sense (${(vector.aesthetic * 100).toFixed(0)}%) matches your café culture love`,
      `Your cozy ambiance preferences show refined taste`,
      `Photo-friendly places are your jam`
    ],
    budget_ranger: [
      `Budget-conscious (${(vector.budgetSensitivity * 100).toFixed(0)}%) but adventurous explorer`,
      `High frequency of trying new places on a smart budget`,
      `You find hidden gems that others miss`
    ],
    sunrise_cartographer: [
      `Morning person vibes (${((1-vector.nightOwl) * 100).toFixed(0)}% early bird score)`,
      `Love for parks, nature spots, and breakfast culture`,
      `Your explorer score shows systematic place discovery`
    ],
    quiet_curator: [
      `Introvert score (${(vector.introvert * 100).toFixed(0)}%) aligns with niche interests`,
      `Preference for solo or small group experiences`,
      `Aesthetic spaces with cultural depth appeal to you`
    ],
    spontaneity_engine: [
      `High explorer score (${(vector.explorer * 100).toFixed(0)}%) with spontaneous weekend style`,
      `You're group-friendly and flexible with plans`,
      `Your energy levels match quick decision-making`
    ],
    tactile_foodsmith: [
      `Food-first mindset (${(vector.foodie * 100).toFixed(0)}% foodie score)`,
      `You selected ${responses.sheet2.topFoodStyles.length} diverse food styles`,
      `Plating aesthetics and sensory experiences matter`
    ],
    photo_pilgrim: [
      `Aesthetic score (${(vector.aesthetic * 100).toFixed(0)}%) drives your place selection`,
      `Photography is part of your exploration process`,
      `You seek Instagram-worthy spots with mid-range budgets`
    ]
  }

  return explanations[persona] || ['Your unique mix creates this profile']
}

/**
 * Creates a complete taste profile from onboarding responses
 */
export function createTasteProfile(
  userId: string,
  responses: OnboardingResponses
): Omit<TasteProfile, 'id' | 'createdAt' | 'updatedAt'> {
  const vector = computeTasteVector(responses)
  const persona = classifyPersona(vector, responses)
  const explanation = generatePersonaExplanation(persona, vector, responses)

  return {
    userId,
    persona,
    personaLabel: PERSONAS[persona].label,
    vector,
    tags: responses.sheet4.freeTags,
    topFoodStyles: responses.sheet2.topFoodStyles,
    favoriteAmbiances: responses.sheet2.favoriteAmbiances,
    activityPrefs: responses.sheet2.activityPreferences,
    sourceOnboardingVersion: 1,
    explanation
  }
}
