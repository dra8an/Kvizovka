/**
 * Online Game Component
 *
 * Main game screen for online multiplayer.
 *
 * This component:
 * - Shows the game board and tiles
 * - Handles online game actions via WebSocket
 * - Shows connection status
 * - Displays opponent information
 * - Handles game completion
 *
 * Reuses many local components but connects to online game store.
 */

import React, { useEffect, useState } from 'react'
import { useOnlineGameStore } from '../../store/onlineGameStore'
import { OnlineMenu } from '../OnlineMenu/OnlineMenu'
import { Board } from '../Board/Board'
import { TileRack } from '../TileRack/TileRack'
import { Scoresheet } from '../Scoresheet/Scoresheet'
import { GameStatus, PlacedTile } from '@kvizovka/shared'

export function OnlineGame() {
  const {
    view,
    gameState,
    yourPlayerId,
    playerName,
    opponentName,
    isConnected,
    gameError,
    makeMove,
    skipTurn,
    reset,
  } = useOnlineGameStore()

  // Local UI state for tile placement
  const [selectedTiles, setSelectedTiles] = useState<PlacedTile[]>([])

  // Clear selected tiles when game state updates (after successful move)
  useEffect(() => {
    // When the server sends updated game state, clear our local placement
    if (gameState) {
      setSelectedTiles([])
    }
  }, [gameState?.round, gameState?.currentPlayerIndex])

  // If not in playing view, show menu/waiting
  if (view !== 'playing') {
    return <OnlineMenu />
  }

  // Must have game state to play
  if (!gameState || !yourPlayerId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="card text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Loading game...</p>
        </div>
      </div>
    )
  }

  // Get player data
  const you = gameState.players.find((p) => p.id === yourPlayerId)
  const opponent = gameState.players.find((p) => p.id !== yourPlayerId)

  if (!you || !opponent) {
    return <div>Error: Player data not found</div>
  }

  // Check if it's your turn
  const isYourTurn = gameState.players[gameState.currentPlayerIndex].id === yourPlayerId

  // Game completed
  if (gameState.status === GameStatus.COMPLETED) {
    const winner = gameState.players.find((p) => p.id === gameState.winner)
    const youWon = winner?.id === yourPlayerId

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
        <div className="card max-w-lg w-full text-center">
          <div className="text-6xl mb-4">{youWon ? '🏆' : '😔'}</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {youWon ? 'You Won!' : 'Game Over'}
          </h2>
          <p className="text-xl text-gray-600 mb-6">
            {winner?.name} wins with {winner?.score} points!
          </p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">You</p>
              <p className="text-2xl font-bold text-gray-800">{you.score}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">{opponentName}</p>
              <p className="text-2xl font-bold text-gray-800">{opponent.score}</p>
            </div>
          </div>

          <button
            onClick={() => {
              reset()
              // This will take them back to menu
            }}
            className="btn-primary w-full"
          >
            Back to Menu
          </button>
        </div>
      </div>
    )
  }

  // Handle play word
  const handlePlayWord = () => {
    console.log('[OnlineGame] Play Word clicked, selectedTiles:', selectedTiles.length)
    if (selectedTiles.length === 0) {
      console.log('[OnlineGame] No tiles selected, ignoring')
      return
    }
    console.log('[OnlineGame] Calling makeMove with tiles:', selectedTiles)
    makeMove(selectedTiles)
    console.log('[OnlineGame] makeMove called')
    // Don't clear selectedTiles here - wait for server response
    // Server will send game:state-update with new board state
  }

  // Handle skip
  const handleSkip = () => {
    skipTurn()
  }

  // Handle tile placement
  const handleTilePlaced = (tile: PlacedTile) => {
    setSelectedTiles(prev => [...prev, tile])
  }

  // Handle tile removed
  const handleTileRemoved = (row: number, col: number) => {
    setSelectedTiles(prev => prev.filter(
      (t) => !(t.row === row && t.col === col)
    ))
  }

  // Handle joker letter set
  const handleJokerLetterSet = (row: number, col: number, letter: string) => {
    setSelectedTiles(prev => prev.map((t) => {
      if (t.row === row && t.col === col) {
        return {
          ...t,
          tile: {
            ...t.tile,
            jokerLetter: letter,
          },
        }
      }
      return t
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-4">
        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
          {/* Connection Status */}
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-600">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          {/* Turn Indicator */}
          <div className="text-center">
            <p className="text-lg font-bold text-gray-800">
              {isYourTurn ? "Your Turn" : `${opponentName}'s Turn`}
            </p>
            {!isYourTurn && (
              <p className="text-sm text-gray-500">Waiting for opponent...</p>
            )}
          </div>

          {/* Game Info */}
          <div className="text-right">
            <p className="text-sm text-gray-600">Round {gameState.round}/10</p>
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-[280px_1fr_300px] gap-4">
        {/* Left Sidebar - Scoresheets */}
        <div className="hidden xl:block space-y-3">
          {/* Your Scoresheet */}
          <Scoresheet
            playerId={you.id}
            playerName={`${you.name} (You)`}
            moves={gameState.moveHistory}
            compact
          />

          {/* Opponent Scoresheet */}
          <Scoresheet
            playerId={opponent.id}
            playerName={opponent.name}
            moves={gameState.moveHistory}
            compact
          />
        </div>

        {/* Center - Board and Tiles */}
        <div className="space-y-4">
          <Board
            boardState={gameState.board}
            playerTiles={you.tiles}
            selectedTiles={selectedTiles}
            onTilePlaced={handleTilePlaced}
            onTileRemoved={handleTileRemoved}
            onJokerLetterSet={handleJokerLetterSet}
            disabled={!isYourTurn}
          />

          {/* Your Tiles */}
          <div className="mt-4">
            <TileRack
              tiles={you.tiles}
              playerName={you.name}
              selectedTiles={selectedTiles}
              onTileRemoved={handleTileRemoved}
              disabled={!isYourTurn}
            />
          </div>

          {/* Controls */}
          {isYourTurn && (
            <div className="mt-4 flex gap-3">
              <button
                onClick={handlePlayWord}
                disabled={selectedTiles.length === 0}
                className="btn-primary flex-1"
              >
                Play Word ({selectedTiles.length} tiles)
              </button>
              <button
                onClick={handleSkip}
                className="btn-secondary px-6"
              >
                Skip Turn
              </button>
            </div>
          )}

          {/* Error Display */}
          {gameError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {gameError}
            </div>
          )}

          {/* Scoresheets (mobile: show below controls) */}
          <div className="xl:hidden grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            <Scoresheet
              playerId={you.id}
              playerName={`${you.name} (You)`}
              moves={gameState.moveHistory}
            />
            <Scoresheet
              playerId={opponent.id}
              playerName={opponent.name}
              moves={gameState.moveHistory}
            />
          </div>
        </div>

        {/* Right Sidebar - TODO: Add OnlineScorePanel */}
        <div className="hidden xl:block space-y-3">
          {/* ScorePanel uses gameStore, need to create OnlineScorePanel */}
          {/* For now, scoresheets on the left show all scoring info */}
        </div>
      </div>
    </div>
  )
}

// Additional styles
const additionalStyles = `
.btn-secondary {
  padding: 0.75rem 1.5rem;
  background: white;
  color: #374151;
  font-weight: 600;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  border-color: #9ca3af;
  background: #f9fafb;
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
`

// Inject additional styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style')
  styleElement.textContent = additionalStyles
  document.head.appendChild(styleElement)
}
