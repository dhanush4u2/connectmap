import { useState } from 'react'
import { useAuthState } from '../../hooks/useAuthState'

interface Sheet0Props {
  onComplete: (data: { displayName: string; username: string }) => void
  initialData: { displayName: string; username: string } | null
}

const PRESET_AVATARS = [
  '🦊', '🐻', '🐼', '🐨', '🐯', '🦁',
  '🐸', '🐙', '🦄', '🐲', '🦖', '🦕',
  '🌸', '🌺', '🌻', '🌷', '🌹', '🏵️',
  '⭐', '✨', '💫', '🌟', '⚡', '🔥',
  '🍕', '🍔', '🍜', '🍱', '🍰', '🍩',
  '🎮', '🎸', '🎨', '📷', '✈️', '🚀'
]

export function Sheet0({ onComplete, initialData }: Sheet0Props) {
  const { user } = useAuthState()
  const [displayName, setDisplayName] = useState(
    initialData?.displayName || user?.displayName || ''
  )
  const [username, setUsername] = useState(
    initialData?.username || user?.email?.split('@')[0].toLowerCase() || ''
  )
  const [selectedAvatar, setSelectedAvatar] = useState('')
  const [error, setError] = useState('')

  const validateAndComplete = () => {
    setError('')

    // Validate display name
    if (!displayName.trim()) {
      setError('Please enter a display name')
      return
    }

    if (displayName.trim().length < 2) {
      setError('Display name must be at least 2 characters')
      return
    }

    // Validate username
    if (!username.trim()) {
      setError('Please enter a username')
      return
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters')
      return
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('Username can only contain letters, numbers, and underscores')
      return
    }

    onComplete({
      displayName: displayName.trim(),
      username: username.toLowerCase().trim(),
      avatarEmoji: selectedAvatar
    } as any)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      validateAndComplete()
    }
  }

  return (
    <div className="card-premium p-8 animate-fade-in">
      <div className="mb-8 text-center">
        <div className="inline-flex h-16 w-16 rounded-2xl bg-gradient-warm items-center justify-center mb-4 shadow-glow">
          <span className="text-3xl font-bold text-white">👋</span>
        </div>
        <h2 className="text-2xl font-bold text-gradient mb-2">Welcome to Connect BLR!</h2>
        <p className="text-sm text-slate-400">Let's set up your profile first</p>
      </div>

      {error && (
        <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Display Name */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-3">
            Display Name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Your name"
            maxLength={50}
            className="w-full px-4 py-3 rounded-xl bg-bg-warm border border-primary/20 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primary/40 transition"
          />
          <p className="mt-2 text-xs text-slate-500">
            This is how others will see you
          </p>
        </div>

        {/* Username */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-3">
            Username
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">@</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              onKeyPress={handleKeyPress}
              placeholder="username"
              maxLength={30}
              className="w-full pl-8 pr-4 py-3 rounded-xl bg-bg-warm border border-primary/20 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primary/40 transition"
            />
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Letters, numbers, and underscores only
          </p>
        </div>

        {/* Avatar Selection */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-3">
            Choose an Avatar <span className="text-slate-500">(optional)</span>
          </label>
          <p className="text-xs text-slate-400 mb-3">Pick an emoji to represent you</p>
          
          <div className="grid grid-cols-6 sm:grid-cols-9 gap-2 max-h-48 overflow-y-auto p-2 rounded-xl bg-bg-warm custom-scrollbar">
            {PRESET_AVATARS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setSelectedAvatar(selectedAvatar === emoji ? '' : emoji)}
                className={`aspect-square text-3xl rounded-xl transition-all hover:scale-110 ${
                  selectedAvatar === emoji
                    ? 'bg-gradient-warm shadow-glow ring-2 ring-primary'
                    : 'bg-bg hover:bg-primary/10'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
          <p className="text-xs text-slate-400 mb-3 text-center">Profile Preview</p>
          <div className="flex items-center justify-center gap-3">
            {selectedAvatar ? (
              <div className="h-14 w-14 rounded-xl bg-gradient-warm flex items-center justify-center text-3xl shadow-glow">
                {selectedAvatar}
              </div>
            ) : user?.photoURL ? (
              <img 
                src={user.photoURL} 
                alt="Profile" 
                className="h-14 w-14 rounded-xl object-cover shadow-glow"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="h-14 w-14 rounded-xl bg-gradient-warm flex items-center justify-center text-2xl font-bold text-white shadow-glow">
                {displayName?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
            <div className="text-left">
              <p className="font-semibold text-slate-100">
                {displayName || 'Your Name'}
              </p>
              <p className="text-sm text-slate-400">
                @{username || 'username'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Button */}
      <div className="mt-8">
        <button
          onClick={validateAndComplete}
          className="w-full py-4 rounded-full font-semibold bg-gradient-warm text-white shadow-glow hover:scale-[1.02] transition"
        >
          Continue →
        </button>
      </div>
    </div>
  )
}
