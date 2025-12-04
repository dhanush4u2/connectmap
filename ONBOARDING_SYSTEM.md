# Onboarding System Documentation

## Overview

The ConnectMap onboarding system is a **4-sheet progressive survey** that collects taste preferences, builds a 6-dimensional taste vector, assigns a personality persona, and creates a comprehensive user profile. The system enforces privacy-first design with username-based identity and optional anonymous mode.

## Architecture

### Flow Diagram

```
Google Sign-In
    ↓
Redirect to /onboarding (via useOnboardingCheck)
    ↓
Sheet 1: Identity & Energy (25%)
    ↓
Sheet 2: Taste Categories (50%)
    ↓
Sheet 3: Behavior & Habits (75%)
    ↓
Sheet 4: Personality Flavor (100%)
    ↓
LoadingProfile Animation (2 seconds)
    ↓
Compute Taste Vector (client-side)
    ↓
Classify Persona (8 archetypes)
    ↓
Write to 3 Firestore Collections
    ↓
Redirect to Map (/)
```

### Middleware Protection

**`useOnboardingCheck` Hook**
- Checks `user_profiles.hasCompletedOnboarding` field
- Redirects unauthenticated users to `/onboarding` if `false`
- Allows `/profile` and `/onboarding` paths without redirect
- Integrated into `MapPage` for automatic enforcement

## Data Model

### Firestore Collections

#### 1. `user_profiles` (Extended)
```typescript
{
  uid: string
  username: string
  displayName: string
  email: string
  photoURL?: string
  tasteProfileId: string              // NEW: Reference to taste_profiles
  hasCompletedOnboarding: boolean     // NEW: Onboarding gate
  privacy: {
    showPlacesToFriends: boolean
    publicProfile: boolean
    anonymousMode: boolean
  }
  connectScore: number
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

#### 2. `taste_profiles` (New)
```typescript
{
  id: string
  userId: string
  tasteVector: {
    foodie: number           // 0-1
    explorer: number         // 0-1
    aesthetic: number        // 0-1
    introvert: number        // 0-1
    nightOwl: number         // 0-1
    budgetSensitivity: number // 0-1
  }
  persona: {
    type: string             // "neonNomad" | "biscottiBotanist" | etc.
    emoji: string
    label: string
    description: string
    explanation: string[]    // 3 personalized bullets
  }
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

#### 3. `user_onboarding_events/{userId}/responses` (New)
```typescript
{
  sheet1: OnboardingSheet1  // Raw survey responses
  sheet2: OnboardingSheet2
  sheet3: OnboardingSheet3
  sheet4: OnboardingSheet4
  timestamp: Timestamp
}
```

## Survey Sheets

### Sheet 1: Identity & Energy
**Progress: 25%**

| Field | Type | Options | Validation |
|-------|------|---------|------------|
| `hangoutEnergy` | Radio | 🔥 High-Energy / 🌙 Chill Vibes / ⚖️ Depends | Required |
| `socialBattery` | Slider | 0-100 | Required |
| `groupSize` | Multi-select | 🙋 Solo / 👫 Duo / 👥 Squad (3-5) / 🎉 Big Group (6+) | ≥1 |
| `dayPreferences` | Multi-select | 🌅 Weekday Morning / 🌆 Weekday Evening / ☀️ Weekend Day / 🌃 Weekend Night | ≥1 |

### Sheet 2: Taste Categories
**Progress: 50%**

| Field | Type | Options | Validation |
|-------|------|---------|------------|
| `topFoodStyles` | Searchable Multi-select | 18 options (Italian, Japanese, Mexican, etc.) | Exactly 3 |
| `favoriteAmbiances` | Multi-select | 🕯️ Cozy / 🎨 Trendy / 🌿 Peaceful / 🎉 Lively / 🏞️ Outdoor / 🍴 Classic | ≥1 |
| `activityPreferences` | Multi-select | 🍽️ Dining / ☕ Coffee/Tea / 🍺 Bars/Nightlife / 🎭 Arts/Culture / 🏃 Active/Outdoors / 🛍️ Shopping | ≥1 |
| `budgetTier` | Radio | 💰 Budget-Friendly / 💸 Mid-Range / 💎 Splurge-Worthy | Required |

**Food Styles:** Italian, Japanese, Mexican, Indian, Chinese, Thai, Mediterranean, American, French, Korean, Vietnamese, Middle Eastern, Latin American, Fusion, Vegetarian/Vegan, Seafood, BBQ/Grill, Bakery/Café

### Sheet 3: Behavior & Habits
**Progress: 75%**

| Field | Type | Options | Validation |
|-------|------|---------|------------|
| `travelMode` | Multi-select | 🚶 Walking / 🚴 Biking / 🚗 Driving / 🚇 Public Transit | ≥1 |
| `weekendType` | Radio | 🗺️ Spontaneous / 📅 Planner / 🎲 Mix of Both | Required |
| `newPlaceFrequency` | Slider | 0-100 (Rarely/Monthly/Bi-weekly/Weekly) | Required |
| `photoPreference` | Radio | 📸 Always / 🤳 Sometimes / 👀 Rarely | Required |

### Sheet 4: Personality Flavor
**Progress: 100%**

| Field | Type | Options | Validation |
|-------|------|---------|------------|
| `personaKeyword` | Radio Grid | 8 persona cards | Optional |
| `freeTags` | Text Input Chips | Free text (max 6 tags) | Optional |
| `privacy.showPlacesToFriends` | Toggle | On/Off | Default: true |
| `privacy.publicProfile` | Toggle | On/Off | Default: false |
| `privacy.anonymousMode` | Toggle | On/Off | Default: false |

## Persona System

### 8 Unique Archetypes

| Persona | Emoji | Key Traits | Best For |
|---------|-------|------------|----------|
| **Neon Nomad** | 🌃 | Night owl, explorer, high-energy | Late-night adventurers |
| **Biscotti Botanist** | 🌿 | Foodie, aesthetic, peaceful | Brunch enthusiasts |
| **Budget Ranger** | 💰 | Explorer, budget-conscious, spontaneous | Value seekers |
| **Sunrise Cartographer** | 🌅 | Planner, early bird, meticulous | Morning people |
| **Quiet Curator** | 🕯️ | Introvert, aesthetic, selective | Solo explorers |
| **Spontaneity Engine** | 🎲 | High-energy, spontaneous, social | Party people |
| **Tactile Foodsmith** | 🍽️ | Foodie, dining-focused, sensory | Food connoisseurs |
| **Photo Pilgrim** | 📸 | Explorer, aesthetic, photo-driven | Instagram travelers |

### Persona Classification Algorithm

1. **Compute Base Scores** (0-100 scale)
   - Night Owl: `dayPreferences` (weekend night +30, weekday evening +20)
   - Explorer: `newPlaceFrequency` slider
   - Aesthetic: `favoriteAmbiances` (trendy/peaceful +25 each)
   - Foodie: `topFoodStyles.length` (3 = 100)
   - Introvert: Inverse of `socialBattery`
   - Budget: `budgetTier` (budget=100, mid=50, splurge=0)

2. **Normalize to 0-1** (divide by 100)

3. **Score Each Persona**
   - Calculate weighted distance from ideal vector
   - Apply bonuses from secondary traits
   - Example: Neon Nomad = 3×nightOwl + 2×explorer + 1.5×highEnergy

4. **Select Best Match** (highest score wins)

5. **Generate Explanations** (3 bullets)
   - Based on strongest vector dimensions
   - Personalized with user's actual choices
   - Example: "Your high explorer score (0.85) shows you're always seeking new experiences"

## Taste Vector Computation

### 6 Dimensions (0-1 scale)

```typescript
{
  foodie: 0.0-1.0,          // Food style variety + dining preference
  explorer: 0.0-1.0,        // New place frequency + spontaneity
  aesthetic: 0.0-1.0,       // Ambiance preferences + photo habits
  introvert: 0.0-1.0,       // Group size + social battery (inverted)
  nightOwl: 0.0-1.0,        // Day preferences weighted
  budgetSensitivity: 0.0-1.0 // Budget tier selection
}
```

### Calculation Details

**Foodie:**
- Base: `topFoodStyles.length / 3` (max 3)
- Bonus: +0.2 if "Dining" in `activityPreferences`
- Capped at 1.0

**Explorer:**
- Base: `newPlaceFrequency / 100`
- Bonus: +0.15 if weekend type is "Spontaneous"
- Bonus: +0.1 if multiple travel modes
- Capped at 1.0

**Aesthetic:**
- Base: Count of trendy/peaceful ambiances × 0.25
- Bonus: +0.2 if photo preference is "Always"
- Capped at 1.0

**Introvert:**
- Base: `1 - (socialBattery / 100)`
- Penalty: -0.2 if prefers big groups (6+)
- Bonus: +0.2 if prefers solo
- Clamped to 0-1

**Night Owl:**
- Weekend Night: +0.30
- Weekday Evening: +0.20
- Weekend Day: +0.10
- Normalized by number of day preferences
- Clamped to 0-1

**Budget Sensitivity:**
- Budget-Friendly: 1.0
- Mid-Range: 0.5
- Splurge-Worthy: 0.0

## Privacy System

### 3 Privacy Toggles

| Setting | Default | Effect |
|---------|---------|--------|
| `showPlacesToFriends` | `true` | Friends can see your saved places |
| `publicProfile` | `false` | Profile visible to all users |
| `anonymousMode` | `false` | Use anonymous username (`user_{uid}`) |

### Username System

- **Google OAuth:** Auto-generates username from email (e.g., `john.doe@gmail.com` → `johndoe`)
- **Email/Password:** User provides custom username
- **Anonymous Mode:** System-generated `user_{uid.substring(0,8)}`
- **Privacy Rule:** Email addresses never displayed to other users

## UI Components

### Component Tree

```
OnboardingPage (Container)
├── Progress Bar (25% per sheet)
├── Sheet1 (Identity & Energy)
│   ├── Radio Buttons (hangoutEnergy)
│   ├── Slider (socialBattery)
│   └── Multi-Select Buttons (groupSize, dayPreferences)
├── Sheet2 (Taste Categories)
│   ├── Searchable Autocomplete (topFoodStyles)
│   ├── Multi-Select Buttons (ambiances, activities)
│   └── Radio Buttons (budgetTier)
├── Sheet3 (Behavior & Habits)
│   ├── Multi-Select Buttons (travelMode)
│   ├── Radio Buttons (weekendType)
│   ├── Slider (newPlaceFrequency)
│   └── Radio Buttons (photoPreference)
├── Sheet4 (Personality Flavor)
│   ├── Persona Cards (8 options)
│   ├── Tag Input (max 6 chips)
│   └── Privacy Toggles (3 switches)
└── LoadingProfile (Success Animation)
    ├── Bouncing Map Emoji
    ├── Progress Bar Animation
    ├── 3 Status Bullets (stagger fade-in)
    └── Pro Tip Box
```

### Styling Conventions

- **Primary Color:** `bg-gradient-to-r from-purple-500 to-pink-500`
- **Active State:** `ring-2 ring-primary`
- **Disabled State:** `opacity-50 cursor-not-allowed`
- **Validation Error:** `ring-2 ring-red-500`
- **Animations:** Custom CSS keyframes in LoadingProfile.tsx

## Firestore Security Rules

```javascript
// user_profiles
match /user_profiles/{userId} {
  allow read: if request.auth != null;
  allow write: if request.auth.uid == userId;
}

// taste_profiles
match /taste_profiles/{profileId} {
  allow read: if request.auth != null;
  allow write: if request.auth.uid == resource.data.userId;
}

// user_onboarding_events
match /user_onboarding_events/{userId}/responses/{responseId} {
  allow read: if request.auth.uid == userId;
  allow write: if request.auth.uid == userId;
}
```

## Testing Checklist

### Manual Testing

- [ ] Sign in with Google OAuth
- [ ] Verify redirect to `/onboarding`
- [ ] Complete Sheet 1 (test validation)
- [ ] Complete Sheet 2 (test search autocomplete)
- [ ] Complete Sheet 3 (test sliders)
- [ ] Complete Sheet 4 (test persona selection)
- [ ] Verify 2-second loading animation
- [ ] Check Firestore writes:
  - [ ] `user_profiles` updated with `tasteProfileId` and `hasCompletedOnboarding: true`
  - [ ] `taste_profiles` created with correct persona
  - [ ] `user_onboarding_events/{userId}/responses` saved
- [ ] Verify redirect to `/` after completion
- [ ] Try accessing `/onboarding` again (should redirect to `/`)
- [ ] Sign out and sign in again (should go to `/` without onboarding)

### Edge Cases

- [ ] Anonymous mode generates correct username
- [ ] Profile with all privacy toggles OFF
- [ ] Profile with no persona selected (should still compute)
- [ ] Food style search with no results
- [ ] Back button behavior (should stay on current sheet)
- [ ] Direct URL access to `/onboarding` while completed

## Future Enhancements

### Phase 2: LLM Integration (Optional)

**Cloud Function: `refineProfileWithLLM`**
```typescript
// Pseudocode from user spec
const prompt = `
User profile:
- Persona: ${persona.label}
- Taste Vector: ${JSON.stringify(tasteVector)}
- Survey Responses: ${JSON.stringify(responses)}

Generate a 2-sentence refined description of this user's taste profile.
`
const refinedDescription = await callLLM(prompt)
await updateDoc(doc(db, 'taste_profiles', profileId), { refinedDescription })
```

### Phase 3: Profile Refinement UI

**30-Second Mini Quiz**
- 5 quick questions to refine persona
- A/B test images ("Which place appeals more?")
- Update taste vector incrementally

### Phase 4: Analytics

**Track Metrics:**
- Sheet completion rates (funnel analysis)
- Average time per sheet
- Most common personas
- Privacy setting distribution
- Onboarding abandonment points

### Phase 5: Recommendations

**Use Taste Vectors for:**
- Place recommendations (cosine similarity)
- Friend matching (similar personas)
- Content personalization (feed ranking)

## File Structure

```
src/
├── types/
│   └── index.ts                    # +15 interfaces (OnboardingSheet1-4, TasteProfile, etc.)
├── lib/
│   ├── onboardingData.ts           # NEW: Constants (PERSONAS, FOOD_STYLES, etc.)
│   └── tasteProfileCompute.ts      # NEW: Algorithms (computeTasteVector, classifyPersona)
├── hooks/
│   └── useOnboardingCheck.ts       # NEW: Middleware for redirect enforcement
├── components/
│   └── onboarding/
│       ├── Sheet1.tsx              # NEW: Identity & Energy
│       ├── Sheet2.tsx              # NEW: Taste Categories
│       ├── Sheet3.tsx              # NEW: Behavior & Habits
│       ├── Sheet4.tsx              # NEW: Personality Flavor
│       ├── LoadingProfile.tsx      # NEW: Success animation
│       └── index.ts                # NEW: Barrel export
├── pages/
│   ├── OnboardingPage.tsx          # NEW: Main container
│   └── MapPage.tsx                 # UPDATED: Uses useOnboardingCheck
└── App.tsx                         # UPDATED: Added /onboarding route
```

## API Reference

### `createTasteProfile(userId, responses)`

**Parameters:**
- `userId: string` - Firebase Auth UID
- `responses: AllOnboardingResponses` - Combined sheet data

**Returns:** `TasteProfile` object

**Side Effects:**
- Computes 6-dimensional taste vector
- Classifies persona (1 of 8 archetypes)
- Generates 3 personalized explanation bullets

### `computeTasteVector(responses)`

**Parameters:**
- `responses: AllOnboardingResponses`

**Returns:** `TasteVector` (6 dimensions, 0-1 scale)

### `classifyPersona(vector, responses)`

**Parameters:**
- `vector: TasteVector`
- `responses: AllOnboardingResponses`

**Returns:** `{ type: PersonaType, ...PersonaDefinition }`

### `useOnboardingCheck()`

**Returns:**
- `{ hasCompletedOnboarding: boolean | null, loading: boolean }`

**Side Effects:**
- Redirects to `/onboarding` if `hasCompletedOnboarding` is `false`
- Reads from `user_profiles` collection

## Troubleshooting

### Issue: Onboarding loops infinitely
**Solution:** Check `hasCompletedOnboarding` field in Firestore. Must be `true` after completion.

### Issue: Persona not assigned
**Solution:** Verify `classifyPersona` runs and `persona` field exists in `taste_profiles` document.

### Issue: Username collision
**Solution:** Auto-append random suffix (`johndoe_a3b2`) if username exists.

### Issue: Anonymous mode not working
**Solution:** Check `privacy.anonymousMode` toggle in Sheet4. Username should be `user_{uid}`.

### Issue: Taste vector all zeros
**Solution:** Verify survey responses have valid data. Check computation in `tasteProfileCompute.ts`.

## Credits

- **Design:** Based on detailed spec provided by user
- **Persona System:** 8 unique archetypes with trait-based matching
- **Algorithm:** Client-side taste vector computation (no LLM required for MVP)
- **Privacy:** Username-based identity, optional anonymous mode

---

**Version:** 1.0  
**Last Updated:** 2024  
**Status:** ✅ Complete - Ready for testing
