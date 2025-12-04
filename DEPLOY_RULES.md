# 🚀 Quick Firebase Rules Deployment Guide

## Option 1: Firebase Console (Manual - Recommended for First Time)

### Step 1: Deploy Firestore Rules
1. Go to: https://console.firebase.google.com/project/connectrockin/firestore/rules
2. Copy everything from `firestore.rules` file
3. Paste into the editor
4. Click **"Publish"**

### Step 2: Deploy Storage Rules
1. Go to: https://console.firebase.google.com/project/connectrockin/storage/rules
2. Copy everything from `storage.rules` file
3. Paste into the editor
4. Click **"Publish"**

### Step 3: Verify Deployment
- Check that both rules show "Last published: Just now"
- Test by signing in with Google

---

## Option 2: Firebase CLI (Automated)

### Prerequisites
```bash
npm install -g firebase-tools
firebase login
```

### Initialize Firebase (First Time Only)
```bash
firebase init
```
- Select: Firestore, Storage
- Use existing project: connectrockin
- Accept default file names

### Deploy Rules
```bash
# Deploy both Firestore and Storage rules
firebase deploy --only firestore:rules,storage:rules
```

### Deploy Only Firestore
```bash
firebase deploy --only firestore:rules
```

### Deploy Only Storage
```bash
firebase deploy --only storage:rules
```

---

## ✅ Verification Checklist

After deploying rules, verify:

- [ ] Sign in with Google works without errors
- [ ] Console shows: "🆕 New user detected, creating minimal profile..."
- [ ] User is redirected to onboarding
- [ ] Can complete onboarding sheets
- [ ] Profile created with `hasCompletedOnboarding: true`
- [ ] Profile page displays correctly
- [ ] XP, levels, achievements all show
- [ ] Can edit profile (username, avatar, bio)

---

## 🐛 Troubleshooting

### Error: "Missing or insufficient permissions"
**Solution**: Rules not deployed yet. Use Option 1 above.

### Error: "Permission denied on user_profiles"
**Solution**: Check that Firestore rules include the `user_profiles` match block.

### Error: "Document not found"
**Solution**: Clear browser cache and sign out/in again. Check that `useAuthProfileSetup` hook is running in `App.tsx`.

---

## 📋 What Changed?

### Before (Old Flow):
- User signs in → Goes to profile page
- No profile in database
- Permission errors everywhere
- Manual field creation needed

### After (New Flow):
- User signs in → **Minimal profile auto-created**
- Redirected to onboarding
- All data stored in database
- No permission errors
- Clean data flow

---

## 🎯 Next Steps

1. **Deploy the rules** using Option 1 or 2 above
2. **Clear test data** (delete test user and their profile)
3. **Test the complete flow** from sign-in to profile display
4. **Verify database** shows correct structure

**Important**: The app will NOT work properly until the Firestore rules are deployed!
