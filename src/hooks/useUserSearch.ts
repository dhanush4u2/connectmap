import { useState } from 'react'
import { collection, query, where, getDocs, limit } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { UserProfile } from '../types'

export function useUserSearch() {
  const [results, setResults] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchUsers = async (searchTerm: string) => {
    if (!searchTerm || searchTerm.trim().length < 2) {
      setResults([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      const searchLower = searchTerm.toLowerCase().trim()
      
      // Search by username (exact match or starts with)
      const usernameQuery = query(
        collection(db, 'user_profiles'),
        where('username', '>=', searchLower),
        where('username', '<=', searchLower + '\uf8ff'),
        limit(20)
      )
      
      const snapshot = await getDocs(usernameQuery)
      const users: UserProfile[] = []
      
      snapshot.forEach((doc) => {
        users.push({ ...doc.data(), uid: doc.id } as UserProfile)
      })

      // If no results, try searching display names
      if (users.length === 0) {
        const displayNameQuery = query(
          collection(db, 'user_profiles'),
          where('displayName', '>=', searchTerm),
          where('displayName', '<=', searchTerm + '\uf8ff'),
          limit(20)
        )
        
        const displaySnapshot = await getDocs(displayNameQuery)
        displaySnapshot.forEach((doc) => {
          users.push({ ...doc.data(), uid: doc.id } as UserProfile)
        })
      }

      setResults(users)
    } catch (err) {
      console.error('Error searching users:', err)
      setError('Failed to search users')
    } finally {
      setLoading(false)
    }
  }

  const clearResults = () => {
    setResults([])
    setError(null)
  }

  return {
    results,
    loading,
    error,
    searchUsers,
    clearResults
  }
}
