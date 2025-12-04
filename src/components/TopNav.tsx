import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthState } from '../hooks/useAuthState'
import { useAdminCheck } from '../hooks/useAdminCheck'
import { signOut } from 'firebase/auth'
import { auth } from '../lib/firebase'

export function TopNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, loading } = useAuthState()
  const { isAdmin, loading: adminLoading } = useAdminCheck()

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      navigate('/')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  // Debug logging
  useEffect(() => {
    if (!loading && !adminLoading && user) {
      console.log('Admin check:', { isAdmin, user: user.uid })
    }
  }, [isAdmin, loading, adminLoading, user])

  return (
    <header className="fixed inset-x-0 top-0 z-20 border-b border-primary/10 bg-bg/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-2.5 md:px-4 md:py-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 md:gap-3">
          <div className="h-8 w-8 md:h-9 md:w-9 rounded-2xl bg-gradient-warm shadow-glow flex items-center justify-center">
            <span className="text-base md:text-lg font-bold text-white">C</span>
          </div>
          <span className="text-sm md:text-base font-bold tracking-wide text-gradient uppercase hidden sm:inline">
            Connect BLR
          </span>
          <span className="text-sm font-bold tracking-wide text-gradient uppercase sm:hidden">
            Connect
          </span>
        </Link>

        {/* Search - Hidden on mobile */}
        <div className="hidden md:flex flex-1 items-center justify-center px-4">
          <input
            aria-label="Search places"
            className="w-full max-w-md rounded-full border border-primary/30 bg-bg-elevated/60 px-5 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
            placeholder="Search cafés, activities, movie spots..."
            onFocus={() => {
              if (location.pathname !== '/') navigate('/')
            }}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 md:gap-3">
          {!loading && !adminLoading && isAdmin && (
            <button
              onClick={() => navigate('/admin')}
              className="btn-secondary text-xs md:text-sm px-3 py-2 md:px-4 md:py-2"
            >
              <span className="hidden md:inline">⚙️ Admin</span>
              <span className="md:hidden">⚙️</span>
            </button>
          )}
          <button
            onClick={() => navigate('/submit')}
            className="btn-primary text-xs md:text-sm px-4 py-2 md:px-6 md:py-2.5"
          >
            <span className="hidden sm:inline">Share a spot</span>
            <span className="sm:hidden">Share</span>
          </button>
          {loading ? (
            <div className="h-8 w-16 rounded-full bg-bg-elevated animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 rounded-full border border-primary/30 px-2 md:px-3 py-1.5 text-xs text-slate-100 transition hover:bg-primary/10"
              >
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName || 'User'} 
                    className="h-6 w-6 md:h-7 md:w-7 rounded-full object-cover ring-2 ring-primary/30"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      console.error('Failed to load profile image:', user.photoURL)
                      e.currentTarget.style.display = 'none'
                      e.currentTarget.nextElementSibling?.classList.remove('hidden')
                    }}
                  />
                ) : null}
                <div 
                  className={`h-6 w-6 md:h-7 md:w-7 rounded-full bg-gradient-warm flex items-center justify-center text-white font-bold text-xs ${user.photoURL ? 'hidden' : ''}`}
                >
                  {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="hidden md:inline text-xs max-w-[100px] truncate">
                  {user.displayName?.split(' ')[0] || 'Profile'}
                </span>
              </button>
              <button
                onClick={handleSignOut}
                className="hidden md:block text-xs text-slate-400 hover:text-slate-100 transition"
              >
                Sign out
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/profile')}
              className="btn-secondary text-xs md:text-sm px-4 py-2 md:px-6 md:py-2.5"
            >
              Sign in
            </button>
          )}
        </div>
      </div>
      
      {/* Mobile search bar */}
      <div className="md:hidden px-3 pb-2">
        <input
          aria-label="Search places"
          className="w-full rounded-full border border-primary/30 bg-bg-elevated/60 px-4 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
          placeholder="Search places..."
          onFocus={() => {
            if (location.pathname !== '/') navigate('/')
          }}
        />
      </div>
    </header>
  )
}
