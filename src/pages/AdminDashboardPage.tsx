import { useEffect, useState } from 'react'
import { collection, query, where, getDocs, doc, updateDoc, addDoc, serverTimestamp, deleteDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuthState } from '../hooks/useAuthState'
import { useNavigate } from 'react-router-dom'

type Submission = {
  id: string
  payload: any
  submittedBy: string
  status: string
  submittedAt: any
}

export function AdminDashboardPage() {
  const { user, loading: authLoading } = useAuthState()
  const navigate = useNavigate()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)

  useEffect(() => {
    // Simple admin check (you should use Firebase custom claims in production)
    if (!authLoading && !user) {
      navigate('/profile')
    }
  }, [user, authLoading, navigate])

  useEffect(() => {
    async function fetchSubmissions() {
      try {
        const q = query(collection(db, 'moderation_queue'), where('status', '==', 'pending'))
        const snapshot = await getDocs(q)
        const fetchedSubmissions: Submission[] = []
        snapshot.forEach((doc) => {
          fetchedSubmissions.push({ id: doc.id, ...doc.data() } as Submission)
        })
        setSubmissions(fetchedSubmissions)
      } catch (error) {
        console.error('Error fetching submissions:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchSubmissions()
    }
  }, [user])

  const handleApprove = async (submission: Submission) => {
    try {
      // Create place in places collection
      await addDoc(collection(db, 'places'), {
        ...submission.payload,
        createdBy: submission.submittedBy,
        status: 'published',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      // Update moderation queue
      await updateDoc(doc(db, 'moderation_queue', submission.id), {
        status: 'approved',
        reviewedBy: user?.uid,
        reviewedAt: serverTimestamp(),
      })

      // Remove from local state
      setSubmissions(submissions.filter((s) => s.id !== submission.id))
      setSelectedSubmission(null)
      alert('✅ Place approved and published!')
    } catch (error) {
      console.error('Error approving submission:', error)
      alert('Failed to approve submission')
    }
  }

  const handleReject = async (submission: Submission) => {
    const reason = prompt('Reason for rejection (optional):')
    
    try {
      await updateDoc(doc(db, 'moderation_queue', submission.id), {
        status: 'rejected',
        reviewedBy: user?.uid,
        reviewedAt: serverTimestamp(),
        notes: reason || '',
      })

      setSubmissions(submissions.filter((s) => s.id !== submission.id))
      setSelectedSubmission(null)
      alert('❌ Submission rejected')
    } catch (error) {
      console.error('Error rejecting submission:', error)
      alert('Failed to reject submission')
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="h-12 w-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar - Submissions List */}
      <div className="w-80 border-r border-primary/20 bg-bg-elevated overflow-y-auto">
        <div className="p-4 border-b border-primary/20">
          <h1 className="text-xl font-bold text-gradient mb-1">Admin Dashboard</h1>
          <p className="text-xs text-slate-400">Moderation Queue</p>
        </div>

        <div className="p-4 space-y-3">
          {submissions.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <p className="text-4xl mb-2">✨</p>
              <p className="text-sm">No pending submissions</p>
            </div>
          ) : (
            submissions.map((submission) => (
              <button
                key={submission.id}
                onClick={() => setSelectedSubmission(submission)}
                className={`w-full text-left p-4 rounded-xl transition-all ${
                  selectedSubmission?.id === submission.id
                    ? 'bg-gradient-warm text-white shadow-glow'
                    : 'bg-bg-warm hover:bg-primary/10 border border-primary/20'
                }`}
              >
                <h3 className="font-semibold text-sm mb-1">
                  {submission.payload.title}
                </h3>
                <p className="text-xs opacity-80 line-clamp-2 mb-2">
                  {submission.payload.description}
                </p>
                <div className="flex gap-2 text-xs opacity-70">
                  <span>{submission.payload.category}</span>
                  <span>•</span>
                  <span>{submission.payload.neighbourhood}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Content - Selected Submission Details */}
      <div className="flex-1 overflow-y-auto">
        {selectedSubmission ? (
          <div className="p-8 max-w-4xl mx-auto">
            <div className="card-premium p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gradient mb-2">
                    {selectedSubmission.payload.title}
                  </h2>
                  <p className="text-sm text-slate-400">
                    Submitted: {selectedSubmission.submittedAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleApprove(selectedSubmission)}
                    className="btn-primary"
                  >
                    ✅ Approve
                  </button>
                  <button
                    onClick={() => handleReject(selectedSubmission)}
                    className="px-6 py-2.5 rounded-full border-2 border-red-500/40 bg-red-500/10 text-sm font-semibold text-red-400 hover:bg-red-500/20 transition"
                  >
                    ❌ Reject
                  </button>
                </div>
              </div>

              {/* Images */}
              {selectedSubmission.payload.images?.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-slate-300 mb-3">Images</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {selectedSubmission.payload.images.map((img: string, idx: number) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`${selectedSubmission.payload.title} ${idx + 1}`}
                        className="w-full h-32 object-cover rounded-xl border border-primary/20"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Details */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-300 mb-2">Description</h3>
                  <p className="text-slate-400 leading-relaxed">
                    {selectedSubmission.payload.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-300 mb-2">Category</h3>
                    <p className="text-primary capitalize">
                      {selectedSubmission.payload.category.replace('_', ' & ')}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-300 mb-2">Neighbourhood</h3>
                    <p className="text-slate-400">{selectedSubmission.payload.neighbourhood}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-300 mb-2">Address</h3>
                  <p className="text-slate-400">{selectedSubmission.payload.address}</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-300 mb-2">Location</h3>
                  <p className="text-slate-400">
                    Lat: {selectedSubmission.payload.location.lat}, Lng: {selectedSubmission.payload.location.lng}
                  </p>
                </div>

                {selectedSubmission.payload.tags?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-300 mb-2">Tags</h3>
                    <div className="flex gap-2 flex-wrap">
                      {selectedSubmission.payload.tags.map((tag: string) => (
                        <span
                          key={tag}
                          className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs text-accent-yellow"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500">
            <div className="text-center">
              <p className="text-6xl mb-4">👈</p>
              <p className="text-sm">Select a submission to review</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
