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
import { useTranslation } from 'react-i18next'
import { useOnlineGameStore } from '../../store/onlineGameStore'
import { OnlineMenu } from '../OnlineMenu/OnlineMenu'
import { Board } from '../Board/Board'
import { TileRack } from '../TileRack/TileRack'
import { Scoresheet } from '../Scoresheet/Scoresheet'
import { OnlineScorePanel } from '../OnlineScorePanel/OnlineScorePanel'
import { OnlineGameControls } from '../OnlineGameControls/OnlineGameControls'
import { SpectatorScorePanel } from '../SpectatorScorePanel/SpectatorScorePanel'
import { SpectatorControls } from '../SpectatorControls/SpectatorControls'
import { Chat } from '../Chat/Chat'
import { BonusFlash } from '../BonusFlash/BonusFlash'
import { DirectionChoiceDialog } from '../DirectionChoiceDialog/DirectionChoiceDialog'
import { GameStatus, PlacedTile, MoveValidationResult, MoveValidator, Board as BoardEngine, BOARD_SIZE } from '@kvizovka/shared'

export function OnlineGame() {
  const { t } = useTranslation(['online', 'common', 'dialogs'])
  const {
    view,
    gameState,
    yourPlayerId,
    chatId,
    playerName,
    opponentName,
    isConnected,
    isSpectator,
    spectators,
    gameError,
    chatMessages,
    bonusFlash,
    directionChoice,
    makeMove,
    skipTurn,
    stealJoker,
    sendChatMessage,
    clearBonusFlash,
    makeMoveWithDirection,
    cancelDirectionChoice,
    reset,
  } = useOnlineGameStore()

  // Local UI state for tile placement
  const [selectedTiles, setSelectedTiles] = useState<PlacedTile[]>([])

  // Local UI state for tile order (for reordering in rack)
  const [playerTileOrder, setPlayerTileOrder] = useState<any[]>([])

  // Local UI state for joker stealing tooltip
  const [draggedTile, setDraggedTile] = useState<any>(null)

  // Local state for custom modal dialog
  const [infoModal, setInfoModal] = useState<{ title: string; message: string } | null>(null)
  const [errorModal, setErrorModal] = useState<{ title: string; message: string } | null>(null)

  // Local state for placement validation
  const [placementValidation, setPlacementValidation] = useState<MoveValidationResult | null>(null)

  // Clear selected tiles when game state updates (after successful move)
  useEffect(() => {
    // When the server sends updated game state, clear our local placement
    if (gameState) {
      setSelectedTiles([])
    }
  }, [gameState?.round, gameState?.currentPlayerIndex])

  // Update player tile order when game state changes
  useEffect(() => {
    if (gameState && yourPlayerId) {
      const you = gameState.players.find((p) => p.id === yourPlayerId)
      if (you && you.tiles) {
        setPlayerTileOrder(you.tiles)
      }
    } else if (gameState && isSpectator) {
      // Spectators see player 1's tiles
      if (gameState.players[0]?.tiles) {
        setPlayerTileOrder(gameState.players[0].tiles)
      }
    }
  }, [gameState, yourPlayerId, isSpectator])

  // Show error modal when gameError is set
  useEffect(() => {
    if (gameError) {
      setErrorModal({
        title: t('dialogs:errors.cannotPlayWord.title'),
        message: gameError
      })
    }
  }, [gameError, t])

  // Run validation when selectedTiles changes
  useEffect(() => {
    if (!gameState) {
      setPlacementValidation(null)
      return
    }

    if (selectedTiles.length === 0) {
      setPlacementValidation(null)
      return
    }

    // Create a temporary board instance for validation
    const tempBoard = new BoardEngine()
    tempBoard.initialize()

    // Copy the current board state
    const currentBoard = gameState.board
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const square = currentBoard[row][col]
        if (square.tile) {
          tempBoard.setTile(row, col, square.tile)
        }
        if (square.isUsed) {
          const tempSquare = tempBoard.getSquare(row, col)
          if (tempSquare) {
            tempSquare.isUsed = true
          }
        }
      }
    }

    // Run validation
    const validator = new MoveValidator(tempBoard)
    const result = validator.validateMove(selectedTiles)
    setPlacementValidation(result)
  }, [selectedTiles, gameState])

  // If not in playing or finished view, show menu/waiting
  if (view !== 'playing' && view !== 'finished') {
    return <OnlineMenu />
  }

  // Must have game state to play
  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="card text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">{t('online:game.loadingGame')}</p>
        </div>
      </div>
    )
  }

  // For spectators, yourPlayerId will be null/undefined
  // Get player data
  let you = yourPlayerId ? gameState.players.find((p) => p.id === yourPlayerId) : null
  let opponent = yourPlayerId ? gameState.players.find((p) => p.id !== yourPlayerId) : null

  // If not a spectator and can't find player data, show error
  if (!isSpectator && (!you || !opponent)) {
    return <div>{t('online:game.errorPlayerNotFound')}</div>
  }

  // For spectators, assign player data (we'll use first two players)
  if (isSpectator) {
    you = gameState.players[0]
    opponent = gameState.players[1]
  }

  if (!you || !opponent) {
    return <div>{t('online:game.errorPlayerNotFound')}</div>
  }

  // Check if it's your turn (always false for spectators)
  const isYourTurn = !isSpectator && yourPlayerId && gameState.players[gameState.currentPlayerIndex].id === yourPlayerId

  // Game completed
  if (gameState.status === GameStatus.COMPLETED) {
    const winner = gameState.players.find((p) => p.id === gameState.winner)
    const youWon = !isSpectator && winner?.id === yourPlayerId
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
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="card text-center mb-6">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">{t('online:game.gameComplete')}</h1>

            {/* End reason */}
            <p className="text-sm text-gray-600 mb-4">
              {getEndReasonMessage()}
            </p>

            {/* Winner announcement */}
            <div className="text-6xl mb-4">
              {isTie ? '🤝' : (isSpectator ? '🏆' : (youWon ? '🏆' : '😔'))}
            </div>

            {isTie ? (
              <p className="text-2xl text-blue-600 font-bold mb-4">
                {t('dialogs:gameOver.tie')}
              </p>
            ) : (
              <>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  {isSpectator
                    ? t('online:game.wins', { name: winner?.name })
                    : (youWon ? t('online:game.youWon') : t('online:game.wins', { name: winner?.name }))
                  }
                </h2>
                <p className="text-xl text-gray-600 mb-4">
                  {t('dialogs:gameOver.winnerPoints', { points: winner?.score })}
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
                <p className="font-bold text-xl mb-2">{you.name}{!isSpectator && ' (You)'}</p>
                <p className="text-4xl font-bold text-gray-900">{you.score}</p>
                <div className="mt-3 text-sm text-gray-600 space-y-1">
                  <p>
                    <span className="font-semibold">{t('online:game.roundsPlayed')}</span> {you.roundsPlayed}
                  </p>
                  {yourTilePenalty > 0 && (
                    <div className="text-red-600">
                      <p>
                        <span className="font-semibold">{t('dialogs:gameOver.unusedTilesPenalty')}</span> -{yourTilePenalty} {t('common:labels.points')}
                      </p>
                      <p className="text-xs mt-1">
                        {t('dialogs:gameOver.tilesLeftInHand', { count: yourTilesLeft })}
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
                playerName={isSpectator ? you.name : `${you.name} (You)`}
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
                    <span className="font-semibold">{t('online:game.roundsPlayed')}</span> {opponent.roundsPlayed}
                  </p>
                  {opponentTilePenalty > 0 && (
                    <div className="text-red-600">
                      <p>
                        <span className="font-semibold">{t('dialogs:gameOver.unusedTilesPenalty')}</span> -{opponentTilePenalty} {t('common:labels.points')}
                      </p>
                      {opponent.tiles.length > 0 && (
                        <>
                          <p className="text-xs mt-1">
                            {t('dialogs:gameOver.tilesLeftInHand', { count: opponent.tiles.length })}
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
                <span className="font-semibold">{t('common:labels.totalMoves')}:</span> {gameState.moveHistory.length}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold">{t('common:labels.rounds')}:</span> {gameState.round}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="card">
            <div className="space-y-3 max-w-md mx-auto">
              <button
                onClick={() => {
                  // TODO: Implement play again feature
                  setInfoModal({
                    title: t('online:game.playAgain'),
                    message: t('online:game.playAgainSoon')
                  })
                }}
                className="btn-primary w-full text-lg py-3"
              >
                {t('online:game.playAgain')}
              </button>

              <button
                onClick={() => {
                  reset()
                  // This will take them back to menu
                }}
                className="btn bg-gray-500 hover:bg-gray-600 text-white w-full"
              >
                {t('online:game.backToMenu')}
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

  // Handle joker steal
  const handleJokerSteal = (row: number, col: number, replacementTileId: string) => {
    stealJoker(row, col, replacementTileId)
  }

  // Handle tile drag start (for joker stealing tooltip)
  const handleTileDragStart = (tile: any) => {
    setDraggedTile(tile)
  }

  // Handle tile drag end (for joker stealing tooltip)
  const handleTileDragEnd = () => {
    setDraggedTile(null)
  }

  // Handle recall tiles
  const handleRecallTiles = () => {
    setSelectedTiles([])
  }

  // Handle undo last tile
  const handleUndoLastTile = () => {
    setSelectedTiles(prev => prev.slice(0, -1))
  }

  // Handle tile reordering in rack
  const handleReorderTiles = (fromIndex: number, toIndex: number) => {
    // Get tiles that are currently available in the rack (not placed on board)
    const selectedTileIds = new Set(selectedTiles.map((st) => st.tile.id))
    const availableTiles = playerTileOrder.filter(
      (tile) => !selectedTileIds.has(tile.id)
    )

    // Validate indices
    if (fromIndex < 0 || fromIndex >= availableTiles.length ||
        toIndex < 0 || toIndex >= availableTiles.length) {
      return
    }

    // Remove tile from old position
    const [movedTile] = availableTiles.splice(fromIndex, 1)

    // Insert at new position
    availableTiles.splice(toIndex, 0, movedTile)

    // Reconstruct the full tiles array (available tiles + placed tiles)
    const placedTiles = playerTileOrder.filter((tile) =>
      selectedTileIds.has(tile.id)
    )

    setPlayerTileOrder([...availableTiles, ...placedTiles])
  }

  // Handle back to menu
  const handleBackToMenu = () => {
    reset()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-2 lg:p-4">
      {/* Header */}
      <header className="mb-2 relative">
        <h1 className="text-2xl lg:text-3xl font-bold text-center text-gray-800">{t('online:game.header')}</h1>

        {/* Connection Status (top-right) */}
        <div className="absolute top-0 right-4 flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-600">
            {isConnected ? t('online:game.connected') : t('online:game.disconnected')}
          </span>
        </div>
      </header>

      {/* Main game layout: [Scoresheets] [Board+Rack] [ScorePanel+Controls] */}
      <div className="max-w-[2000px] mx-auto">
        <div className="grid grid-cols-1 xl:grid-cols-[450px_1fr_300px] gap-2 lg:gap-4">
          {/* Left sidebar: Scoresheets + Chat (desktop only) */}
          <div className="hidden xl:block space-y-3">
            {/* Scoresheets side-by-side */}
            <div className="grid grid-cols-2 gap-2">
              {/* Your Scoresheet */}
              <Scoresheet
                playerId={you.id}
                playerName={isSpectator ? you.name : `${you.name} (You)`}
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

            {/* Chat with fixed height */}
            <div className="max-h-96 overflow-y-auto">
              <Chat
                messages={chatMessages}
                yourPlayerId={chatId || you.id}
                onSendMessage={sendChatMessage}
              />
            </div>
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
              onJokerSteal={handleJokerSteal}
              gameState={gameState}
              draggedTile={draggedTile}
              disabled={!isYourTurn || isSpectator}
            />

            {/* Tile rack */}
            <TileRack
              tiles={playerTileOrder.length > 0 ? playerTileOrder : you.tiles}
              playerName={you.name}
              selectedTiles={selectedTiles}
              onTileRemoved={handleTileRemoved}
              onTileDragStart={handleTileDragStart}
              onTileDragEnd={handleTileDragEnd}
              onReorderTiles={handleReorderTiles}
              disabled={!isYourTurn || isSpectator}
            />

            {/* Game controls (mobile: show below rack) */}
            <div className="xl:hidden">
              {isSpectator ? (
                <SpectatorControls
                  onLeaveGame={handleBackToMenu}
                />
              ) : (
                <OnlineGameControls
                  isYourTurn={isYourTurn}
                  selectedTiles={selectedTiles}
                  placementValidation={placementValidation}
                  gameError={gameError}
                  onPlayWord={handlePlayWord}
                  onSkipTurn={handleSkip}
                  onRecallTiles={handleRecallTiles}
                  onUndoLastTile={handleUndoLastTile}
                  onBackToMenu={handleBackToMenu}
                />
              )}
            </div>

            {/* Scoresheets (mobile: show below controls) */}
            <div className="xl:hidden grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
              <Scoresheet
                playerId={you.id}
                playerName={isSpectator ? you.name : `${you.name} (You)`}
                moves={gameState.moveHistory}
              />
              <Scoresheet
                playerId={opponent.id}
                playerName={opponent.name}
                moves={gameState.moveHistory}
              />
            </div>

            {/* Chat (mobile: show below scoresheets) */}
            <div className="xl:hidden mt-4">
              <Chat
                messages={chatMessages}
                yourPlayerId={chatId || you.id}
                onSendMessage={sendChatMessage}
              />
            </div>
          </div>

          {/* Right sidebar: Score panel and controls (desktop) */}
          <div className="hidden xl:block space-y-3">
            {isSpectator ? (
              <>
                <SpectatorScorePanel
                  gameState={gameState}
                  spectators={spectators}
                />
                <SpectatorControls
                  onLeaveGame={handleBackToMenu}
                />
              </>
            ) : (
              <>
                <OnlineScorePanel
                  gameState={gameState}
                  yourPlayerId={yourPlayerId!}
                  opponentName={opponentName}
                  spectators={spectators}
                />
                <OnlineGameControls
                  isYourTurn={isYourTurn}
                  selectedTiles={selectedTiles}
                  placementValidation={placementValidation}
                  gameError={gameError}
                  onPlayWord={handlePlayWord}
                  onSkipTurn={handleSkip}
                  onRecallTiles={handleRecallTiles}
                  onUndoLastTile={handleUndoLastTile}
                  onBackToMenu={handleBackToMenu}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Custom info modal */}
      {infoModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setInfoModal(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl p-5 max-w-sm mx-4 border-2 border-blue-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="text-2xl text-blue-500">
                ℹ️
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-700">
                  {infoModal.title}
                </h3>
                <p className="text-gray-600 whitespace-pre-line text-sm mt-1">
                  {infoModal.message}
                </p>
              </div>
            </div>
            <button
              onClick={() => setInfoModal(null)}
              className="btn w-full py-2 font-medium text-white text-sm rounded-lg bg-blue-500 hover:bg-blue-600"
            >
              {t('common:buttons.ok')}
            </button>
          </div>
        </div>
      )}

      {/* Custom error modal */}
      {errorModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setErrorModal(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl p-5 max-w-sm mx-4 border-2 border-red-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="text-2xl text-red-500">
                ⚠️
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-700">
                  {errorModal.title}
                </h3>
                <p className="text-gray-600 whitespace-pre-line text-sm mt-1">
                  {errorModal.message}
                </p>
              </div>
            </div>
            <button
              onClick={() => setErrorModal(null)}
              className="btn w-full py-2 font-medium text-white text-sm rounded-lg bg-red-500 hover:bg-red-600"
            >
              {t('common:buttons.ok')}
            </button>
          </div>
        </div>
      )}

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

