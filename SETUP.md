# 🚀 SETUP INSTRUCTIONS - Connect BLR

## ⚠️ IMPORTANT: You Need to Configure Your Credentials

The app **will not work** until you add your Firebase and Mapbox credentials to the `.env` file.

## Step-by-Step Setup

### 1. Get Firebase Credentials

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: `connectrockin` (or create a new one)
3. **Go to Project Settings** (gear icon) → **General** tab
4. **Scroll down to "Your apps"** section
5. **Click on the Web app** (</> icon) or create one if none exists
6. **Copy the config object**

You'll see something like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "connectrockin.firebaseapp.com",
  projectId: "connectrockin",
  storageBucket: "connectrockin.appspot.com",
  messagingSenderId: "112059090391997797534",
  appId: "1:112059090391997797534:web:..."
};
```

### 2. Update .env File

Open the `.env` file in the root of your project and replace the placeholder values with your Firebase credentials:

```env
# Replace these with your actual values from Firebase Console
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=connectrockin.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=connectrockin
VITE_FIREBASE_STORAGE_BUCKET=connectrockin.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=112059090391997797534
VITE_FIREBASE_APP_ID=1:112059090391997797534:web:XXXXXXXXXX

# No API key needed! We use Leaflet with free OpenStreetMap tiles
```

### 3. Enable Firebase Services

#### Enable Authentication:
1. In Firebase Console, click **Authentication** in the left menu
2. Click **Get Started**
3. Go to **Sign-in method** tab
4. Enable **Google** provider:
   - Click Google
   - Toggle Enable
   - Add support email
   - Save
5. Enable **Email/Password** provider:
   - Click Email/Password
   - Toggle Enable
   - Save

#### Enable Firestore:
1. Click **Firestore Database** in left menu
2. Click **Create database**
3. Choose **Start in production mode**
4. Select location (choose closest to Bengaluru: `asia-south1`)
5. Click **Enable**
6. Go to **Rules** tab and paste these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /places/{placeId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /moderation_queue/{submissionId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
    }
    match /reviews/{reviewId} {
      allow read: if true;
      allow create: if request.auth != null;
    }
    match /reactions/{reactionId} {
      allow read: if true;
      allow create: if request.auth != null;
    }
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth.uid == userId;
    }
  }
}
```

#### Enable Storage:
1. Click **Storage** in left menu
2. Click **Get Started**
3. Choose **Start in production mode**
4. Click **Next** → **Done**
5. Go to **Rules** tab and paste:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /submissions/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null
                  && request.resource.size < 5 * 1024 * 1024
                  && request.resource.contentType.matches('image/.*');
    }
  }
}
```

### 5. Install Dependencies

```bash
npm install --legacy-peer-deps
```

> **Note**: The `--legacy-peer-deps` flag is needed because react-leaflet hasn't officially updated for React 19 yet, but it works fine.

### 6. Seed Sample Data

This will add 5 sample places to your Firestore:

```bash
npm run seed:places
```

You should see:
```
Seeded cafe-indiranagar-1
Seeded activity-koramangala-1
Seeded movie-whitefield-1
Seeded cafe-mg-road-1
Seeded activity-hsr-1
✅ Seeding complete!
```

### 7. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` 🎉

## ✅ Verification Checklist

- [ ] `.env` file has real Firebase credentials (not placeholders)
- [ ] Firebase Authentication is enabled (Google + Email/Password)
- [ ] Firestore Database is created with proper rules
- [ ] Firebase Storage is enabled with proper rules
- [ ] Sample data is seeded successfully
- [ ] Dev server runs without errors
- [ ] Map loads and shows markers (using free OpenStreetMap tiles)
- [ ] Can sign in with Google or Email
- [ ] Can submit a new place
- [ ] Can view place details

## 🐛 Troubleshooting

### "Firebase: Error (auth/invalid-api-key)"
- Your Firebase API key is wrong or not set
- Check `.env` file has `VITE_FIREBASE_API_KEY` with correct value
- Restart dev server after changing `.env`

### "Permission denied" errors in console
- Your Firestore/Storage rules are not set correctly
- Go back to Firebase Console and update the rules as shown above

### Seeding fails
- Make sure `.env` is configured correctly
- Make sure Firestore is enabled
- Check your internet connection
- Run `npm install` again

### "ERESOLVE unable to resolve dependency tree" error
- This happens because react-leaflet hasn't officially updated to React 19
- Solution: Use `npm install --legacy-peer-deps`
- Or: An `.npmrc` file is included to handle this automatically

### Dev server won't start
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# Try running again
npm run dev
```

## 📞 Need Help?

1. Check Firebase Console for any error messages
2. Check browser console (F12) for errors
3. Make sure all environment variables are set correctly
4. Verify Firebase services are enabled

---

Once setup is complete, check out `README_NEW.md` for full documentation!
