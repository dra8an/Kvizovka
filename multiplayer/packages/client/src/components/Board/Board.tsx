/**
 * Board Component
 *
 * The main game board - a 17×17 grid of squares.
 *
 * Features:
 * - Displays all 289 squares (17×17)
 * - Shows premium fields with colors
 * - Displays placed tiles
 * - Handles drag-and-drop for tile placement
 * - Subscribes to game store for board state
 *
 * This is the central UI component of Kvizovka!
 */

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useGameStore } from '../../store/gameStore'
import { Square } from './Square'
import { BOARD_SIZE, Tile as TileType, BoardType, PlacedTile, TilePlacementState, MoveValidator, Board as BoardEngine, MoveValidationResult, Logger } from '@kvizovka/shared'
import { JokerLetterDialog } from '../JokerLetterDialog/JokerLetterDialog'

/**
 * Board Component Props (for online mode)
 */
interface BoardProps {
  /**
   * Board state (optional - uses gameStore if not provided)
   */
  boardState?: BoardType

  /**
   * Current player's tiles (optional - uses gameStore if not provided)
   */
  playerTiles?: TileType[]

  /**
   * Currently selected/placed tiles (optional - uses gameStore if not provided)
   */
  selectedTiles?: PlacedTile[]

  /**
   * Callback when tile is placed (optional - uses gameStore if not provided)
   */
  onTilePlaced?: (placedTile: PlacedTile) => void

  /**
   * Callback when tile is removed (optional - uses gameStore if not provided)
   */
  onTileRemoved?: (row: number, col: number) => void

  /**
   * Callback when joker letter is set (optional - uses gameStore if not provided)
   */
  onJokerLetterSet?: (row: number, col: number, letter: string) => void

  /**
   * Callback when joker is stolen (optional - uses gameStore if not provided)
   */
  onJokerSteal?: (row: number, col: number, replacementTileId: string) => void

  /**
   * Game state (optional - uses gameStore if not provided)
   * Needed for checking stealable jokers
   */
  gameState?: any

  /**
   * Currently dragged tile (for joker stealing tooltip)
   */
  draggedTile?: TileType | null

  /**
   * Disabled state (for online mode when not your turn)
   */
  disabled?: boolean

  /**
   * Callback when a square is clicked (for mobile click-to-place mode)
   */
  onSquareClick?: (row: number, col: number) => void

  /**
   * Currently selected tile for placement (mobile click-to-place mode)
   * Used for visual feedback on valid drop targets
   */
  selectedTileForPlacement?: TileType | null

  /**
   * Hide the board legend (for mobile to save space)
   */
  hideLegend?: boolean

  /**
   * Compact mode for mobile - smaller squares and tiles
   */
  compact?: boolean

  /**
   * Touch drag target square (for mobile visual feedback)
   */
  touchTargetSquare?: { row: number; col: number } | null

  /**
   * Called when touch drag starts on a tile already on the board (for mobile)
   */
  onBoardTileTouchStart?: (e: React.TouchEvent, row: number, col: number) => void

  /**
   * Position of tile currently being dragged from board (to fade it)
   */
  draggingFromSquare?: { row: number; col: number } | null
}

/**
 * Board Component
 *
 * Supports two modes:
 * 1. Local mode (no props): Uses gameStore
 * 2. Online mode (with props): Uses props and callbacks
 *
 * Example usage:
 * ```tsx
 * // Local mode
 * <Board />
 *
 * // Online mode
 * <Board
 *   boardState={gameState.board}
 *   playerTiles={you.tiles}
 *   selectedTiles={localSelectedTiles}
 *   onTilePlaced={(tile) => setLocalSelectedTiles([...localSelectedTiles, tile])}
 *   onTileRemoved={(row, col) => ...}
 *   disabled={!isYourTurn}
 * />
 * ```
 */
export function Board(props: BoardProps = {}) {
  const { t } = useTranslation('game')

  // Subscribe to game store (for local mode)
  const storeGame = useGameStore((state) => state.game)
  const storeSelectTile = useGameStore((state) => state.selectTile)
  const storeUnselectTile = useGameStore((state) => state.unselectTile)
  const storeSelectedTiles = useGameStore((state) => state.selectedTiles)
  const storeSetJokerLetter = useGameStore((state) => state.setJokerLetter)
  const storePlacementValidation = useGameStore((state) => state.placementValidation)
  const storeValidateCurrentPlacement = useGameStore((state) => state.validateCurrentPlacement)
  const storeBoardInstance = useGameStore((state) => state.boardInstance)

  // Determine which data source to use (props or store)
  const isOnlineMode = !!props.boardState
  const game = storeGame
  const board = props.boardState || game?.board
  const playerTiles = props.playerTiles || game?.players[game?.currentPlayerIndex || 0]?.tiles || []
  const selectedTiles = props.selectedTiles !== undefined ? props.selectedTiles : storeSelectedTiles
  const disabled = props.disabled || false

  // Actions (use callbacks if provided, otherwise use store)
  const selectTile = (tile: TileType, row: number, col: number) => {
    if (disabled) return
    if (props.onTilePlaced) {
      props.onTilePlaced({ tile, row, col })
    } else {
      storeSelectTile(tile, row, col)
    }
  }

  const unselectTile = (row: number, col: number) => {
    if (disabled) return
    if (props.onTileRemoved) {
      props.onTileRemoved(row, col)
    } else {
      storeUnselectTile(row, col)
    }
  }

  const setJokerLetter = (row: number, col: number, letter: string) => {
    if (disabled) return
    if (props.onJokerLetterSet) {
      props.onJokerLetterSet(row, col, letter)
    } else {
      storeSetJokerLetter(row, col, letter)
    }
  }

  // Local state for drag-and-drop
  const [draggedTileId, setDraggedTileId] = useState<string | null>(null)
  const [hoveredSquare, setHoveredSquare] = useState<{ row: number; col: number } | null>(
    null
  )

  // Use dragged tile from props (online mode) or local state (local mode)
  const currentDraggedTile = props.draggedTile !== undefined ? props.draggedTile : null

  // Local state for joker letter selection
  const [jokerDialog, setJokerDialog] = useState<{
    show: boolean
    tile: TileType | null
    row: number
    col: number
  }>({
    show: false,
    tile: null,
    row: 0,
    col: 0,
  })

  // Local state for joker stealing confirmation
  const [stealConfirmDialog, setStealConfirmDialog] = useState<{
    show: boolean
    row: number
    col: number
    replacementTile: TileType | null
  }>({
    show: false,
    row: 0,
    col: 0,
    replacementTile: null,
  })

  // Local state for online mode validation
  const [onlinePlacementValidation, setOnlinePlacementValidation] = useState<MoveValidationResult | null>(null)

  // Run validation for online mode when selectedTiles changes
  useEffect(() => {
    if (isOnlineMode && props.boardState) {
      if (selectedTiles.length === 0) {
        setOnlinePlacementValidation(null)
        return
      }

      // Create a temporary board instance for validation
      const tempBoard = new BoardEngine()
      tempBoard.initialize()

      // Copy the current board state
      const currentBoard = props.boardState
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
      setOnlinePlacementValidation(result)
    }
  }, [isOnlineMode, selectedTiles, props.boardState])

  // Determine which validation to use
  const placementValidation = isOnlineMode ? onlinePlacementValidation : storePlacementValidation

  // If no board, show placeholder
  if (!board) {
    return (
      <div className="flex items-center justify-center p-12 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
        <p className="text-gray-500 text-lg">No active game. Start a game to see the board!</p>
      </div>
    )
  }

  /**
   * Check if a square is a valid drop target
   *
   * Rules:
   * - Square must be empty (no tile)
   * - Must not be a blocker tile
   */
  const isValidDropTarget = (row: number, col: number): boolean => {
    const square = board[row]?.[col]
    if (!square) return false

    // Square must be empty
    if (square.tile) return false

    return true
  }

  /**
   * Handle drag over square
   *
   * This is called when user drags a tile over a square.
   * We track which square is being hovered for visual feedback.
   */
  const handleDragOver = (row: number, col: number, event: React.DragEvent) => {
    setHoveredSquare({ row, col })
  }

  /**
   * Handle drop on square
   *
   * This is called when user drops a tile on a square.
   * We get the tile ID from drag data and call selectTile to add it to selectedTiles.
   */
  const handleDrop = (row: number, col: number, event: React.DragEvent) => {
    // Don't allow drops if disabled
    if (disabled) return

    // Clear hover state
    setHoveredSquare(null)

    // Get drag data
    const dragData = event.dataTransfer.getData('text/plain')
    if (!dragData) {
      Logger.error('No drag data')
      return
    }

    // Check if dragging from board (format: "square:row:col")
    if (dragData.startsWith('square:')) {
      const [, fromRowStr, fromColStr] = dragData.split(':')
      const fromRow = parseInt(fromRowStr)
      const fromCol = parseInt(fromColStr)

      // Remove from old position, add to new position
      const tileAtOldPos = selectedTiles.find(
        (st) => st.row === fromRow && st.col === fromCol
      )

      if (tileAtOldPos) {
        unselectTile(fromRow, fromCol)
        selectTile(tileAtOldPos.tile, row, col)
        Logger.debug(`Moved tile from ${fromRow},${fromCol} to ${row},${col}`)
      }
      return
    }

    // Extract tile ID from drag data
    // Format can be either:
    // - "rack-tile:{index}:{tileId}" (dragging from rack)
    // - "{tileId}" (direct tile ID)
    let tileId: string
    if (dragData.startsWith('rack-tile:')) {
      // Extract tileId from "rack-tile:{index}:{tileId}"
      const parts = dragData.split(':')
      tileId = parts[2]
    } else {
      // Direct tile ID
      tileId = dragData
    }

    // Find the tile in current player's hand
    const tile = playerTiles.find((t) => t.id === tileId)

    if (!tile) {
      Logger.error('Tile not found in player hand')
      return
    }

    // Check if trying to steal a joker
    const currentGame = props.gameState || storeGame
    if (currentGame?.stealableJokers && currentGame.stealableJokers.length > 0) {
      const stealableJoker = currentGame.stealableJokers.find(
        (j: any) => j.row === row && j.col === col
      )

      if (stealableJoker) {
        // Attempting to steal a joker - check if tile matches
        if (tile.letter === stealableJoker.assignedLetter) {
          // Valid steal - show confirmation dialog
          setStealConfirmDialog({
            show: true,
            row,
            col,
            replacementTile: tile,
          })
          return
        } else {
          // Invalid steal - tile doesn't match
          Logger.debug(`Cannot steal joker: need ${stealableJoker.assignedLetter}, have ${tile.letter}`)
          return
        }
      }
    }

    // Check if valid drop for regular placement
    if (!isValidDropTarget(row, col)) {
      Logger.debug('Invalid drop target')
      return
    }

    // Add tile to selectedTiles
    selectTile(tile, row, col)

    Logger.debug(`Placed ${tile.isJoker ? 'Joker' : tile.letter} at ${row}, ${col}`)

    // If joker, show letter selection dialog
    if (tile.isJoker) {
      setJokerDialog({
        show: true,
        tile: tile,
        row: row,
        col: col,
      })
    }

    // Clear dragged tile
    setDraggedTileId(null)
  }

  /**
   * Handle joker letter selection
   */
  const handleJokerLetterSelected = (letter: string) => {
    if (jokerDialog.tile) {
      setJokerLetter(jokerDialog.row, jokerDialog.col, letter)
      Logger.debug(`Joker at ${jokerDialog.row},${jokerDialog.col} set to ${letter}`)
    }

    // Close dialog
    setJokerDialog({ show: false, tile: null, row: 0, col: 0 })
  }

  /**
   * Handle joker dialog cancel
   */
  const handleJokerDialogCancel = () => {
    // Remove the joker from board
    if (jokerDialog.tile) {
      unselectTile(jokerDialog.row, jokerDialog.col)
      Logger.debug(`Cancelled joker placement at ${jokerDialog.row},${jokerDialog.col}`)
    }

    // Close dialog
    setJokerDialog({ show: false, tile: null, row: 0, col: 0 })
  }

  /**
   * Handle steal confirmation
   */
  const handleStealConfirm = () => {
    const { row, col, replacementTile } = stealConfirmDialog

    if (replacementTile) {
      if (props.onJokerSteal) {
        // Online mode - call callback
        props.onJokerSteal(row, col, replacementTile.id)
      } else {
        // Local mode - call store
        // Note: stealJoker should be added to gameStore for local mode
        // For now, this will only work in online mode
        Logger.warn('Joker stealing in local mode not yet implemented in multiplayer client')
      }
    }

    // Close dialog
    setStealConfirmDialog({ show: false, row: 0, col: 0, replacementTile: null })
  }

  /**
   * Handle steal cancel
   */
  const handleStealCancel = () => {
    setStealConfirmDialog({ show: false, row: 0, col: 0, replacementTile: null })
  }

  /**
   * Get tooltip for joker stealing
   */
  const getStealTooltip = (): { show: boolean; message: string; isValid: boolean } | null => {
    if (!currentDraggedTile || !hoveredSquare) return null

    const currentGame = props.gameState || storeGame
    if (!currentGame?.stealableJokers) return null

    const stealableJoker = currentGame.stealableJokers.find(
      (j: any) => j.row === hoveredSquare.row && j.col === hoveredSquare.col
    )

    if (!stealableJoker) return null

    const isValid = currentDraggedTile.letter === stealableJoker.assignedLetter

    if (isValid) {
      return { show: true, message: `✓ Can steal joker (${stealableJoker.assignedLetter})`, isValid: true }
    } else {
      return { show: true, message: `✗ Cannot steal - need ${stealableJoker.assignedLetter}, have ${currentDraggedTile.letter}`, isValid: false }
    }
  }

  /**
   * Handle drag start from board square
   *
   * Called when user starts dragging a tile that's already on the board (selectedTiles).
   */
  const handleTileDragStart = (row: number, col: number) => {
    Logger.debug(`Started dragging tile from board at ${row}, ${col}`)
  }

  /**
   * Get tile placement state for real-time visual feedback
   *
   * Returns the visual state for a selected tile based on validation.
   */
  const getTileState = (row: number, col: number): TilePlacementState => {
    const selectedTile = selectedTiles.find((st) => st.row === row && st.col === col)
    if (!selectedTile) return TilePlacementState.NEUTRAL

    if (!placementValidation) return TilePlacementState.NEUTRAL

    if (placementValidation.isValid) {
      return TilePlacementState.VALID_WORD
    }

    return TilePlacementState.INVALID
  }

  /**
   * Get highlighted line (row or column) for direction indicator
   *
   * Returns the row or column that should be highlighted based on placement direction.
   */
  const getHighlightedLine = ():
    | { type: 'row' | 'col'; index: number }
    | null => {
    if (selectedTiles.length < 2 || !placementValidation?.direction) return null

    const firstTile = selectedTiles[0]

    return {
      type: placementValidation.direction === 'HORIZONTAL' ? 'row' : 'col',
      index:
        placementValidation.direction === 'HORIZONTAL'
          ? firstTile.row
          : firstTile.col,
    }
  }

  /**
   * Check if a square is in the highlighted line
   *
   * Used to apply cyan background to row/column being filled.
   */
  const isInHighlightedLine = (row: number, col: number): boolean => {
    const highlight = getHighlightedLine()
    if (!highlight) return false

    return highlight.type === 'row' ? highlight.index === row : highlight.index === col
  }

  /**
   * Render the board grid
   *
   * Creates a 17×17 CSS Grid with Square components.
   */
  return (
    <div className="flex flex-col items-center gap-2">
      {/* Board container */}
      <div className="bg-white p-2 lg:p-3 rounded-lg shadow-lg">
        {/* 17×17 CSS Grid */}
        <div
          className={`grid ${props.compact ? 'gap-[1px]' : 'gap-0.5'} bg-gray-300 p-0.5 rounded`}
          style={{
            gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
            gridTemplateRows: `repeat(${BOARD_SIZE}, 1fr)`,
            // Mobile: use almost full width, Desktop: constrained by height
            width: props.compact ? 'min(96vw, 96vw)' : 'min(90vw, 70vh, 1400px)',
            height: props.compact ? 'min(96vw, 96vw)' : 'min(90vw, 70vh, 1400px)',
          }}
        >
          {/* Map each square */}
          {board.map((row, rowIndex) =>
            row.map((square, colIndex) => {
              // Check if this square is being hovered during drag
              const isHovered =
                hoveredSquare?.row === rowIndex && hoveredSquare?.col === colIndex

              // Check if this square has a tile being placed (from selectedTiles)
              const selectedTile = selectedTiles.find(
                (st) => st.row === rowIndex && st.col === colIndex
              )

              // Create a temporary square with selectedTile overlay if present
              const displaySquare = selectedTile
                ? { ...square, tile: selectedTile.tile }
                : square

              // Determine if this square should show a preview tile
              const shouldShowPreview =
                currentDraggedTile &&
                hoveredSquare &&
                hoveredSquare.row === rowIndex &&
                hoveredSquare.col === colIndex &&
                !displaySquare.tile // Only show preview on empty squares

              // Determine if this square is a valid click target (for click-to-place mode)
              const isClickTarget = !!props.selectedTileForPlacement && !displaySquare.tile

              // Determine if this square is the current touch drag target
              const isTouchTarget = props.touchTargetSquare?.row === rowIndex && props.touchTargetSquare?.col === colIndex

              // Determine if a tile is being dragged from this square
              const isDraggingFromHere = props.draggingFromSquare?.row === rowIndex && props.draggingFromSquare?.col === colIndex

              return (
                <Square
                  key={`${rowIndex}-${colIndex}`}
                  square={displaySquare}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  isValidDrop={isHovered && isValidDropTarget(rowIndex, colIndex)}
                  isDraggable={!!selectedTile}
                  onTileDragStart={handleTileDragStart}
                  placementState={getTileState(rowIndex, colIndex)}
                  isHighlightedLine={isInHighlightedLine(rowIndex, colIndex)}
                  previewTile={shouldShowPreview ? currentDraggedTile : null}
                  onClick={props.onSquareClick ? (row, col) => props.onSquareClick!(row, col) : undefined}
                  isClickTarget={isClickTarget}
                  compact={props.compact}
                  isTouchTarget={isTouchTarget}
                  onTileTouchStart={props.onBoardTileTouchStart}
                  isDraggingFromHere={isDraggingFromHere}
                />
              )
            })
          )}
        </div>
      </div>

      {/* Board legend (hidden on mobile) */}
      {!props.hideLegend && (
        <div className="flex flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-premium-yellow rounded"></div>
            <span>{t('board.legend.doubleLetter')}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-premium-green rounded"></div>
            <span>{t('board.legend.tripleLetter')}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-premium-red rounded"></div>
            <span>{t('board.legend.quadrupleLetter')}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-premium-blue rounded"></div>
            <span>{t('board.legend.wordMultiplier')}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-yellow-400 rounded"></div>
            <span>{t('board.legend.center')}</span>
          </div>
        </div>
      )}

      {/* Tooltip for joker stealing */}
      {(() => {
        const stealTooltip = getStealTooltip()
        return stealTooltip && hoveredSquare && (
          <div
            className="absolute pointer-events-none z-50"
            style={{
              left: `calc(${((hoveredSquare.col + 0.5) / BOARD_SIZE) * 100}%)`,
              top: `calc(${((hoveredSquare.row + 0.5) / BOARD_SIZE) * 100}% - 80px)`,
              transform: 'translateX(-50%)',
            }}
          >
            <div className={`px-3 py-1.5 rounded-lg font-semibold text-xs shadow-xl backdrop-blur-sm border-2 whitespace-nowrap ${
              stealTooltip.isValid
                ? 'bg-green-500/90 text-white border-green-300'
                : 'bg-red-500/90 text-white border-red-300'
            }`}>
              {stealTooltip.message}
            </div>
          </div>
        )
      })()}

      {/* Steal confirmation dialog */}
      {stealConfirmDialog.show && stealConfirmDialog.replacementTile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Steal Joker?</h3>
            <p className="text-gray-700 mb-4">
              Do you want to steal the joker at position ({stealConfirmDialog.row}, {stealConfirmDialog.col})
              by replacing it with your <span className="font-bold">{stealConfirmDialog.replacementTile.letter}</span> tile?
            </p>
            <p className="text-sm text-gray-600 mb-6">
              You will receive the joker back into your hand (with no assigned letter).
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleStealConfirm}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded"
              >
                Yes, Steal Joker
              </button>
              <button
                onClick={handleStealCancel}
                className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Joker letter selection dialog */}
      {jokerDialog.show && (
        <JokerLetterDialog
          onSelect={handleJokerLetterSelected}
          onCancel={handleJokerDialogCancel}
        />
      )}
    </div>
  )
}

/**
 * Key Concepts Explained:
 *
 * 1. **CSS Grid Layout**
 *    - We use `display: grid` to create a 17×17 grid
 *    - `gridTemplateColumns: repeat(17, 1fr)` creates 17 equal columns
 *    - Each square automatically fills its grid cell
 *
 * 2. **Responsive Sizing**
 *    - `width: min(85vw, 85vh)` makes board fit screen
 *    - Uses 85% of viewport width OR height (whichever is smaller)
 *    - Board stays square on all screen sizes
 *
 * 3. **Zustand Subscriptions**
 *    - `useGameStore((state) => state.game)` subscribes to game state
 *    - Component re-renders ONLY when game.board changes
 *    - Efficient: doesn't re-render on other state changes
 *
 * 4. **Drag-and-Drop Flow** (to be completed with TileRack)
 *    - User drags tile from rack → onDragStart in TileRack
 *    - User drags over square → onDragOver in Board
 *    - User drops tile → onDrop in Board → selectTile() in store
 *
 * 5. **Optional Chaining** (?.)
 *    - `board[row]?.[col]` safely accesses nested arrays
 *    - Returns undefined if row or col doesn't exist
 *    - Prevents "Cannot read property of undefined" errors
 *
 * 6. **Array.map() for Rendering**
 *    - `board.map((row) => row.map((square) => ...))` creates nested loops
 *    - Outer map: rows, Inner map: columns
 *    - Each square gets unique key: `${rowIndex}-${colIndex}`
 */
