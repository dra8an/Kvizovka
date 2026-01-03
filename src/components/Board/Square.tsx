/**
 * Square Component
 *
 * Represents a single square on the Kvizovka board.
 *
 * Features:
 * - Displays premium field colors and icons
 * - Shows tile if placed (letter + value)
 * - Shows blocker tiles (black squares)
 * - Handles drop events for drag-and-drop
 * - Visual feedback for valid/invalid drops
 *
 * Premium field colors (matching Tailwind classes):
 * - Double Letter (2x): Yellow (bg-premium-yellow)
 * - Triple Letter (3x): Green (bg-premium-green)
 * - Quadruple Letter (4x): Red (bg-premium-red)
 * - Word Multiplier (X): Blue (bg-premium-blue)
 * - Center: Gold (bg-yellow-400)
 */

import { BoardSquare } from '../../types'

/**
 * Props for Square component
 */
interface SquareProps {
  /**
   * The square data (position, tile, premium field)
   */
  square: BoardSquare

  /**
   * Called when user drops a tile on this square
   */
  onDrop?: (row: number, col: number, event: React.DragEvent) => void

  /**
   * Called when user drags over this square
   */
  onDragOver?: (row: number, col: number) => void

  /**
   * Whether this square is a valid drop target
   */
  isValidDrop?: boolean

  /**
   * Whether the tile on this square is draggable (for selectedTiles)
   */
  isDraggable?: boolean

  /**
   * Called when user starts dragging a tile from this square
   */
  onTileDragStart?: (row: number, col: number) => void
}

/**
 * Square Component
 *
 * Example usage:
 * ```tsx
 * <Square
 *   square={boardSquare}
 *   onDrop={(row, col) => handleDrop(row, col)}
 *   isValidDrop={true}
 * />
 * ```
 */
export function Square({ square, onDrop, onDragOver, isValidDrop, isDraggable, onTileDragStart }: SquareProps) {
  // Get premium field class based on type
  const getPremiumClass = (): string => {
    if (!square.premiumField) {
      return 'bg-gray-100' // Normal square
    }

    // Don't show premium color if field has been used
    if (square.isUsed) {
      return 'bg-gray-100'
    }

    switch (square.premiumField) {
      case 'DOUBLE_LETTER':
        return 'bg-premium-yellow' // Yellow
      case 'TRIPLE_LETTER':
        return 'bg-premium-green text-white' // Green
      case 'QUADRUPLE_LETTER':
        return 'bg-premium-red text-white' // Red
      case 'WORD_MULTIPLIER':
        return 'bg-premium-blue text-white' // Blue
      case 'CENTER':
        return 'bg-yellow-400' // Gold/star
      default:
        return 'bg-gray-100'
    }
  }

  // Get premium field label
  const getPremiumLabel = (): string => {
    if (!square.premiumField || square.isUsed) {
      return ''
    }

    switch (square.premiumField) {
      case 'DOUBLE_LETTER':
        return '2L'
      case 'TRIPLE_LETTER':
        return '3L'
      case 'QUADRUPLE_LETTER':
        return '4L'
      case 'WORD_MULTIPLIER':
        return 'X'
      case 'CENTER':
        return '★'
      default:
        return ''
    }
  }

  // Handle drag over (for drop zone highlighting)
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault() // Allow drop
    onDragOver?.(square.row, square.col)
  }

  // Handle drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    onDrop?.(square.row, square.col, e)
  }

  // Get tile display
  const renderTile = () => {
    const tile = square.tile

    if (!tile) {
      return null // Empty square
    }

    // Check if blocker tile
    if ('type' in tile && tile.type === 'BLOCKER') {
      return (
        <div className="absolute inset-0 bg-gray-800 rounded-sm">
          {/* Blocker tile - solid black */}
        </div>
      )
    }

    // Regular tile or joker
    let letter = ''
    let value = 0
    let isJoker = false

    if ('letter' in tile) {
      // Check if joker
      if ('isJoker' in tile && tile.isJoker) {
        letter = tile.jokerLetter || ''  // Show chosen letter or empty
        value = 0 // Jokers have 0 value
        isJoker = true
      } else {
        letter = tile.letter
        value = tile.value
      }
    }

    // Handle drag start for tile
    const handleTileDragStart = (e: React.DragEvent) => {
      if (!isDraggable) {
        e.preventDefault()
        return
      }

      // Store square position in drag data (so we can remove from selectedTiles)
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('text/plain', `square:${square.row}:${square.col}`)

      onTileDragStart?.(square.row, square.col)
    }

    return (
      <div
        draggable={isDraggable}
        onDragStart={handleTileDragStart}
        className={`absolute inset-1 rounded shadow-md flex flex-col items-center justify-center border-2 ${
          isJoker
            ? 'bg-purple-100 border-purple-400'  // Purple for jokers
            : 'bg-amber-100 border-amber-300'    // Amber for regular tiles
        } ${
          isDraggable ? 'cursor-grab active:cursor-grabbing' : ''
        }`}
      >
        {/* Joker icon (top-left corner) */}
        {isJoker && (
          <div className="absolute top-0 left-0.5 text-xs">🃏</div>
        )}

        {/* Letter */}
        <div className={`text-xl font-bold ${isJoker ? 'text-purple-900' : 'text-gray-900'}`}>
          {letter || '?'}
        </div>

        {/* Value (bottom-right corner) */}
        <div className={`absolute bottom-0.5 right-1 text-xs font-semibold ${isJoker ? 'text-purple-700' : 'text-gray-600'}`}>
          {value}
        </div>
      </div>
    )
  }

  return (
    <div
      className={`
        relative w-full h-full border border-gray-300
        ${getPremiumClass()}
        ${isValidDrop ? 'ring-2 ring-green-500 ring-inset' : ''}
        transition-all
      `}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Premium field label (when no tile placed) */}
      {!square.tile && (
        <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold">
          {getPremiumLabel()}
        </div>
      )}

      {/* Tile (if placed) */}
      {renderTile()}

      {/* Coordinates (for debugging - can be removed later) */}
      {/* <div className="absolute top-0 left-0 text-[6px] text-gray-400">
        {square.row},{square.col}
      </div> */}
    </div>
  )
}
