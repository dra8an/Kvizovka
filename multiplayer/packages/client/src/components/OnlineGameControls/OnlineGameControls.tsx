/**
 * OnlineGameControls Component
 *
 * Props-based version of GameControls for online multiplayer.
 * Provides buttons for game actions in online mode.
 */

import { PlacedTile } from '@kvizovka/shared'

interface OnlineGameControlsProps {
  isYourTurn: boolean
  selectedTiles: PlacedTile[]
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
  gameError,
  onPlayWord,
  onSkipTurn,
  onRecallTiles,
  onBackToMenu,
  onEndGameTest,
}: OnlineGameControlsProps) {
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
   */
  const handleSkipTurn = () => {
    if (selectedTiles.length > 0) {
      const confirm = window.confirm(
        'You have tiles placed on the board. Skip turn anyway? (Tiles will be returned to rack)'
      )
      if (!confirm) return
    }
    onSkipTurn()
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
    const confirm = window.confirm(
      'Are you sure you want to leave the game? This will disconnect you from the match.'
    )
    if (confirm) {
      onBackToMenu()
    }
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
        Play Word {selectedTiles.length > 0 && `(${selectedTiles.length} tiles)`}
      </button>

      {/* Secondary actions */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleRecallTiles}
          disabled={selectedTiles.length === 0 || !isYourTurn}
          className="btn btn-secondary"
        >
          Recall Tiles
        </button>

        <button
          onClick={handleSkipTurn}
          disabled={!isYourTurn}
          className="btn btn-secondary"
        >
          Skip Turn
        </button>
      </div>

      {/* Exchange tiles - Coming soon */}
      <button
        disabled
        className="btn bg-gray-300 text-gray-500 cursor-not-allowed"
        title="Exchange tiles feature coming soon"
      >
        Exchange Tiles
      </button>

      {/* Game management */}
      <div className="grid grid-cols-1 gap-2 mt-2 pt-3 border-t border-gray-300">
        {/* Test button - only show if handler provided */}
        {onEndGameTest && (
          <button
            onClick={onEndGameTest}
            className="btn bg-orange-500 hover:bg-orange-600 text-white text-sm"
            title="For testing - ends game immediately"
          >
            🧪 End Game (Test)
          </button>
        )}

        <button
          onClick={handleBackToMenu}
          className="btn bg-red-500 hover:bg-red-600 text-white text-sm"
        >
          Leave Game
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

      {/* Help text */}
      <div className="mt-2 text-xs text-gray-600 text-center">
        <p>Drag tiles from your rack to the board, then click Play Word</p>
      </div>
    </div>
  )
}
