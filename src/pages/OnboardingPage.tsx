import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthState } from '../hooks/useAuthState'
import { doc, setDoc, updateDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { createTasteProfile } from '../lib/tasteProfileCompute'
import { generateTasteProfileWithGemini, shouldUseGemini } from '../lib/gemini'
import { PERSONAS } from '../lib/onboardingData'
import type {
  OnboardingSheet1,
  OnboardingSheet2,
  OnboardingSheet3,
  OnboardingSheet4,
  OnboardingResponses
} from '../types'
import { Sheet0, Sheet1, Sheet2, Sheet3, Sheet4, LoadingProfile } from '../components/onboarding'

export function OnboardingPage() {
  const { user, loading } = useAuthState()
  const navigate = useNavigate()
  const [currentSheet, setCurrentSheet] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)

  const [sheet0Data, setSheet0Data] = useState<{displayName: string; username: string; avatarEmoji?: string} | null>(null)
  const [sheet1Data, setSheet1Data] = useState<OnboardingSheet1 | null>(null)
  const [sheet2Data, setSheet2Data] = useState<OnboardingSheet2 | null>(null)
  const [sheet3Data, setSheet3Data] = useState<OnboardingSheet3 | null>(null)
  const [sheet4Data, setSheet4Data] = useState<OnboardingSheet4 | null>(null)

  const handleSheet0Complete = (data: {displayName: string; username: string; avatarEmoji?: string}) => {
    setSheet0Data(data)
    setCurrentSheet(1)
  }

  const handleSheet1Complete = (data: OnboardingSheet1) => {
    setSheet1Data(data)
    setCurrentSheet(2)
  }

  const handleSheet2Complete = (data: OnboardingSheet2) => {
    setSheet2Data(data)
    setCurrentSheet(3)
  }

  const handleSheet3Complete = (data: OnboardingSheet3) => {
    setSheet3Data(data)
    setCurrentSheet(4)
  }

  const handleSheet4Complete = async (data: OnboardingSheet4) => {
    if (!user || !sheet0Data || !sheet1Data || !sheet2Data || !sheet3Data) return

    setSheet4Data(data)
    setIsProcessing(true)

    try {
      // Prepare onboarding responses
      const responses: Omit<OnboardingResponses, 'createdAt'> = {
        userId: user.uid,
        sheet1: sheet1Data,
        sheet2: sheet2Data,
        sheet3: sheet3Data,
        sheet4: data,
        processed: false
      }

      // Save raw responses to user_onboarding_events
      const onboardingRef = await addDoc(
        collection(db, 'user_onboarding_events', user.uid, 'responses'),
        {
          ...responses,
          createdAt: serverTimestamp()
        }
      )

      // Compute taste profile
      let tasteProfile

      // Use Gemini if API key is available, otherwise fall back to client-side computation
      if (shouldUseGemini()) {
        try {
          console.log('🤖 Using Gemini 2.0 Flash for taste profile generation...')
          const geminiResult = await generateTasteProfileWithGemini(responses as OnboardingResponses)
          
          // Get persona definition from PERSONAS constant
          const personaDefinition = PERSONAS[geminiResult.persona]
          
          tasteProfile = {
            userId: user.uid,
            persona: geminiResult.persona,
            personaLabel: personaDefinition?.label || 'Explorer',
            vector: geminiResult.tasteVector,
            tags: data.freeTags,
            topFoodStyles: sheet2Data.topFoodStyles,
            favoriteAmbiances: sheet2Data.favoriteAmbiances,
            activityPrefs: sheet2Data.activityPreferences,
            sourceOnboardingVersion: 1,
            explanation: geminiResult.explanation,
            refinedDescription: geminiResult.refinedDescription
          }
          console.log('✨ Gemini analysis complete:', geminiResult.persona)
        } catch (geminiError) {
          console.warn('⚠️ Gemini API failed, falling back to client-side computation:', geminiError)
          // Fall back to client-side computation
          tasteProfile = createTasteProfile(user.uid, responses as OnboardingResponses)
        }
      } else {
        console.log('🔧 Using client-side computation (no Gemini API key)')
        // Use client-side computation
        tasteProfile = createTasteProfile(user.uid, responses as OnboardingResponses)
      }

      // Save taste profile
      const profileRef = await addDoc(collection(db, 'taste_profiles'), {
        ...tasteProfile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })

      // Update existing user profile with onboarding data
      // Profile was already created by useAuthProfileSetup hook after authentication
      const userRef = doc(db, 'user_profiles', user.uid)
      await updateDoc(userRef, {
        displayName: sheet0Data.displayName,
        avatarEmoji: sheet0Data.avatarEmoji || '',
        username: sheet0Data.username,
        tasteProfileId: profileRef.id,
        hasCompletedOnboarding: true,
        privacy: data.privacy,
        updatedAt: serverTimestamp()
      })

      // Mark onboarding as processed
      await setDoc(
        doc(db, 'user_onboarding_events', user.uid, 'responses', onboardingRef.id),
        { processed: true, profileId: profileRef.id },
        { merge: true }
      )

      // Navigate to map with slight delay to show success
      setTimeout(() => {
        navigate('/', { replace: true })
      }, 2000)
    } catch (error) {
      console.error('Error completing onboarding:', error)
      alert('Failed to complete onboarding. Please try again.')
      setIsProcessing(false)
    }
  }

  const handleBack = () => {
    if (currentSheet > 0) {
      setCurrentSheet(currentSheet - 1)
    }
  }

  const progress = ((currentSheet + 1) / 5) * 100

  // Use useEffect to handle navigation instead of direct navigate() call
  useEffect(() => {
    if (!loading && !user) {
      navigate('/profile')
    }
  }, [loading, user, navigate])

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-bg-elevated flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
      </div>
    )
  }

  // Return loading if no user (will redirect via useEffect)
  if (!user) {
    return (
      <div className="min-h-screen bg-bg-elevated flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
      </div>
    )
  }

  if (isProcessing) {
    return <LoadingProfile />
  }

  return (
    <div className="min-h-screen bg-bg-elevated flex flex-col items-center justify-center p-4">
      {/* Progress Bar */}
      <div className="w-full max-w-2xl mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-400 uppercase tracking-wider">
            Building Your Taste World
          </span>
          <span className="text-xs text-primary font-semibold">
            Step {currentSheet + 1}/5
          </span>
        </div>
        <div className="h-2 bg-bg-warm rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-warm transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Sheet Content */}
      <div className="w-full max-w-2xl">
        {currentSheet === 0 && (
          <Sheet0 onComplete={handleSheet0Complete} initialData={sheet0Data} />
        )}
        {currentSheet === 1 && (
          <Sheet1 onComplete={handleSheet1Complete} initialData={sheet1Data} />
        )}
        {currentSheet === 2 && (
          <Sheet2 
            onComplete={handleSheet2Complete} 
            onBack={handleBack}
            initialData={sheet2Data}
          />
        )}
        {currentSheet === 3 && (
          <Sheet3 
            onComplete={handleSheet3Complete} 
            onBack={handleBack}
            initialData={sheet3Data}
          />
        )}
        {currentSheet === 4 && (
          <Sheet4 
            onComplete={handleSheet4Complete} 
            onBack={handleBack}
            initialData={sheet4Data}
          />
        )}
      </div>

      {/* Microcopy */}
      <p className="text-xs text-slate-500 mt-8 text-center max-w-md">
        {currentSheet === 0 && "Choose a username and avatar that represents you."}
        {currentSheet === 1 && "Pick what feels like you — be honest, this is your vibe passport."}
        {currentSheet === 2 && "No wrong answers — choose 3 food tastes to help us find your flavor map."}
        {currentSheet === 3 && "This tells us whether to surface curated hits or quick pop-up plans."}
        {currentSheet === 4 && "This is how your Taste World will look and who sees it."}
      </p>
    </div>
  )
}
