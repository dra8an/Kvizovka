/**
 * OnlineGameControls Component
 *
 * Props-based version of GameControls for online multiplayer.
 * Provides buttons for game actions in online mode.
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PlacedTile, MoveValidationResult } from '@kvizovka/shared'

interface OnlineGameControlsProps {
  isYourTurn: boolean
  selectedTiles: PlacedTile[]
  placementValidation: MoveValidationResult | null
  gameError: string | null
  onPlayWord: () => void
  onSkipTurn: () => void
  onRecallTiles: () => void
  onBackToMenu: () => void
  onEndGameTest?: () => void  // For testing game completion
}

export function OnlineGameControls({
  isYourTurn,
  selectedTiles,
  placementValidation,
  gameError,
  onPlayWord,
  onSkipTurn,
  onRecallTiles,
  onBackToMenu,
  onEndGameTest,
}: OnlineGameControlsProps) {
  const { t } = useTranslation(['online', 'common', 'dialogs'])

  // Local state for custom confirmation dialog
  const [confirmDialog, setConfirmDialog] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null)

  // Calculate word length for display
  const getWordLengthDisplay = () => {
    if (selectedTiles.length === 0) return null

    // Get word length from validation result
    let wordLength = 0
    if (placementValidation?.wordsFormed && placementValidation.wordsFormed.length > 0) {
      // Get main word (first word in wordsFormed)
      const mainWord = placementValidation.wordsFormed[0]
      wordLength = mainWord.length
    } else {
      // Fallback to selected tiles count if validation not available
      wordLength = selectedTiles.length
    }

    const MIN_LENGTH = 4
    const isValid = wordLength >= MIN_LENGTH

    return {
      wordLength,
      isValid,
      display: isValid
        ? `${wordLength} ${t('common:plurals.letter', { count: wordLength })} ✓`
        : `${wordLength}/${MIN_LENGTH} ${t('common:plurals.letter', { count: MIN_LENGTH })}`
    }
  }

  const wordLengthInfo = getWordLengthDisplay()
  /**
   * Handle Play Word button click
   */
  const handlePlayWord = () => {
    if (selectedTiles.length === 0) {
      return
    }
    onPlayWord()
  }

  /**
   * Handle Skip Turn button click
   * Always shows confirmation dialog.
   */
  const handleSkipTurn = () => {
    const message = selectedTiles.length > 0
      ? t('dialogs:confirmations.skipTurn.message')
      : t('dialogs:confirmations.skipTurn.messageNoTiles')

    setConfirmDialog({
      title: t('dialogs:confirmations.skipTurn.title'),
      message,
      onConfirm: () => {
        onSkipTurn()
        setConfirmDialog(null)
      }
    })
  }

  /**
   * Handle Recall Tiles button click
   */
  const handleRecallTiles = () => {
    onRecallTiles()
  }

  /**
   * Handle Back to Menu
   */
  const handleBackToMenu = () => {
    setConfirmDialog({
      title: t('online:controls.leaveGameConfirm.title'),
      message: t('online:controls.leaveGameConfirm.message'),
      onConfirm: () => {
        onBackToMenu()
        setConfirmDialog(null)
      }
    })
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Main action: Play Word */}
      <button
        onClick={handlePlayWord}
        disabled={selectedTiles.length === 0 || !isYourTurn}
        className={`
          btn text-lg py-4 font-bold
          ${
            selectedTiles.length > 0 && isYourTurn
              ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }
        `}
      >
        <div className="flex flex-col items-center gap-1">
          <span>
            {selectedTiles.length > 0
              ? t('online:controls.playWordWithCount', { count: selectedTiles.length })
              : t('online:controls.playWord')}
          </span>
          {wordLengthInfo && (
            <span className={`text-sm font-semibold ${
              wordLengthInfo.isValid ? 'text-green-200' : 'text-yellow-200'
            }`}>
              {wordLengthInfo.display}
            </span>
          )}
        </div>
      </button>

      {/* Secondary actions */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleRecallTiles}
          disabled={selectedTiles.length === 0 || !isYourTurn}
          className="btn btn-secondary"
        >
          {t('online:controls.recallTiles')}
        </button>

        <button
          onClick={handleSkipTurn}
          disabled={!isYourTurn}
          className="btn btn-secondary"
        >
          {t('online:controls.skipTurn')}
        </button>
      </div>

      {/* Exchange tiles - Coming soon */}
      <button
        disabled
        className="btn bg-gray-300 text-gray-500 cursor-not-allowed"
        title={t('online:controls.exchangeComingSoon')}
      >
        {t('online:controls.exchangeTiles')}
      </button>

      {/* Game management */}
      <div className="grid grid-cols-1 gap-2 mt-2 pt-3 border-t border-gray-300">
        {/* Test button - only show if handler provided */}
        {onEndGameTest && (
          <button
            onClick={onEndGameTest}
            className="btn bg-orange-500 hover:bg-orange-600 text-white text-sm"
            title={t('online:controls.endGameTestTitle')}
          >
            🧪 {t('online:controls.endGameTest')}
          </button>
        )}

        <button
          onClick={handleBackToMenu}
          className="btn bg-red-500 hover:bg-red-600 text-white text-sm"
        >
          {t('online:controls.leaveGame')}
        </button>
      </div>

      {/* Error display */}
      {gameError && (
        <div className="mt-2 p-3 bg-red-50 border-2 border-red-300 rounded-lg">
          <p className="text-sm text-red-800 font-medium">
            ❌ {gameError}
          </p>
        </div>
      )}

      {/* Custom confirmation dialog (Yes/No) */}
      {confirmDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setConfirmDialog(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl p-5 max-w-sm mx-4 border-2 border-yellow-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="text-2xl text-yellow-500">
                ❓
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-yellow-700">
                  {confirmDialog.title}
                </h3>
                <p className="text-gray-600 whitespace-pre-line text-sm mt-1">
                  {confirmDialog.message}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setConfirmDialog(null)}
                className="btn py-2 font-medium text-gray-700 text-sm rounded-lg bg-gray-200 hover:bg-gray-300"
              >
                {t('common:buttons.cancel')}
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                className="btn py-2 font-medium text-white text-sm rounded-lg bg-yellow-500 hover:bg-yellow-600"
              >
                {t('common:buttons.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help text */}
      <div className="mt-2 text-xs text-gray-600 text-center">
        <p>{t('online:controls.helpText')}</p>
      </div>
    </div>
  )
}
