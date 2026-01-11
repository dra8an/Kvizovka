import React, { useEffect, useState } from 'react'

interface BonusFlashProps {
  bonus: number
  onComplete?: () => void
}

/**
 * BonusFlash Component
 *
 * Displays a flashing overlay message when a long word bonus is awarded.
 * Shows "+20", "+30", "+40", or "+50" depending on the bonus.
 * Fades in, holds briefly, then fades out.
 */
export const BonusFlash: React.FC<BonusFlashProps> = ({ bonus, onComplete }) => {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    // Fade out after 1.5 seconds
    const timer = setTimeout(() => {
      setVisible(false)
      // Call onComplete after fade out animation (0.5s)
      setTimeout(() => {
        onComplete?.()
      }, 500)
    }, 1500)

    return () => clearTimeout(timer)
  }, [onComplete])

  if (bonus === 0) {
    return null
  }

  return (
    <div
      className={`
        fixed inset-0 flex items-center justify-center
        pointer-events-none z-50
        transition-opacity duration-500
        ${visible ? 'opacity-100' : 'opacity-0'}
      `}
    >
      <div
        className="
          text-8xl font-bold
          text-green-500
          drop-shadow-[0_0_20px_rgba(34,197,94,0.8)]
          animate-pulse
        "
        style={{
          textShadow: '0 0 30px rgba(34, 197, 94, 0.8), 0 0 60px rgba(34, 197, 94, 0.5)',
        }}
      >
        +{bonus}
      </div>
    </div>
  )
}
