import { useState } from 'react'
import { useUserSearch } from '../hooks/useUserSearch'
import { useFriends } from '../hooks/useFriends'
import { useAuthState } from '../hooks/useAuthState'
import type { UserProfile } from '../types'

export function UserSearch() {
  const { user } = useAuthState()
  const { results, loading, searchUsers, clearResults } = useUserSearch()
  const { friends, sentRequests, sendFriendRequest } = useFriends(user?.uid)
  const [searchTerm, setSearchTerm] = useState('')

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    if (value.length >= 2) {
      searchUsers(value)
    } else {
      clearResults()
    }
  }

  const handleSendRequest = async (targetUser: UserProfile) => {
    if (!user) return
    
    try {
      await sendFriendRequest(targetUser.uid, user.displayName || 'User', user.photoURL || undefined)
      alert(`Friend request sent to ${targetUser.displayName || targetUser.username}!`)
    } catch (error: any) {
      alert(error.message || 'Failed to send friend request')
    }
  }

  const isFriend = (userId: string) => friends.some(f => f.uid === userId)
  const hasSentRequest = (userId: string) => sentRequests.some(r => r.toUserId === userId)

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search users by username..."
          className="w-full px-4 py-3 rounded-xl bg-bg-warm border border-primary/20 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primary/40 transition"
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="h-5 w-5 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
          </div>
        )}
      </div>

      {/* Search Results */}
      {results.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-slate-400 px-2">{results.length} users found</p>
          {results.map((profile) => {
            const isCurrentUser = profile.uid === user?.uid
            const friendStatus = isFriend(profile.uid)
            const requestSent = hasSentRequest(profile.uid)

            return (
              <div
                key={profile.uid}
                className="flex items-center gap-3 p-3 rounded-xl bg-bg-warm border border-primary/20 hover:bg-primary/5 transition"
              >
                {/* Avatar */}
                <img
                  src={profile.photoURL || `https://ui-avatars.com/api/?name=${profile.displayName || profile.username}&background=FF6B35&color=fff`}
                  alt={profile.displayName || profile.username}
                  className="w-12 h-12 rounded-full border-2 border-primary/30"
                />

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-slate-200 truncate">
                    {profile.displayName || 'Anonymous'}
                  </h3>
                  {profile.username && (
                    <p className="text-xs text-slate-400">@{profile.username}</p>
                  )}
                  {profile.bio && (
                    <p className="text-xs text-slate-500 line-clamp-1 mt-1">{profile.bio}</p>
                  )}
                </div>

                {/* Action Button */}
                {!isCurrentUser && (
                  <div>
                    {friendStatus ? (
                      <span className="px-4 py-2 rounded-full bg-green-500/20 text-green-400 text-xs font-semibold border border-green-500/30">
                        ✓ Friends
                      </span>
                    ) : requestSent ? (
                      <span className="px-4 py-2 rounded-full bg-primary/20 text-primary text-xs font-semibold border border-primary/30">
                        Request Sent
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSendRequest(profile)}
                        className="px-4 py-2 rounded-full bg-gradient-warm text-white text-xs font-semibold hover:shadow-glow transition"
                      >
                        + Add Friend
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* No Results */}
      {searchTerm.length >= 2 && !loading && results.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          <p className="text-3xl mb-2">🔍</p>
          <p className="text-sm">No users found</p>
        </div>
      )}
    </div>
  )
}
