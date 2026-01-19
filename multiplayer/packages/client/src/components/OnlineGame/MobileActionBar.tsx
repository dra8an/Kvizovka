/**
 * Mobile Action Bar Component
 *
 * Bottom action bar for mobile game layout.
 * Shows main game actions: Recall, Play, Skip
 *
 * Layout:
 * [Recall] [Play] [Skip]
 *
 * Features:
 * - Play button disabled when no tiles placed or invalid placement
 * - Recall returns all placed tiles to rack
 * - Skip ends turn without playing
 * - Safe area padding for devices with home indicator
 */

import { useTranslation } from 'react-i18next'
import { MoveValidationResult } from '@kvizovka/shared'

interface MobileActionBarProps {
  isYourTurn: boolean
  canPlay: boolean
  hasPlacedTiles: boolean
  placementValidation: MoveValidationResult | null
  onRecall: () => void
  onPlay: () => void
  onSkip: () => void
}

export function MobileActionBar({
  isYourTurn,
  canPlay,
  hasPlacedTiles,
  placementValidation,
  onRecall,
  onPlay,
  onSkip,
}: MobileActionBarProps) {
  const { t } = useTranslation(['game', 'common'])

  // Determine if play button should be enabled
  const playEnabled = isYourTurn && canPlay && placementValidation?.isValid

  return (
    <div className="bg-white border-t border-gray-200 px-4 py-3 pb-safe">
      <div className="flex justify-center gap-3 max-w-md mx-auto">
        {/* Recall button */}
        <button
          onClick={onRecall}
          disabled={!isYourTurn || !hasPlacedTiles}
          className={`
            flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm
            transition-all min-h-[48px]
            ${
              isYourTurn && hasPlacedTiles
                ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 active:bg-gray-300'
                : 'bg-gray-50 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          <span className="text-lg">↩</span>
          <span>{t('game:controls.recall')}</span>
        </button>

        {/* Play button */}
        <button
          onClick={onPlay}
          disabled={!playEnabled}
          className={`
            flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm
            transition-all min-h-[48px]
            ${
              playEnabled
                ? 'bg-green-600 hover:bg-green-700 text-white active:bg-green-800 shadow-md'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          <span className="text-lg">✓</span>
          <span>{t('game:controls.play')}</span>
        </button>

        {/* Skip button */}
        <button
          onClick={onSkip}
          disabled={!isYourTurn}
          className={`
            flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm
            transition-all min-h-[48px]
            ${
              isYourTurn
                ? 'bg-orange-100 hover:bg-orange-200 text-orange-700 active:bg-orange-300'
                : 'bg-gray-50 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          <span className="text-lg">⏭</span>
          <span>{t('game:controls.skip')}</span>
        </button>
      </div>

      {/* Validation feedback */}
      {hasPlacedTiles && placementValidation && !placementValidation.isValid && (
        <div className="mt-2 text-center">
          <p className="text-xs text-red-600">{placementValidation.reason}</p>
        </div>
      )}
    </div>
  )
}
