import { useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'

/**
 * Hook that listens to authentication state and creates a minimal user profile
 * when a new user signs up or signs in for the first time.
 * 
 * This ensures that user_profiles document exists immediately after authentication,
 * preventing permission errors. The profile will be completed during onboarding.
 */
export function useAuthProfileSetup() {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return

      try {
        // Check if user profile already exists
        const userRef = doc(db, 'user_profiles', user.uid)
        const userSnap = await getDoc(userRef)

        if (!userSnap.exists()) {
          console.log('🆕 New user detected, creating minimal profile...')
          
          // Create minimal profile immediately after authentication
          // This will be completed during onboarding
          await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || null,
            photoURL: user.photoURL || null,
            username: null, // Will be set during onboarding
            avatarEmoji: null,
            bio: '',
            savedPlaces: [],
            friends: [],
            friendCount: 0,
            placesCount: 0,
            tasteProfileId: null, // Will be set during onboarding
            connectScore: 0,
            hasCompletedOnboarding: false, // Important: false until onboarding is done
            privacy: {
              showPlacesToFriends: true,
              publicProfile: false,
              anonymousMode: false
            },
            // XP and Level System - initialized to defaults
            xp: 0,
            level: 1,
            foodieLevel: 1,
            explorerLevel: 1,
            curatorLevel: 1,
            socialLevel: 1,
            // Achievements
            achievements: [],
            unlockedAchievements: 0,
            totalAchievements: 15,
            // Admin
            isAdmin: false,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          })
          
          console.log('✅ Minimal profile created successfully')
        } else {
          console.log('👤 Existing user profile found')
        }
      } catch (error) {
        console.error('❌ Error setting up user profile:', error)
      }
    })

    return unsubscribe
  }, [])
}
