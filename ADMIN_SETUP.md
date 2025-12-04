# Admin System Setup Guide

## Quick Start - Make Yourself an Admin

### Step 1: Get Your User ID

1. Sign in to your app
2. Open Browser Console (F12)
3. Run this command:
```javascript
firebase.auth().currentUser.uid
```
4. Copy your UID (looks like: `xYz123AbC456...`)

OR

Go to Firebase Console → Authentication → Users → Copy your UID

### Step 2: Create Admin Role in Firestore

1. Open Firebase Console
2. Go to Firestore Database
3. Click "Start collection"
4. Collection ID: `admin_roles`
5. Click "Next"
6. Document ID: **[YOUR_UID]** (paste your copied UID)
7. Add these fields:

```
Field: uid          Type: string    Value: [YOUR_UID]
Field: email        Type: string    Value: [YOUR_EMAIL]
Field: role         Type: string    Value: admin
Field: displayName  Type: string    Value: [YOUR_NAME]
Field: createdAt    Type: timestamp Value: [current time]
```

8. Click "Save"
9. Refresh your app - you should now see the "⚙️ Admin" button!

## Admin Dashboard Features

Once you're an admin, you can access `/admin` route where you can:

### 1. Review Submissions
- View all pending place submissions
- Approve or reject submissions
- See all submission details including images

### 2. Manage Categories (Coming Soon)
- Add new categories
- Edit existing categories
- Delete categories
- Categories automatically appear in the submit form

### 3. Manage Admins (Coming Soon)
- Add new admins or moderators
- Remove admin access
- View all admins

## Adding More Admins

### Method 1: Through Firebase Console (Manual)

1. Get the user's UID from Authentication tab
2. Go to Firestore → admin_roles collection
3. Add a new document with their UID as the document ID
4. Add the same fields as above

### Method 2: Through Admin Dashboard (Recommended - Coming Soon)

Once the Admin Manager component is implemented, you'll be able to:
1. Go to Admin Dashboard
2. Click "Admins" tab
3. Enter user email
4. Select role (admin or moderator)
5. Click "Add Admin"

## Roles Explained

### Admin
- Full access to everything
- Can approve/reject submissions
- Can manage categories
- Can add/remove other admins
- Can edit/delete any place

### Moderator  
- Can approve/reject submissions
- Can edit places
- **Cannot** manage categories
- **Cannot** add/remove admins

### User (Default)
- Can submit places
- Can like/save places
- Can leave reviews
- Cannot access admin dashboard

## Security Rules

Make sure your Firestore security rules are set up correctly. In Firebase Console:

1. Go to Firestore Database → Rules
2. Replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is admin
    function isAdmin() {
      return request.auth != null && 
             exists(/databases/$(database)/documents/admin_roles/$(request.auth.uid)) &&
             get(/databases/$(database)/documents/admin_roles/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Helper function to check if user is moderator or admin
    function isModerator() {
      return request.auth != null && 
             exists(/databases/$(database)/documents/admin_roles/$(request.auth.uid));
    }
    
    // Admin roles - only admins can manage
    match /admin_roles/{userId} {
      allow read: if isModerator();
      allow write: if isAdmin();
    }
    
    // Categories - anyone can read, only admins can write
    match /categories/{categoryId} {
      allow read: if true;
      allow create, update, delete: if isAdmin();
    }
    
    // Places - published places are public
    match /places/{placeId} {
      allow read: if resource.data.status == 'published' || request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if isModerator();
    }
    
    // Moderation queue
    match /moderation_queue/{submissionId} {
      allow read: if request.auth != null && 
                  (resource.data.submittedBy == request.auth.uid || isModerator());
      allow create: if request.auth != null;
      allow update, delete: if isModerator();
    }
    
    // User profiles (if you add this later)
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. Click "Publish"

## Testing Admin Access

### Test Checklist:

1. **Sign in with your admin account**
   - [ ] "⚙️ Admin" button appears in navigation
   - [ ] Button works on both desktop and mobile

2. **Access Admin Dashboard**
   - [ ] Navigate to `/admin` route
   - [ ] Dashboard loads without errors
   - [ ] Can see pending submissions (if any)

3. **Review Submissions**
   - [ ] Can view submission details
   - [ ] Can approve submissions → places appear on map
   - [ ] Can reject submissions → removed from queue

4. **Sign out and sign in with non-admin account**
   - [ ] Admin button does NOT appear
   - [ ] Cannot access `/admin` (redirects to home)
   - [ ] Can still submit places normally

## Troubleshooting

### Admin button not appearing?

1. Check your UID is correct in admin_roles document
2. Check document ID matches your UID exactly
3. Check `role` field is set to `"admin"` (string, lowercase)
4. Try signing out and signing in again
5. Check browser console for errors
6. Make sure `useAdminCheck` hook is not throwing errors

### Cannot access admin dashboard?

1. Ensure you're signed in
2. Check Firestore rules allow admin_roles read access
3. Check browser console for permission errors
4. Verify admin_roles collection exists and has your document

### Admin features not working?

1. Check Firestore security rules are published
2. Verify your admin role in Firestore
3. Check browser console for errors
4. Ensure Firebase SDK is initialized correctly

## What's Implemented Now

✅ **Currently Working:**
- Admin check hook
- Admin button in navigation (only for admins)
- Protected admin dashboard route
- Submission review system
- Approve/reject functionality

🚧 **To Be Implemented:**
- Category management UI
- Admin management UI
- Place editing from admin panel
- Bulk operations
- Analytics dashboard

## Next Steps

After setting yourself as admin:

1. Test the admin dashboard
2. Review any pending submissions
3. Implement remaining features from IMPLEMENTATION_GUIDE.md
4. Add category management
5. Add admin management panel
6. Set up proper Firebase security rules

## Production Recommendations

For production use:

1. **Use Firebase Custom Claims instead of Firestore collection**
   - More secure
   - Better performance
   - Requires Firebase Admin SDK (backend)

2. **Add audit logging**
   - Log all admin actions
   - Track who approved/rejected what

3. **Add email notifications**
   - Notify users when their submission is approved/rejected
   - Notify admins when new submission arrives

4. **Rate limiting**
   - Limit number of submissions per user per day
   - Prevent spam and abuse

5. **Image moderation**
   - Use ML/AI to detect inappropriate images
   - Manual review for flagged content
