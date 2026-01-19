/**
 * Mobile Online Game Component
 *
 * Main game screen for online multiplayer (mobile layout).
 *
 * This component:
 * - Vertical stack layout optimized for mobile
 * - Touch drag-and-drop for tile placement
 * - Simplified UI (no scoresheet, chat, spectator features)
 *
 * Layout:
 * ┌─────────────────────────────┐
 * │  [You: 14]   [Opponent: 8]  │  ← MobileScoreHeader
 * ├─────────────────────────────┤
 * │         Board               │  ← Game board
 * ├─────────────────────────────┤
 * │   [A][B][C][D][E][F][G]     │  ← TileRack (scrollable)
 * ├─────────────────────────────┤
 * │   [Recall] [Play] [Skip]    │  ← MobileActionBar
 * └─────────────────────────────┘
 */

import { useEffect, useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useOnlineGameStore } from '../../store/onlineGameStore'
import { OnlineMenu } from '../OnlineMenu/OnlineMenu'
import { Board } from '../Board/Board'
import { TileRack } from '../TileRack/TileRack'
import { BonusFlash } from '../BonusFlash/BonusFlash'
import { DirectionChoiceDialog } from '../DirectionChoiceDialog/DirectionChoiceDialog'
import { MobileScoreHeader } from './MobileScoreHeader'
import { MobileActionBar } from './MobileActionBar'
import { DragOverlay } from '../DragOverlay/DragOverlay'
import { useTouchDrag } from '../../hooks/useTouchDrag'
import { useBoardZoom } from '../../hooks/useBoardZoom'
import { GameStatus, PlacedTile, MoveValidationResult, MoveValidator, Board as BoardEngine, BOARD_SIZE, Tile as TileType, Logger } from '@kvizovka/shared'

export function MobileOnlineGame() {
  const { t } = useTranslation(['online', 'common', 'dialogs'])
  const {
    view,
    gameState,
    yourPlayerId,
    opponentName,
    isSpectator,
    gameError,
    bonusFlash,
    directionChoice,
    makeMove,
    skipTurn,
    stealJoker,
    clearBonusFlash,
    makeMoveWithDirection,
    cancelDirectionChoice,
    reset,
  } = useOnlineGameStore()

  // Local UI state for tile placement
  const [selectedTiles, setSelectedTiles] = useState<PlacedTile[]>([])

  // Local UI state for tile order (for reordering in rack)
  const [playerTileOrder, setPlayerTileOrder] = useState<TileType[]>([])

  // Touch drag-and-drop
  const { dragState, handleTouchStart, handleTouchStartFromBoard, handleTouchMove, handleTouchEnd, handleTouchCancel } = useTouchDrag()
  const boardRef = useRef<HTMLDivElement>(null)

  // Board zoom for mobile
  const { zoomPan, handlePanStart, handlePanMove, handlePanEnd, resetZoom } = useBoardZoom(selectedTiles, boardRef as React.RefObject<HTMLElement>)

  // Local state for error display
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Local state for placement validation
  const [placementValidation, setPlacementValidation] = useState<MoveValidationResult | null>(null)

  // Clear selected tiles when game state updates (after successful move)
  useEffect(() => {
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
      if (gameState.players[0]?.tiles) {
        setPlayerTileOrder(gameState.players[0].tiles)
      }
    }
  }, [gameState, yourPlayerId, isSpectator])

  // Show error when gameError is set
  useEffect(() => {
    if (gameError) {
      setErrorMessage(gameError)
      // Auto-clear after 3 seconds
      const timer = setTimeout(() => setErrorMessage(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [gameError])

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
        <div className="text-center p-4">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">{t('online:game.loadingGame')}</p>
        </div>
      </div>
    )
  }

  // Get player data
  let you = yourPlayerId ? gameState.players.find((p) => p.id === yourPlayerId) : null
  let opponent = yourPlayerId ? gameState.players.find((p) => p.id !== yourPlayerId) : null

  // For spectators, assign player data
  if (isSpectator) {
    you = gameState.players[0]
    opponent = gameState.players[1]
  }

  if (!you || !opponent) {
    return <div className="p-4">{t('online:game.errorPlayerNotFound')}</div>
  }

  // Check if it's your turn (always false for spectators)
  const isYourTurn = !isSpectator && yourPlayerId && gameState.players[gameState.currentPlayerIndex].id === yourPlayerId

  // Game completed - show simplified results for mobile
  if (gameState.status === GameStatus.COMPLETED) {
    const winner = gameState.players.find((p) => p.id === gameState.winner)
    const youWon = !isSpectator && winner?.id === yourPlayerId
    const isTie = !winner || gameState.winner === undefined

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4 flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="text-6xl mb-4">
            {isTie ? '🤝' : (youWon ? '🏆' : '😔')}
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {isTie
              ? t('dialogs:gameOver.tie')
              : (youWon ? t('online:game.youWon') : t('online:game.wins', { name: winner?.name }))}
          </h1>
          <div className="flex gap-8 mt-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">{you.name}</p>
              <p className="text-3xl font-bold">{you.score}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">{opponent.name}</p>
              <p className="text-3xl font-bold">{opponent.score}</p>
            </div>
          </div>
          <button
            onClick={() => reset()}
            className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold"
          >
            {t('online:game.backToMenu')}
          </button>
        </div>
      </div>
    )
  }

  // Handle play word
  const handlePlayWord = () => {
    Logger.debug('[MobileOnlineGame] Play Word clicked, selectedTiles:', selectedTiles.length)
    if (selectedTiles.length === 0) return
    makeMove(selectedTiles)
  }

  // Handle skip
  const handleSkip = () => {
    skipTurn()
  }

  // Handle tile placement (from drag-and-drop or touch drag)
  const handleTilePlaced = (placedTile: PlacedTile) => {
    setSelectedTiles(prev => [...prev, placedTile])
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
          tile: { ...t.tile, jokerLetter: letter },
        }
      }
      return t
    }))
  }

  // Handle joker steal
  const handleJokerSteal = (row: number, col: number, replacementTileId: string) => {
    stealJoker(row, col, replacementTileId)
  }

  // Handle recall tiles
  const handleRecallTiles = () => {
    setSelectedTiles([])
  }

  // Handle tile reordering in rack
  const handleReorderTiles = (fromIndex: number, toIndex: number) => {
    const selectedTileIds = new Set(selectedTiles.map((st) => st.tile.id))
    const availableTiles = playerTileOrder.filter(
      (tile) => !selectedTileIds.has(tile.id)
    )

    if (fromIndex < 0 || fromIndex >= availableTiles.length ||
        toIndex < 0 || toIndex >= availableTiles.length) {
      return
    }

    const [movedTile] = availableTiles.splice(fromIndex, 1)
    availableTiles.splice(toIndex, 0, movedTile)

    const placedTiles = playerTileOrder.filter((tile) =>
      selectedTileIds.has(tile.id)
    )

    setPlayerTileOrder([...availableTiles, ...placedTiles])
  }

  // Touch drag: Handle drop on board
  const handleTouchDrop = (
    row: number,
    col: number,
    tile: TileType,
    tileIndex: number,
    fromBoard: boolean,
    fromRow: number | null,
    fromCol: number | null
  ) => {
    if (!isYourTurn) return

    // Special case: dropped outside board (row/col = -1) - return to rack
    if (row === -1 && col === -1) {
      if (fromBoard && fromRow !== null && fromCol !== null) {
        handleTileRemoved(fromRow, fromCol)
        Logger.debug('[MobileOnlineGame] Touch returned tile to rack from:', fromRow, fromCol)
      }
      return
    }

    // Check if square is empty (on the actual board state)
    const square = gameState.board[row]?.[col]
    if (square?.tile) return // Can't drop on committed tiles

    // Check if there's already a tile placed here (from selectedTiles)
    const alreadyPlaced = selectedTiles.find(st => st.row === row && st.col === col)
    if (alreadyPlaced) return

    // If moving from board to board
    if (fromBoard && fromRow !== null && fromCol !== null) {
      // Don't move to same position
      if (fromRow === row && fromCol === col) return

      // Remove from old position and place at new
      handleTileRemoved(fromRow, fromCol)
      handleTilePlaced({ tile, row, col })
      Logger.debug('[MobileOnlineGame] Touch moved tile from:', fromRow, fromCol, 'to:', row, col)
    } else {
      // Placing from rack
      handleTilePlaced({ tile, row, col })
      Logger.debug('[MobileOnlineGame] Touch dropped tile at:', row, col)
    }
  }

  // Touch drag: Handle touch start on a tile already on the board
  const handleBoardTileTouchStart = (e: React.TouchEvent, row: number, col: number) => {
    if (!isYourTurn) return

    // Find the tile in selectedTiles
    const placedTile = selectedTiles.find(st => st.row === row && st.col === col)
    if (!placedTile) return

    handleTouchStartFromBoard(e, placedTile.tile, row, col)
    Logger.debug('[MobileOnlineGame] Touch started on board tile at:', row, col)
  }

  // Get transform params for touch calculations
  const transformParams = { scale: zoomPan.scale, panX: zoomPan.panX, panY: zoomPan.panY }

  // Wrapper for touch move that handles dragging or panning
  const onTouchMove = (e: React.TouchEvent) => {
    if (dragState.isDragging) {
      handleTouchMove(e, boardRef as React.RefObject<HTMLElement>, transformParams)
    } else if (zoomPan.scale > 1 && zoomPan.isPanning) {
      handlePanMove(e)
    }
  }

  // Wrapper for touch end that handles dragging or panning
  const onTouchEnd = (e: React.TouchEvent) => {
    if (dragState.isDragging) {
      handleTouchEnd(e, handleTouchDrop, boardRef as React.RefObject<HTMLElement>, transformParams)
    } else if (zoomPan.isPanning) {
      handlePanEnd()
    }
  }

  // Handle touch start on board area (for panning when zoomed)
  const onBoardTouchStart = (e: React.TouchEvent) => {
    // Only start pan if zoomed and not starting on a tile
    if (zoomPan.scale > 1 && !dragState.isDragging) {
      const target = e.target as HTMLElement
      // Don't pan if touching a tile
      if (!target.closest('[data-tile]')) {
        handlePanStart(e)
      }
    }
  }

  return (
    <div
      className="min-h-screen bg-gray-100 flex flex-col touch-none"
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={handleTouchCancel}
    >
      {/* Score Header */}
      <MobileScoreHeader
        yourScore={you.score}
        yourName={you.name}
        opponentScore={opponent.score}
        opponentName={opponent.name}
        isYourTurn={!!isYourTurn}
      />

      {/* Error message */}
      {errorMessage && (
        <div className="bg-red-100 border-b border-red-200 px-4 py-2 text-center">
          <p className="text-red-600 text-sm">{errorMessage}</p>
        </div>
      )}

      {/* Board area - takes available space */}
      <div
        ref={boardRef}
        className="flex-1 flex flex-col items-center justify-center p-1 overflow-hidden min-h-0 relative"
        onTouchStart={onBoardTouchStart}
      >
        <div
          style={{
            transform: `translate(${zoomPan.panX}px, ${zoomPan.panY}px) scale(${zoomPan.scale})`,
            transformOrigin: '0 0',
            transition: zoomPan.isPanning ? 'none' : 'transform 0.3s ease-out',
            willChange: 'transform',
          }}
        >
          <Board
            boardState={gameState.board}
            playerTiles={you.tiles}
            selectedTiles={selectedTiles}
            onTilePlaced={handleTilePlaced}
            onTileRemoved={handleTileRemoved}
            onJokerLetterSet={handleJokerLetterSet}
            onJokerSteal={handleJokerSteal}
            gameState={gameState}
            disabled={!isYourTurn || isSpectator}
            hideLegend={true}
            compact={true}
            touchTargetSquare={dragState.isDragging && dragState.targetRow !== null ? { row: dragState.targetRow, col: dragState.targetCol! } : null}
            onBoardTileTouchStart={handleBoardTileTouchStart}
            draggingFromSquare={dragState.isDragging && dragState.fromBoard && dragState.fromRow !== null ? { row: dragState.fromRow, col: dragState.fromCol! } : null}
          />
        </div>

        {/* Reset zoom button */}
        {zoomPan.scale > 1 && (
          <button
            onClick={resetZoom}
            className="absolute bottom-2 right-2 bg-white/90 text-gray-700 px-3 py-1.5 rounded-lg shadow-md text-sm font-medium border border-gray-200 active:bg-gray-100"
          >
            {t('common:resetZoom', 'Reset')}
          </button>
        )}
      </div>

      {/* Tile Rack - compact mode for mobile with touch drag */}
      <div className="bg-white border-t border-gray-200 px-2 py-1">
        <TileRack
          tiles={playerTileOrder.length > 0 ? playerTileOrder : you.tiles}
          playerName={you.name}
          selectedTiles={selectedTiles}
          onTileRemoved={handleTileRemoved}
          onReorderTiles={handleReorderTiles}
          disabled={!isYourTurn || isSpectator}
          compact={true}
          onTouchDragStart={handleTouchStart}
          draggingTileId={dragState.tile?.id}
        />
      </div>

      {/* Action Bar */}
      <MobileActionBar
        isYourTurn={!!isYourTurn}
        canPlay={selectedTiles.length > 0}
        hasPlacedTiles={selectedTiles.length > 0}
        placementValidation={placementValidation}
        onRecall={handleRecallTiles}
        onPlay={handlePlayWord}
        onSkip={handleSkip}
      />

      {/* Touch drag overlay */}
      {dragState.isDragging && dragState.tile && (
        <DragOverlay
          tile={dragState.tile}
          x={dragState.currentX}
          y={dragState.currentY}
        />
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
