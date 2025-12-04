import { useState } from 'react'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { UserProfile } from '../types'

interface EditProfileModalProps {
  user: any
  userProfile: UserProfile | null
  onClose: () => void
  onUpdate: () => void
}

const PRESET_AVATARS = [
  '🦊', '🐻', '🐼', '🐨', '🐯', '🦁',
  '🐸', '🐙', '🦄', '🐲', '🦖', '🦕',
  '🌸', '🌺', '🌻', '🌷', '🌹', '🏵️',
  '⭐', '✨', '💫', '🌟', '⚡', '🔥',
  '🍕', '🍔', '🍜', '🍱', '🍰', '🍩',
  '🎮', '🎸', '🎨', '📷', '✈️', '🚀'
]

export function EditProfileModal({ user, userProfile, onClose, onUpdate }: EditProfileModalProps) {
  const [displayName, setDisplayName] = useState(userProfile?.displayName || user?.displayName || '')
  const [username, setUsername] = useState(userProfile?.username || '')
  const [selectedAvatar, setSelectedAvatar] = useState(userProfile?.avatarEmoji || '')
  const [bio, setBio] = useState(userProfile?.bio || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    if (!user) return

    // Validate username
    if (!username.trim()) {
      setError('Username is required')
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

    setSaving(true)
    setError('')

    try {
      const userRef = doc(db, 'user_profiles', user.uid)
      await updateDoc(userRef, {
        displayName: displayName.trim(),
        username: username.toLowerCase().trim(),
        avatarEmoji: selectedAvatar,
        bio: bio.trim(),
        updatedAt: serverTimestamp()
      })

      onUpdate()
      onClose()
    } catch (error: any) {
      console.error('Error updating profile:', error)
      setError(error.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="card-premium w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gradient">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your display name"
              className="w-full rounded-xl border border-primary/30 bg-bg-warm px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Username
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                placeholder="username"
                className="w-full rounded-xl border border-primary/30 bg-bg-warm pl-8 pr-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Letters, numbers, and underscores only
            </p>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              rows={3}
              maxLength={150}
              className="w-full rounded-xl border border-primary/30 bg-bg-warm px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
            <p className="mt-1 text-xs text-slate-500 text-right">
              {bio.length}/150
            </p>
          </div>

          {/* Avatar Emoji */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Choose Avatar
            </label>
            <div className="grid grid-cols-6 sm:grid-cols-9 gap-2 max-h-64 overflow-y-auto p-2 rounded-xl bg-bg-warm custom-scrollbar">
              {PRESET_AVATARS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setSelectedAvatar(emoji)}
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
            {selectedAvatar && (
              <p className="mt-2 text-xs text-slate-400 text-center">
                Selected: <span className="text-2xl">{selectedAvatar}</span>
              </p>
            )}
          </div>

          {/* Preview */}
          <div className="p-4 rounded-xl bg-bg-warm border border-primary/20">
            <p className="text-xs text-slate-400 mb-3">Preview</p>
            <div className="flex items-center gap-3">
              {selectedAvatar ? (
                <div className="h-14 w-14 rounded-xl bg-gradient-warm flex items-center justify-center text-3xl shadow-glow">
                  {selectedAvatar}
                </div>
              ) : user?.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt="Profile" 
                  className="h-14 w-14 rounded-xl object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="h-14 w-14 rounded-xl bg-gradient-warm flex items-center justify-center text-2xl font-bold text-white">
                  {displayName?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
              <div>
                <p className="font-semibold text-slate-100">
                  {displayName || 'Display Name'}
                </p>
                <p className="text-sm text-slate-400">
                  @{username || 'username'}
                </p>
                {bio && (
                  <p className="text-xs text-slate-500 mt-1">
                    {bio}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-full border border-primary/30 text-slate-300 hover:bg-primary/10 transition font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
