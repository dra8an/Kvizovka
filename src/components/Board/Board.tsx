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

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useGameStore } from '../../store/gameStore'
import { Square } from './Square'
import { BOARD_SIZE } from '../../constants'
import { JokerLetterDialog } from '../JokerLetterDialog/JokerLetterDialog'
import { Tile as TileType } from '../../types'

/**
 * Board Component
 *
 * Example usage:
 * ```tsx
 * <Board />
 * ```
 *
 * The board automatically subscribes to game store,
 * so it updates whenever the board state changes.
 */
export function Board() {
  const { t } = useTranslation(['game'])

  // Subscribe to game store
  const game = useGameStore((state) => state.game)
  const selectTile = useGameStore((state) => state.selectTile)
  const unselectTile = useGameStore((state) => state.unselectTile)
  const selectedTiles = useGameStore((state) => state.selectedTiles)
  const setJokerLetter = useGameStore((state) => state.setJokerLetter)
  const stealJoker = useGameStore((state) => state.stealJoker)
  const draggedTile = useGameStore((state) => state.draggedTile)
  const setDraggedTile = useGameStore((state) => state.setDraggedTile)
  const setHoveredSquare = useGameStore((state) => state.setHoveredSquare)
  const hoveredSquare = useGameStore((state) => state.hoveredSquare)

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
    tile: TileType | null
    jokerLetter: string
  }>({
    show: false,
    row: 0,
    col: 0,
    tile: null,
    jokerLetter: '',
  })

  // If no game, show placeholder
  if (!game) {
    return (
      <div className="flex items-center justify-center p-12 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
        <p className="text-gray-500 text-lg">No active game. Start a game to see the board!</p>
      </div>
    )
  }

  // Get board from game state
  const board = game.board

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
   * We track which square is being hovered for visual feedback on the dragged tile.
   */
  const handleDragOver = (row: number, col: number, event: React.DragEvent) => {
    // Update hovered square in store (TileRack will use this for visual feedback)
    setHoveredSquare({ row, col })
  }

  /**
   * Handle drop on square
   *
   * This is called when user drops a tile on a square.
   * We get the tile ID from drag data and call selectTile to add it to selectedTiles.
   * Also handles joker stealing when dropping a tile on a stealable joker.
   */
  const handleDrop = (row: number, col: number, event: React.DragEvent) => {
    // Clear hover state
    setHoveredSquare(null)

    // Get drag data
    const dragData = event.dataTransfer.getData('text/plain')
    if (!dragData) {
      console.error('No drag data')
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
        console.log(`Moved tile from ${fromRow},${fromCol} to ${row},${col}`)
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
    const currentPlayer = game.players[game.currentPlayerIndex]
    const tile = currentPlayer.tiles.find((t) => t.id === tileId)

    if (!tile) {
      console.error('Tile not found in player hand')
      return
    }

    // Check for joker stealing BEFORE checking if square is empty
    // A stealable joker means the square is NOT empty, but it's a valid action
    const square = board[row]?.[col]
    const stealableJoker = game.stealableJokers?.find(
      (j) => j.row === row && j.col === col
    )

    // Check if square has a tile and it's not a blocker
    const squareTile = square?.tile
    const isTileAJoker =
      squareTile && 'isJoker' in squareTile && squareTile.isJoker

    if (stealableJoker && isTileAJoker) {
      // Check if the tile being dropped matches the joker's assigned letter
      if (tile.letter === stealableJoker.assignedLetter) {
        // Show confirmation dialog for joker stealing
        console.log(`Detected joker stealing attempt at ${row},${col}`)
        setStealConfirmDialog({
          show: true,
          row: row,
          col: col,
          tile: tile,
          jokerLetter: stealableJoker.assignedLetter,
        })
        return
      } else {
        console.log(
          `Tile letter ${tile.letter} does not match joker letter ${stealableJoker.assignedLetter}`
        )
        return
      }
    }

    // Check if valid drop (normal tile placement)
    if (!isValidDropTarget(row, col)) {
      console.log('Invalid drop target')
      return
    }

    // Add tile to selectedTiles
    selectTile(tile, row, col)

    console.log(`Placed ${tile.isJoker ? 'Joker' : tile.letter} at ${row}, ${col}`)

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
    setDraggedTile(null)
  }

  /**
   * Handle joker letter selection
   */
  const handleJokerLetterSelected = (letter: string) => {
    if (jokerDialog.tile) {
      setJokerLetter(jokerDialog.row, jokerDialog.col, letter)
      console.log(`Joker at ${jokerDialog.row},${jokerDialog.col} set to ${letter}`)
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
      console.log(`Cancelled joker placement at ${jokerDialog.row},${jokerDialog.col}`)
    }

    // Close dialog
    setJokerDialog({ show: false, tile: null, row: 0, col: 0 })
  }

  /**
   * Handle joker steal confirmation
   */
  const handleStealConfirm = () => {
    if (stealConfirmDialog.tile) {
      const success = stealJoker(
        stealConfirmDialog.row,
        stealConfirmDialog.col,
        stealConfirmDialog.tile
      )

      if (success) {
        console.log(
          `Successfully stole joker at ${stealConfirmDialog.row},${stealConfirmDialog.col}`
        )
      } else {
        console.error('Failed to steal joker')
      }
    }

    // Close dialog
    setStealConfirmDialog({
      show: false,
      row: 0,
      col: 0,
      tile: null,
      jokerLetter: '',
    })
  }

  /**
   * Handle joker steal cancel
   */
  const handleStealCancel = () => {
    console.log('User cancelled joker stealing')

    // Close dialog
    setStealConfirmDialog({
      show: false,
      row: 0,
      col: 0,
      tile: null,
      jokerLetter: '',
    })
  }

  /**
   * Handle drag start from board square
   *
   * Called when user starts dragging a tile that's already on the board (selectedTiles).
   */
  const handleTileDragStart = (row: number, col: number) => {
    console.log(`Started dragging tile from board at ${row}, ${col}`)
  }

  /**
   * Get steal tooltip information
   */
  const getStealTooltip = (): { show: boolean; message: string; isValid: boolean } | null => {
    if (!draggedTile || !hoveredSquare || !game) {
      return null
    }

    // Check if hovering over a stealable joker
    const stealableJoker = game.stealableJokers?.find(
      (j) => j.row === hoveredSquare.row && j.col === hoveredSquare.col
    )

    if (!stealableJoker) {
      return null
    }

    // Check if letter matches
    const isValid = draggedTile.letter === stealableJoker.assignedLetter

    if (isValid) {
      return {
        show: true,
        message: `✓ Can steal joker (${stealableJoker.assignedLetter})`,
        isValid: true,
      }
    } else {
      return {
        show: true,
        message: `✗ Cannot steal - need ${stealableJoker.assignedLetter}, have ${draggedTile.letter}`,
        isValid: false,
      }
    }
  }

  const stealTooltip = getStealTooltip()

  /**
   * Render the board grid
   *
   * Creates a 17×17 CSS Grid with Square components.
   */
  return (
    <div className="flex flex-col items-center gap-2">
      {/* Board container */}
      <div className="bg-white p-2 lg:p-3 rounded-lg shadow-lg relative">
        {/* Joker steal tooltip - positioned over the board */}
        {stealTooltip && hoveredSquare && (
          <div
            className="absolute pointer-events-none z-50"
            style={{
              left: `calc(${((hoveredSquare.col + 0.5) / BOARD_SIZE) * 100}%)`,
              top: `calc(${((hoveredSquare.row + 0.5) / BOARD_SIZE) * 100}% - 80px)`,
              transform: 'translateX(-50%)',
            }}
          >
            <div
              className={`
                px-3 py-1.5 rounded-lg font-semibold text-xs shadow-xl
                backdrop-blur-sm border-2
                whitespace-nowrap
                ${
                  stealTooltip.isValid
                    ? 'bg-green-500/90 text-white border-green-300'
                    : 'bg-red-500/90 text-white border-red-300'
                }
              `}
            >
              {stealTooltip.message}
            </div>
          </div>
        )}

        {/* 17×17 CSS Grid */}
        <div
          className="grid gap-0.5 bg-gray-300 p-0.5 rounded"
          style={{
            gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
            gridTemplateRows: `repeat(${BOARD_SIZE}, 1fr)`,
            width: 'min(90vw, 70vh, 1400px)', // Max 1400px, 90% width or 70% height
            height: 'min(90vw, 70vh, 1400px)',
          }}
        >
          {/* Map each square */}
          {board.map((row, rowIndex) =>
            row.map((square, colIndex) => {
              // Check if this square has a tile being placed (from selectedTiles)
              const selectedTile = selectedTiles.find(
                (st) => st.row === rowIndex && st.col === colIndex
              )

              // Create a temporary square with selectedTile overlay if present
              const displaySquare = selectedTile
                ? { ...square, tile: selectedTile.tile }
                : square

              return (
                <Square
                  key={`${rowIndex}-${colIndex}`}
                  square={displaySquare}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  isValidDrop={false}
                  isDraggable={!!selectedTile}
                  onTileDragStart={handleTileDragStart}
                />
              )
            })
          )}
        </div>
      </div>

      {/* Board legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-premium-yellow rounded"></div>
          <span>{t('game:board.legend.doubleLetter')}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-premium-green rounded"></div>
          <span>{t('game:board.legend.tripleLetter')}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-premium-red rounded"></div>
          <span>{t('game:board.legend.quadrupleLetter')}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-premium-blue rounded"></div>
          <span>{t('game:board.legend.wordMultiplier')}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-yellow-400 rounded"></div>
          <span>{t('game:board.legend.center')}</span>
        </div>
      </div>

      {/* Joker letter selection dialog */}
      {jokerDialog.show && (
        <JokerLetterDialog
          onSelect={handleJokerLetterSelected}
          onCancel={handleJokerDialogCancel}
        />
      )}

      {/* Joker stealing confirmation dialog */}
      {stealConfirmDialog.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
            <h3 className="text-xl font-bold mb-4">Steal Joker?</h3>
            <p className="mb-4">
              Do you want to steal the joker (
              <span className="font-bold text-blue-600">{stealConfirmDialog.jokerLetter}</span>)
              from the board?
            </p>
            <p className="text-sm text-gray-600 mb-6">
              You will replace it with your{' '}
              <span className="font-bold">{stealConfirmDialog.tile?.letter}</span> tile and receive
              the joker in your hand.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleStealCancel}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors"
              >
                No, Cancel
              </button>
              <button
                onClick={handleStealConfirm}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Yes, Steal Joker
              </button>
            </div>
          </div>
        </div>
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
