# ⚡ Quick Start Guide - Connect BLR

## 🚨 BEFORE YOU START

The app **will NOT work** without proper Firebase configuration. You need:
- Firebase Web App credentials
- No map API key needed! (We use free OpenStreetMap)

## 30-Second Setup

### 1. Get Your Credentials

**Firebase** (5 min):
- Go to: https://console.firebase.google.com/
- Project: `connectrockin` → Settings → Web App
- Copy: apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId

**Map**: No setup needed! We use free Leaflet + OpenStreetMap tiles 🎉

### 2. Configure .env

Edit `.env` file:
```env
VITE_FIREBASE_API_KEY=<your-api-key>
VITE_FIREBASE_AUTH_DOMAIN=connectrockin.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=connectrockin
VITE_FIREBASE_STORAGE_BUCKET=connectrockin.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=<your-sender-id>
VITE_FIREBASE_APP_ID=<your-app-id>

# No map API key needed!
```

### 3. Enable Firebase Services

**In Firebase Console:**

1. **Authentication** → Enable Google + Email/Password
2. **Firestore Database** → Create database → Copy rules from `SETUP.md`
3. **Storage** → Get started → Copy rules from `SETUP.md`

### 4. Run the App

```bash
npm install --legacy-peer-deps
npm run seed:places
npm run dev
```

> **Note**: Use `--legacy-peer-deps` for React 19 compatibility

Visit: `http://localhost:5173` 🎉

## ✅ What You Should See

1. **Map with 5 markers** in Bengaluru
2. **Category filters** above place list
3. **"Share a spot"** button in header
4. **"Sign in"** button in header

## 🎮 Test the App

1. Click a marker → See popup → Click "View Details"
2. Click "Sign in" → Try Google or Email auth
3. After signing in → Click "Share a spot" → Fill form → Submit
4. Go to `/admin` → See your submission → Approve it
5. Go back to map → See your new place!

## 🐛 If Something's Wrong

**Blank map?**
- Map should load automatically with OpenStreetMap tiles
- Check browser console for errors
- Restart dev server

**Auth errors?**
- Check Firebase credentials in `.env`
- Enable Auth providers in Firebase Console
- Restart dev server

**No data?**
- Run `npm run seed:places`
- Check Firestore rules

**Still stuck?**
- See `SETUP.md` for detailed troubleshooting

## 📖 Full Documentation

- `SETUP.md` - Complete setup instructions
- `README_NEW.md` - Full project documentation
- `CHANGES.md` - What was changed/fixed

---

**Time to first successful run: ~10 minutes** ⏱️
