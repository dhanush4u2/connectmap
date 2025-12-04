import { useState } from 'react'
import type { OnboardingSheet1, HangoutEnergy, GroupSize, DayPreference } from '../../types'
import { HANGOUT_ENERGY_OPTIONS, GROUP_SIZE_OPTIONS, DAY_PREFERENCE_OPTIONS } from '../../lib/onboardingData'

interface Sheet1Props {
  onComplete: (data: OnboardingSheet1) => void
  initialData: OnboardingSheet1 | null
}

export function Sheet1({ onComplete, initialData }: Sheet1Props) {
  const [hangoutEnergy, setHangoutEnergy] = useState<HangoutEnergy>(
    initialData?.hangoutEnergy || 'balanced'
  )
  const [socialBattery, setSocialBattery] = useState(
    initialData?.socialBattery || 50
  )
  const [groupSize, setGroupSize] = useState<GroupSize[]>(
    initialData?.groupSize || []
  )
  const [dayPreferences, setDayPreferences] = useState<DayPreference[]>(
    initialData?.dayPreferences || []
  )

  const toggleGroupSize = (size: GroupSize) => {
    setGroupSize(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    )
  }

  const toggleDayPreference = (pref: DayPreference) => {
    setDayPreferences(prev =>
      prev.includes(pref) ? prev.filter(p => p !== pref) : [...prev, pref]
    )
  }

  const canProceed = groupSize.length > 0 && dayPreferences.length > 0

  const handleContinue = () => {
    if (canProceed) {
      onComplete({
        hangoutEnergy,
        socialBattery,
        groupSize,
        dayPreferences
      })
    }
  }

  return (
    <div className="card-premium p-8 animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gradient mb-2">What's your vibe?</h2>
        <p className="text-sm text-slate-400">We'll craft your Taste World</p>
      </div>

      <div className="space-y-8">
        {/* Hangout Energy */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-3">
            Preferred hangout energy
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {HANGOUT_ENERGY_OPTIONS.map(option => (
              <button
                key={option.value}
                onClick={() => setHangoutEnergy(option.value as HangoutEnergy)}
                className={`p-4 rounded-xl text-center transition ${
                  hangoutEnergy === option.value
                    ? 'bg-gradient-warm text-white shadow-glow'
                    : 'bg-bg-warm border border-primary/20 hover:bg-primary/10'
                }`}
              >
                <div className="text-2xl mb-1">{option.emoji}</div>
                <div className="text-xs font-semibold">{option.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Social Battery */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-3">
            Social battery — Introvert ↔ Extrovert
          </label>
          <div className="space-y-3">
            <input
              type="range"
              min="0"
              max="100"
              value={socialBattery}
              onChange={(e) => setSocialBattery(Number(e.target.value))}
              className="w-full h-2 bg-bg-warm rounded-full appearance-none cursor-pointer slider-thumb"
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>🤫 Introvert</span>
              <span className="text-primary font-semibold">{socialBattery}%</span>
              <span>🎉 Extrovert</span>
            </div>
          </div>
        </div>

        {/* Group Size */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-3">
            Group size comfort <span className="text-slate-500">(select all that apply)</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {GROUP_SIZE_OPTIONS.map(option => (
              <button
                key={option.value}
                onClick={() => toggleGroupSize(option.value as GroupSize)}
                className={`p-4 rounded-xl text-center transition ${
                  groupSize.includes(option.value as GroupSize)
                    ? 'bg-gradient-warm text-white shadow-glow'
                    : 'bg-bg-warm border border-primary/20 hover:bg-primary/10'
                }`}
              >
                <div className="text-2xl mb-1">{option.emoji}</div>
                <div className="text-xs font-semibold">{option.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Day Preferences */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-3">
            Typical day preference <span className="text-slate-500">(select all that apply)</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {DAY_PREFERENCE_OPTIONS.map(option => (
              <button
                key={option.value}
                onClick={() => toggleDayPreference(option.value as DayPreference)}
                className={`p-4 rounded-xl flex items-center gap-3 transition ${
                  dayPreferences.includes(option.value as DayPreference)
                    ? 'bg-gradient-warm text-white shadow-glow'
                    : 'bg-bg-warm border border-primary/20 hover:bg-primary/10'
                }`}
              >
                <div className="text-2xl">{option.emoji}</div>
                <div className="text-sm font-semibold text-left">{option.label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Continue Button */}
      <button
        onClick={handleContinue}
        disabled={!canProceed}
        className={`w-full mt-8 py-4 rounded-full font-semibold transition ${
          canProceed
            ? 'bg-gradient-warm text-white shadow-glow hover:scale-[1.02]'
            : 'bg-bg-warm text-slate-600 cursor-not-allowed'
        }`}
      >
        Continue →
      </button>
    </div>
  )
}
