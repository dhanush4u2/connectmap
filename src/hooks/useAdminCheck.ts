import { useState, useEffect } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuthState } from './useAuthState'

export function useAdminCheck() {
  const { user } = useAuthState()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isModerator, setIsModerator] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAdminStatus() {
      if (!user) {
        setIsAdmin(false)
        setIsModerator(false)
        setLoading(false)
        return
      }

      try {
        const adminDoc = await getDoc(doc(db, 'admin_roles', user.uid))
        
        if (adminDoc.exists()) {
          const role = adminDoc.data()?.role
          setIsAdmin(role === 'admin')
          setIsModerator(role === 'moderator' || role === 'admin')
        } else {
          setIsAdmin(false)
          setIsModerator(false)
        }
      } catch (error) {
        console.error('Error checking admin status:', error)
        setIsAdmin(false)
        setIsModerator(false)
      } finally {
        setLoading(false)
      }
    }

    checkAdminStatus()
  }, [user])

  return { isAdmin, isModerator, loading }
}
