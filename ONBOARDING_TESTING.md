# Onboarding System - Testing Guide

## Quick Start Testing

### Prerequisites
- Firebase project configured
- Authentication enabled (Google OAuth)
- Firestore database created
- Security rules deployed

### Test Account Setup

1. **Create Test User**
   ```bash
   # Sign in via UI with test Google account
   # OR use Firebase Auth Emulator
   firebase emulators:start --only auth,firestore
   ```

2. **Clear Onboarding State** (for retesting)
   ```typescript
   // In browser console
   import { doc, updateDoc } from 'firebase/firestore';
   import { db, auth } from './lib/firebase';
   
   await updateDoc(doc(db, 'user_profiles', auth.currentUser.uid), {
     hasCompletedOnboarding: false
   });
   
   // Then refresh page
   ```

## Test Scenarios

### ✅ Scenario 1: First-Time User (Google OAuth)

**Goal:** Complete full onboarding flow

**Steps:**
1. Sign in with Google account (no existing profile)
2. **Expected:** Redirect to `/onboarding`
3. **Sheet 1:**
   - Select "🔥 High-Energy" hangout energy
   - Set social battery to 75
   - Select "👫 Duo" and "👥 Squad (3-5)"
   - Select "🌆 Weekday Evening" and "🌃 Weekend Night"
   - Click "Next"
4. **Sheet 2:**
   - Search and select 3 food styles: "Italian", "Japanese", "Mexican"
   - Select ambiances: "🎨 Trendy" and "🎉 Lively"
   - Select activities: "🍽️ Dining" and "🍺 Bars/Nightlife"
   - Select "💸 Mid-Range" budget
   - Click "Next"
5. **Sheet 3:**
   - Select travel modes: "🚶 Walking" and "🚇 Public Transit"
   - Select "🗺️ Spontaneous" weekend type
   - Set new place frequency to 80
   - Select "📸 Always" photo preference
   - Click "Next"
6. **Sheet 4:**
   - Select "🌃 Neon Nomad" persona
   - Add tags: "foodie", "nightlife", "explorer"
   - Toggle privacy settings as desired
   - Click "Complete Profile"
7. **LoadingProfile Animation:**
   - See bouncing map emoji
   - Watch progress bar animate
   - Read status bullets (fade in sequentially)
   - Wait 2 seconds
8. **Expected:** Redirect to `/` (map page)

**Firestore Validation:**
```typescript
// Check user_profiles
const userProfile = await getDoc(doc(db, 'user_profiles', userId));
console.assert(userProfile.data().hasCompletedOnboarding === true);
console.assert(userProfile.data().tasteProfileId !== undefined);

// Check taste_profiles
const tasteProfile = await getDoc(doc(db, 'taste_profiles', userProfile.data().tasteProfileId));
console.assert(tasteProfile.data().persona.type === 'neonNomad');
console.assert(tasteProfile.data().tasteVector.explorer > 0.7); // High explorer score

// Check user_onboarding_events
const responses = await getDocs(collection(db, `user_onboarding_events/${userId}/responses`));
console.assert(responses.size === 1);
```

---

### ✅ Scenario 2: Existing User (Already Completed)

**Goal:** Verify onboarding bypass

**Steps:**
1. Sign in with user who has `hasCompletedOnboarding: true`
2. **Expected:** Redirect to `/` (NOT `/onboarding`)
3. Try navigating to `/onboarding` directly
4. **Expected:** Redirect to `/`

---

### ✅ Scenario 3: Validation Errors

**Goal:** Test form validation

**Sheet 1 Tests:**
1. Don't select any group size → **Error:** "Please select at least one group size"
2. Don't select any day preference → **Error:** "Please select at least one day preference"
3. Click "Next" without completing → **Disabled button**

**Sheet 2 Tests:**
1. Select only 2 food styles → **Counter shows "2/3"** → Button disabled
2. Select 4 food styles → **Only first 3 accepted**
3. Don't select any ambiance → **Error:** "Please select at least one ambiance"
4. Don't select any activity → **Error:** "Please select at least one activity"

**Sheet 3 Tests:**
1. Don't select any travel mode → **Error:** "Please select at least one travel mode"

**Sheet 4 Tests:**
1. All fields optional → **No errors, can complete**

---

### ✅ Scenario 4: Privacy Settings

**Goal:** Test privacy controls

**Test Cases:**
1. **Public Profile:**
   - Enable "Public Profile"
   - Complete onboarding
   - Verify `user_profiles.privacy.publicProfile === true`

2. **Anonymous Mode:**
   - Enable "Anonymous Mode"
   - Complete onboarding
   - Verify username is `user_{uid.substring(0,8)}`

3. **All Private:**
   - Disable all 3 toggles
   - Complete onboarding
   - Verify all privacy fields are `false`

---

### ✅ Scenario 5: Persona Classification

**Goal:** Test persona algorithm accuracy

**Test Profiles:**

| Test Case | Survey Answers | Expected Persona |
|-----------|----------------|------------------|
| Night Owl + Explorer | Weekend Night, High frequency (90) | **Neon Nomad** 🌃 |
| Foodie + Peaceful | 3 food styles, Peaceful ambiance, Always photos | **Biscotti Botanist** 🌿 |
| Budget + Spontaneous | Budget tier, Spontaneous weekend, High frequency | **Budget Ranger** 💰 |
| Early Bird + Planner | Weekday Morning, Planner weekend, Low frequency | **Sunrise Cartographer** 🌅 |
| Solo + Aesthetic | Solo group, Trendy ambiance, Always photos | **Quiet Curator** 🕯️ |
| High Energy + Big Groups | High-Energy, Big Group (6+), Lively ambiance | **Spontaneity Engine** 🎲 |
| Dining Focused | All activities = Dining, 3 food styles | **Tactile Foodsmith** 🍽️ |
| Photo Obsessed | Always photos, Aesthetic ambiance, High explorer | **Photo Pilgrim** 📸 |

**Validation Script:**
```typescript
import { computeTasteVector, classifyPersona } from './lib/tasteProfileCompute';

const testCases = [
  {
    name: 'Night Owl Explorer',
    responses: {
      sheet1: {
        hangoutEnergy: 'high-energy',
        socialBattery: 80,
        groupSize: ['duo', 'squad'],
        dayPreferences: ['weekend-night', 'weekday-evening']
      },
      sheet2: {
        topFoodStyles: ['Italian', 'Japanese', 'Mexican'],
        favoriteAmbiances: ['lively'],
        activityPreferences: ['dining', 'bars-nightlife'],
        budgetTier: 'mid-range'
      },
      sheet3: {
        travelMode: ['walking'],
        weekendType: 'spontaneous',
        newPlaceFrequency: 90,
        photoPreference: 'always'
      },
      sheet4: {
        freeTags: [],
        privacy: { showPlacesToFriends: true, publicProfile: false, anonymousMode: false }
      }
    },
    expectedPersona: 'neonNomad'
  }
  // Add more test cases...
];

testCases.forEach(test => {
  const vector = computeTasteVector(test.responses);
  const persona = classifyPersona(vector, test.responses);
  console.assert(
    persona.type === test.expectedPersona,
    `Failed: ${test.name} - Expected ${test.expectedPersona}, got ${persona.type}`
  );
});
```

---

### ✅ Scenario 6: Edge Cases

**Test Cases:**

1. **Back Button Mid-Flow:**
   - Complete Sheet 1, click "Next"
   - Hit browser back button
   - **Expected:** Stay on Sheet 2 (no navigation)

2. **Refresh Mid-Flow:**
   - Complete Sheet 1, click "Next"
   - Refresh page
   - **Expected:** Start from Sheet 1 (state not persisted)
   - **Note:** This is intentional - users must complete in one session

3. **Network Failure:**
   - Complete all sheets
   - Disconnect network
   - Click "Complete Profile"
   - **Expected:** Loading screen stays, error toast appears
   - Reconnect network
   - **Expected:** Retry automatically (or show retry button)

4. **Concurrent Sessions:**
   - Sign in on 2 devices simultaneously
   - Complete onboarding on Device 1
   - Try completing on Device 2
   - **Expected:** Device 2 redirects to `/` (already completed)

5. **Invalid Unicode in Tags:**
   - Enter tags with emoji: "😀 happy vibes"
   - **Expected:** Accepted (Firestore supports Unicode)

6. **XSS Attempt in Tags:**
   - Enter tag: `<script>alert('xss')</script>`
   - **Expected:** Rendered as plain text (React escapes by default)

---

## Automated Testing (Playwright)

### E2E Test Suite

```typescript
// e2e/onboarding-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Onboarding Flow', () => {
  test('should complete full onboarding for new user', async ({ page }) => {
    // Sign in
    await page.goto('/');
    await page.click('text=Sign In with Google');
    // ... handle Google OAuth popup ...
    
    // Should redirect to /onboarding
    await expect(page).toHaveURL('/onboarding');
    
    // Sheet 1
    await page.click('text=High-Energy');
    await page.fill('input[type="range"]', '75');
    await page.click('text=Duo');
    await page.click('text=Weekend Night');
    await page.click('button:has-text("Next")');
    
    // Sheet 2
    await page.fill('input[placeholder="Search food styles..."]', 'Italian');
    await page.click('text=Italian');
    // ... complete all fields ...
    await page.click('button:has-text("Next")');
    
    // Sheet 3
    await page.click('text=Walking');
    await page.click('text=Spontaneous');
    await page.fill('input[type="range"]', '80');
    await page.click('text=Always');
    await page.click('button:has-text("Next")');
    
    // Sheet 4
    await page.click('text=Neon Nomad');
    await page.fill('input[placeholder="e.g., adventurous, curious..."]', 'foodie');
    await page.keyboard.press('Enter');
    await page.click('button:has-text("Complete Profile")');
    
    // Loading animation
    await expect(page.locator('text=Building your profile')).toBeVisible();
    
    // Redirect to map
    await expect(page).toHaveURL('/', { timeout: 5000 });
  });
  
  test('should show validation errors', async ({ page }) => {
    await page.goto('/onboarding');
    
    // Try to proceed without completing Sheet 1
    const nextButton = page.locator('button:has-text("Next")');
    await expect(nextButton).toBeDisabled();
    
    // Fill partial data
    await page.click('text=High-Energy');
    await expect(nextButton).toBeDisabled(); // Still disabled (missing group size)
    
    await page.click('text=Duo');
    await expect(nextButton).toBeEnabled(); // Now enabled
  });
});
```

---

## Performance Testing

### Load Time Metrics

**Targets:**
- Sheet 1 render: <200ms
- Sheet 2 food style search: <100ms per keystroke
- Taste vector computation: <50ms
- Total onboarding time: <5 minutes (user-dependent)

**Measurement:**
```typescript
// Add to OnboardingPage.tsx
useEffect(() => {
  const startTime = performance.now();
  
  return () => {
    const endTime = performance.now();
    console.log(`Sheet ${currentSheet} render time: ${endTime - startTime}ms`);
  };
}, [currentSheet]);
```

### Firestore Write Performance

**Targets:**
- Single write (taste_profiles): <500ms
- Batch write (3 collections): <1000ms

**Measurement:**
```typescript
const startTime = performance.now();
await setDoc(doc(db, 'taste_profiles', profileId), tasteProfile);
const endTime = performance.now();
console.log(`Firestore write time: ${endTime - startTime}ms`);
```

---

## Accessibility Testing

### Keyboard Navigation

- [ ] Tab through all form fields in order
- [ ] Space/Enter to select radio buttons
- [ ] Arrow keys to adjust sliders
- [ ] Escape to close search dropdown (Sheet 2)

### Screen Reader

- [ ] All labels read correctly
- [ ] Error messages announced
- [ ] Progress bar announces percentage
- [ ] Loading status announced

### Color Contrast

- [ ] All text meets WCAG AA standard (4.5:1 ratio)
- [ ] Active states have sufficient contrast
- [ ] Error states use more than just color (icon + text)

---

## Browser Compatibility

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

---

## Rollback Plan

If critical issues found in production:

1. **Disable Onboarding Redirect:**
   ```typescript
   // In useOnboardingCheck.ts
   const ONBOARDING_ENABLED = false; // Feature flag
   
   if (!ONBOARDING_ENABLED) {
     return { hasCompletedOnboarding: true, loading: false };
   }
   ```

2. **Mark All Users as Completed:**
   ```typescript
   // Emergency script
   const usersRef = collection(db, 'user_profiles');
   const snapshot = await getDocs(usersRef);
   
   for (const doc of snapshot.docs) {
     await updateDoc(doc.ref, { hasCompletedOnboarding: true });
   }
   ```

3. **Revert Code:**
   ```bash
   git revert HEAD~5  # Revert last 5 commits (onboarding feature)
   git push origin main
   ```

---

## Monitoring Dashboard

### Key Metrics to Track

```typescript
// Firebase Analytics
logEvent(analytics, 'onboarding_started', { timestamp: new Date() });
logEvent(analytics, 'onboarding_sheet_completed', { sheet: 1, time_spent: 45 });
logEvent(analytics, 'onboarding_abandoned', { sheet: 2, reason: 'validation_error' });
logEvent(analytics, 'onboarding_completed', { 
  total_time: 240, 
  persona: 'neonNomad',
  privacy_public: false
});
```

### Alerts to Set Up

- Completion rate drops below 70%
- Average time exceeds 10 minutes
- Error rate exceeds 5%
- Persona distribution skews (one persona >40%)

---

## Success Criteria

✅ **MVP Launch:**
- [ ] 80%+ completion rate
- [ ] Average time <6 minutes
- [ ] <2% error rate
- [ ] All 8 personas represented
- [ ] No critical bugs in 1 week

✅ **Post-Launch Goals:**
- [ ] 90%+ completion rate (after UX improvements)
- [ ] Average time <4 minutes
- [ ] <1% error rate
- [ ] A/B test 2-sheet vs 4-sheet flow

---

**Ready to Test!** Start with Scenario 1 (First-Time User) to verify end-to-end flow.
