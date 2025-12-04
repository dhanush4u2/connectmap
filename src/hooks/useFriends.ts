import { useState, useEffect } from 'react'
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc,
  doc,
  serverTimestamp,
  onSnapshot,
  deleteDoc,
  or,
  and
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { FriendRequest, UserProfile } from '../types'

export function useFriends(userId: string | undefined) {
  const [friends, setFriends] = useState<UserProfile[]>([])
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([])
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch friends list
  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchFriends = async () => {
      try {
        // Get friendships where user is either user1 or user2
        const friendshipsQuery = query(
          collection(db, 'friendships'),
          or(
            where('user1Id', '==', userId),
            where('user2Id', '==', userId)
          )
        )
        
        const snapshot = await getDocs(friendshipsQuery)
        const friendIds: string[] = []
        
        snapshot.forEach((doc) => {
          const data = doc.data()
          // Get the other user's ID
          if (data.user1Id === userId) {
            friendIds.push(data.user2Id)
          } else {
            friendIds.push(data.user1Id)
          }
        })

        // Fetch friend profiles
        if (friendIds.length > 0) {
          const profilesQuery = query(
            collection(db, 'user_profiles'),
            where('uid', 'in', friendIds)
          )
          const profilesSnapshot = await getDocs(profilesQuery)
          const friendsList: UserProfile[] = []
          profilesSnapshot.forEach((doc) => {
            friendsList.push({ ...doc.data(), uid: doc.id } as UserProfile)
          })
          setFriends(friendsList)
        } else {
          setFriends([])
        }
      } catch (error) {
        console.error('Error fetching friends:', error)
      }
    }

    fetchFriends()
  }, [userId])

  // Real-time listener for friend requests (received)
  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const requestsQuery = query(
      collection(db, 'friend_requests'),
      and(
        where('toUserId', '==', userId),
        where('status', '==', 'pending')
      )
    )

    const unsubscribe = onSnapshot(requestsQuery, (snapshot) => {
      const requests: FriendRequest[] = []
      snapshot.forEach((doc) => {
        requests.push({ id: doc.id, ...doc.data() } as FriendRequest)
      })
      setFriendRequests(requests)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [userId])

  // Fetch sent requests
  useEffect(() => {
    if (!userId) return

    const fetchSentRequests = async () => {
      try {
        const sentQuery = query(
          collection(db, 'friend_requests'),
          and(
            where('fromUserId', '==', userId),
            where('status', '==', 'pending')
          )
        )
        const snapshot = await getDocs(sentQuery)
        const sent: FriendRequest[] = []
        snapshot.forEach((doc) => {
          sent.push({ id: doc.id, ...doc.data() } as FriendRequest)
        })
        setSentRequests(sent)
      } catch (error) {
        console.error('Error fetching sent requests:', error)
      }
    }

    fetchSentRequests()
  }, [userId])

  const sendFriendRequest = async (toUserId: string, fromUserName: string, fromUserPhoto?: string) => {
    if (!userId) return

    try {
      // Check if request already exists
      const existingQuery = query(
        collection(db, 'friend_requests'),
        and(
          where('fromUserId', '==', userId),
          where('toUserId', '==', toUserId)
        )
      )
      const existing = await getDocs(existingQuery)
      
      if (!existing.empty) {
        throw new Error('Friend request already sent')
      }

      // Check if friendship already exists
      const friendshipQuery = query(
        collection(db, 'friendships'),
        or(
          and(where('user1Id', '==', userId), where('user2Id', '==', toUserId)),
          and(where('user1Id', '==', toUserId), where('user2Id', '==', userId))
        )
      )
      const friendshipExists = await getDocs(friendshipQuery)
      
      if (!friendshipExists.empty) {
        throw new Error('Already friends')
      }

      await addDoc(collection(db, 'friend_requests'), {
        fromUserId: userId,
        toUserId,
        fromUserName,
        fromUserPhoto,
        status: 'pending',
        createdAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error sending friend request:', error)
      throw error
    }
  }

  const acceptFriendRequest = async (requestId: string, fromUserId: string) => {
    if (!userId) return

    try {
      // Create friendship
      await addDoc(collection(db, 'friendships'), {
        user1Id: fromUserId,
        user2Id: userId,
        createdAt: serverTimestamp()
      })

      // Update request status
      await updateDoc(doc(db, 'friend_requests', requestId), {
        status: 'accepted'
      })

      // Remove from local state
      setFriendRequests(prev => prev.filter(req => req.id !== requestId))
    } catch (error) {
      console.error('Error accepting friend request:', error)
      throw error
    }
  }

  const rejectFriendRequest = async (requestId: string) => {
    try {
      await updateDoc(doc(db, 'friend_requests', requestId), {
        status: 'rejected'
      })
      setFriendRequests(prev => prev.filter(req => req.id !== requestId))
    } catch (error) {
      console.error('Error rejecting friend request:', error)
      throw error
    }
  }

  const removeFriend = async (friendId: string) => {
    if (!userId) return

    try {
      // Find and delete the friendship
      const friendshipQuery = query(
        collection(db, 'friendships'),
        or(
          and(where('user1Id', '==', userId), where('user2Id', '==', friendId)),
          and(where('user1Id', '==', friendId), where('user2Id', '==', userId))
        )
      )
      const snapshot = await getDocs(friendshipQuery)
      
      const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref))
      await Promise.all(deletePromises)

      // Update local state
      setFriends(prev => prev.filter(f => f.uid !== friendId))
    } catch (error) {
      console.error('Error removing friend:', error)
      throw error
    }
  }

  return {
    friends,
    friendRequests,
    sentRequests,
    loading,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend
  }
}
