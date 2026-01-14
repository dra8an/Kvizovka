/**
 * OnlineScorePanel Component
 *
 * Props-based version of ScorePanel for online multiplayer.
 * Displays game scores, timer, and statistics for both players.
 */

import { useTranslation } from 'react-i18next'
import { useState, useEffect } from 'react'
import { GameState } from '@kvizovka/shared'

interface OnlineScorePanelProps {
  gameState: GameState
  yourPlayerId: string
  opponentName: string
  spectators?: Array<{ socketId: string; name: string }>
}

export function OnlineScorePanel({ gameState, yourPlayerId, opponentName, spectators = [] }: OnlineScorePanelProps) {
  const { t } = useTranslation(['common', 'online'])

  // Local state for live timer countdown
  const [displayTime, setDisplayTime] = useState<{ [playerId: string]: number }>({})

  // Sync display time with server ONLY when turn changes or round changes
  useEffect(() => {
    const newDisplayTime: { [playerId: string]: number } = {}
    gameState.players.forEach(player => {
      newDisplayTime[player.id] = player.timeRemaining
    })
    setDisplayTime(newDisplayTime)
  }, [gameState.currentPlayerIndex, gameState.round]) // Only sync on turn/round change, NOT on every player update

  // Countdown timer for current player
  useEffect(() => {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex]

    const interval = setInterval(() => {
      setDisplayTime(prev => ({
        ...prev,
        [currentPlayer.id]: Math.max(0, (prev[currentPlayer.id] || currentPlayer.timeRemaining) - 1000)
      }))
    }, 1000)

    return () => clearInterval(interval)
  }, [gameState.currentPlayerIndex, gameState.players])

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

  return (
    <div className="flex flex-col gap-4">
      {/* Spectators list (if any) */}
      {spectators.length > 0 && (
        <div className="px-2 py-1.5 bg-gray-50 rounded border border-gray-200">
          <p className="text-[10px] font-medium text-gray-500 mb-1">
            👁️ Spectators ({spectators.length}/5)
          </p>
          <div className="space-y-0.5">
            {spectators.map((spectator) => (
              <p key={spectator.socketId} className="text-[10px] text-gray-600">
                {spectator.name}
              </p>
            ))}
          </div>
        </div>
      )}

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
                (displayTime[you.id] ?? you.timeRemaining) < 60000 ? 'text-red-300' : ''
              }`}
            >
              {formatTime(displayTime[you.id] ?? you.timeRemaining)}
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
                (displayTime[opponent.id] ?? opponent.timeRemaining) < 60000 ? 'text-red-300' : ''
              }`}
            >
              {formatTime(displayTime[opponent.id] ?? opponent.timeRemaining)}
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
    </div>
  )
}
