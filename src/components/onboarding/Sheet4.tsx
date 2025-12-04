import { useState } from 'react'
import type { OnboardingSheet4, PersonaType } from '../../types'
import { PERSONAS } from '../../lib/onboardingData'

interface Sheet4Props {
  onComplete: (data: OnboardingSheet4) => void
  onBack: () => void
  initialData: OnboardingSheet4 | null
}

export function Sheet4({ onComplete, onBack, initialData }: Sheet4Props) {
  const [personaKeyword, setPersonaKeyword] = useState<PersonaType>(
    initialData?.personaKeyword || 'neon_nomad'
  )
  const [freeTags, setFreeTags] = useState<string[]>(
    initialData?.freeTags || []
  )
  const [tagInput, setTagInput] = useState('')
  const [privacy, setPrivacy] = useState(
    initialData?.privacy || {
      showPlacesToFriends: true,
      publicProfile: false,
      anonymousMode: false
    }
  )

  const handleAddTag = () => {
    const tag = tagInput.trim()
    if (tag && freeTags.length < 6 && !freeTags.includes(tag)) {
      setFreeTags([...freeTags, tag])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setFreeTags(freeTags.filter(t => t !== tag))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  const canProceed = true // All fields are optional

  const handleComplete = () => {
    onComplete({
      personaKeyword,
      freeTags,
      privacy
    })
  }

  return (
    <div className="card-premium p-8 animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gradient mb-2">Attach your persona</h2>
        <p className="text-sm text-slate-400">Make your Taste World unique</p>
      </div>

      <div className="space-y-8">
        {/* Persona Selection */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-3">
            Pick a persona keyword
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto custom-scrollbar">
            {Object.values(PERSONAS).map(persona => (
              <button
                key={persona.type}
                onClick={() => setPersonaKeyword(persona.type)}
                className={`p-4 rounded-xl text-left transition ${
                  personaKeyword === persona.type
                    ? 'bg-gradient-warm text-white shadow-glow'
                    : 'bg-bg-warm border border-primary/20 hover:bg-primary/10'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{persona.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold mb-1">{persona.label}</div>
                    <div className="text-xs opacity-80 mb-2">{persona.description}</div>
                    <div className="flex flex-wrap gap-1">
                      {persona.traits.map(trait => (
                        <span
                          key={trait}
                          className="px-2 py-0.5 rounded-full text-[10px] bg-primary/20 border border-primary/30"
                        >
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Free Tags */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-3">
            Free-text tags <span className="text-slate-500">({freeTags.length}/6)</span>
          </label>
          <p className="text-xs text-slate-400 mb-3">Add hobbies, obsessions: F1, Jazz, Board games...</p>
          
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a tag and press Enter"
              disabled={freeTags.length >= 6}
              className="flex-1 px-4 py-3 rounded-xl bg-bg-warm border border-primary/20 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primary/40 transition disabled:opacity-50"
            />
            <button
              onClick={handleAddTag}
              disabled={!tagInput.trim() || freeTags.length >= 6}
              className="px-6 py-3 rounded-xl bg-gradient-warm text-white font-semibold hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>

          {freeTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {freeTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => handleRemoveTag(tag)}
                  className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-sm hover:bg-red-500/20 hover:border-red-500/40 transition group"
                >
                  <span>{tag}</span>
                  <span className="ml-2 text-red-400 opacity-0 group-hover:opacity-100 transition">×</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Privacy Settings */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-3">
            Connect privacy defaults
          </label>
          <div className="space-y-3">
            <button
              onClick={() => setPrivacy({ ...privacy, showPlacesToFriends: !privacy.showPlacesToFriends })}
              className={`w-full p-4 rounded-xl flex items-center justify-between transition ${
                privacy.showPlacesToFriends
                  ? 'bg-green-500/20 border-2 border-green-500/40'
                  : 'bg-bg-warm border-2 border-primary/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">👥</div>
                <div className="text-left">
                  <div className="font-semibold text-sm">Show places to friends</div>
                  <div className="text-xs text-slate-400">Friends can see your saved places</div>
                </div>
              </div>
              <div className={`w-12 h-6 rounded-full transition ${privacy.showPlacesToFriends ? 'bg-green-500' : 'bg-slate-600'}`}>
                <div className={`w-5 h-5 bg-white rounded-full m-0.5 transition-transform ${privacy.showPlacesToFriends ? 'translate-x-6' : ''}`} />
              </div>
            </button>

            <button
              onClick={() => setPrivacy({ ...privacy, publicProfile: !privacy.publicProfile })}
              className={`w-full p-4 rounded-xl flex items-center justify-between transition ${
                privacy.publicProfile
                  ? 'bg-blue-500/20 border-2 border-blue-500/40'
                  : 'bg-bg-warm border-2 border-primary/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">🌍</div>
                <div className="text-left">
                  <div className="font-semibold text-sm">Public profile</div>
                  <div className="text-xs text-slate-400">Anyone can discover your profile</div>
                </div>
              </div>
              <div className={`w-12 h-6 rounded-full transition ${privacy.publicProfile ? 'bg-blue-500' : 'bg-slate-600'}`}>
                <div className={`w-5 h-5 bg-white rounded-full m-0.5 transition-transform ${privacy.publicProfile ? 'translate-x-6' : ''}`} />
              </div>
            </button>

            <button
              onClick={() => setPrivacy({ ...privacy, anonymousMode: !privacy.anonymousMode })}
              className={`w-full p-4 rounded-xl flex items-center justify-between transition ${
                privacy.anonymousMode
                  ? 'bg-purple-500/20 border-2 border-purple-500/40'
                  : 'bg-bg-warm border-2 border-primary/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">🎭</div>
                <div className="text-left">
                  <div className="font-semibold text-sm">Anonymous mode</div>
                  <div className="text-xs text-slate-400">Hide your name, use generated username</div>
                </div>
              </div>
              <div className={`w-12 h-6 rounded-full transition ${privacy.anonymousMode ? 'bg-purple-500' : 'bg-slate-600'}`}>
                <div className={`w-5 h-5 bg-white rounded-full m-0.5 transition-transform ${privacy.anonymousMode ? 'translate-x-6' : ''}`} />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3 mt-8">
        <button
          onClick={onBack}
          className="px-6 py-4 rounded-full bg-bg-warm border border-primary/20 hover:bg-primary/10 transition font-semibold"
        >
          ← Back
        </button>
        <button
          onClick={handleComplete}
          disabled={!canProceed}
          className="flex-1 py-4 rounded-full font-semibold bg-gradient-warm text-white shadow-glow hover:scale-[1.02] transition"
        >
          🎉 Create my Taste World
        </button>
      </div>
    </div>
  )
}
