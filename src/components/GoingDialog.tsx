import { useState } from 'react'

interface GoingDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (data: {
    date?: string
    time?: string
    visibility: 'friends' | 'public'
  }) => void
  placeName: string
}

export function GoingDialog({ isOpen, onClose, onConfirm, placeName }: GoingDialogProps) {
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [visibility, setVisibility] = useState<'friends' | 'public'>('public')

  if (!isOpen) return null

  const handleSubmit = () => {
    onConfirm({
      date: selectedDate || undefined,
      time: selectedTime || undefined,
      visibility,
    })
    onClose()
  }

  // Generate time options
  const timeOptions = []
  for (let hour = 0; hour < 24; hour++) {
    for (let min of [0, 30]) {
      const h = hour % 12 || 12
      const ampm = hour < 12 ? 'AM' : 'PM'
      const time = `${h}:${min.toString().padStart(2, '0')} ${ampm}`
      timeOptions.push(time)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-bg-elevated border border-primary/20 rounded-3xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gradient">I'm Going!</h2>
            <p className="text-sm text-slate-400 mt-1">to {placeName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Date Picker */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            📅 When are you going?
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full bg-bg/50 border border-primary/20 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        {/* Time Picker */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            🕐 What time?
          </label>
          <select
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="w-full bg-bg/50 border border-primary/20 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          >
            <option value="">Select a time (optional)</option>
            {timeOptions.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>

        {/* Visibility Options */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-3">
            👥 Who can see this?
          </label>
          <div className="space-y-2">
            <button
              onClick={() => setVisibility('public')}
              className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                visibility === 'public'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-slate-700 bg-bg/30 text-slate-400 hover:border-slate-600'
              }`}
            >
              <div className="text-2xl">🌍</div>
              <div className="text-left flex-1">
                <div className="font-semibold">Public</div>
                <div className="text-xs opacity-75">Anyone can see and join you</div>
              </div>
              {visibility === 'public' && (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>

            <button
              onClick={() => setVisibility('friends')}
              className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                visibility === 'friends'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-slate-700 bg-bg/30 text-slate-400 hover:border-slate-600'
              }`}
            >
              <div className="text-2xl">👥</div>
              <div className="text-left flex-1">
                <div className="font-semibold">Friends Only</div>
                <div className="text-xs opacity-75">Only your friends can see this</div>
              </div>
              {visibility === 'friends' && (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-6 rounded-full border-2 border-slate-700 text-slate-300 font-semibold hover:bg-slate-800 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-3 px-6 rounded-full bg-gradient-warm text-white font-semibold shadow-glow hover:shadow-glow-lg hover:scale-105 transition-all"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}
