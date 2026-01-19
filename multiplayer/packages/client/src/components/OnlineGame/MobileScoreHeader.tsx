/**
 * Mobile Score Header Component
 *
 * Compact score display for mobile layout.
 * Shows both players' scores with turn indicator.
 *
 * Layout:
 * [You: 14] vs [Opponent: 8]
 *
 * The current player's score is highlighted.
 */

import { useTranslation } from 'react-i18next'

interface MobileScoreHeaderProps {
  yourScore: number
  yourName: string
  opponentScore: number
  opponentName: string
  isYourTurn: boolean
}

export function MobileScoreHeader({
  yourScore,
  yourName,
  opponentScore,
  opponentName,
  isYourTurn,
}: MobileScoreHeaderProps) {
  const { t } = useTranslation(['online', 'common'])

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 shadow-md">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {/* Your score - highlighted if your turn */}
        <div
          className={`flex flex-col items-center px-4 py-2 rounded-lg transition-all ${
            isYourTurn
              ? 'bg-white/20 ring-2 ring-white/50 scale-105'
              : 'bg-white/10'
          }`}
        >
          <span className="text-white/80 text-xs font-medium truncate max-w-[80px]">
            {yourName}
          </span>
          <span className="text-white text-2xl font-bold">{yourScore}</span>
          {isYourTurn && (
            <span className="text-yellow-300 text-xs font-semibold">
              {t('common:labels.yourTurn')}
            </span>
          )}
        </div>

        {/* VS indicator */}
        <div className="text-white/60 text-sm font-semibold">vs</div>

        {/* Opponent score - highlighted if their turn */}
        <div
          className={`flex flex-col items-center px-4 py-2 rounded-lg transition-all ${
            !isYourTurn
              ? 'bg-white/20 ring-2 ring-white/50 scale-105'
              : 'bg-white/10'
          }`}
        >
          <span className="text-white/80 text-xs font-medium truncate max-w-[80px]">
            {opponentName}
          </span>
          <span className="text-white text-2xl font-bold">{opponentScore}</span>
          {!isYourTurn && (
            <span className="text-yellow-300 text-xs font-semibold">
              {t('online:game.theirTurn')}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
