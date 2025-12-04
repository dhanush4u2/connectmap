import { useState } from 'react'
import type { OnboardingSheet2, Ambiance, Activity, BudgetTier } from '../../types'
import { FOOD_STYLES, AMBIANCE_OPTIONS, ACTIVITY_OPTIONS, BUDGET_TIERS } from '../../lib/onboardingData'

interface Sheet2Props {
  onComplete: (data: OnboardingSheet2) => void
  onBack: () => void
  initialData: OnboardingSheet2 | null
}

export function Sheet2({ onComplete, onBack, initialData }: Sheet2Props) {
  const [topFoodStyles, setTopFoodStyles] = useState<string[]>(
    initialData?.topFoodStyles || []
  )
  const [favoriteAmbiances, setFavoriteAmbiances] = useState<Ambiance[]>(
    initialData?.favoriteAmbiances || []
  )
  const [activityPreferences, setActivityPreferences] = useState<Activity[]>(
    initialData?.activityPreferences || []
  )
  const [budgetTier, setBudgetTier] = useState<BudgetTier>(
    initialData?.budgetTier || 'mid'
  )
  const [searchTerm, setSearchTerm] = useState('')

  const filteredFoodStyles = FOOD_STYLES.filter(style =>
    style.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const toggleFoodStyle = (style: string) => {
    if (topFoodStyles.includes(style)) {
      setTopFoodStyles(prev => prev.filter(s => s !== style))
    } else if (topFoodStyles.length < 3) {
      setTopFoodStyles(prev => [...prev, style])
    }
  }

  const toggleAmbiance = (ambiance: Ambiance) => {
    setFavoriteAmbiances(prev =>
      prev.includes(ambiance) ? prev.filter(a => a !== ambiance) : [...prev, ambiance]
    )
  }

  const toggleActivity = (activity: Activity) => {
    setActivityPreferences(prev =>
      prev.includes(activity) ? prev.filter(a => a !== activity) : [...prev, activity]
    )
  }

  const canProceed = topFoodStyles.length === 3 && favoriteAmbiances.length > 0 && activityPreferences.length > 0

  const handleContinue = () => {
    if (canProceed) {
      onComplete({
        topFoodStyles,
        favoriteAmbiances,
        activityPreferences,
        budgetTier
      })
    }
  }

  return (
    <div className="card-premium p-8 animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gradient mb-2">Taste check — pick what hits</h2>
        <p className="text-sm text-slate-400">Select your top 3 food styles</p>
      </div>

      <div className="space-y-8">
        {/* Food Styles */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-3">
            Top 3 food styles <span className="text-primary">({topFoodStyles.length}/3)</span>
          </label>
          
          {/* Search Input */}
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search food styles..."
            className="w-full px-4 py-3 mb-3 rounded-xl bg-bg-warm border border-primary/20 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primary/40 transition"
          />

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto custom-scrollbar">
            {filteredFoodStyles.map(style => {
              const isSelected = topFoodStyles.includes(style)
              const isDisabled = !isSelected && topFoodStyles.length >= 3
              
              return (
                <button
                  key={style}
                  onClick={() => toggleFoodStyle(style)}
                  disabled={isDisabled}
                  className={`p-3 rounded-lg text-sm font-semibold transition ${
                    isSelected
                      ? 'bg-gradient-warm text-white shadow-glow'
                      : isDisabled
                      ? 'bg-bg-warm/50 text-slate-600 cursor-not-allowed'
                      : 'bg-bg-warm border border-primary/20 hover:bg-primary/10'
                  }`}
                >
                  {style}
                </button>
              )
            })}
          </div>
        </div>

        {/* Ambiance */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-3">
            Ambiance loves <span className="text-slate-500">(select all that apply)</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {AMBIANCE_OPTIONS.map(option => (
              <button
                key={option.value}
                onClick={() => toggleAmbiance(option.value as Ambiance)}
                className={`p-4 rounded-xl flex items-center gap-3 transition ${
                  favoriteAmbiances.includes(option.value as Ambiance)
                    ? 'bg-gradient-warm text-white shadow-glow'
                    : 'bg-bg-warm border border-primary/20 hover:bg-primary/10'
                }`}
              >
                <div className="text-xl">{option.emoji}</div>
                <div className="text-xs font-semibold text-left">{option.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Activity Preferences */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-3">
            Activity preferences <span className="text-slate-500">(select all that apply)</span>
          </label>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {ACTIVITY_OPTIONS.map(option => (
              <button
                key={option.value}
                onClick={() => toggleActivity(option.value as Activity)}
                className={`p-4 rounded-xl text-center transition ${
                  activityPreferences.includes(option.value as Activity)
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

        {/* Budget Tier */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-3">
            Budget dial
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {BUDGET_TIERS.map(tier => (
              <button
                key={tier.value}
                onClick={() => setBudgetTier(tier.value as BudgetTier)}
                className={`p-4 rounded-xl text-left transition ${
                  budgetTier === tier.value
                    ? 'bg-gradient-warm text-white shadow-glow'
                    : 'bg-bg-warm border border-primary/20 hover:bg-primary/10'
                }`}
              >
                <div className="text-lg font-bold mb-1">{tier.label}</div>
                <div className="text-xs opacity-80">{tier.description}</div>
              </button>
            ))}
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
