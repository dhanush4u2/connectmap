import { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuthState } from './useAuthState'
import { useNavigate, useLocation } from 'react-router-dom'

export function useOnboardingCheck() {
  const { user, loading: authLoading } = useAuthState()
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    async function checkOnboarding() {
      if (authLoading) return
      
      if (!user) {
        setHasCompletedOnboarding(false)
        setLoading(false)
        return
      }

      try {
        const userProfileRef = doc(db, 'user_profiles', user.uid)
        const userProfileSnap = await getDoc(userProfileRef)

        if (userProfileSnap.exists()) {
          const hasCompleted = userProfileSnap.data()?.hasCompletedOnboarding === true
          setHasCompletedOnboarding(hasCompleted)
          
          // Redirect to onboarding if not completed and not already on onboarding page
          if (!hasCompleted && location.pathname !== '/onboarding' && location.pathname !== '/profile') {
            navigate('/onboarding', { replace: true })
          }
        } else {
          // No profile exists, needs onboarding
          setHasCompletedOnboarding(false)
          if (location.pathname !== '/onboarding' && location.pathname !== '/profile') {
            navigate('/onboarding', { replace: true })
          }
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error)
        setHasCompletedOnboarding(false)
      } finally {
        setLoading(false)
      }
    }

    checkOnboarding()
  }, [user, authLoading, navigate, location.pathname])

  return {
    hasCompletedOnboarding,
    loading: loading || authLoading
  }
}
