import { useMemo } from 'react'

interface AttendeeInfo {
  userId: string
  userName: string
  userAvatar: string
}

interface PlaceMarkerProps {
  attendees?: AttendeeInfo[]
  totalGoing?: number
  category?: string
}

// Category emoji mapping
const getCategoryEmoji = (category?: string): string => {
  const emojiMap: Record<string, string> = {
    food_cafe: '☕',
    food_restaurant: '🍽️',
    activity: '🎮',
    movie: '🎬',
    nightlife: '🌃',
    shopping: '🛍️',
    parks: '🌳',
  }
  return emojiMap[category || ''] || '📍'
}

export function PlaceMarker({ attendees = [], totalGoing = 0, category }: PlaceMarkerProps) {
  // Calculate marker size based on attendance (min: 40px, max: 80px)
  const size = useMemo(() => {
    if (totalGoing === 0) return 40
    if (totalGoing <= 5) return 48
    if (totalGoing <= 10) return 56
    if (totalGoing <= 20) return 64
    return 72
  }, [totalGoing])

  const displayAttendees = attendees.slice(0, 3)
  const hasAttendees = displayAttendees.length > 0

  return (
    <div
      className="place-marker"
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
    >
      {/* Pulsing ring for active events */}
      {totalGoing > 0 && (
        <div
          className="marker-pulse-ring"
          style={{
            width: `${size + 16}px`,
            height: `${size + 16}px`,
          }}
        />
      )}

      {/* Main marker circle */}
      <div className="marker-circle">
        {hasAttendees ? (
          /* Show attendee avatars */
          <div className="marker-avatars">
            {displayAttendees.length === 1 && (
              <div className="marker-avatar-single">
                {displayAttendees[0].userAvatar}
              </div>
            )}
            {displayAttendees.length === 2 && (
              <div className="marker-avatar-duo">
                <span className="marker-avatar-duo-item">{displayAttendees[0].userAvatar}</span>
                <span className="marker-avatar-duo-item">{displayAttendees[1].userAvatar}</span>
              </div>
            )}
            {displayAttendees.length >= 3 && (
              <div className="marker-avatar-trio">
                <span className="marker-avatar-trio-item marker-avatar-top">
                  {displayAttendees[0].userAvatar}
                </span>
                <div className="marker-avatar-trio-bottom">
                  <span className="marker-avatar-trio-item">{displayAttendees[1].userAvatar}</span>
                  <span className="marker-avatar-trio-item">{displayAttendees[2].userAvatar}</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Show default category icon */
          <div className="marker-default-icon">
            {getCategoryEmoji(category)}
          </div>
        )}

        {/* Count badge for 2+ attendees */}
        {totalGoing > 1 && (
          <div className="marker-count-badge">
            {totalGoing > 99 ? '99+' : totalGoing}
          </div>
        )}
      </div>
    </div>
  )
}
