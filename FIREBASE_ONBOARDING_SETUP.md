# Firebase Setup for Onboarding System

## Firestore Collections

### 1. Update `user_profiles` Collection

Add new fields to existing user profiles:

```typescript
// New fields to add
{
  tasteProfileId: string              // Reference to taste_profiles/{id}
  hasCompletedOnboarding: boolean     // Onboarding gate (default: false)
  privacy: {
    showPlacesToFriends: boolean      // Default: true
    publicProfile: boolean            // Default: false
    anonymousMode: boolean            // Default: false
  }
}
```

**Migration for existing users:**
```javascript
// Run once to add fields to existing profiles
const usersRef = collection(db, 'user_profiles');
const snapshot = await getDocs(usersRef);

snapshot.forEach(async (doc) => {
  await updateDoc(doc.ref, {
    hasCompletedOnboarding: false,
    'privacy.showPlacesToFriends': true,
    'privacy.publicProfile': false,
    'privacy.anonymousMode': false
  });
});
```

### 2. Create `taste_profiles` Collection

**Path:** `taste_profiles/{profileId}`

**Document Structure:**
```typescript
{
  id: string                  // Auto-generated
  userId: string             // Foreign key to user_profiles
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
    explanation: string[]    // Array of 3 strings
  }
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

**Indexes:** None required (queries by userId only)

### 3. Create `user_onboarding_events` Collection

**Path:** `user_onboarding_events/{userId}/responses/{responseId}`

**Document Structure:**
```typescript
{
  sheet1: {
    hangoutEnergy: string
    socialBattery: number
    groupSize: string[]
    dayPreferences: string[]
  }
  sheet2: {
    topFoodStyles: string[]
    favoriteAmbiances: string[]
    activityPreferences: string[]
    budgetTier: string
  }
  sheet3: {
    travelMode: string[]
    weekendType: string
    newPlaceFrequency: number
    photoPreference: string
  }
  sheet4: {
    personaKeyword?: string
    freeTags: string[]
    privacy: {
      showPlacesToFriends: boolean
      publicProfile: boolean
      anonymousMode: boolean
    }
  }
  timestamp: Timestamp
}
```

**Indexes:** None required (single document per user)

## Security Rules

Add these rules to your `firestore.rules` file:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // User Profiles (Updated)
    match /user_profiles/{userId} {
      allow read: if request.auth != null;
      allow create: if request.auth.uid == userId;
      allow update: if request.auth.uid == userId
        && (!request.resource.data.diff(resource.data).affectedKeys()
            .hasAny(['uid', 'email', 'createdAt'])); // Prevent changing core fields
    }
    
    // Taste Profiles
    match /taste_profiles/{profileId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null
        && request.resource.data.userId == request.auth.uid;
      allow update: if request.auth.uid == resource.data.userId;
      allow delete: if request.auth.uid == resource.data.userId;
    }
    
    // Onboarding Events (User's own responses)
    match /user_onboarding_events/{userId}/responses/{responseId} {
      allow read: if request.auth.uid == userId;
      allow write: if request.auth.uid == userId;
    }
  }
}
```

## Composite Indexes

### Required Indexes

1. **taste_profiles by userId**
   - Collection: `taste_profiles`
   - Fields: `userId` (Ascending), `createdAt` (Descending)
   - Query: Finding user's latest taste profile

**Create via Firebase Console:**
```
Collection ID: taste_profiles
Fields indexed:
  - userId (Ascending)
  - createdAt (Descending)
Query scope: Collection
```

**Or via CLI:**
```bash
firebase firestore:indexes --add \
  --collection-group taste_profiles \
  --field userId --order asc \
  --field createdAt --order desc
```

## Cloud Functions (Optional - Future Enhancement)

### Function: `refineProfileWithLLM`

**Trigger:** onCreate in `taste_profiles` collection

**Purpose:** Generate refined description using LLM

```typescript
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { getFirestore } from 'firebase-admin/firestore';

export const refineProfileWithLLM = onDocumentCreated(
  'taste_profiles/{profileId}',
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const profile = snapshot.data();
    const db = getFirestore();

    // Call LLM API (OpenAI, Anthropic, etc.)
    const prompt = `
      User taste profile:
      - Persona: ${profile.persona.label}
      - Taste Vector: ${JSON.stringify(profile.tasteVector)}
      
      Generate a 2-sentence refined description highlighting their unique preferences.
    `;

    // const refinedDescription = await callLLM(prompt);

    // Update taste profile with LLM output
    await db.collection('taste_profiles').doc(event.params.profileId).update({
      refinedDescription: 'LLM output here',
      lastRefined: new Date()
    });
  }
);
```

### Function: `trackOnboardingEvent`

**Trigger:** onCreate in `user_onboarding_events` collection

**Purpose:** Analytics and metrics tracking

```typescript
export const trackOnboardingEvent = onDocumentCreated(
  'user_onboarding_events/{userId}/responses/{responseId}',
  async (event) => {
    const responses = event.data?.data();
    
    // Track to analytics service
    await logAnalytics('onboarding_completed', {
      userId: event.params.userId,
      timestamp: new Date(),
      persona: responses?.sheet4?.personaKeyword,
      privacy: responses?.sheet4?.privacy
    });
  }
);
```

## Data Validation

### Client-Side Validation (Already Implemented)

All validation is done in the onboarding sheet components:
- Sheet 1: Requires at least 1 group size and 1 day preference
- Sheet 2: Requires exactly 3 food styles, at least 1 ambiance, 1 activity
- Sheet 3: Requires at least 1 travel mode
- Sheet 4: All fields optional

### Server-Side Validation (Cloud Functions)

For production, add server-side validation:

```typescript
import { onDocumentWritten } from 'firebase-functions/v2/firestore';

export const validateTasteProfile = onDocumentWritten(
  'taste_profiles/{profileId}',
  async (event) => {
    const newData = event.data?.after.data();
    if (!newData) return;

    // Validate taste vector dimensions (0-1 range)
    const vector = newData.tasteVector;
    const validDimensions = ['foodie', 'explorer', 'aesthetic', 'introvert', 'nightOwl', 'budgetSensitivity'];
    
    for (const dim of validDimensions) {
      if (typeof vector[dim] !== 'number' || vector[dim] < 0 || vector[dim] > 1) {
        throw new Error(`Invalid taste vector dimension: ${dim}`);
      }
    }

    // Validate persona type
    const validPersonas = ['neonNomad', 'biscottiBotanist', 'budgetRanger', 'sunriseCartographer', 
                          'quietCurator', 'spontaneityEngine', 'tactileFoodsmith', 'photoPilgrim'];
    if (!validPersonas.includes(newData.persona.type)) {
      throw new Error(`Invalid persona type: ${newData.persona.type}`);
    }
  }
);
```

## Backup Strategy

### Weekly Backup

```bash
# Export all onboarding data
gcloud firestore export gs://YOUR_BUCKET/backups/$(date +%Y%m%d)/ \
  --collection-ids='user_profiles,taste_profiles,user_onboarding_events'
```

### Point-in-Time Recovery

Enable Point-in-Time Recovery (PITR) in Firebase Console:
1. Go to Firestore Database
2. Settings → Backups
3. Enable PITR (allows recovery up to 7 days back)

## Monitoring

### Key Metrics to Track

1. **Onboarding Completion Rate**
   - Query: `user_profiles` where `hasCompletedOnboarding == true`
   - Target: >80% of new users

2. **Average Time to Complete**
   - Use `user_onboarding_events.timestamp` and `user_profiles.createdAt`
   - Target: <5 minutes

3. **Persona Distribution**
   - Query: `taste_profiles` grouped by `persona.type`
   - Ensure balanced distribution (no persona >30%)

4. **Privacy Settings Adoption**
   - Track percentage of users with each privacy toggle
   - Monitor anonymous mode usage

### Firebase Analytics Events

Add these events to track user behavior:

```typescript
import { logEvent } from 'firebase/analytics';

// Sheet completion
logEvent(analytics, 'onboarding_sheet_completed', {
  sheet_number: 1,
  time_spent_seconds: 45
});

// Persona selection
logEvent(analytics, 'persona_selected', {
  persona_type: 'neonNomad',
  is_manual_selection: true
});

// Privacy settings
logEvent(analytics, 'privacy_settings_changed', {
  anonymous_mode: false,
  public_profile: true
});
```

## Testing Data

### Seed Test Profiles

```typescript
// scripts/seedOnboardingData.ts
import { db } from './firebase.node';
import { collection, doc, setDoc } from 'firebase/firestore';

const testProfiles = [
  {
    userId: 'test-user-1',
    tasteVector: {
      foodie: 0.9,
      explorer: 0.7,
      aesthetic: 0.8,
      introvert: 0.3,
      nightOwl: 0.6,
      budgetSensitivity: 0.2
    },
    persona: {
      type: 'neonNomad',
      emoji: '🌃',
      label: 'Neon Nomad',
      description: 'Night owl explorer seeking high-energy adventures',
      explanation: [
        'Your high explorer score (0.7) shows constant curiosity',
        'Night owl tendencies (0.6) drive late-night discoveries',
        'Low introvert score (0.3) means you thrive in social settings'
      ]
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
  // Add more test profiles...
];

async function seedData() {
  for (const profile of testProfiles) {
    const docRef = doc(collection(db, 'taste_profiles'));
    await setDoc(docRef, { ...profile, id: docRef.id });
    console.log(`Created test profile: ${docRef.id}`);
  }
}

seedData();
```

## Troubleshooting

### Issue: Permission Denied on taste_profiles

**Symptom:** Client gets "Missing or insufficient permissions" error

**Solution:**
1. Check user is authenticated: `auth.currentUser !== null`
2. Verify `userId` field matches `auth.uid`
3. Check security rules are deployed: `firebase deploy --only firestore:rules`

### Issue: hasCompletedOnboarding not updating

**Symptom:** User stuck in onboarding loop

**Solution:**
1. Check Firestore write succeeded: Look for error in browser console
2. Verify field name: `hasCompletedOnboarding` (camelCase)
3. Check user_profiles document exists before update:
```typescript
const userRef = doc(db, 'user_profiles', userId);
const userSnap = await getDoc(userRef);
if (!userSnap.exists()) {
  // Create profile first
  await setDoc(userRef, { ...profileData, hasCompletedOnboarding: true });
} else {
  await updateDoc(userRef, { hasCompletedOnboarding: true });
}
```

### Issue: Taste vector NaN values

**Symptom:** `tasteVector.foodie` shows `NaN` in Firestore

**Solution:**
1. Check survey responses have valid data (not undefined)
2. Add defensive checks in `computeTasteVector`:
```typescript
const foodieBase = Math.min((responses.sheet2?.topFoodStyles?.length ?? 0) / 3, 1);
```

### Issue: Duplicate onboarding responses

**Symptom:** Multiple documents in `user_onboarding_events/{userId}/responses`

**Solution:**
1. Use deterministic document ID (e.g., `latest` or timestamp)
2. Or implement idempotency check before writing

## Migration Script

For existing users who need to complete onboarding:

```typescript
// scripts/migrateExistingUsers.ts
import { db } from './firebase.node';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

async function migrateUsers() {
  const usersRef = collection(db, 'user_profiles');
  const snapshot = await getDocs(usersRef);
  
  let migrated = 0;
  
  for (const userDoc of snapshot.docs) {
    const data = userDoc.data();
    
    // Add onboarding fields if missing
    if (data.hasCompletedOnboarding === undefined) {
      await updateDoc(doc(db, 'user_profiles', userDoc.id), {
        hasCompletedOnboarding: false,
        'privacy.showPlacesToFriends': true,
        'privacy.publicProfile': false,
        'privacy.anonymousMode': false
      });
      
      migrated++;
      console.log(`Migrated user: ${userDoc.id}`);
    }
  }
  
  console.log(`Total users migrated: ${migrated}`);
}

migrateUsers();
```

## Production Checklist

- [ ] Deploy Firestore security rules
- [ ] Create composite index for `taste_profiles` (userId + createdAt)
- [ ] Enable PITR for 7-day recovery window
- [ ] Set up Cloud Function for LLM refinement (optional)
- [ ] Configure Firebase Analytics events
- [ ] Migrate existing users with new fields
- [ ] Test onboarding flow in production
- [ ] Set up monitoring dashboard (completion rate, time spent)
- [ ] Configure backup schedule (weekly exports)
- [ ] Document runbook for common issues

---

**Next Steps:**
1. Deploy security rules: `firebase deploy --only firestore:rules`
2. Create indexes via Firebase Console
3. Test onboarding with test user
4. Monitor completion metrics for 1 week
5. Iterate on UX based on analytics
