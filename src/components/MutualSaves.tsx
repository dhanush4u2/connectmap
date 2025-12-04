import { useMutualSaves } from '../hooks/useMutualSaves'
import { useFriends } from '../hooks/useFriends'
import { useAuthState } from '../hooks/useAuthState'
import { useNavigate } from 'react-router-dom'

export function MutualSaves() {
  const { user } = useAuthState()
  const { friends } = useFriends(user?.uid)
  const friendIds = friends.map(f => f.uid)
  const { mutualSaves, loading } = useMutualSaves(user?.uid, friendIds)
  const navigate = useNavigate()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
      </div>
    )
  }

  if (mutualSaves.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <p className="text-3xl mb-2">🔔</p>
        <p className="text-sm">No mutual saves yet</p>
        <p className="text-xs mt-2">When you and your friends save the same place, it will appear here!</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-400 px-2 mb-3">
        {mutualSaves.length} {mutualSaves.length === 1 ? 'mutual save' : 'mutual saves'}
      </p>
      
      {mutualSaves.map((mutualSave) => (
        <div
          key={mutualSave.placeId}
          className="card-premium p-4 hover:scale-[1.02] transition-transform cursor-pointer"
          onClick={() => navigate(`/place/${mutualSave.placeId}`)}
        >
          {/* Place Title */}
          <h3 className="font-semibold text-sm text-slate-100 mb-2">
            📍 {mutualSave.placeTitle}
          </h3>

          {/* Friends who saved this */}
          <div className="space-y-2">
            <p className="text-xs text-slate-400">
              Also saved by:
            </p>
            <div className="flex flex-wrap gap-2">
              {mutualSave.friendsWhoSaved.map((friend) => (
                <div
                  key={friend.uid}
                  className="flex items-center gap-2 px-2 py-1 rounded-full bg-primary/10 border border-primary/20"
                >
                  <img
                    src={friend.photoURL || `https://ui-avatars.com/api/?name=${friend.displayName || friend.username}&background=FF6B35&color=fff`}
                    alt={friend.displayName || friend.username}
                    className="w-5 h-5 rounded-full border border-primary/30"
                  />
                  <span className="text-xs text-slate-300">
                    {friend.displayName || friend.username}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Notification Badge */}
          {!mutualSave.notificationShown && (
            <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-accent-yellow/20 border border-accent-yellow/40">
              <span className="text-xs text-accent-yellow font-semibold">🔔 New</span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
