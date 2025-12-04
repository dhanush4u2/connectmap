import { useState } from 'react'
import type { OnboardingSheet3, TravelMode, WeekendType, PhotoPreference } from '../../types'
import { TRAVEL_MODE_OPTIONS, WEEKEND_TYPE_OPTIONS } from '../../lib/onboardingData'

interface Sheet3Props {
  onComplete: (data: OnboardingSheet3) => void
  onBack: () => void
  initialData: OnboardingSheet3 | null
}

export function Sheet3({ onComplete, onBack, initialData }: Sheet3Props) {
  const [travelMode, setTravelMode] = useState<TravelMode[]>(
    initialData?.travelMode || []
  )
  const [weekendType, setWeekendType] = useState<WeekendType>(
    initialData?.weekendType || 'mix'
  )
  const [newPlaceFrequency, setNewPlaceFrequency] = useState(
    initialData?.newPlaceFrequency || 50
  )
  const [photoPreference, setPhotoPreference] = useState<PhotoPreference>(
    initialData?.photoPreference || 'keep_private'
  )

  const toggleTravelMode = (mode: TravelMode) => {
    setTravelMode(prev =>
      prev.includes(mode) ? prev.filter(m => m !== mode) : [...prev, mode]
    )
  }

  const canProceed = travelMode.length > 0

  const handleContinue = () => {
    if (canProceed) {
      onComplete({
        travelMode,
        weekendType,
        newPlaceFrequency,
        photoPreference
      })
    }
  }

  const getFrequencyLabel = (value: number) => {
    if (value < 25) return 'Rarely'
    if (value < 50) return 'Monthly'
    if (value < 75) return 'Bi-weekly'
    return 'Weekly'
  }

  return (
    <div className="card-premium p-8 animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gradient mb-2">How you move in the city</h2>
        <p className="text-sm text-slate-400">Your exploration habits</p>
      </div>

      <div className="space-y-8">
        {/* Travel Mode */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-3">
            Travel mode preference <span className="text-slate-500">(select all that apply)</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {TRAVEL_MODE_OPTIONS.map(option => (
              <button
                key={option.value}
                onClick={() => toggleTravelMode(option.value as TravelMode)}
                className={`p-4 rounded-xl flex flex-col items-center gap-2 transition ${
                  travelMode.includes(option.value as TravelMode)
                    ? 'bg-gradient-warm text-white shadow-glow'
                    : 'bg-bg-warm border border-primary/20 hover:bg-primary/10'
                }`}
              >
                <div className="text-2xl">{option.emoji}</div>
                <div className="text-xs font-semibold text-center">{option.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Weekend Type */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-3">
            Weekend type
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {WEEKEND_TYPE_OPTIONS.map(option => (
              <button
                key={option.value}
                onClick={() => setWeekendType(option.value as WeekendType)}
                className={`p-4 rounded-xl flex items-center gap-3 transition ${
                  weekendType === option.value
                    ? 'bg-gradient-warm text-white shadow-glow'
                    : 'bg-bg-warm border border-primary/20 hover:bg-primary/10'
                }`}
              >
                <div className="text-2xl">{option.emoji}</div>
                <div className="text-sm font-semibold">{option.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* New Place Frequency */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-3">
            Frequency of trying new places
          </label>
          <div className="space-y-3">
            <input
              type="range"
              min="0"
              max="100"
              value={newPlaceFrequency}
              onChange={(e) => setNewPlaceFrequency(Number(e.target.value))}
              className="w-full h-2 bg-bg-warm rounded-full appearance-none cursor-pointer slider-thumb"
            />
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Rarely</span>
              <span className="text-primary font-semibold">{getFrequencyLabel(newPlaceFrequency)}</span>
              <span className="text-slate-400">Weekly</span>
            </div>
          </div>
        </div>

        {/* Photo Preference */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-3">
            Photo preference
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              onClick={() => setPhotoPreference('post_photos')}
              className={`p-5 rounded-xl text-left transition ${
                photoPreference === 'post_photos'
                  ? 'bg-gradient-warm text-white shadow-glow'
                  : 'bg-bg-warm border border-primary/20 hover:bg-primary/10'
              }`}
            >
              <div className="text-2xl mb-2">📸</div>
              <div className="font-semibold mb-1">I post photos</div>
              <div className="text-xs opacity-80">Share my experiences with others</div>
            </button>
            <button
              onClick={() => setPhotoPreference('keep_private')}
              className={`p-5 rounded-xl text-left transition ${
                photoPreference === 'keep_private'
                  ? 'bg-gradient-warm text-white shadow-glow'
                  : 'bg-bg-warm border border-primary/20 hover:bg-primary/10'
              }`}
            >
              <div className="text-2xl mb-2">🔒</div>
              <div className="font-semibold mb-1">I keep it private</div>
              <div className="text-xs opacity-80">Personal memories, no sharing</div>
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
          onClick={handleContinue}
          disabled={!canProceed}
          className={`flex-1 py-4 rounded-full font-semibold transition ${
            canProceed
              ? 'bg-gradient-warm text-white shadow-glow hover:scale-[1.02]'
              : 'bg-bg-warm text-slate-600 cursor-not-allowed'
          }`}
        >
          Continue →
        </button>
      </div>
    </div>
  )
}
