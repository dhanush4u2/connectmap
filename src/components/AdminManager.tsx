import { useState, useEffect } from 'react'
import { collection, getDocs, doc, serverTimestamp, query, where, updateDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuthState } from '../hooks/useAuthState'
import type { UserProfile } from '../types'

export function AdminManager() {
  const { user } = useAuthState()
  const [admins, setAdmins] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [searchUsername, setSearchUsername] = useState('')
  const [searchResults, setSearchResults] = useState<UserProfile[]>([])
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    fetchAdmins()
  }, [])

  async function fetchAdmins() {
    try {
      const q = query(collection(db, 'user_profiles'), where('isAdmin', '==', true))
      const snapshot = await getDocs(q)
      const adminsList: UserProfile[]  = []
      snapshot.forEach((docSnap) => {
        adminsList.push({ ...docSnap.data(), uid: docSnap.id } as UserProfile)
      })
      setAdmins(adminsList)
    } catch (error) {
      console.error('Error fetching admins:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSearchUsername() {
    if (!searchUsername.trim()) {
      alert('Please enter a username')
      return
    }

    setSearching(true)
    try {
      const q = query(
        collection(db, 'user_profiles'),
        where('username', '>=', searchUsername.toLowerCase()),
        where('username', '<=', searchUsername.toLowerCase() + '\uf8ff')
      )
      const snapshot = await getDocs(q)
      const results: UserProfile[] = []
      snapshot.forEach((docSnap) => {
        const data = { ...docSnap.data(), uid: docSnap.id } as UserProfile
        // Filter out already admins
        if (!data.isAdmin) {
          results.push(data)
        }
      })
      setSearchResults(results)
      
      if (results.length === 0) {
        alert('No users found with that username')
      }
    } catch (error) {
      console.error('Error searching users:', error)
      alert('Failed to search users')
    } finally {
      setSearching(false)
    }
  }

  async function handleMakeAdmin(userProfile: UserProfile) {
    if (!confirm(`Make @${userProfile.username} an admin?`)) return

    try {
      const userRef = doc(db, 'user_profiles', userProfile.uid)
      await updateDoc(userRef, {
        isAdmin: true,
        updatedAt: serverTimestamp()
      })
      
      // Clear search and refresh admins list
      setSearchResults([])
      setSearchUsername('')
      setIsAdding(false)
      fetchAdmins()
      alert(`✅ @${userProfile.username} is now an admin!`)
    } catch (error) {
      console.error('Error making user admin:', error)
      alert('Failed to make user admin')
    }
  }

  async function handleRemoveAdmin(userProfile: UserProfile) {
    if (userProfile.uid === user?.uid) {
      alert("You can't remove yourself!")
      return
    }

    if (!confirm(`Remove admin access for @${userProfile.username}?`)) return

    try {
      const userRef = doc(db, 'user_profiles', userProfile.uid)
      await updateDoc(userRef, {
        isAdmin: false,
        updatedAt: serverTimestamp()
      })
      
      fetchAdmins()
      alert(`✅ Admin access removed for @${userProfile.username}`)
    } catch (error) {
      console.error('Error removing admin:', error)
      alert('Failed to remove admin')
    }
  }

  if (loading) {
    return <div className="flex justify-center p-12"><div className="h-12 w-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" /></div>
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="card-premium p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gradient mb-1">Manage Admins</h2>
            <p className="text-xs md:text-sm text-slate-400">
              {admins.length} admin users
            </p>
          </div>
          <button
            onClick={() => {
              setIsAdding(!isAdding)
              setSearchResults([])
              setSearchUsername('')
            }}
            className="btn-primary text-sm px-4 py-2"
          >
            {isAdding ? 'Cancel' : '+ Add Admin'}
          </button>
        </div>

        {isAdding && (
          <div className="mb-6 p-4 md:p-6 rounded-2xl bg-bg-warm border border-primary/20">
            <h3 className="text-sm font-semibold text-slate-300 mb-4">Search User by Username</h3>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Enter username (e.g., johndoe)"
                value={searchUsername}
                onChange={(e) => setSearchUsername(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearchUsername()}
                className="flex-1 rounded-xl border border-primary/30 bg-bg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button
                onClick={handleSearchUsername}
                disabled={searching}
                className="btn-primary text-sm px-6"
              >
                {searching ? 'Searching...' : 'Search'}
              </button>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-slate-400 mb-2">Found {searchResults.length} user(s):</p>
                {searchResults.map((result) => (
                  <div
                    key={result.uid}
                    className="flex items-center justify-between p-3 rounded-xl bg-bg border border-primary/20"
                  >
                    <div className="flex items-center gap-3">
                      {result.photoURL ? (
                        <img 
                          src={result.photoURL} 
                          alt={result.displayName || 'User'} 
                          className="h-10 w-10 rounded-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gradient-warm flex items-center justify-center text-white font-bold text-sm">
                          {result.displayName?.[0]?.toUpperCase() || result.email?.[0]?.toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-slate-100 text-sm">
                          {result.displayName || 'User'}
                        </p>
                        <p className="text-xs text-slate-400">@{result.username}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleMakeAdmin(result)}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold bg-primary text-white hover:bg-primary-light transition"
                    >
                      Make Admin
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="space-y-3">
          {admins.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <p className="text-4xl mb-2">👥</p>
              <p className="text-sm">No admins found</p>
            </div>
          ) : (
            admins.map((admin) => (
              <div
                key={admin.uid}
                className="flex items-center justify-between p-4 rounded-2xl bg-bg-warm border border-primary/20"
              >
                <div className="flex items-center gap-4">
                  {admin.photoURL ? (
                    <img 
                      src={admin.photoURL} 
                      alt={admin.displayName || 'Admin'} 
                      className="h-10 w-10 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gradient-warm flex items-center justify-center text-white font-bold">
                      {admin.displayName?.[0]?.toUpperCase() || admin.email?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-slate-100 text-sm">
                      {admin.displayName || 'Admin User'}
                      {admin.uid === user?.uid && <span className="ml-2 text-xs text-primary">(You)</span>}
                    </p>
                    <p className="text-xs text-slate-400">@{admin.username}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/20 text-primary border border-primary/30">
                      ADMIN
                    </span>
                  </div>
                </div>
                {admin.uid !== user?.uid && (
                  <button
                    onClick={() => handleRemoveAdmin(admin)}
                    className="px-3 md:px-4 py-2 rounded-full text-xs font-semibold text-red-400 border border-red-500/30 hover:bg-red-500/10 transition"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
