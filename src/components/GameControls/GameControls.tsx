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

import { useGameStore } from '../../store/gameStore'
import { GameStatus } from '../../types'

/**
 * GameControls Component
 *
 * Example usage:
 * ```tsx
 * <GameControls />
 * ```
 */
export function GameControls() {
  // Subscribe to game store
  const game = useGameStore((state) => state.game)
  const selectedTiles = useGameStore((state) => state.selectedTiles)
  const lastValidation = useGameStore((state) => state.lastValidation)

  // Game actions
  const makeMove = useGameStore((state) => state.makeMove)
  const skipTurn = useGameStore((state) => state.skipTurn)
  const clearSelection = useGameStore((state) => state.clearSelection)
  const pauseGame = useGameStore((state) => state.pauseGame)
  const resumeGame = useGameStore((state) => state.resumeGame)
  const endGame = useGameStore((state) => state.endGame)

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
      alert('Please place some tiles on the board first!')
      return
    }

    const success = makeMove(selectedTiles)

    if (!success) {
      // Show error message from validation
      const reason = lastValidation?.reason || 'Invalid move'
      alert(`Cannot play word: ${reason}`)
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
      const confirm = window.confirm(
        'You have tiles placed on the board. Skip turn anyway? (Tiles will be returned to rack)'
      )
      if (!confirm) return
    }

    skipTurn()
    clearSelection()
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
   * TODO: Implement tile selection UI for exchange.
   * For now, just show a message.
   */
  const handleExchangeTiles = () => {
    alert('Exchange tiles feature coming soon! For now, use Skip Turn.')
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
    const confirm = window.confirm(
      'Are you sure you want to end the game? Final scores will be calculated.'
    )
    if (confirm) {
      endGame()
    }
  }

  // Check if game is in progress
  const isInProgress = game.status === GameStatus.IN_PROGRESS
  const isPaused = game.status === GameStatus.PAUSED

  return (
    <div className="flex flex-col gap-3">
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
        Play Word {selectedTiles.length > 0 && `(${selectedTiles.length} tiles)`}
      </button>

      {/* Secondary actions */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleRecallTiles}
          disabled={selectedTiles.length === 0 || !isInProgress}
          className="btn btn-secondary"
        >
          Recall Tiles
        </button>

        <button
          onClick={handleSkipTurn}
          disabled={!isInProgress}
          className="btn btn-secondary"
        >
          Skip Turn
        </button>
      </div>

      {/* Exchange tiles (TODO) */}
      <button
        onClick={handleExchangeTiles}
        disabled={!isInProgress}
        className="btn bg-purple-500 hover:bg-purple-600 text-white disabled:bg-gray-300 disabled:text-gray-500"
      >
        Exchange Tiles
      </button>

      {/* Game management */}
      <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-gray-300">
        <button
          onClick={handlePauseResume}
          disabled={game.status === GameStatus.COMPLETED}
          className="btn bg-yellow-500 hover:bg-yellow-600 text-white text-sm"
        >
          {isPaused ? 'Resume' : 'Pause'}
        </button>

        <button
          onClick={handleEndGame}
          disabled={game.status === GameStatus.COMPLETED}
          className="btn bg-red-500 hover:bg-red-600 text-white text-sm"
        >
          End Game
        </button>
      </div>

      {/* Validation error display */}
      {lastValidation && !lastValidation.isValid && (
        <div className="mt-2 p-3 bg-red-50 border-2 border-red-300 rounded-lg">
          <p className="text-sm text-red-800 font-medium">
            ❌ {lastValidation.reason}
          </p>
        </div>
      )}

      {/* Help text */}
      <div className="mt-2 text-xs text-gray-600 text-center">
        <p>Drag tiles from your rack to the board, then click Play Word</p>
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
