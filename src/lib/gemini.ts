import { GoogleGenerativeAI } from '@google/generative-ai'
import type { OnboardingResponses, TasteVector, PersonaType } from '../types'

// Initialize Gemini with API key from environment
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '')

// Use Gemini 2.0 Flash model
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

/**
 * Generate taste profile using Gemini AI
 * Analyzes survey responses and returns personalized taste vector and persona
 */
export async function generateTasteProfileWithGemini(
  responses: Pick<OnboardingResponses, 'sheet1' | 'sheet2' | 'sheet3' | 'sheet4'>
): Promise<{
  tasteVector: TasteVector
  persona: PersonaType
  explanation: string[]
  refinedDescription: string
}> {
  const prompt = `You are an expert taste profile analyzer for a location discovery app. Analyze the following user survey responses and generate a detailed taste profile.

**Survey Responses:**

**Sheet 1 - Identity & Energy:**
- Hangout Energy: ${responses.sheet1.hangoutEnergy}
- Social Battery: ${responses.sheet1.socialBattery}/100
- Group Size Preferences: ${responses.sheet1.groupSize.join(', ')}
- Day Preferences: ${responses.sheet1.dayPreferences.join(', ')}

**Sheet 2 - Taste Categories:**
- Top Food Styles: ${responses.sheet2.topFoodStyles.join(', ')}
- Favorite Ambiances: ${responses.sheet2.favoriteAmbiances.join(', ')}
- Activity Preferences: ${responses.sheet2.activityPreferences.join(', ')}
- Budget Tier: ${responses.sheet2.budgetTier}

**Sheet 3 - Behavior & Habits:**
- Travel Mode: ${responses.sheet3.travelMode.join(', ')}
- Weekend Type: ${responses.sheet3.weekendType}
- New Place Frequency: ${responses.sheet3.newPlaceFrequency}/100 (0=rarely, 100=weekly)
- Photo Preference: ${responses.sheet3.photoPreference}

**Sheet 4 - Personality:**
- Persona Keyword: ${responses.sheet4.personaKeyword || 'not selected'}
- Free Tags: ${responses.sheet4.freeTags.join(', ') || 'none'}

**Task:**
Generate a taste profile with the following JSON structure (respond ONLY with valid JSON, no markdown):

{
  "tasteVector": {
    "foodie": <0.0-1.0>,
    "explorer": <0.0-1.0>,
    "aesthetic": <0.0-1.0>,
    "introvert": <0.0-1.0>,
    "nightOwl": <0.0-1.0>,
    "budgetSensitivity": <0.0-1.0>
  },
  "persona": "<one of: neon_nomad, biscotti_botanist, budget_ranger, sunrise_cartographer, quiet_curator, spontaneity_engine, tactile_foodsmith, photo_pilgrim>",
  "explanation": [
    "<personalized bullet 1 about their strongest trait>",
    "<personalized bullet 2 about their preferences>",
    "<personalized bullet 3 about their habits>"
  ],
  "refinedDescription": "<2-3 sentence natural description of their taste profile>"
}

**Persona Definitions:**
- neon_nomad: Night owl explorer seeking high-energy adventures
- biscotti_botanist: Foodie + aesthetic + peaceful ambiance lover
- budget_ranger: Explorer + budget-conscious + spontaneous
- sunrise_cartographer: Planner + early bird + meticulous
- quiet_curator: Introvert + aesthetic + selective
- spontaneity_engine: High-energy + spontaneous + social
- tactile_foodsmith: Foodie + dining-focused + sensory
- photo_pilgrim: Explorer + aesthetic + photo-driven

**Taste Vector Guidelines:**
- foodie: Based on food style variety, dining preference
- explorer: Based on new place frequency, spontaneity, travel modes
- aesthetic: Based on ambiance preferences (trendy/peaceful), photo habits
- introvert: Based on social battery (inverted), group size preferences
- nightOwl: Based on day preferences (weekend night/weekday evening weighted higher)
- budgetSensitivity: Based on budget tier (budget=1.0, mid=0.5, splurge=0.0)

Respond with ONLY the JSON object, no additional text.`

  try {
    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    // Parse JSON response
    const parsed = JSON.parse(text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim())

    // Validate and normalize taste vector (ensure 0-1 range)
    const tasteVector: TasteVector = {
      foodie: Math.max(0, Math.min(1, parsed.tasteVector.foodie)),
      explorer: Math.max(0, Math.min(1, parsed.tasteVector.explorer)),
      aesthetic: Math.max(0, Math.min(1, parsed.tasteVector.aesthetic)),
      introvert: Math.max(0, Math.min(1, parsed.tasteVector.introvert)),
      nightOwl: Math.max(0, Math.min(1, parsed.tasteVector.nightOwl)),
      budgetSensitivity: Math.max(0, Math.min(1, parsed.tasteVector.budgetSensitivity))
    }

    // Validate persona
    const validPersonas: PersonaType[] = [
      'neon_nomad',
      'biscotti_botanist',
      'budget_ranger',
      'sunrise_cartographer',
      'quiet_curator',
      'spontaneity_engine',
      'tactile_foodsmith',
      'photo_pilgrim'
    ]

    const persona = validPersonas.includes(parsed.persona)
      ? parsed.persona
      : 'neon_nomad' // Default fallback

    return {
      tasteVector,
      persona,
      explanation: parsed.explanation || [
        'Your unique preferences create an exciting taste profile',
        'You have a balanced approach to exploring new places',
        'Your habits show a thoughtful approach to experiences'
      ],
      refinedDescription:
        parsed.refinedDescription ||
        'A unique explorer with diverse tastes and an adventurous spirit.'
    }
  } catch (error) {
    console.error('Gemini API error:', error)
    throw new Error(
      'Failed to generate taste profile with Gemini. Please check your API key and network connection.'
    )
  }
}

/**
 * Fallback function if Gemini fails - uses original client-side logic
 */
export function shouldUseGemini(): boolean {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  return !!apiKey && apiKey.length > 0
}
