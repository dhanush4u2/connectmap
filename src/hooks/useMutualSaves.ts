import { useEffect, useState } from 'react'
import { 
  collection, 
  query, 
  where, 
  getDocs,
  onSnapshot,
  doc,
  getDoc
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { UserProfile } from '../types'

interface MutualSaveData {
  placeId: string
  placeTitle: string
  friendsWhoSaved: UserProfile[]
  notificationShown?: boolean
}

export function useMutualSaves(userId: string | undefined, friendIds: string[]) {
  const [mutualSaves, setMutualSaves] = useState<MutualSaveData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId || friendIds.length === 0) {
      setMutualSaves([])
      setLoading(false)
      return
    }

    const checkMutualSaves = async () => {
      try {
        // Get current user's saved places
        const userProfileRef = doc(db, 'user_profiles', userId)
        const userProfileSnap = await getDoc(userProfileRef)
        
        if (!userProfileSnap.exists()) {
          setMutualSaves([])
          setLoading(false)
          return
        }

        const userSavedPlaces = userProfileSnap.data()?.savedPlaces || []
        
        if (userSavedPlaces.length === 0) {
          setMutualSaves([])
          setLoading(false)
          return
        }

        // Get friends' profiles with their saved places
        const friendsQuery = query(
          collection(db, 'user_profiles'),
          where('uid', 'in', friendIds)
        )
        const friendsSnapshot = await getDocs(friendsQuery)
        
        const friendProfiles: UserProfile[] = []
        friendsSnapshot.forEach((doc) => {
          friendProfiles.push({ ...doc.data(), uid: doc.id } as UserProfile)
        })

        // Find mutual saves
        const mutualSavesMap = new Map<string, UserProfile[]>()
        
        for (const place of userSavedPlaces) {
          const friendsWithThisPlace = friendProfiles.filter(
            friend => friend.savedPlaces?.includes(place)
          )
          
          if (friendsWithThisPlace.length > 0) {
            mutualSavesMap.set(place, friendsWithThisPlace)
          }
        }

        // Get place details for mutual saves
        const mutualSavesData: MutualSaveData[] = []
        
        for (const [placeId, friends] of mutualSavesMap.entries()) {
          try {
            const placeRef = doc(db, 'places', placeId)
            const placeSnap = await getDoc(placeRef)
            
            if (placeSnap.exists()) {
              mutualSavesData.push({
                placeId,
                placeTitle: placeSnap.data()?.title || 'Unknown Place',
                friendsWhoSaved: friends
              })
            }
          } catch (error) {
            console.error(`Error fetching place ${placeId}:`, error)
          }
        }

        setMutualSaves(mutualSavesData)
      } catch (error) {
        console.error('Error checking mutual saves:', error)
      } finally {
        setLoading(false)
      }
    }

    checkMutualSaves()

    // Set up real-time listener for user's saved places changes
    const userProfileRef = doc(db, 'user_profiles', userId)
    const unsubscribe = onSnapshot(userProfileRef, () => {
      checkMutualSaves()
    })

    return () => unsubscribe()
  }, [userId, friendIds])

  return { mutualSaves, loading }
}
