/**
 * ScorePanel Component
 *
 * Displays game scores, timer, and statistics for both players.
 *
 * Features:
 * - Both players' scores and names
 * - Countdown timer for current player
 * - Rounds played
 * - Tiles remaining in bag
 * - Last move score (if any)
 * - Highlights current player
 *
 * Updates in real-time as game progresses.
 */

import { useGameStore } from '../../store/gameStore'
import { useEffect, useState } from 'react'

/**
 * ScorePanel Component
 *
 * Example usage:
 * ```tsx
 * <ScorePanel />
 * ```
 */
export function ScorePanel() {
  // Subscribe to game store
  const game = useGameStore((state) => state.game)

  // Local state for forcing re-renders (timer updates)
  const [, forceUpdate] = useState(0)

  // Force re-render every second to update timer display
  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate((n) => n + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // If no game, show placeholder
  if (!game) {
    return (
      <div className="flex items-center justify-center p-6 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
        <p className="text-gray-500">No active game</p>
      </div>
    )
  }

  /**
   * Format time in MM:SS
   *
   * @param ms - Time in milliseconds
   * @returns Formatted string (e.g., "12:34")
   */
  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // Get players
  const [player1, player2] = game.players
  const currentPlayer = game.players[game.currentPlayerIndex]

  // Get last move score
  const lastMove = game.moveHistory[game.moveHistory.length - 1]
  const lastMoveScore = lastMove?.score || 0

  // Count tiles remaining in bag
  const tilesRemaining = game.tileBag.filter((tile) => tile !== null).length

  return (
    <div className="flex flex-col gap-4">
      {/* Game info header */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-800 text-white p-4 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-2">Game Status</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="opacity-80">Round:</span>{' '}
            <span className="font-semibold">{game.round}/10</span>
          </div>
          <div>
            <span className="opacity-80">Tiles left:</span>{' '}
            <span className="font-semibold">{tilesRemaining}</span>
          </div>
          <div>
            <span className="opacity-80">Total moves:</span>{' '}
            <span className="font-semibold">{game.moveHistory.length}</span>
          </div>
          <div>
            <span className="opacity-80">Status:</span>{' '}
            <span className="font-semibold">{game.status}</span>
          </div>
        </div>
      </div>

      {/* Player 1 */}
      <div
        className={`
        p-4 rounded-lg shadow-md transition-all
        ${
          game.currentPlayerIndex === 0
            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white ring-4 ring-blue-300'
            : 'bg-white text-gray-800'
        }
      `}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold">{player1.name}</h3>
          {game.currentPlayerIndex === 0 && (
            <span className="text-xs font-semibold bg-white text-blue-600 px-2 py-1 rounded">
              CURRENT TURN
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className={game.currentPlayerIndex === 0 ? 'opacity-90' : 'text-gray-600'}>
              Score
            </p>
            <p className="text-3xl font-bold">{player1.score}</p>
          </div>
          <div>
            <p className={game.currentPlayerIndex === 0 ? 'opacity-90' : 'text-gray-600'}>
              Time Left
            </p>
            <p
              className={`text-2xl font-bold ${
                player1.timeRemaining < 60000 ? 'text-red-300' : ''
              }`}
            >
              {formatTime(player1.timeRemaining)}
            </p>
          </div>
        </div>

        <div className="mt-3 text-xs opacity-80">
          <span>Rounds played: {player1.roundsPlayed}</span>
          <span className="mx-2">•</span>
          <span>Tiles: {player1.tiles.length}</span>
        </div>
      </div>

      {/* Player 2 */}
      <div
        className={`
        p-4 rounded-lg shadow-md transition-all
        ${
          game.currentPlayerIndex === 1
            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white ring-4 ring-green-300'
            : 'bg-white text-gray-800'
        }
      `}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold">{player2.name}</h3>
          {game.currentPlayerIndex === 1 && (
            <span className="text-xs font-semibold bg-white text-green-600 px-2 py-1 rounded">
              CURRENT TURN
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className={game.currentPlayerIndex === 1 ? 'opacity-90' : 'text-gray-600'}>
              Score
            </p>
            <p className="text-3xl font-bold">{player2.score}</p>
          </div>
          <div>
            <p className={game.currentPlayerIndex === 1 ? 'opacity-90' : 'text-gray-600'}>
              Time Left
            </p>
            <p
              className={`text-2xl font-bold ${
                player2.timeRemaining < 60000 ? 'text-red-300' : ''
              }`}
            >
              {formatTime(player2.timeRemaining)}
            </p>
          </div>
        </div>

        <div className="mt-3 text-xs opacity-80">
          <span>Rounds played: {player2.roundsPlayed}</span>
          <span className="mx-2">•</span>
          <span>Tiles: {player2.tiles.length}</span>
        </div>
      </div>

      {/* Last move info */}
      {lastMove && (
        <div className="bg-purple-50 p-3 rounded-lg border-2 border-purple-200">
          <h4 className="text-sm font-bold text-purple-900 mb-1">Last Move</h4>
          <div className="text-xs text-purple-800">
            <p>
              <span className="font-semibold">Type:</span> {lastMove.type}
            </p>
            {lastMove.score > 0 && (
              <p>
                <span className="font-semibold">Score:</span> +{lastMove.score} points
              </p>
            )}
            {lastMove.formedWords && lastMove.formedWords.length > 0 && (
              <p>
                <span className="font-semibold">Words:</span>{' '}
                {lastMove.formedWords.join(', ')}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Key Concepts Explained:
 *
 * 1. **Force Re-render Pattern**
 *    - Timer updates in store don't always trigger re-render
 *    - `setInterval` + `forceUpdate` ensures UI updates every second
 *    - `forceUpdate((n) => n + 1)` increments state, forcing re-render
 *
 * 2. **useEffect Cleanup**
 *    - `return () => clearInterval(interval)` runs when component unmounts
 *    - Prevents memory leaks
 *    - Important: Always clean up intervals/timeouts!
 *
 * 3. **Conditional Styling**
 *    - `${condition ? 'class-a' : 'class-b'}` applies different styles
 *    - Used to highlight current player
 *    - Template literals allow multi-line className strings
 *
 * 4. **Destructuring Arrays**
 *    - `const [player1, player2] = game.players` gets both players
 *    - Cleaner than `game.players[0]` and `game.players[1]`
 *
 * 5. **Time Formatting**
 *    - `Math.floor(ms / 1000)` converts ms to seconds
 *    - `padStart(2, '0')` ensures "5" becomes "05"
 *    - Result: "12:05" instead of "12:5"
 *
 * 6. **Optional Chaining**
 *    - `lastMove?.score` returns undefined if lastMove is null
 *    - Prevents "Cannot read property of null" errors
 *
 * 7. **Array.filter() for Counting**
 *    - `tileBag.filter(tile => tile !== null).length` counts non-null tiles
 *    - Alternative to manual loop
 */
