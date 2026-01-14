/**
 * OnlineScorePanel Component
 *
 * Props-based version of ScorePanel for online multiplayer.
 * Displays game scores, timer, and statistics for both players.
 */

import { useTranslation } from 'react-i18next'
import { GameState } from '@kvizovka/shared'

interface OnlineScorePanelProps {
  gameState: GameState
  yourPlayerId: string
  opponentName: string
}

export function OnlineScorePanel({ gameState, yourPlayerId, opponentName }: OnlineScorePanelProps) {
  const { t } = useTranslation(['common', 'online'])
  /**
   * Format time in MM:SS
   */
  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // Get players
  const you = gameState.players.find((p) => p.id === yourPlayerId)
  const opponent = gameState.players.find((p) => p.id !== yourPlayerId)

  if (!you || !opponent) {
    return (
      <div className="flex items-center justify-center p-6 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
        <p className="text-gray-500">Loading players...</p>
      </div>
    )
  }

  // Determine if it's your turn
  const isYourTurn = gameState.players[gameState.currentPlayerIndex].id === yourPlayerId
  const isOpponentTurn = gameState.players[gameState.currentPlayerIndex].id === opponent.id

  // Get last move
  const lastMove = gameState.moveHistory[gameState.moveHistory.length - 1]

  return (
    <div className="flex flex-col gap-4">
      {/* You (Player 1 style) */}
      <div
        className={`
        p-4 rounded-lg shadow-md transition-all
        ${
          isYourTurn
            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white ring-4 ring-blue-300'
            : 'bg-white text-gray-800'
        }
      `}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold">{you.name} ({t('online:room.you')})</h3>
          {isYourTurn && (
            <span className="text-xs font-semibold bg-white text-blue-600 px-2 py-1 rounded animate-pulse">
              {t('common:labels.currentTurn')}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className={isYourTurn ? 'opacity-90' : 'text-gray-600'}>
              {t('common:labels.score')}
            </p>
            <p className="text-3xl font-bold">{you.score}</p>
          </div>
          <div>
            <p className={isYourTurn ? 'opacity-90' : 'text-gray-600'}>
              {t('common:labels.timeLeft')}
            </p>
            <p
              className={`text-2xl font-bold ${
                you.timeRemaining < 60000 ? 'text-red-300' : ''
              }`}
            >
              {formatTime(you.timeRemaining)}
            </p>
          </div>
        </div>

        <div className="mt-3 text-xs opacity-80">
          <span>{t('online:game.roundsPlayed')} {you.roundsPlayed}</span>
          <span className="mx-2">•</span>
          <span>{t('online:game.tilesCount')} {you.tiles.length}</span>
        </div>

        {/* Your tiles */}
        <div className="mt-3 pt-3 border-t border-white/20">
          <p className="text-xs opacity-80 mb-2">{t('common:labels.tiles')}:</p>
          <div className="flex flex-wrap gap-0.5">
            {you.tiles.map((tile, index) => (
              <div
                key={`${tile.id}-${index}`}
                className={`relative w-6 h-6 rounded shadow-sm flex items-center justify-center ${
                  isYourTurn
                    ? 'bg-white/20 border border-white/30'
                    : 'bg-gray-100 border border-gray-300'
                }`}
                title={tile.isJoker ? `Joker${tile.jokerLetter ? ` (${tile.jokerLetter})` : ''}` : tile.letter}
              >
                <span className={`text-[10px] font-bold ${isYourTurn ? 'text-white' : 'text-gray-700'}`}>
                  {tile.isJoker ? (tile.jokerLetter || '*') : tile.letter}
                </span>
                <span className={`absolute bottom-0 right-0.5 text-[6px] font-semibold ${isYourTurn ? 'text-white/80' : 'text-gray-600'}`}>
                  {tile.value}
                </span>
                {tile.isJoker && (
                  <span className="absolute top-0 right-0 text-[6px]" title="Joker">
                    ✨
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Opponent (Player 2 style) */}
      <div
        className={`
        p-4 rounded-lg shadow-md transition-all
        ${
          isOpponentTurn
            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white ring-4 ring-green-300'
            : 'bg-white text-gray-800'
        }
      `}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold">{opponentName}</h3>
          {isOpponentTurn && (
            <span className="text-xs font-semibold bg-white text-green-600 px-2 py-1 rounded animate-pulse">
              {t('common:labels.currentTurn')}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className={isOpponentTurn ? 'opacity-90' : 'text-gray-600'}>
              {t('common:labels.score')}
            </p>
            <p className="text-3xl font-bold">{opponent.score}</p>
          </div>
          <div>
            <p className={isOpponentTurn ? 'opacity-90' : 'text-gray-600'}>
              {t('common:labels.timeLeft')}
            </p>
            <p
              className={`text-2xl font-bold ${
                opponent.timeRemaining < 60000 ? 'text-red-300' : ''
              }`}
            >
              {formatTime(opponent.timeRemaining)}
            </p>
          </div>
        </div>

        <div className="mt-3 text-xs opacity-80">
          <span>{t('online:game.roundsPlayed')} {opponent.roundsPlayed}</span>
          <span className="mx-2">•</span>
          <span>{t('online:game.tilesCount')} {opponent.tiles.length}</span>
        </div>

        {/* Opponent tiles */}
        <div className="mt-3 pt-3 border-t border-white/20">
          <p className="text-xs opacity-80 mb-2">{t('common:labels.tiles')}:</p>
          <div className="flex flex-wrap gap-0.5">
            {opponent.tiles.map((tile, index) => (
              <div
                key={`${tile.id}-${index}`}
                className={`relative w-6 h-6 rounded shadow-sm flex items-center justify-center ${
                  isOpponentTurn
                    ? 'bg-white/20 border border-white/30'
                    : 'bg-gray-100 border border-gray-300'
                }`}
                title={tile.isJoker ? `Joker${tile.jokerLetter ? ` (${tile.jokerLetter})` : ''}` : tile.letter}
              >
                <span className={`text-[10px] font-bold ${isOpponentTurn ? 'text-white' : 'text-gray-700'}`}>
                  {tile.isJoker ? (tile.jokerLetter || '*') : tile.letter}
                </span>
                <span className={`absolute bottom-0 right-0.5 text-[6px] font-semibold ${isOpponentTurn ? 'text-white/80' : 'text-gray-600'}`}>
                  {tile.value}
                </span>
                {tile.isJoker && (
                  <span className="absolute top-0 right-0 text-[6px]" title="Joker">
                    ✨
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Last move info */}
      {lastMove && (
        <div className="bg-purple-50 p-3 rounded-lg border-2 border-purple-200">
          <h4 className="text-sm font-bold text-purple-900 mb-1">{t('common:labels.lastMove')}</h4>
          <div className="text-xs text-purple-800">
            <p>
              <span className="font-semibold">{t('common:labels.type')}:</span> {lastMove.type}
            </p>
            {lastMove.score > 0 && (
              <p>
                <span className="font-semibold">{t('common:labels.score')}:</span> +{lastMove.score} {t('common:labels.points')}
              </p>
            )}
            {lastMove.formedWords && lastMove.formedWords.length > 0 && (
              <p>
                <span className="font-semibold">{t('common:labels.words')}:</span>{' '}
                {lastMove.formedWords.join(', ')}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
