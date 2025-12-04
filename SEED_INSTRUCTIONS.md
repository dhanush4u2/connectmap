# 🚨 IMMEDIATE ACTION REQUIRED: Deploy Firestore Rules

## The seed script failed because Firestore rules haven't been deployed yet.

### Quick Fix (Option 1 - Firebase Console - 5 minutes):

1. **Go to Firebase Console**: https://console.firebase.google.com/project/connectrockin/firestore/rules

2. **Replace the rules** with the content from `firestore.rules` file in this repository

3. **Click "Publish"**

4. **Run the seed script again**:
   ```bash
   npm run seed:places
   ```

---

### Alternative (Option 2 - Temporary Open Rules - FOR DEVELOPMENT ONLY):

If you need to seed immediately and will deploy proper rules later:

1. Go to: https://console.firebase.google.com/project/connectrockin/firestore/rules

2. **Temporarily** use these rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;  // WARNING: Temporarily allow all access
    }
  }
}
```

3. Click "Publish"

4. Run seed script:
   ```bash
   npm run seed:places
   ```

5. **IMPORTANT**: After seeding, go back and replace with the proper rules from `firestore.rules`

---

## What Will Be Seeded:

The script will upload **16 authentic Bangalore places**:

### Cafes & Restaurants (7):
- ☕ Third Wave Coffee Roasters (Indiranagar)
- 🍔 Truffles (Koramangala) - Famous burgers
- ☕ Brahmin's Coffee Bar (Basavanagudi) - Legendary breakfast
- 🍺 Toit Brewpub (Indiranagar) - Craft beer & pizza
- ☕ Blue Tokai Coffee Roasters (Whitefield)
- ☕ Koshy's (Church Street) - 1940s vintage cafe
- 🍽️ MTR (Mavalli) - 95-year-old iconic restaurant

### Activities (5):
- 🎮 Smaaash (Koramangala) - Gaming & VR
- 🧗 Climb Central (HSR) - Rock climbing
- 🎭 Rangashankara Theatre (JP Nagar)
- 🌊 Ulsoor Lake - Boating & picnics
- 🌳 Lalbagh Botanical Garden - 240-acre historic garden
- 🏞️ Cubbon Park - 300-acre central park

### Movies (3):
- 🎬 PVR Koramangala (IMAX, 4DX, Gold Class)
- 🎬 INOX Whitefield (Dolby Atmos, Recliners)
- 🎬 Gopalan Cinemas (Jayanagar) - Affordable multiplex

All places have:
- ✅ Real Bangalore coordinates
- ✅ Proper categories and subcategories
- ✅ Tags, ratings, and reaction counts
- ✅ Timings, price ranges, and descriptions
- ✅ Status set to 'published' (will appear on map immediately)

---

## After Seeding:

The frontend will automatically load these places because `MapPage.tsx` already fetches from the `places` collection:

```typescript
// This query runs on every map load
const q = query(
  collection(db, 'places'),
  where('status', '==', 'published')
)
```

**Markers will appear on the map** at their respective Bangalore locations!

---

## Current Status:

❌ Firestore rules not deployed  
❌ Cannot write to database  
⏳ Waiting for rules deployment  
✅ Script ready with 16 places  

**Action needed**: Deploy rules using Option 1 or 2 above, then run `npm run seed:places`
