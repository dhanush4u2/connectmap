# 🌟 Connect BLR - Discover Bengaluru

A beautiful, community-driven platform for discovering and sharing amazing cafés, activities, and movie spots in Bengaluru. Built with React, Firebase, and Mapbox.

![Connect BLR](https://img.shields.io/badge/React-19.2-blue) ![Firebase](https://img.shields.io/badge/Firebase-11.3-orange) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)

## ✨ Features

- 🗺️ **Interactive Map** - Explore places on an interactive Mapbox map with custom markers
- 🔍 **Smart Filtering** - Filter by category (Food & Café, Activities, Movies) and tags
- 🔐 **User Authentication** - Sign in with Google or Email via Firebase Auth
- 📝 **Submit Places** - Share your favorite spots with the community
- ❤️ **Reactions** - Like, love, and save places you enjoy
- ⭐ **Reviews** - Write and read reviews from other community members
- 👨‍💼 **Admin Dashboard** - Moderation queue for approving/rejecting submissions
- 🎨 **Premium Design** - Dark theme with warm orange gradients and smooth animations
- 📱 **Responsive** - Works seamlessly on desktop and mobile

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/pnpm
- Firebase account (free tier works)
- No map API key needed! (Free OpenStreetMap tiles)

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd connectmap
npm install --legacy-peer-deps
```

> **Note**: We use `--legacy-peer-deps` because react-leaflet hasn't updated to support React 19 yet. It works perfectly fine with React 19.

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing project: `connectrockin`)
3. Enable **Authentication** (Google & Email/Password providers)
4. Enable **Firestore Database** (Start in production mode, we'll add rules)
5. Enable **Storage** (Start in production mode)
6. Go to Project Settings → General → Your apps → Web app
7. Copy the Firebase config values

### 3. Configure Environment Variables

Edit the `.env` file in the project root with your credentials:

```env
# Firebase Web App Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=connectrockin.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=connectrockin
VITE_FIREBASE_STORAGE_BUCKET=connectrockin.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# No map API key needed - we use free OpenStreetMap tiles!
```

### 4. Firestore Security Rules

In Firebase Console → Firestore Database → Rules, add:

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
      allow update: if request.auth != null; // Add admin check in production
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

### 5. Storage Security Rules

In Firebase Console → Storage → Rules, add:

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

### 6. Seed Sample Data

```bash
npm run seed:places
```

### 7. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` 🎉

## 📁 Project Structure

```
connectmap/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── MapView.tsx    # Mapbox map with markers
│   │   └── TopNav.tsx     # Navigation header
│   ├── pages/             # Route pages
│   │   ├── MapPage.tsx            # Main map with filtering
│   │   ├── PlaceDetailPage.tsx   # Place details & reviews
│   │   ├── SubmitPage.tsx        # Submit new places
│   │   ├── ProfilePage.tsx       # Auth & user profile
│   │   └── AdminDashboardPage.tsx # Moderation queue
│   ├── hooks/             # Custom React hooks
│   │   └── useAuthState.ts
│   ├── lib/               # Utilities & config
│   │   └── firebase.ts    # Firebase initialization
│   ├── App.tsx            # Main app component
│   └── main.tsx           # App entry point
├── scripts/
│   └── seedPlaces.ts      # Database seeding script
└── public/                # Static assets
```

## 🎨 Design Theme

The app features a warm, vibrant aesthetic inspired by food and entertainment:

- **Color Palette**: Deep brown backgrounds with orange/yellow gradients
- **Primary**: `#ff6b2c` (vibrant orange)
- **Accents**: `#ffb340` (warm yellow), `#ff4545` (accent red)
- **Typography**: System fonts with bold gradients
- **Components**: Rounded corners (1.25-1.5rem), soft shadows, hover animations

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: TailwindCSS with custom warm theme
- **State**: TanStack Query (React Query)
- **Auth**: Firebase Authentication (Google + Email)
- **Database**: Cloud Firestore
- **Storage**: Firebase Storage
- **Maps**: Leaflet + OpenStreetMap (completely free!)
- **Routing**: React Router v7
- **Testing**: Vitest + Playwright

## 📝 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run test         # Run unit tests
npm run test:ui      # Run tests with UI
npm run e2e          # Run E2E tests
npm run seed:places  # Seed sample places to Firestore
```

## 🔐 Authentication Flow

1. User clicks "Sign In" → Redirected to `/profile`
2. Choose Google OAuth or Email/Password
3. Firebase handles authentication
4. User redirected back with auth token
5. Auth state managed via `useAuthState` hook

## 📍 Adding Places

1. Click "Share a spot" button
2. Fill in place details (name, description, category, location)
3. Optionally add images (up to 5)
4. Click "Get Location" to auto-fill coordinates
5. Submit → Goes to moderation queue
6. Admin approves → Place appears on map

## 👨‍💼 Admin Moderation

1. Sign in with admin account
2. Navigate to `/admin`
3. View pending submissions
4. Click submission to review details
5. Approve (publishes to map) or Reject

## 🚀 Deployment

### Vercel (Recommended)

```bash
npm run build
# Connect your GitHub repo to Vercel
# Add environment variables in Vercel dashboard
```

### Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - feel free to use this project for learning or your own purposes!

## 🙏 Acknowledgments

- Leaflet & OpenStreetMap for free, beautiful maps
- Firebase for backend infrastructure
- The Bengaluru community for inspiration

## 🐛 Known Issues & Future Enhancements

- [ ] Add clustering for better performance with many markers
- [ ] Implement place search with Algolia
- [ ] Add "Featured Place of the Day" automation
- [ ] User contribution leaderboard
- [ ] Push notifications for new places
- [ ] Social sharing with Open Graph tags
- [ ] PWA support for offline access

---

Built with ❤️ for the Bengaluru community
