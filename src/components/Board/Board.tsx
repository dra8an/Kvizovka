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
  // Subscribe to game store
  const game = useGameStore((state) => state.game)
  const selectTile = useGameStore((state) => state.selectTile)
  const unselectTile = useGameStore((state) => state.unselectTile)
  const selectedTiles = useGameStore((state) => state.selectedTiles)
  const setJokerLetter = useGameStore((state) => state.setJokerLetter)

  // Local state for drag-and-drop
  const [draggedTileId, setDraggedTileId] = useState<string | null>(null)
  const [hoveredSquare, setHoveredSquare] = useState<{ row: number; col: number } | null>(
    null
  )

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
   * We track which square is being hovered for visual feedback.
   */
  const handleDragOver = (row: number, col: number) => {
    setHoveredSquare({ row, col })
  }

  /**
   * Handle drop on square
   *
   * This is called when user drops a tile on a square.
   * We get the tile ID from drag data and call selectTile to add it to selectedTiles.
   */
  const handleDrop = (row: number, col: number, event: React.DragEvent) => {
    // Clear hover state
    setHoveredSquare(null)

    // Check if valid drop
    if (!isValidDropTarget(row, col)) {
      console.log('Invalid drop target')
      return
    }

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
    setDraggedTileId(null)
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
   * Handle drag start from board square
   *
   * Called when user starts dragging a tile that's already on the board (selectedTiles).
   */
  const handleTileDragStart = (row: number, col: number) => {
    console.log(`Started dragging tile from board at ${row}, ${col}`)
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

              return (
                <Square
                  key={`${rowIndex}-${colIndex}`}
                  square={displaySquare}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  isValidDrop={isHovered && isValidDropTarget(rowIndex, colIndex)}
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
          <span>2L - Double Letter</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-premium-green rounded"></div>
          <span>3L - Triple Letter</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-premium-red rounded"></div>
          <span>4L - Quadruple Letter</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-premium-blue rounded"></div>
          <span>X - Word Multiplier</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-yellow-400 rounded"></div>
          <span>★ - Center (Start)</span>
        </div>
      </div>

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
