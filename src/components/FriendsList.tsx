import { useFriends } from '../hooks/useFriends'
import { useAuthState } from '../hooks/useAuthState'

export function FriendsList() {
  const { user } = useAuthState()
  const { friends, loading, removeFriend } = useFriends(user?.uid)

  const handleRemoveFriend = async (friendId: string, friendName: string) => {
    const confirmed = confirm(`Remove ${friendName} from your friends?`)
    if (!confirmed) return

    try {
      await removeFriend(friendId)
    } catch (error) {
      console.error('Failed to remove friend:', error)
      alert('Failed to remove friend')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
      </div>
    )
  }

  if (friends.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <p className="text-3xl mb-2">👥</p>
        <p className="text-sm">No friends yet</p>
        <p className="text-xs mt-2">Search for users to add friends!</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-slate-400 px-2 mb-3">{friends.length} friends</p>
      {friends.map((friend) => (
        <div
          key={friend.uid}
          className="flex items-center gap-3 p-3 rounded-xl bg-bg-warm border border-primary/20 hover:bg-primary/5 transition group"
        >
          {/* Avatar */}
          <img
            src={friend.photoURL || `https://ui-avatars.com/api/?name=${friend.displayName || friend.username}&background=FF6B35&color=fff`}
            alt={friend.displayName || friend.username}
            className="w-10 h-10 rounded-full border-2 border-primary/30"
          />

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-slate-200 truncate">
              {friend.displayName || 'Anonymous'}
            </h3>
            {friend.username && (
              <p className="text-xs text-slate-400">@{friend.username}</p>
            )}
            {friend.placesCount !== undefined && (
              <p className="text-xs text-slate-500 mt-1">
                {friend.placesCount} saved places
              </p>
            )}
          </div>

          {/* Remove Button (shows on hover) */}
          <button
            onClick={() => handleRemoveFriend(friend.uid, friend.displayName || friend.username || 'this user')}
            className="opacity-0 group-hover:opacity-100 px-3 py-1.5 rounded-full bg-red-500/10 text-red-400 text-xs font-semibold border border-red-500/20 hover:bg-red-500/20 transition"
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  )
}
