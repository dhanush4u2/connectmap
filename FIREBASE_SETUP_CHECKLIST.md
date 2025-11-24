# 🔥 Firebase Setup Checklist

Before running `npm run seed:places`, complete these steps in Firebase Console:

## 1. Enable Firestore Database ✅

1. Visit: https://console.firebase.google.com/project/connectrockin/firestore
2. Click **"Create Database"**
3. Choose **"Start in production mode"**
4. Select location: **asia-south1** (Mumbai, India)
5. Click **"Enable"**

### Add Firestore Security Rules:
Go to **Rules** tab and paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /places/{placeId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
    }
    
    match /moderation_queue/{docId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    match /reviews/{reviewId} {
      allow read: if true;
      allow create: if request.auth != null;
    }
  }
}
```

Click **"Publish"**

---

## 2. Enable Authentication ✅

1. Visit: https://console.firebase.google.com/project/connectrockin/authentication
2. Click **"Get Started"**
3. Enable **Email/Password** provider
4. Enable **Google** provider (add your email as authorized domain)

---

## 3. Enable Firebase Storage ✅

1. Visit: https://console.firebase.google.com/project/connectrockin/storage
2. Click **"Get Started"**
3. Choose **"Start in production mode"**
4. Select same location as Firestore

### Add Storage Security Rules:
Go to **Rules** tab and paste:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /places/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

Click **"Publish"**

---

## 4. Seed Sample Data 🌱

After completing steps 1-3, run:

```bash
npm run seed:places
```

This will add 5 sample places to your map:
- Indiranagar Night Café
- Go-Karting Arena (Koramangala)
- Cineplex IMAX (Whitefield)
- Artisan Coffee House (MG Road)
- Urban Climbing Wall (HSR Layout)

---

## 5. Test the App 🚀

1. Visit: http://localhost:5173
2. Sign in with Google or Email/Password
3. View the 5 seeded places on the map
4. Try submitting a new place
5. Check admin dashboard to approve submissions

---

## ⚠️ Current Error Explained

The error `7 PERMISSION_DENIED: Missing or insufficient permissions` means:
- ✅ Firebase connection is working
- ✅ Environment variables are loaded correctly
- ❌ Firestore Database is not enabled yet

Complete Step 1 above to fix this!
