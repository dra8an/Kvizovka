/**
 * Tile Component
 *
 * Represents a single draggable tile in the player's rack.
 *
 * Features:
 * - Displays letter and value
 * - Draggable via HTML5 drag-and-drop
 * - Special styling for joker tiles
 * - Visual feedback during drag
 *
 * Tile appearance:
 * - Regular tiles: Amber background with black letter
 * - Joker tiles: Purple background with "?" or chosen letter
 * - Value shown in bottom-right corner
 */

import { Tile as TileType } from '../../types'

/**
 * Props for Tile component
 */
interface TileProps {
  /**
   * The tile data (letter, value, isJoker, etc.)
   */
  tile: TileType

  /**
   * Called when drag starts
   */
  onDragStart?: (tile: TileType) => void

  /**
   * Called when drag ends
   */
  onDragEnd?: () => void

  /**
   * Whether the tile is currently being dragged
   */
  isDragging?: boolean

  /**
   * Whether the tile is disabled (can't be dragged)
   */
  disabled?: boolean
}

/**
 * Tile Component
 *
 * Example usage:
 * ```tsx
 * <Tile
 *   tile={tileA}
 *   onDragStart={(tile) => handleDragStart(tile)}
 *   onDragEnd={() => handleDragEnd()}
 * />
 * ```
 */
export function Tile({ tile, onDragStart, onDragEnd, isDragging, disabled }: TileProps) {
  /**
   * Get the letter to display
   *
   * - Regular tiles: Show the letter (A, B, Č, etc.)
   * - Joker tiles: Show joker icon 🃏
   */
  const getDisplayLetter = (): string => {
    if (tile.isJoker) {
      return '🃏'
    }
    return tile.letter
  }

  /**
   * Get the value to display
   *
   * - Regular tiles: Show the value (1, 2, 3, etc.)
   * - Joker tiles: Always 0
   */
  const getDisplayValue = (): number => {
    return tile.value
  }

  /**
   * Handle drag start event
   */
  const handleDragStart = (e: React.DragEvent) => {
    if (disabled) {
      e.preventDefault()
      return
    }

    // Store tile ID in drag data
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', tile.id)

    // Call parent handler
    onDragStart?.(tile)
  }

  /**
   * Handle drag end event
   */
  const handleDragEnd = () => {
    onDragEnd?.()
  }

  /**
   * Get tile background color
   *
   * - Joker tiles: Purple
   * - Regular tiles: Amber
   */
  const getTileClass = (): string => {
    if (tile.isJoker) {
      return 'bg-purple-200 border-purple-400'
    }
    return 'bg-amber-100 border-amber-300'
  }

  return (
    <div
      draggable={!disabled}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`
        relative w-16 h-16 rounded-lg shadow-md border-2
        flex flex-col items-center justify-center
        ${getTileClass()}
        ${isDragging ? 'opacity-50 cursor-grabbing' : 'cursor-grab'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:scale-105'}
        transition-all duration-150
        select-none
      `}
    >
      {/* Letter */}
      <div className="text-2xl font-bold text-gray-900">{getDisplayLetter()}</div>

      {/* Value (bottom-right corner) */}
      <div className="absolute bottom-1 right-1.5 text-xs font-semibold text-gray-600">
        {getDisplayValue()}
      </div>

      {/* Joker indicator (top-left) */}
      {tile.isJoker && (
        <div className="absolute top-0.5 left-1 text-[10px] font-bold text-purple-600">
          JOKER
        </div>
      )}
    </div>
  )
}

/**
 * Key Concepts Explained:
 *
 * 1. **HTML5 Drag-and-Drop API**
 *    - `draggable={true}` makes element draggable
 *    - `onDragStart` fires when drag begins
 *    - `onDragEnd` fires when drag ends (drop or cancel)
 *    - `e.dataTransfer.setData()` stores data during drag
 *
 * 2. **Optional Chaining (?.)**
 *    - `onDragStart?.(tile)` calls function only if it exists
 *    - Prevents errors if prop is undefined
 *    - Equivalent to: `if (onDragStart) onDragStart(tile)`
 *
 * 3. **Conditional Rendering**
 *    - `{tile.isJoker && <div>...</div>}` shows element only if joker
 *    - Short-circuit evaluation: if left side false, right side not evaluated
 *
 * 4. **Template Literals**
 *    - Backticks (`) allow multi-line strings
 *    - ${} for dynamic values
 *    - Used for combining Tailwind classes conditionally
 *
 * 5. **Tailwind Utilities**
 *    - `transition-all`: Animate all properties
 *    - `duration-150`: Animation takes 150ms
 *    - `hover:scale-105`: Grow 5% on hover
 *    - `select-none`: Prevent text selection during drag
 */
