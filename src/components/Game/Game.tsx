/**
 * Game Component
 *
 * The main game screen that combines all game UI components.
 *
 * Features:
 * - Board (17×17 grid)
 * - TileRack (player's tiles)
 * - ScorePanel (scores, timer, stats)
 * - GameControls (action buttons)
 * - Responsive layout
 *
 * This is the complete playable Kvizovka interface!
 */

import { Board } from '../Board/Board'
import { TileRack } from '../TileRack/TileRack'
import { ScorePanel } from '../ScorePanel/ScorePanel'
import { GameControls } from '../GameControls/GameControls'
import { Scoresheet } from '../Scoresheet/Scoresheet'
import { useGameStore } from '../../store/gameStore'
import { GameMode, GameStatus } from '../../types'

/**
 * Game Component
 *
 * Example usage:
 * ```tsx
 * <Game />
 * ```
 */
export function Game() {
  // Subscribe to game store
  const game = useGameStore((state) => state.game)
  const startGame = useGameStore((state) => state.startGame)
  const reset = useGameStore((state) => state.reset)

  /**
   * Handle start new game
   *
   * TODO: Add a proper game setup screen with player name inputs
   * For now, just start a game with default names.
   */
  const handleStartGame = () => {
    startGame(GameMode.LOCAL_MULTIPLAYER, 'Player 1', 'Player 2')
  }

  /**
   * Handle new game after completion
   */
  const handleNewGame = () => {
    reset()
    handleStartGame()
  }

  // If no game, show start screen
  if (!game) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-6">
        <div className="card max-w-md w-full text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Kvizovka</h1>
          <p className="text-lg text-gray-600 mb-8">
            Serbian Word Board Game
          </p>

          <button
            onClick={handleStartGame}
            className="btn btn-primary w-full text-xl py-4"
          >
            Start New Game
          </button>

          <div className="mt-6 text-sm text-gray-600 text-left">
            <p className="font-semibold mb-2">How to play:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Drag tiles from your rack to the board</li>
              <li>Form words (minimum 4 letters)</li>
              <li>Click "Play Word" to submit</li>
              <li>First move must touch the center ★</li>
              <li>10 rounds per player</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  // Game completed screen
  if (game.status === GameStatus.COMPLETED) {
    const [player1, player2] = game.players
    const winner = game.players.find((p) => p.id === game.winner)

    // Get end reason message
    const getEndReasonMessage = () => {
      switch (game.endReason) {
        case 'rounds_completed':
          return '10 rounds completed by both players'
        case 'time_expired':
          return 'Time expired'
        case 'no_tiles':
          return 'No more tiles available'
        default:
          return 'Game ended'
      }
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="card text-center mb-6">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Game Complete!</h1>

            {/* End reason */}
            <p className="text-sm text-gray-600 mb-4">
              {getEndReasonMessage()}
            </p>

            {/* Winner announcement */}
            <div className="text-6xl mb-4">
              {winner ? '🏆' : '🤝'}
            </div>

            {winner ? (
              <>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  {winner.name} Wins!
                </h2>
                <p className="text-xl text-gray-600 mb-4">
                  {winner.score} points!
                </p>
              </>
            ) : (
              <p className="text-2xl text-blue-600 font-bold mb-4">
                It's a Tie!
              </p>
            )}
          </div>

          {/* Final Scores and Scoresheets Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Player 1 Score Card and Scoresheet */}
            <div className="space-y-4">
              {/* Score Summary */}
              <div className={`p-6 rounded-lg ${player1.id === game.winner ? 'bg-green-100 border-2 border-green-500' : 'bg-white shadow-md'}`}>
                <p className="font-bold text-xl mb-2">{player1.name}</p>
                <p className="text-4xl font-bold text-gray-900">{player1.score}</p>
                <div className="mt-3 text-sm text-gray-600 space-y-1">
                  <p>
                    <span className="font-semibold">Rounds played:</span> {player1.roundsPlayed}
                  </p>
                  {player1.tilePenalty && player1.tilePenalty > 0 && (
                    <div className="text-red-600">
                      <p>
                        <span className="font-semibold">Unused tiles penalty:</span> -{player1.tilePenalty} points
                      </p>
                      <p className="text-xs mt-1">
                        ({player1.tiles.length} tile{player1.tiles.length !== 1 ? 's' : ''} left in hand)
                      </p>
                      {player1.tiles.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {player1.tiles.map((tile, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center justify-center w-8 h-8 bg-amber-100 border border-amber-300 rounded text-xs font-bold"
                              title={tile.isJoker ? `Joker (${tile.jokerLetter || '?'})` : tile.letter}
                            >
                              {tile.isJoker ? (tile.jokerLetter || '*') : tile.letter}
                              <sub className="text-[8px] ml-0.5">{tile.value}</sub>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Full Scoresheet */}
              <Scoresheet
                playerId={player1.id}
                playerName={player1.name}
                moves={game.moveHistory}
              />
            </div>

            {/* Player 2 Score Card and Scoresheet */}
            <div className="space-y-4">
              {/* Score Summary */}
              <div className={`p-6 rounded-lg ${player2.id === game.winner ? 'bg-green-100 border-2 border-green-500' : 'bg-white shadow-md'}`}>
                <p className="font-bold text-xl mb-2">{player2.name}</p>
                <p className="text-4xl font-bold text-gray-900">{player2.score}</p>
                <div className="mt-3 text-sm text-gray-600 space-y-1">
                  <p>
                    <span className="font-semibold">Rounds played:</span> {player2.roundsPlayed}
                  </p>
                  {player2.tilePenalty && player2.tilePenalty > 0 && (
                    <div className="text-red-600">
                      <p>
                        <span className="font-semibold">Unused tiles penalty:</span> -{player2.tilePenalty} points
                      </p>
                      <p className="text-xs mt-1">
                        ({player2.tiles.length} tile{player2.tiles.length !== 1 ? 's' : ''} left in hand)
                      </p>
                      {player2.tiles.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {player2.tiles.map((tile, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center justify-center w-8 h-8 bg-amber-100 border border-amber-300 rounded text-xs font-bold"
                              title={tile.isJoker ? `Joker (${tile.jokerLetter || '?'})` : tile.letter}
                            >
                              {tile.isJoker ? (tile.jokerLetter || '*') : tile.letter}
                              <sub className="text-[8px] ml-0.5">{tile.value}</sub>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Full Scoresheet */}
              <Scoresheet
                playerId={player2.id}
                playerName={player2.name}
                moves={game.moveHistory}
              />
            </div>
          </div>

          {/* Game stats */}
          <div className="card text-center mb-6">
            <div className="bg-gray-50 rounded-lg p-4 text-sm inline-block">
              <p className="text-gray-600">
                <span className="font-semibold">Total moves:</span> {game.moveHistory.length}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold">Rounds:</span> {game.round}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="card">
            <div className="max-w-md mx-auto">
              <button
                onClick={handleNewGame}
                className="btn-primary w-full text-lg py-3"
              >
                Play Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Active game screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-2 lg:p-4">
      {/* Header */}
      <header className="mb-2">
        <h1 className="text-2xl lg:text-3xl font-bold text-center text-gray-800">Kvizovka</h1>
      </header>

      {/* Main game layout: [Scoresheets] [Board+Rack] [ScorePanel] */}
      <div className="max-w-[2000px] mx-auto">
        <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr_300px] gap-2 lg:gap-4">
          {/* Left sidebar: Scoresheets (desktop only) */}
          <div className="hidden xl:block space-y-3">
            {/* Player 1 Scoresheet */}
            <Scoresheet
              playerId={game.players[0].id}
              playerName={game.players[0].name}
              moves={game.moveHistory}
              compact
            />

            {/* Player 2 Scoresheet */}
            <Scoresheet
              playerId={game.players[1].id}
              playerName={game.players[1].name}
              moves={game.moveHistory}
              compact
            />
          </div>

          {/* Center: Board and Tile Rack */}
          <div className="space-y-1.5">
            {/* Board */}
            <Board />

            {/* Tile rack */}
            <TileRack />

            {/* Game controls (mobile: show below rack) */}
            <div className="xl:hidden">
              <GameControls />
            </div>

            {/* Scoresheets (mobile: show below controls) */}
            <div className="xl:hidden grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
              <Scoresheet
                playerId={game.players[0].id}
                playerName={game.players[0].name}
                moves={game.moveHistory}
              />
              <Scoresheet
                playerId={game.players[1].id}
                playerName={game.players[1].name}
                moves={game.moveHistory}
              />
            </div>
          </div>

          {/* Right sidebar: Score panel and controls (desktop) */}
          <div className="hidden xl:block space-y-3">
            <ScorePanel />
            <GameControls />
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Key Concepts Explained:
 *
 * 1. **Responsive Layout**
 *    - `grid-cols-1` on mobile (stacked vertically)
 *    - `lg:grid-cols-[1fr_300px]` on desktop (board left, sidebar right)
 *    - Sidebar is 300px wide, board takes remaining space
 *
 * 2. **Conditional Rendering**
 *    - Different screens for: no game, active game, completed game
 *    - Early returns make code cleaner than nested conditionals
 *
 * 3. **Mobile-First Design**
 *    - Controls below rack on mobile
 *    - Controls in sidebar on desktop
 *    - `hidden lg:block` and `lg:hidden` for responsive visibility
 *
 * 4. **Gradient Backgrounds**
 *    - `bg-gradient-to-br from-gray-100 to-gray-200`
 *    - Creates subtle depth effect
 *    - More polished than flat colors
 *
 * 5. **Winner Highlighting**
 *    - Winner's score card has green background + border
 *    - Loser has plain white background
 *    - Visual distinction makes winner obvious
 *
 * 6. **Component Composition**
 *    - Game combines smaller components (Board, TileRack, etc.)
 *    - Each component handles its own logic
 *    - Clean separation of concerns
 */
