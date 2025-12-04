import { useState } from 'react'

interface SharePanelProps {
  isOpen: boolean
  onClose: () => void
  placeId: string
  placeName: string
}

export function SharePanel({ isOpen, onClose, placeId, placeName }: SharePanelProps) {
  const [copied, setCopied] = useState(false)
  
  const shareUrl = `${window.location.origin}/place/${placeId}`
  const shareText = `Check out ${placeName} on ConnectMap! Join me there! 🎉`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleShare = (platform: string) => {
    let url = ''
    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
        break
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
        break
      case 'whatsapp':
        url = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`
        break
      case 'telegram':
        url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`
        break
    }
    if (url) window.open(url, '_blank', 'width=600,height=400')
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: placeName,
          text: shareText,
          url: shareUrl,
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-bg-elevated border border-primary/20 rounded-3xl shadow-2xl max-w-md w-full p-6 animate-scale-in" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gradient">Share</h2>
            <p className="text-sm text-slate-400 mt-1">Invite friends to {placeName}</p>
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

        {/* Social Media Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={() => handleShare('whatsapp')}
            className="flex items-center gap-3 p-4 rounded-xl border-2 border-slate-700 bg-bg/30 hover:border-green-500 hover:bg-green-500/10 transition-all group"
          >
            <div className="text-2xl">💬</div>
            <div className="text-left flex-1">
              <div className="font-semibold text-slate-300 group-hover:text-green-500">WhatsApp</div>
            </div>
          </button>

          <button
            onClick={() => handleShare('telegram')}
            className="flex items-center gap-3 p-4 rounded-xl border-2 border-slate-700 bg-bg/30 hover:border-blue-500 hover:bg-blue-500/10 transition-all group"
          >
            <div className="text-2xl">✈️</div>
            <div className="text-left flex-1">
              <div className="font-semibold text-slate-300 group-hover:text-blue-500">Telegram</div>
            </div>
          </button>

          <button
            onClick={() => handleShare('twitter')}
            className="flex items-center gap-3 p-4 rounded-xl border-2 border-slate-700 bg-bg/30 hover:border-sky-500 hover:bg-sky-500/10 transition-all group"
          >
            <div className="text-2xl">🐦</div>
            <div className="text-left flex-1">
              <div className="font-semibold text-slate-300 group-hover:text-sky-500">Twitter</div>
            </div>
          </button>

          <button
            onClick={() => handleShare('facebook')}
            className="flex items-center gap-3 p-4 rounded-xl border-2 border-slate-700 bg-bg/30 hover:border-blue-600 hover:bg-blue-600/10 transition-all group"
          >
            <div className="text-2xl">📘</div>
            <div className="text-left flex-1">
              <div className="font-semibold text-slate-300 group-hover:text-blue-600">Facebook</div>
            </div>
          </button>
        </div>

        {/* Native Share (Mobile) */}
        {typeof navigator.share !== 'undefined' && (
          <button
            onClick={handleNativeShare}
            className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-primary/30 bg-primary/10 hover:bg-primary/20 transition-all mb-4 text-primary font-semibold"
          >
            <span>📤</span>
            <span>More options</span>
          </button>
        )}

        {/* Copy Link */}
        <div className="bg-bg/50 border border-primary/20 rounded-xl p-4">
          <p className="text-xs text-slate-400 mb-2">Share Link</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 bg-bg-elevated border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none"
            />
            <button
              onClick={handleCopyLink}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                copied
                  ? 'bg-green-600 text-white'
                  : 'bg-gradient-warm text-white hover:shadow-glow'
              }`}
            >
              {copied ? '✓ Copied!' : '📋 Copy'}
            </button>
          </div>
        </div>

        {/* Info */}
        <p className="text-xs text-slate-500 mt-4 text-center">
          Friends can save, RSVP, and join you at this place! 🎉
        </p>
      </div>
    </div>
  )
}
