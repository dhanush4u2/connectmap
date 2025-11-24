# 🔥 Firebase Debug Guide

## Current Issue: PERMISSION_DENIED

The error means your Firestore security rules are blocking access. Here's how to fix it:

---

## ✅ Solution 1: Update Firestore Rules (RECOMMENDED)

Go to: https://console.firebase.google.com/project/connectrockin/firestore/rules

Replace the rules with this EXACT configuration:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Allow anyone to read places
    match /places/{placeId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Allow authenticated users to access moderation queue
    match /moderation_queue/{docId} {
      allow read, write: if request.auth != null;
    }
    
    // Allow anyone to read reviews, authenticated to write
    match /reviews/{reviewId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

**Important:** Click the **PUBLISH** button after pasting!

---

## ✅ Solution 2: Manually Add Data (YES, YOU CAN!)

Instead of using the seed script, manually add places through Firebase Console:

1. Go to: https://console.firebase.google.com/project/connectrockin/firestore/data
2. Click **"Start collection"**
3. Collection ID: `places`
4. Click **"Next"**

### Add your first place:
- Document ID: `place-001`
- Add these fields one by one:

| Field Name | Type | Value |
|------------|------|-------|
| `title` | string | `Indiranagar Café` |
| `description` | string | `Cozy coffee shop with late-night vibes` |
| `category` | string | `food_cafe` |
| `status` | string | `published` |
| `address` | string | `100 Feet Road, Indiranagar` |
| `city` | string | `Bengaluru` |
| `neighbourhood` | string | `Indiranagar` |
| `avgRating` | number | `4.5` |
| `createdBy` | string | `manual` |
| `tags` | array | Add items: `coffee`, `late-night`, `vibes` |
| `location` | map | Add fields: `lat` (number): `12.9784`, `lng` (number): `77.6408` |
| `images` | array | Leave empty for now |
| `reactionCount` | map | Add fields: `like` (number): `0`, `love` (number): `0`, `save` (number): `0` |
| `contributors` | array | Leave empty |
| `meta` | map | Add fields: `views` (number): `0`, `featuredScore` (number): `0` |
| `createdAt` | timestamp | Click "Set to current timestamp" |
| `updatedAt` | timestamp | Click "Set to current timestamp" |

Click **"Save"**

---

## 🐛 Debug Steps

### Step 1: Check Firebase Console
Open browser console (F12) and check for errors when visiting http://localhost:5174

### Step 2: Verify Firebase Config
Your current `.env` file has these values:
```
VITE_FIREBASE_API_KEY=AIzaSyAmCMW3R0wbY2wExDKwb5oeybryHN_pwDI
VITE_FIREBASE_PROJECT_ID=connectrockin
```

Verify these match your Firebase Console:
https://console.firebase.google.com/project/connectrockin/settings/general

### Step 3: Test Firestore Connection
Add this temporary code to `src/pages/MapPage.tsx` (line 36):

```typescript
console.log('Firebase initialized:', db)
console.log('Fetching places...')
```

Then check browser console for logs.

---

## 🎯 Why the Seed Script Failed

The seed script tries to **write** to Firestore, which requires:
1. ✅ Firestore Database enabled
2. ✅ Security rules that allow writes
3. ❌ Your current rules might be too restrictive

Even with "test mode" rules, the seed script runs from **Node.js (server)** not from an authenticated browser session, so it has no auth token.

**Two solutions:**
- Option A: Manually add 1-2 places via Firebase Console (easiest!)
- Option B: Temporarily set rules to `allow read, write: if true;` for testing, then restrict later

---

## 🚀 Quick Start (Skip Seeding)

1. **Manually add 1 place** using the table above
2. **Refresh the app** at http://localhost:5174
3. You should see the marker on the map! 🎉

Once you confirm the app works with manual data, we can fix the seed script permissions.
