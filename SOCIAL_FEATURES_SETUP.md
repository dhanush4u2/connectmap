# Firebase Setup for Social Features

## Required Firestore Collections

### 1. user_profiles
Store user profile information including saved places and friends.

**Fields:**
- `uid` (string): User's Firebase Auth UID
- `email` (string): User's email
- `displayName` (string): User's display name
- `photoURL` (string): User's profile photo URL
- `username` (string): Unique searchable username (lowercase)
- `bio` (string): User bio/description
- `savedPlaces` (array): Array of placeIds user has saved
- `friends` (array): Array of friend UIDs
- `friendCount` (number): Count of friends
- `placesCount` (number): Count of saved places
- `createdAt` (timestamp): Account creation time

**Indexes Required:**
- Single field index on `username` (ascending)
- Single field index on `displayName` (ascending)
- Single field index on `uid` (ascending)

**Security Rules:**
```javascript
match /user_profiles/{userId} {
  allow read: if request.auth != null;
  allow write: if request.auth != null && request.auth.uid == userId;
}
```

### 2. friend_requests
Store pending, accepted, and rejected friend requests.

**Fields:**
- `fromUserId` (string): UID of user sending request
- `toUserId` (string): UID of user receiving request
- `fromUserName` (string): Display name of sender
- `fromUserPhoto` (string): Photo URL of sender
- `status` (string): 'pending' | 'accepted' | 'rejected'
- `createdAt` (timestamp): Request creation time

**Indexes Required:**
- Composite index on `toUserId` (ascending) + `status` (ascending)
- Composite index on `fromUserId` (ascending) + `status` (ascending)

**Security Rules:**
```javascript
match /friend_requests/{requestId} {
  allow read: if request.auth != null && (
    request.auth.uid == resource.data.fromUserId ||
    request.auth.uid == resource.data.toUserId
  );
  allow create: if request.auth != null && request.auth.uid == request.resource.data.fromUserId;
  allow update: if request.auth != null && request.auth.uid == resource.data.toUserId;
  allow delete: if request.auth != null && (
    request.auth.uid == resource.data.fromUserId ||
    request.auth.uid == resource.data.toUserId
  );
}
```

### 3. friendships
Store confirmed friendships between users.

**Fields:**
- `user1Id` (string): UID of first user
- `user2Id` (string): UID of second user
- `createdAt` (timestamp): Friendship creation time

**Indexes Required:**
- Single field index on `user1Id` (ascending)
- Single field index on `user2Id` (ascending)

**Security Rules:**
```javascript
match /friendships/{friendshipId} {
  allow read: if request.auth != null && (
    request.auth.uid == resource.data.user1Id ||
    request.auth.uid == resource.data.user2Id
  );
  allow create: if request.auth != null;
  allow delete: if request.auth != null && (
    request.auth.uid == resource.data.user1Id ||
    request.auth.uid == resource.data.user2Id
  );
}
```

## Setup Steps

### 1. Create Collections
1. Go to Firebase Console → Firestore Database
2. Create the following collections:
   - `user_profiles`
   - `friend_requests`
   - `friendships`

### 2. Create Indexes
Go to Firebase Console → Firestore Database → Indexes

**friend_requests indexes:**
- Collection ID: `friend_requests`
  - Fields: `toUserId` (Ascending), `status` (Ascending)
- Collection ID: `friend_requests`
  - Fields: `fromUserId` (Ascending), `status` (Ascending)

**user_profiles indexes:**
- Collection ID: `user_profiles`
  - Fields: `username` (Ascending)
- Collection ID: `user_profiles`
  - Fields: `displayName` (Ascending)

### 3. Update Security Rules
1. Go to Firebase Console → Firestore Database → Rules
2. Add the rules provided above

### 4. Initialize User Profiles
When a user signs in for the first time, create their profile:

```typescript
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from './lib/firebase'

async function createUserProfile(user: User) {
  const userRef = doc(db, 'user_profiles', user.uid)
  await setDoc(userRef, {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || 'Anonymous',
    photoURL: user.photoURL || null,
    username: user.email?.split('@')[0].toLowerCase() || '',
    bio: '',
    savedPlaces: [],
    friends: [],
    friendCount: 0,
    placesCount: 0,
    createdAt: serverTimestamp()
  })
}
```

## Testing the Social Features

### 1. Create Test Users
1. Sign in with 2 different Google accounts
2. Profiles will be auto-created on first sign-in

### 2. Test Friend Requests
1. User A: Go to Social Panel → Search tab
2. Search for User B by username
3. Click "Add Friend"
4. User B: Go to Social Panel → Requests tab
5. Accept the friend request

### 3. Test Mutual Saves
1. Both users save the same place
2. Go to Social Panel → 🔔 (Mutual Saves) tab
3. Both users should see the mutual save notification

## Features Implemented

✅ **User Search**: Search users by username or display name
✅ **Friend Requests**: Send, accept, and reject friend requests
✅ **Friends List**: View all friends with remove functionality
✅ **Mutual Saves**: Detect when friends save the same places
✅ **Real-time Updates**: Friend requests update in real-time
✅ **Social Panel**: Integrated right panel on map page with tabs
✅ **Notifications**: Visual indicators for new mutual saves

## Next Steps

1. **Enable Admin Features**:
   - Check browser console for admin debug logs
   - Ensure admin role is set in `admin_roles` collection
   - Admin button should appear in TopNav when signed in

2. **Add Places**:
   - Use admin dashboard → Submissions tab to approve places
   - Or add directly to Firestore `places` collection

3. **Test Social Features**:
   - Create 2 test accounts
   - Add each other as friends
   - Save the same places to see mutual saves

4. **Customize**:
   - Update user profile creation logic
   - Add notification preferences
   - Implement push notifications (optional)
