import { useState } from 'react'
import { useAuthState } from '../hooks/useAuthState'
import { UserSearch } from './UserSearch'
import { FriendRequests } from './FriendRequests'
import { FriendsList } from './FriendsList'
import { MutualSaves } from './MutualSaves'

type Tab = 'friends' | 'search' | 'requests' | 'mutual'

export function SocialPanel() {
  const { user } = useAuthState()
  const [activeTab, setActiveTab] = useState<Tab>('friends')

  if (!user) {
    return (
      <div className="h-full flex items-center justify-center p-6 bg-bg-elevated/50 backdrop-blur-sm">
        <div className="text-center text-slate-500">
          <p className="text-3xl mb-2">🔒</p>
          <p className="text-sm">Sign in to connect with friends</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-bg-elevated/50 backdrop-blur-sm border-l border-primary/20">
      {/* Header */}
      <div className="p-4 border-b border-primary/20 bg-bg-elevated/80">
        <h2 className="text-lg font-bold text-gradient mb-3">Social</h2>
        
        {/* Tabs */}
        <div className="flex gap-1.5">
          <button
            onClick={() => setActiveTab('friends')}
            className={`flex-1 px-2 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'friends'
                ? 'bg-gradient-warm text-white shadow-glow'
                : 'bg-bg-warm hover:bg-primary/10 border border-primary/20'
            }`}
          >
            👥
          </button>
          <button
            onClick={() => setActiveTab('mutual')}
            className={`flex-1 px-2 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'mutual'
                ? 'bg-gradient-warm text-white shadow-glow'
                : 'bg-bg-warm hover:bg-primary/10 border border-primary/20'
            }`}
          >
            🔔
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 px-2 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'search'
                ? 'bg-gradient-warm text-white shadow-glow'
                : 'bg-bg-warm hover:bg-primary/10 border border-primary/20'
            }`}
          >
            🔍
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 px-2 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'requests'
                ? 'bg-gradient-warm text-white shadow-glow'
                : 'bg-bg-warm hover:bg-primary/10 border border-primary/20'
            }`}
          >
            📬
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'friends' && <FriendsList />}
        {activeTab === 'mutual' && <MutualSaves />}
        {activeTab === 'search' && <UserSearch />}
        {activeTab === 'requests' && <FriendRequests />}
      </div>
    </div>
  )
}
