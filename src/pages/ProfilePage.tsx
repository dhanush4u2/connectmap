import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthState } from '../hooks/useAuthState'
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth, db } from '../lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import type { UserProfile } from '../types'
import { calculateXPForNextLevel, getUserAchievements } from '../lib/xpSystem'
import { EditProfileModal } from '../components/EditProfileModal'
import { SavedPlaces } from '../components/SavedPlaces'

export function ProfilePage() {
  const { user, loading } = useAuthState()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)

  // Load user profile data and check onboarding status
  useEffect(() => {
    async function loadProfile() {
      if (!user) {
        setProfileLoading(false)
        return
      }

      try {
        const profileRef = doc(db, 'user_profiles', user.uid)
        const profileSnap = await getDoc(profileRef)
        
        if (profileSnap.exists()) {
          const profile = profileSnap.data() as UserProfile
          setUserProfile(profile)
          
          // If profile exists but onboarding not completed, redirect to onboarding
          if (!profile.hasCompletedOnboarding) {
            console.log('Profile exists but onboarding not completed, redirecting...')
            navigate('/onboarding', { replace: true })
          }
        } else {
          // No profile exists, needs onboarding
          console.log('No profile found, redirecting to onboarding...')
          navigate('/onboarding', { replace: true })
        }
      } catch (error) {
        console.error('Error loading profile:', error)
      } finally {
        setProfileLoading(false)
      }
    }

    loadProfile()
  }, [user, navigate])

  const handleGoogleSignIn = async () => {
    setError('')
    setAuthLoading(true)
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
    } catch (error: any) {
      console.error('Google sign-in error:', error)
      setError(error.message || 'Failed to sign in with Google')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setAuthLoading(true)

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password)
      } else {
        await signInWithEmailAndPassword(auth, email, password)
      }
    } catch (error: any) {
      console.error('Email auth error:', error)
      setError(error.message || 'Authentication failed')
    } finally {
      setAuthLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="h-12 w-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
      </div>
    )
  }

  const handleProfileUpdate = async () => {
    if (!user) return
    // Reload profile data
    try {
      const profileRef = doc(db, 'user_profiles', user.uid)
      const profileSnap = await getDoc(profileRef)
      if (profileSnap.exists()) {
        setUserProfile(profileSnap.data() as UserProfile)
      }
    } catch (error) {
      console.error('Error reloading profile:', error)
    }
  }

  if (user) {
    const xp = userProfile?.xp || 0
    const level = userProfile?.level || 1
    const xpProgress = calculateXPForNextLevel(xp)
    const achievements = getUserAchievements(userProfile?.achievements || [])
    
    return (
      <>
      <div className="mx-auto max-w-4xl p-4 md:p-6 space-y-6">
        {/* Profile Header */}
        <div className="card-premium p-6 md:p-8">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {userProfile?.avatarEmoji ? (
              <div className="h-20 w-20 rounded-2xl bg-gradient-warm flex items-center justify-center text-4xl shadow-glow ring-2 ring-primary/30">
                {userProfile.avatarEmoji}
              </div>
            ) : user.photoURL ? (
              <img 
                src={user.photoURL} 
                alt={user.displayName || 'User'} 
                className="h-20 w-20 rounded-2xl shadow-glow object-cover ring-2 ring-primary/30"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="h-20 w-20 rounded-2xl bg-gradient-warm flex items-center justify-center text-3xl font-bold text-white shadow-glow">
                {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-xl md:text-2xl font-bold text-gradient">
                  {user.displayName || 'Anonymous User'}
                </h1>
                <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold">
                  Level {level}
                </span>
              </div>
              <p className="text-slate-400 text-xs md:text-sm mb-1">
                @{userProfile?.username || user.email?.split('@')[0]}
              </p>
              {userProfile?.bio && (
                <p className="text-slate-500 text-xs mb-2">{userProfile.bio}</p>
              )}
              <p className="text-slate-500 text-xs mb-4">{user.email}</p>
              
              {/* XP Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>{xpProgress.current} XP</span>
                  <span>{xpProgress.needed} XP to Level {level + 1}</span>
                </div>
                <div className="h-2 bg-bg-warm rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-warm transition-all duration-500"
                    style={{ width: `${xpProgress.progress}%` }}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowEditModal(true)}
                  className="text-sm text-primary hover:text-primary-light transition font-medium"
                >
                  ✏️ Edit Profile
                </button>
                <button
                  onClick={() => signOut(auth)}
                  className="text-sm text-slate-400 hover:text-red-400 transition"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card-premium p-4">
            <p className="text-xs text-slate-400 mb-1">Total XP</p>
            <p className="text-2xl font-bold text-gradient">{xp}</p>
          </div>
          <div className="card-premium p-4">
            <p className="text-xs text-slate-400 mb-1">Places</p>
            <p className="text-2xl font-bold text-gradient">{userProfile?.placesCount || 0}</p>
          </div>
          <div className="card-premium p-4">
            <p className="text-xs text-slate-400 mb-1">Saves</p>
            <p className="text-2xl font-bold text-gradient">{userProfile?.savedPlaces?.length || 0}</p>
          </div>
          <div className="card-premium p-4">
            <p className="text-xs text-slate-400 mb-1">Friends</p>
            <p className="text-2xl font-bold text-gradient">{userProfile?.friendCount || 0}</p>
          </div>
        </div>

        {/* Levels Breakdown */}
        <div className="card-premium p-6">
          <h2 className="text-lg font-semibold text-slate-100 mb-4">Your Levels</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-xl bg-bg-warm">
              <div className="text-3xl mb-2">🍕</div>
              <p className="text-xs text-slate-400 mb-1">Foodie</p>
              <p className="text-lg font-bold text-primary">Level {userProfile?.foodieLevel || 1}</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-bg-warm">
              <div className="text-3xl mb-2">🗺️</div>
              <p className="text-xs text-slate-400 mb-1">Explorer</p>
              <p className="text-lg font-bold text-primary">Level {userProfile?.explorerLevel || 1}</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-bg-warm">
              <div className="text-3xl mb-2">✍️</div>
              <p className="text-xs text-slate-400 mb-1">Curator</p>
              <p className="text-lg font-bold text-primary">Level {userProfile?.curatorLevel || 1}</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-bg-warm">
              <div className="text-3xl mb-2">🤝</div>
              <p className="text-xs text-slate-400 mb-1">Social</p>
              <p className="text-lg font-bold text-primary">Level {userProfile?.socialLevel || 1}</p>
            </div>
          </div>
          <div className="mt-4 text-xs text-slate-500 text-center">
            <p>💡 Earn XP: Review places (+120), Add places (+360), Make friends (+60)</p>
          </div>
        </div>

        {/* Achievements */}
        <div className="card-premium p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-100">Achievements</h2>
            <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold">
              {userProfile?.unlockedAchievements || 0}/{userProfile?.totalAchievements || 15}
            </span>
          </div>
          
          {achievements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {achievements.map(achievement => (
                <div 
                  key={achievement.id}
                  className="flex items-center gap-3 p-4 rounded-xl bg-bg-warm border border-primary/20"
                >
                  <div className="text-3xl">{achievement.emoji}</div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-100 text-sm">{achievement.title}</p>
                    <p className="text-xs text-slate-400">{achievement.description}</p>
                    <p className="text-xs text-accent-yellow mt-1">+{achievement.xpReward} XP</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <p className="text-4xl mb-3">🏆</p>
              <p className="text-sm mb-1">No achievements yet</p>
              <p className="text-xs text-slate-600">Start exploring to unlock achievements!</p>
            </div>
          )}
          
          <div className="mt-6 p-4 rounded-xl bg-primary/10 border border-primary/20 text-center">
            <p className="text-xs text-slate-400">
              <span className="font-semibold text-accent-yellow">Coming Soon:</span> More achievements, badges, and rewards!
            </p>
          </div>
        </div>

        {/* Saved Places */}
        <div className="card-premium p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-100">Saved Places</h2>
            <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold">
              {userProfile?.savedPlaces?.length || 0}
            </span>
          </div>
          <SavedPlaces userId={user.uid} />
        </div>

        {/* Activity Feed */}
        <div className="card-premium p-6">
          <h2 className="text-lg font-semibold text-slate-100 mb-4">Recent Activity</h2>
          <div className="text-center py-12 text-slate-500">
            <p className="text-4xl mb-2">📍</p>
            <p className="text-sm">No activity yet</p>
            <p className="text-xs text-slate-600 mt-1">Share your first spot to get started!</p>
          </div>
        </div>
      </div>
      
      {showEditModal && (
        <EditProfileModal
          user={user}
          userProfile={userProfile}
          onClose={() => setShowEditModal(false)}
          onUpdate={handleProfileUpdate}
        />
      )}
      </>
    )
  }

  return (
    <div className="mx-auto max-w-md p-4 md:p-6">
      <div className="card-premium p-6 md:p-8">
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex h-14 w-14 md:h-16 md:w-16 rounded-2xl bg-gradient-warm items-center justify-center mb-4 shadow-glow">
            <span className="text-2xl md:text-3xl font-bold text-white">C</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-gradient mb-2">
            {isSignUp ? 'Join Connect BLR' : 'Welcome Back'}
          </h1>
          <p className="text-xs md:text-sm text-slate-400">
            {isSignUp ? 'Create an account to share and discover places' : 'Sign in to continue exploring'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleSignIn}
          disabled={authLoading}
          className="w-full mb-6 rounded-full bg-white text-slate-900 px-6 py-3 font-semibold flex items-center justify-center gap-3 hover:bg-slate-100 transition disabled:opacity-50"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {authLoading ? 'Signing in...' : 'Continue with Google'}
        </button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-primary/20"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-bg-elevated px-3 text-slate-500">or</span>
          </div>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-primary/30 bg-bg-warm px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-xl border border-primary/30 bg-bg-warm px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={authLoading}
            className="w-full btn-primary disabled:opacity-50"
          >
            {authLoading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp)
              setError('')
            }}
            className="text-primary hover:text-primary-light font-medium transition"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  )
}
