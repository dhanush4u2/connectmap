import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthState } from '../hooks/useAuthState'
import { signOut } from 'firebase/auth'
import { auth } from '../lib/firebase'

export function TopNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, loading } = useAuthState()

  const handleSignOut = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <header className="fixed inset-x-0 top-0 z-20 border-b border-primary/20 bg-bg/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-2xl bg-gradient-warm shadow-glow flex items-center justify-center">
            <span className="text-lg font-bold text-white">C</span>
          </div>
          <span className="text-base font-bold tracking-wide text-gradient uppercase">
            Connect BLR
          </span>
        </Link>

        <div className="flex flex-1 items-center justify-center px-4">
          <input
            aria-label="Search places"
            className="w-full max-w-md rounded-full border border-primary/30 bg-bg-elevated/60 px-5 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
            placeholder="Search cafés, activities, movie spots..."
            onFocus={() => {
              if (location.pathname !== '/') navigate('/')
            }}
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/submit')}
            className="hidden sm:inline-flex btn-primary"
          >
            Share a spot
          </button>
          {loading ? (
            <div className="h-8 w-20 rounded-full bg-bg-elevated animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 rounded-full border border-primary/30 px-3 py-1.5 text-xs text-slate-100 transition hover:bg-primary/10"
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" className="h-5 w-5 rounded-full" />
                ) : (
                  <div className="h-5 w-5 rounded-full bg-gradient-warm" />
                )}
                <span className="hidden sm:inline">{user.displayName || 'Profile'}</span>
              </button>
              <button
                onClick={handleSignOut}
                className="text-xs text-slate-400 hover:text-slate-100 transition"
              >
                Sign out
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/profile')}
              className="btn-secondary"
            >
              Sign in
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
