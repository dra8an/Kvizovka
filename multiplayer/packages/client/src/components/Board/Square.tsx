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

import { useTranslation } from 'react-i18next'
import { BoardSquare, TilePlacementState, Tile } from '@kvizovka/shared'
import { latinToCyrillic } from '../../utils/letterMapping'

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
  onDragOver?: (row: number, col: number, event: React.DragEvent) => void

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

  /**
   * Placement state for real-time visual feedback
   * Used to show green/amber/gray tiles as player places them
   */
  placementState?: TilePlacementState

  /**
   * Whether this square is in the highlighted row/column
   * Used to show direction indicator when 2+ tiles are placed
   */
  isHighlightedLine?: boolean

  /**
   * Preview tile to show when dragging over this square
   * Shows a semi-transparent preview of where the tile will land
   */
  previewTile?: Tile | null
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
export function Square({
  square,
  onDrop,
  onDragOver,
  isValidDrop,
  isDraggable,
  onTileDragStart,
  placementState = TilePlacementState.NEUTRAL,
  isHighlightedLine = false,
  previewTile = null
}: SquareProps) {
  const { i18n } = useTranslation()

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

  /**
   * Get tile background and border classes based on placement state
   * Provides real-time visual feedback for tile placement
   */
  const getTileStateClass = (isJoker: boolean): string => {
    // For committed tiles (not being placed), use default colors
    if (placementState === TilePlacementState.NEUTRAL) {
      return isJoker
        ? 'bg-purple-100 border-purple-400'
        : 'bg-amber-100 border-amber-300'
    }

    // Real-time feedback for tiles being placed
    switch (placementState) {
      case TilePlacementState.VALID_WORD:
        // Green - forms a valid word (≥4 letters)
        return 'bg-green-100 border-green-500 border-2'

      case TilePlacementState.VALID_PLACEMENT:
        // Amber - correct placement but word incomplete
        return 'bg-amber-100 border-amber-500 border-2'

      case TilePlacementState.INVALID:
        // Gray - placement violates rules
        return 'bg-gray-400 border-gray-500 opacity-60'

      default:
        return isJoker
          ? 'bg-purple-100 border-purple-400'
          : 'bg-amber-100 border-amber-300'
    }
  }

  // Handle drag over (for drop zone highlighting)
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault() // Allow drop
    onDragOver?.(square.row, square.col, e)
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
        const jokerLetter = tile.jokerLetter || ''
        // Convert joker letter to Cyrillic if Serbian
        letter = jokerLetter ? latinToCyrillic(jokerLetter, i18n.language) : ''
        value = 0 // Jokers have 0 value
        isJoker = true
      } else {
        // Convert to Cyrillic if Serbian language
        letter = latinToCyrillic(tile.letter, i18n.language)
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
        className={`absolute inset-1 rounded shadow-md flex flex-col items-center justify-center border-2 transition-all duration-200 ${
          getTileStateClass(isJoker)
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

        {/* Value (bottom-right corner) - smaller and more in corner */}
        <div className={`absolute bottom-0 right-0.5 text-[9px] font-semibold ${isJoker ? 'text-purple-700' : 'text-gray-600'}`}>
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
        ${isHighlightedLine ? 'bg-cyan-50' : ''}
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

      {/* Preview tile (when dragging over) */}
      {previewTile && !square.tile && (
        <div className="absolute inset-1 rounded shadow-md flex flex-col items-center justify-center border-2 border-dashed border-blue-400 bg-blue-50 opacity-60 pointer-events-none transition-all duration-100">
          {/* Joker icon (top-left corner) */}
          {previewTile.isJoker && (
            <div className="absolute top-0 left-0.5 text-xs">🃏</div>
          )}

          {/* Letter */}
          <div className={`text-xl font-bold ${previewTile.isJoker ? 'text-purple-900' : 'text-gray-900'}`}>
            {previewTile.isJoker
              ? (previewTile.jokerLetter ? latinToCyrillic(previewTile.jokerLetter, i18n.language) : '?')
              : latinToCyrillic(previewTile.letter, i18n.language)
            }
          </div>

          {/* Value (bottom-right corner) */}
          <div className={`absolute bottom-0 right-0.5 text-[9px] font-semibold ${previewTile.isJoker ? 'text-purple-700' : 'text-gray-600'}`}>
            {previewTile.value}
          </div>
        </div>
      )}

      {/* Coordinates (for debugging - can be removed later) */}
      {/* <div className="absolute top-0 left-0 text-[6px] text-gray-400">
        {square.row},{square.col}
      </div> */}
    </div>
  )
}
