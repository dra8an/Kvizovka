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
import { OnlineScorePanel } from '../OnlineScorePanel/OnlineScorePanel'
import { OnlineGameControls } from '../OnlineGameControls/OnlineGameControls'
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
    forceEndGame,
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

  // If not in playing or finished view, show menu/waiting
  if (view !== 'playing' && view !== 'finished') {
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
    const isTie = !winner || gameState.winner === undefined

    // Get tile penalties from player objects (set by server when game ends)
    // Opponent's tiles are sanitized, so we can't calculate from tiles array
    const yourTilePenalty = you.tilePenalty || 0
    const opponentTilePenalty = opponent.tilePenalty || 0

    // For tile count display, use the stored penalty to infer tile count
    // (This is approximate since we don't know exact tile composition for opponent)
    const yourTilesLeft = you.tiles.length
    const opponentTilesLeft = opponent.tiles.length > 0 ? opponent.tiles.length : (opponentTilePenalty > 0 ? 'unknown' : 0)

    // Get end reason message
    const getEndReasonMessage = () => {
      switch (gameState.endReason) {
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
              {isTie ? '🤝' : youWon ? '🏆' : '😔'}
            </div>

            {isTie ? (
              <p className="text-2xl text-blue-600 font-bold mb-4">
                It's a Tie!
              </p>
            ) : (
              <>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  {youWon ? 'You Won!' : `${winner?.name} Wins!`}
                </h2>
                <p className="text-xl text-gray-600 mb-4">
                  {winner?.score} points!
                </p>
              </>
            )}
          </div>

          {/* Final Scores and Scoresheets Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Your Score Card and Scoresheet */}
            <div className="space-y-4">
              {/* Score Summary */}
              <div className={`p-6 rounded-lg ${youWon && !isTie ? 'bg-green-100 border-2 border-green-500' : 'bg-white shadow-md'}`}>
                <p className="font-bold text-xl mb-2">{you.name} (You)</p>
                <p className="text-4xl font-bold text-gray-900">{you.score}</p>
                <div className="mt-3 text-sm text-gray-600 space-y-1">
                  <p>
                    <span className="font-semibold">Rounds played:</span> {you.roundsPlayed}
                  </p>
                  {yourTilePenalty > 0 && (
                    <div className="text-red-600">
                      <p>
                        <span className="font-semibold">Unused tiles penalty:</span> -{yourTilePenalty} points
                      </p>
                      <p className="text-xs mt-1">
                        ({yourTilesLeft} tile{yourTilesLeft !== 1 ? 's' : ''} left in hand)
                      </p>
                      {you.tiles.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {you.tiles.map((tile, idx) => (
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
                playerId={you.id}
                playerName={`${you.name} (You)`}
                moves={gameState.moveHistory}
              />
            </div>

            {/* Opponent Score Card and Scoresheet */}
            <div className="space-y-4">
              {/* Score Summary */}
              <div className={`p-6 rounded-lg ${!youWon && !isTie ? 'bg-green-100 border-2 border-green-500' : 'bg-white shadow-md'}`}>
                <p className="font-bold text-xl mb-2">{opponent.name}</p>
                <p className="text-4xl font-bold text-gray-900">{opponent.score}</p>
                <div className="mt-3 text-sm text-gray-600 space-y-1">
                  <p>
                    <span className="font-semibold">Rounds played:</span> {opponent.roundsPlayed}
                  </p>
                  {opponentTilePenalty > 0 && (
                    <div className="text-red-600">
                      <p>
                        <span className="font-semibold">Unused tiles penalty:</span> -{opponentTilePenalty} points
                      </p>
                      {opponent.tiles.length > 0 && (
                        <>
                          <p className="text-xs mt-1">
                            ({opponent.tiles.length} tile{opponent.tiles.length !== 1 ? 's' : ''} left in hand)
                          </p>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {opponent.tiles.map((tile, idx) => (
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
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Full Scoresheet */}
              <Scoresheet
                playerId={opponent.id}
                playerName={opponent.name}
                moves={gameState.moveHistory}
              />
            </div>
          </div>

          {/* Game stats */}
          <div className="card text-center mb-6">
            <div className="bg-gray-50 rounded-lg p-4 text-sm inline-block">
              <p className="text-gray-600">
                <span className="font-semibold">Total moves:</span> {gameState.moveHistory.length}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold">Rounds:</span> {gameState.round}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="card">
            <div className="space-y-3 max-w-md mx-auto">
              <button
                onClick={() => {
                  // TODO: Implement play again feature
                  alert('Play Again feature coming soon! Both players would need to agree.')
                }}
                className="btn-primary w-full text-lg py-3"
              >
                Play Again
              </button>

              <button
                onClick={() => {
                  reset()
                  // This will take them back to menu
                }}
                className="btn bg-gray-500 hover:bg-gray-600 text-white w-full"
              >
                Back to Menu
              </button>
            </div>
          </div>
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

  // Handle recall tiles
  const handleRecallTiles = () => {
    setSelectedTiles([])
  }

  // Handle back to menu
  const handleBackToMenu = () => {
    reset()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-2 lg:p-4">
      {/* Header */}
      <header className="mb-2">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Kvizovka Online</h1>

          {/* Connection Status */}
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-600">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </header>

      {/* Main game layout: [Scoresheets] [Board+Rack] [ScorePanel+Controls] */}
      <div className="max-w-[2000px] mx-auto">
        <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr_300px] gap-2 lg:gap-4">
          {/* Left sidebar: Scoresheets (desktop only) */}
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

          {/* Center: Board and Tile Rack */}
          <div className="space-y-1.5">
            {/* Board */}
            <Board
              boardState={gameState.board}
              playerTiles={you.tiles}
              selectedTiles={selectedTiles}
              onTilePlaced={handleTilePlaced}
              onTileRemoved={handleTileRemoved}
              onJokerLetterSet={handleJokerLetterSet}
              disabled={!isYourTurn}
            />

            {/* Tile rack */}
            <TileRack
              tiles={you.tiles}
              playerName={you.name}
              selectedTiles={selectedTiles}
              onTileRemoved={handleTileRemoved}
              disabled={!isYourTurn}
            />

            {/* Game controls (mobile: show below rack) */}
            <div className="xl:hidden">
              <OnlineGameControls
                isYourTurn={isYourTurn}
                selectedTiles={selectedTiles}
                gameError={gameError}
                onPlayWord={handlePlayWord}
                onSkipTurn={handleSkip}
                onRecallTiles={handleRecallTiles}
                onBackToMenu={handleBackToMenu}
                onEndGameTest={forceEndGame}
              />
            </div>

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

          {/* Right sidebar: Score panel and controls (desktop) */}
          <div className="hidden xl:block space-y-3">
            <OnlineScorePanel
              gameState={gameState}
              yourPlayerId={yourPlayerId}
              opponentName={opponentName}
            />
            <OnlineGameControls
              isYourTurn={isYourTurn}
              selectedTiles={selectedTiles}
              gameError={gameError}
              onPlayWord={handlePlayWord}
              onSkipTurn={handleSkip}
              onRecallTiles={handleRecallTiles}
              onBackToMenu={handleBackToMenu}
              onEndGameTest={forceEndGame}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

