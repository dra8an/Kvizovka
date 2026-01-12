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

import React from 'react'
import { useTranslation } from 'react-i18next'
import { Board } from '../Board/Board'
import { TileRack } from '../TileRack/TileRack'
import { ScorePanel } from '../ScorePanel/ScorePanel'
import { GameControls } from '../GameControls/GameControls'
import { Scoresheet } from '../Scoresheet/Scoresheet'
import { LanguageSwitcher } from '../LanguageSwitcher/LanguageSwitcher'
import { BonusFlash } from '../BonusFlash/BonusFlash'
import { DirectionChoiceDialog } from '../DirectionChoiceDialog/DirectionChoiceDialog'
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
  const { t } = useTranslation(['game', 'dialogs', 'common'])

  // Subscribe to game store
  const game = useGameStore((state) => state.game)
  const startGame = useGameStore((state) => state.startGame)
  const reset = useGameStore((state) => state.reset)
  const bonusFlash = useGameStore((state) => state.bonusFlash)
  const clearBonusFlash = useGameStore((state) => state.clearBonusFlash)
  const directionChoice = useGameStore((state) => state.directionChoice)
  const makeMoveWithDirection = useGameStore((state) => state.makeMoveWithDirection)
  const cancelDirectionChoice = useGameStore((state) => state.cancelDirectionChoice)

  // Local state for player name input
  const [showNameInput, setShowNameInput] = React.useState(false)
  const [player1Name, setPlayer1Name] = React.useState('')
  const [player2Name, setPlayer2Name] = React.useState('')

  /**
   * Handle showing the name input screen
   */
  const handleShowNameInput = () => {
    setShowNameInput(true)
  }

  /**
   * Handle starting game with player names
   */
  const handleStartGame = (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    const name1 = player1Name.trim() || t('common:defaultNames.player1')
    const name2 = player2Name.trim() || t('common:defaultNames.player2')

    startGame(GameMode.LOCAL_MULTIPLAYER, name1, name2)

    // Reset form
    setShowNameInput(false)
    setPlayer1Name('')
    setPlayer2Name('')
  }

  /**
   * Handle new game after completion
   */
  const handleNewGame = () => {
    reset()
    setShowNameInput(true)
  }

  // If no game, show start screen or name input
  if (!game) {
    // Show name input form
    if (showNameInput) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-6">
          <div className="card max-w-md w-full">
            {/* Language switcher (centered above title) */}
            <div className="flex justify-center mb-4">
              <LanguageSwitcher />
            </div>

            <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">{t('game:title')}</h1>
            <p className="text-gray-600 mb-6 text-center">{t('game:playerSetup.subtitle')}</p>

            <form onSubmit={handleStartGame}>
              <div className="space-y-4">
                {/* Player 1 Name */}
                <div>
                  <label htmlFor="player1" className="block text-sm font-semibold text-gray-700 mb-1">
                    {t('game:playerSetup.player1Label')}
                  </label>
                  <input
                    type="text"
                    id="player1"
                    value={player1Name}
                    onChange={(e) => setPlayer1Name(e.target.value)}
                    placeholder={t('common:defaultNames.player1')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    maxLength={20}
                    autoFocus
                  />
                </div>

                {/* Player 2 Name */}
                <div>
                  <label htmlFor="player2" className="block text-sm font-semibold text-gray-700 mb-1">
                    {t('game:playerSetup.player2Label')}
                  </label>
                  <input
                    type="text"
                    id="player2"
                    value={player2Name}
                    onChange={(e) => setPlayer2Name(e.target.value)}
                    placeholder={t('common:defaultNames.player2')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    maxLength={20}
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowNameInput(false)}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  {t('common:buttons.cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 btn btn-primary py-3 font-semibold"
                >
                  {t('game:playerSetup.startGame')}
                </button>
              </div>
            </form>

            <p className="mt-4 text-xs text-gray-500 text-center">
              {t('game:playerSetup.hint')}
            </p>
          </div>
        </div>
      )
    }

    // Show welcome screen
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-6">
        <div className="card max-w-md w-full text-center">
          {/* Language switcher (centered above title) */}
          <div className="flex justify-center mb-4">
            <LanguageSwitcher />
          </div>

          <h1 className="text-4xl font-bold text-gray-800 mb-4">{t('game:title')}</h1>
          <p className="text-lg text-gray-600 mb-8">
            {t('game:subtitle')}
          </p>

          <button
            onClick={handleShowNameInput}
            className="btn btn-primary w-full text-xl py-4"
          >
            {t('common:buttons.start')}
          </button>

          <div className="mt-6 text-sm text-gray-600 text-left">
            <p className="font-semibold mb-2">{t('game:howToPlay.title')}</p>
            <ul className="list-disc list-inside space-y-1">
              <li>{t('game:howToPlay.dragTiles')}</li>
              <li>{t('game:howToPlay.formWords')}</li>
              <li>{t('game:howToPlay.clickPlay')}</li>
              <li>{t('game:howToPlay.firstMove')}</li>
              <li>{t('game:howToPlay.rounds')}</li>
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
          return t('dialogs:gameOver.endReasons.roundsCompleted')
        case 'time_expired':
          return t('dialogs:gameOver.endReasons.timeExpired')
        case 'no_tiles':
          return t('dialogs:gameOver.endReasons.noTiles')
        default:
          return t('dialogs:gameOver.endReasons.default')
      }
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-2 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="card text-center mb-3 py-3 relative">
            {/* Language switcher (top-right) */}
            <div className="absolute top-2 right-2">
              <LanguageSwitcher />
            </div>

            <h1 className="text-2xl font-bold text-gray-800 mb-1">{t('dialogs:gameOver.title')}</h1>

            {/* End reason */}
            <p className="text-xs text-gray-600 mb-2">
              {getEndReasonMessage()}
            </p>

            {/* Winner announcement */}
            <div className="text-4xl mb-2">
              {winner ? '🏆' : '🤝'}
            </div>

            {winner ? (
              <>
                <h2 className="text-xl font-bold text-gray-800 mb-1">
                  {t('dialogs:gameOver.winner', { playerName: winner.name })}
                </h2>
                <p className="text-base text-gray-600">
                  {t('dialogs:gameOver.winnerPoints', { points: winner.score })}
                </p>
              </>
            ) : (
              <p className="text-lg text-blue-600 font-bold">
                {t('dialogs:gameOver.tie')}
              </p>
            )}
          </div>

          {/* Final Scores and Scoresheets Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            {/* Player 1 Score Card and Scoresheet */}
            <div className="space-y-2">
              {/* Score Summary */}
              <div className={`p-3 rounded-lg border-2 ${player1.id === game.winner ? 'bg-green-100 border-green-500' : 'bg-white border-transparent shadow-md'}`}>
                <p className="font-bold text-base mb-1">{player1.name}</p>
                <p className="text-2xl font-bold text-gray-900">{player1.score}</p>
                <div className="mt-2 text-xs text-gray-600 space-y-1">
                  <p>
                    <span className="font-semibold">{t('common:labels.rounds')}:</span> {player1.roundsPlayed}
                  </p>
                  {player1.tilePenalty && player1.tilePenalty > 0 && (
                    <div className="text-red-600">
                      <p>
                        <span className="font-semibold">{t('dialogs:gameOver.unusedTilesPenalty')}</span> -{player1.tilePenalty} {t('common:labels.points')}
                      </p>
                      <p className="text-[10px] mt-1">
                        {t('dialogs:gameOver.tilesLeftInHand', { count: player1.tiles.length })}
                      </p>
                      {player1.tiles.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-0.5">
                          {player1.tiles.map((tile, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center justify-center w-6 h-6 bg-amber-100 border border-amber-300 rounded text-[10px] font-bold"
                              title={tile.isJoker ? `Joker (${tile.jokerLetter || '?'})` : tile.letter}
                            >
                              {tile.isJoker ? (tile.jokerLetter || '*') : tile.letter}
                              <sub className="text-[6px] ml-0.5">{tile.value}</sub>
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
            <div className="space-y-2">
              {/* Score Summary */}
              <div className={`p-3 rounded-lg border-2 ${player2.id === game.winner ? 'bg-green-100 border-green-500' : 'bg-white border-transparent shadow-md'}`}>
                <p className="font-bold text-base mb-1">{player2.name}</p>
                <p className="text-2xl font-bold text-gray-900">{player2.score}</p>
                <div className="mt-2 text-xs text-gray-600 space-y-1">
                  <p>
                    <span className="font-semibold">{t('common:labels.rounds')}:</span> {player2.roundsPlayed}
                  </p>
                  {player2.tilePenalty && player2.tilePenalty > 0 && (
                    <div className="text-red-600">
                      <p>
                        <span className="font-semibold">{t('dialogs:gameOver.unusedTilesPenalty')}</span> -{player2.tilePenalty} {t('common:labels.points')}
                      </p>
                      <p className="text-[10px] mt-1">
                        {t('dialogs:gameOver.tilesLeftInHand', { count: player2.tiles.length })}
                      </p>
                      {player2.tiles.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-0.5">
                          {player2.tiles.map((tile, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center justify-center w-6 h-6 bg-amber-100 border border-amber-300 rounded text-[10px] font-bold"
                              title={tile.isJoker ? `Joker (${tile.jokerLetter || '?'})` : tile.letter}
                            >
                              {tile.isJoker ? (tile.jokerLetter || '*') : tile.letter}
                              <sub className="text-[6px] ml-0.5">{tile.value}</sub>
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

          {/* Action buttons */}
          <div className="card py-2">
            <div className="max-w-md mx-auto">
              <button
                onClick={handleNewGame}
                className="btn-primary w-full text-base py-2"
              >
                {t('common:buttons.playAgain')}
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
      <header className="mb-2 relative">
        <h1 className="text-2xl lg:text-3xl font-bold text-center text-gray-800">{t('game:title')}</h1>
        {/* Language switcher (top-right) */}
        <div className="absolute top-0 right-4">
          <LanguageSwitcher />
        </div>
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

      {/* Bonus flash overlay */}
      {bonusFlash !== null && (
        <BonusFlash bonus={bonusFlash} onComplete={clearBonusFlash} />
      )}

      {/* Direction choice dialog */}
      {directionChoice && (
        <DirectionChoiceDialog
          horizontalWord={directionChoice.horizontalOption.wordText}
          verticalWord={directionChoice.verticalOption.wordText}
          onChoose={makeMoveWithDirection}
          onCancel={cancelDirectionChoice}
        />
      )}
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
