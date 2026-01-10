/**
 * GameControls Component
 *
 * Provides buttons for game actions.
 *
 * Features:
 * - Play Word button (submit current move)
 * - Skip Turn button
 * - Exchange Tiles button (TODO: implement tile selection)
 * - Recall Tiles button (undo placement before submitting)
 * - Pause/Resume button
 * - End Game button
 *
 * Buttons are enabled/disabled based on game state.
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useGameStore } from '../../store/gameStore'
import { GameStatus, MoveType } from '../../types'

/**
 * GameControls Component
 *
 * Example usage:
 * ```tsx
 * <GameControls />
 * ```
 */
export function GameControls() {
  const { t } = useTranslation(['common', 'dialogs', 'game'])

  // Local state for custom modal dialog
  const [modalMessage, setModalMessage] = useState<{ title: string; message: string; type: 'error' | 'info' } | null>(null)
  // Local state for confirmation dialog (with callback)
  const [confirmDialog, setConfirmDialog] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null)

  // Subscribe to game store
  const game = useGameStore((state) => state.game)
  const selectedTiles = useGameStore((state) => state.selectedTiles)
  const lastValidation = useGameStore((state) => state.lastValidation)
  const lastPlayedWord = useGameStore((state) => state.lastPlayedWord)
  const isExchangeMode = useGameStore((state) => state.isExchangeMode)
  const tilesForExchange = useGameStore((state) => state.tilesForExchange)
  const tileBagInstance = useGameStore((state) => state.tileBagInstance)

  // Game actions
  const makeMove = useGameStore((state) => state.makeMove)
  const skipTurn = useGameStore((state) => state.skipTurn)
  const clearSelection = useGameStore((state) => state.clearSelection)
  const challengeLastWord = useGameStore((state) => state.challengeLastWord)
  const pauseGame = useGameStore((state) => state.pauseGame)
  const resumeGame = useGameStore((state) => state.resumeGame)
  const endGame = useGameStore((state) => state.endGame)
  const enterExchangeMode = useGameStore((state) => state.enterExchangeMode)
  const exitExchangeMode = useGameStore((state) => state.exitExchangeMode)
  const exchangeTiles = useGameStore((state) => state.exchangeTiles)

  // If no game, don't show controls
  if (!game) {
    return null
  }

  /**
   * Handle Play Word button click
   *
   * Attempts to submit the currently placed tiles as a move.
   */
  const handlePlayWord = () => {
    if (selectedTiles.length === 0) {
      setModalMessage({
        title: t('dialogs:errors.noTilesPlaced.title'),
        message: t('dialogs:errors.noTilesPlaced.message'),
        type: 'error'
      })
      return
    }

    const success = makeMove(selectedTiles)

    if (!success) {
      // Get the fresh validation reason from the store (after makeMove updated it)
      const freshValidation = useGameStore.getState().lastValidation
      const reason = freshValidation?.reason || t('validation:errors.invalidMove')
      setModalMessage({
        title: t('dialogs:errors.cannotPlayWord.title'),
        message: reason,
        type: 'error'
      })
      // Note: lastValidation error will also show below buttons after modal is closed
    } else {
      console.log('Move accepted!')
    }
  }

  /**
   * Handle Skip Turn button click
   *
   * Skips the current player's turn (no penalty).
   */
  const handleSkipTurn = () => {
    if (selectedTiles.length > 0) {
      setConfirmDialog({
        title: t('dialogs:confirmations.skipTurn.title'),
        message: t('dialogs:confirmations.skipTurn.message'),
        onConfirm: () => {
          skipTurn()
          clearSelection()
          setConfirmDialog(null)
        }
      })
    } else {
      skipTurn()
      clearSelection()
    }
  }

  /**
   * Handle Recall Tiles button click
   *
   * Returns all placed tiles to the rack without submitting.
   */
  const handleRecallTiles = () => {
    clearSelection()
  }

  /**
   * Handle Exchange Tiles button click
   *
   * Enters exchange mode so player can select tiles to exchange.
   */
  const handleExchangeTiles = () => {
    // Check if tile bag is empty
    if (tileBagInstance && tileBagInstance.isEmpty()) {
      setModalMessage({
        title: t('dialogs:errors.cannotExchange.title'),
        message: t('dialogs:errors.cannotExchange.emptyBag'),
        type: 'error'
      })
      return
    }

    // Try to enter exchange mode
    const canExchange = enterExchangeMode()

    if (!canExchange) {
      setModalMessage({
        title: t('dialogs:errors.cannotExchange.title'),
        message: t('dialogs:errors.cannotExchange.consecutiveExchange'),
        type: 'error'
      })
      return
    }
  }

  /**
   * Handle Confirm Exchange button click
   *
   * Exchanges the selected tiles with new ones from the bag.
   */
  const handleConfirmExchange = () => {
    if (tilesForExchange.length === 0) {
      setModalMessage({
        title: t('dialogs:errors.noTilesSelected.title'),
        message: t('dialogs:errors.noTilesSelected.message'),
        type: 'error'
      })
      return
    }

    setConfirmDialog({
      title: t('dialogs:confirmations.exchangeTiles.title'),
      message: t('dialogs:confirmations.exchangeTiles.message', { count: tilesForExchange.length }),
      onConfirm: () => {
        const success = exchangeTiles(tilesForExchange)
        if (success) {
          console.log('Tiles exchanged successfully!')
        } else {
          setModalMessage({
            title: t('dialogs:errors.exchangeFailed.title'),
            message: t('dialogs:errors.exchangeFailed.message'),
            type: 'error'
          })
        }
        setConfirmDialog(null)
      }
    })
  }

  /**
   * Handle Cancel Exchange button click
   *
   * Exits exchange mode without exchanging any tiles.
   */
  const handleCancelExchange = () => {
    exitExchangeMode()
  }

  /**
   * Handle Pause/Resume button click
   */
  const handlePauseResume = () => {
    if (game.status === GameStatus.PAUSED) {
      resumeGame()
    } else {
      pauseGame()
    }
  }

  /**
   * Handle End Game button click
   */
  const handleEndGame = () => {
    setConfirmDialog({
      title: t('dialogs:confirmations.endGame.title'),
      message: t('dialogs:confirmations.endGame.message'),
      onConfirm: () => {
        endGame()
        setConfirmDialog(null)
      }
    })
  }

  /**
   * Handle Challenge Word button click
   *
   * In Kvizovka, words are not automatically validated.
   * Players can challenge the opponent's last word.
   * - If challenge succeeds (word invalid): Move is undone
   * - If challenge fails (word valid): Challenger loses 3 minutes
   */
  const handleChallenge = () => {
    if (!lastPlayedWord) return

    setConfirmDialog({
      title: t('dialogs:confirmations.challenge.title', { word: lastPlayedWord.word }),
      message: t('dialogs:confirmations.challenge.message'),
      onConfirm: () => {
        const result = challengeLastWord()
        if (result) {
          if (result.success) {
            setModalMessage({
              title: t('dialogs:results.challengeSuccess.title'),
              message: t('dialogs:results.challengeSuccess.message', { word: result.word, reason: result.reason }),
              type: 'info'
            })
          } else {
            setModalMessage({
              title: t('dialogs:results.challengeFailed.title'),
              message: t('dialogs:results.challengeFailed.message', { word: result.word }),
              type: 'error'
            })
          }
        }
        setConfirmDialog(null)
      }
    })
  }

  // Check if game is in progress
  const isInProgress = game.status === GameStatus.IN_PROGRESS
  const isPaused = game.status === GameStatus.PAUSED

  // Check if current player can challenge (opponent just played a word)
  const canChallenge = lastPlayedWord && isInProgress

  // Check if current player's last move was an exchange
  const canExchangeTiles = (() => {
    if (!game || !isInProgress) return false

    const currentPlayerId = game.players[game.currentPlayerIndex].id
    const playerMoves = game.moveHistory.filter(move => move.playerId === currentPlayerId)
    const lastPlayerMove = playerMoves[playerMoves.length - 1]

    // Can't exchange if last move was also an exchange
    return !(lastPlayerMove && lastPlayerMove.type === MoveType.EXCHANGE)
  })()

  return (
    <div className="flex flex-col gap-3">
      {/* Exchange Mode UI */}
      {isExchangeMode ? (
        <>
          {/* Confirm Exchange Button */}
          <button
            onClick={handleConfirmExchange}
            disabled={tilesForExchange.length === 0}
            className={`
              btn text-lg py-4 font-bold
              ${
                tilesForExchange.length > 0
                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {t('common:buttons.confirmExchange')} {tilesForExchange.length > 0 && `(${tilesForExchange.length} ${t('common:plurals.tile', { count: tilesForExchange.length })})`}
          </button>

          {/* Cancel Exchange Button */}
          <button
            onClick={handleCancelExchange}
            className="btn bg-red-500 hover:bg-red-600 text-white text-lg py-4 font-bold"
          >
            {t('common:buttons.cancelExchange')}
          </button>

          {/* Info Message */}
          <div className="p-3 bg-purple-50 border-2 border-purple-300 rounded-lg">
            <p className="text-sm text-purple-800 font-medium">
              {t('game:rackInfo.clickToSelect')}
            </p>
          </div>
        </>
      ) : (
        <>
          {/* Main action: Play Word */}
          <button
            onClick={handlePlayWord}
            disabled={selectedTiles.length === 0 || !isInProgress}
            className={`
              btn text-lg py-4 font-bold
              ${
                selectedTiles.length > 0 && isInProgress
                  ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {t('common:buttons.playWord')} {selectedTiles.length > 0 && `(${selectedTiles.length} ${t('common:plurals.tile', { count: selectedTiles.length })})`}
          </button>

          {/* Challenge button (only shown when opponent just played a word) */}
          {canChallenge && (
            <button
              onClick={handleChallenge}
              className="btn text-lg py-4 font-bold bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg animate-pulse"
            >
              ⚠️ {t('common:buttons.challenge')}: "{lastPlayedWord.word}"
            </button>
          )}

          {/* Secondary actions */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleRecallTiles}
              disabled={selectedTiles.length === 0 || !isInProgress}
              className="btn btn-secondary"
            >
              {t('common:buttons.recallTiles')}
            </button>

            <button
              onClick={handleSkipTurn}
              disabled={!isInProgress}
              className="btn btn-secondary"
            >
              {t('common:buttons.skipTurn')}
            </button>
          </div>

          {/* Exchange tiles */}
          <button
            onClick={handleExchangeTiles}
            disabled={!canExchangeTiles}
            className="btn bg-purple-500 hover:bg-purple-600 text-white disabled:bg-gray-300 disabled:text-gray-500"
          >
            {t('common:buttons.exchange')}
          </button>
        </>
      )}

      {/* Game management */}
      <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-gray-300">
        <button
          onClick={handlePauseResume}
          disabled={game.status === GameStatus.COMPLETED}
          className="btn bg-yellow-500 hover:bg-yellow-600 text-white text-sm"
        >
          {isPaused ? t('common:buttons.resume') : t('common:buttons.pause')}
        </button>

        <button
          onClick={handleEndGame}
          disabled={game.status === GameStatus.COMPLETED}
          className="btn bg-red-500 hover:bg-red-600 text-white text-sm"
        >
          {t('common:buttons.endGame')}
        </button>
      </div>

      {/* Validation error display (always shown below buttons) */}
      {lastValidation && !lastValidation.isValid && (
        <div className="mt-2 p-3 bg-red-50 border-2 border-red-300 rounded-lg">
          <p className="text-sm text-red-800 font-medium">
            ❌ {lastValidation.reason}
          </p>
        </div>
      )}

      {/* Custom modal dialog (popup over board, not full screen) */}
      {modalMessage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setModalMessage(null)}
        >
          <div
            className={`bg-white rounded-xl shadow-2xl p-5 max-w-sm mx-4 border-2 relative ${
              modalMessage.type === 'error' ? 'border-red-300' : 'border-blue-300'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 mb-4">
              <div className={`text-2xl ${
                modalMessage.type === 'error' ? 'text-red-500' : 'text-blue-500'
              }`}>
                {modalMessage.type === 'error' ? '⚠️' : 'ℹ️'}
              </div>
              <div className="flex-1">
                <h3 className={`text-lg font-semibold ${
                  modalMessage.type === 'error' ? 'text-red-700' : 'text-blue-700'
                }`}>
                  {modalMessage.title}
                </h3>
                <p className="text-gray-600 whitespace-pre-line text-sm mt-1">
                  {modalMessage.message}
                </p>
              </div>
            </div>
            <button
              onClick={() => setModalMessage(null)}
              className={`btn w-full py-2 font-medium text-white text-sm rounded-lg ${
                modalMessage.type === 'error'
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {t('common:buttons.ok')}
            </button>
          </div>
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
        <p>{t('game:howToPlay.clickPlay')}</p>
      </div>
    </div>
  )
}

/**
 * Key Concepts Explained:
 *
 * 1. **Button Disabled State**
 *    - `disabled={condition}` makes button unclickable when true
 *    - Combined with conditional styling for visual feedback
 *    - `cursor-not-allowed` shows user can't click
 *
 * 2. **window.confirm()**
 *    - Shows browser confirmation dialog
 *    - Returns true if user clicks "OK", false if "Cancel"
 *    - Useful for destructive actions (skip turn with tiles placed)
 *
 * 3. **Conditional Button Styling**
 *    - Green gradient for enabled Play Word (call to action)
 *    - Gray for disabled buttons
 *    - Different colors for different action types
 *
 * 4. **Grid Layout**
 *    - `grid grid-cols-2` creates 2-column layout
 *    - `gap-2` adds space between buttons
 *    - Responsive: buttons grow to fill available space
 *
 * 5. **Validation Feedback**
 *    - Shows lastValidation error below buttons
 *    - Only shows when move was invalid
 *    - Red background for error visibility
 *
 * 6. **Optional Rendering**
 *    - `if (!game) return null` exits early
 *    - Component renders nothing if no game active
 *    - Cleaner than wrapping entire return in conditional
 *
 * 7. **Boolean Logic**
 *    - `const isInProgress = game.status === GameStatus.IN_PROGRESS`
 *    - Store computed values for readability
 *    - Easier to understand than inline conditions
 */
