import { useFriends } from '../hooks/useFriends'
import { useAuthState } from '../hooks/useAuthState'

export function FriendRequests() {
  const { user } = useAuthState()
  const { friendRequests, acceptFriendRequest, rejectFriendRequest } = useFriends(user?.uid)

  if (friendRequests.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <p className="text-3xl mb-2">📬</p>
        <p className="text-sm">No pending friend requests</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {friendRequests.map((request) => (
        <div
          key={request.id}
          className="flex items-center gap-3 p-4 rounded-xl bg-bg-warm border border-primary/20"
        >
          {/* Avatar */}
          <img
            src={request.fromUserPhoto || `https://ui-avatars.com/api/?name=${request.fromUserName}&background=FF6B35&color=fff`}
            alt={request.fromUserName}
            className="w-12 h-12 rounded-full border-2 border-primary/30"
          />

          {/* User Info */}
          <div className="flex-1">
            <h3 className="font-semibold text-sm text-slate-200">
              {request.fromUserName || 'Someone'}
            </h3>
            <p className="text-xs text-slate-400">wants to be friends</p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={async () => {
                try {
                  await acceptFriendRequest(request.id, request.fromUserId)
                } catch (error) {
                  console.error('Failed to accept:', error)
                  alert('Failed to accept friend request')
                }
              }}
              className="px-4 py-2 rounded-full bg-green-500/20 text-green-400 text-xs font-semibold border border-green-500/30 hover:bg-green-500/30 transition"
            >
              ✓ Accept
            </button>
            <button
              onClick={async () => {
                try {
                  await rejectFriendRequest(request.id)
                } catch (error) {
                  console.error('Failed to reject:', error)
                  alert('Failed to reject friend request')
                }
              }}
              className="px-4 py-2 rounded-full bg-red-500/20 text-red-400 text-xs font-semibold border border-red-500/30 hover:bg-red-500/30 transition"
            >
              ✗ Decline
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
