# Quick Start Guide - Admin & Social Features

## 🚀 Quick Setup (5 minutes)

### Step 1: Firebase Collections
In Firebase Console → Firestore, create these collections:
- ✅ `user_profiles`
- ✅ `friend_requests`
- ✅ `friendships`
- ✅ `categories`

### Step 2: Enable Admin Access
1. Sign in to your app
2. Copy your UID from browser console
3. In Firestore, go to `admin_roles` collection
4. Create document: `{your-uid}` with field `role: "admin"`
5. Refresh page - Admin button appears!

### Step 3: Create Indexes
In Firebase Console → Firestore → Indexes, create:
```
friend_requests: toUserId (ASC) + status (ASC)
friend_requests: fromUserId (ASC) + status (ASC)
```

### Step 4: Update Security Rules
Copy rules from `SOCIAL_FEATURES_SETUP.md` → Firestore Rules

## ✨ Features Overview

### Admin Dashboard (`/admin` route)
- **📋 Submissions**: Approve/reject place submissions
- **🏷️ Categories**: Add/delete categories
- **👥 Admins**: Manage admin users

### Social Panel (Right side of map)
- **👥 Friends**: View all friends, remove friends
- **🔔 Mutual Saves**: Places saved by you AND friends
- **🔍 Search**: Find users, send friend requests
- **📬 Requests**: Accept/decline friend requests

## 🧪 Testing

### Test Admin Features
```bash
1. Sign in as admin
2. Click "Admin" in top nav
3. Test each tab
```

### Test Social Features
```bash
1. Create 2 accounts (use Chrome + Incognito)
2. Search for each other
3. Add as friends
4. Both save the same place
5. Check 🔔 tab - mutual save appears!
```

## 🐛 Troubleshooting

**Admin button not showing?**
- Check console: Should show `Admin check: { isAdmin: true, user: "..." }`
- Verify UID matches exactly in `admin_roles` collection
- Sign out and sign in again

**Friend requests failing?**
- Create Firestore indexes (see Step 3)
- Update security rules

**Mutual saves not working?**
- Ensure users are friends first
- Both users must save the place
- Check `user_profiles` collection has `savedPlaces` arrays

## 📚 Documentation

- **SOCIAL_FEATURES_SETUP.md** - Complete Firebase setup
- **ADMIN_SOCIAL_IMPLEMENTATION.md** - Full implementation details
- **IMPLEMENTATION_GUIDE.md** - Original feature guide

## 🎯 Key Files

**Admin:**
- `src/pages/AdminDashboardPage.tsx`
- `src/components/CategoryManager.tsx`
- `src/components/AdminManager.tsx`

**Social:**
- `src/components/SocialPanel.tsx`
- `src/hooks/useFriends.ts`
- `src/hooks/useMutualSaves.ts`

## ✅ All Done!

All features are implemented and ready to use. Follow the setup steps above and you're good to go! 🎉
