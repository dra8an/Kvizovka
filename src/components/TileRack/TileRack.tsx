/**
 * TileRack Component
 *
 * Displays the current player's tiles (up to 10 tiles).
 *
 * Features:
 * - Shows all tiles in player's hand
 * - Tiles are draggable to board
 * - Updates when tiles change
 * - Shows whose turn it is
 * - Visual feedback during drag
 *
 * In Kvizovka, players hold 10 tiles (not 7 like Scrabble).
 */

import { useState } from 'react'
import { useGameStore } from '../../store/gameStore'
import { Tile } from './Tile'
import { Tile as TileType } from '../../types'

/**
 * TileRack Component
 *
 * Example usage:
 * ```tsx
 * <TileRack />
 * ```
 *
 * The rack automatically shows the current player's tiles.
 */
export function TileRack() {
  // Subscribe to game store
  const game = useGameStore((state) => state.game)

  // Local state for drag-and-drop
  const [draggedTile, setDraggedTile] = useState<TileType | null>(null)

  // If no game, show placeholder
  if (!game) {
    return (
      <div className="flex items-center justify-center p-6 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
        <p className="text-gray-500">No active game. Start a game to see your tiles!</p>
      </div>
    )
  }

  // Get current player
  const currentPlayer = game.players[game.currentPlayerIndex]

  /**
   * Handle drag start
   *
   * Store the dragged tile so we can use it when dropped on board.
   */
  const handleDragStart = (tile: TileType) => {
    setDraggedTile(tile)
    console.log('Started dragging tile:', tile.letter)
  }

  /**
   * Handle drag end
   *
   * Clear dragged tile state.
   */
  const handleDragEnd = () => {
    setDraggedTile(null)
    console.log('Stopped dragging')
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Player info */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-800">{currentPlayer.name}'s Tiles</h3>
          <p className="text-sm text-gray-600">
            {currentPlayer.tiles.length} tile{currentPlayer.tiles.length !== 1 ? 's' : ''} in hand
          </p>
        </div>
        <div className="text-sm text-gray-600">
          <p className="font-semibold">Your Turn</p>
        </div>
      </div>

      {/* Tile rack container */}
      <div className="bg-gradient-to-b from-amber-700 to-amber-800 p-4 rounded-lg shadow-lg">
        {/* Tiles */}
        <div className="flex gap-2 justify-center flex-wrap">
          {currentPlayer.tiles.length > 0 ? (
            currentPlayer.tiles.map((tile) => (
              <Tile
                key={tile.id}
                tile={tile}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                isDragging={draggedTile?.id === tile.id}
              />
            ))
          ) : (
            <div className="text-amber-200 py-4">
              No tiles in hand
            </div>
          )}
        </div>

        {/* Rack info */}
        <div className="mt-3 text-center">
          <p className="text-xs text-amber-200">
            Drag tiles to the board to place them
          </p>
        </div>
      </div>

      {/* Debug info (can be removed later) */}
      {draggedTile && (
        <div className="text-xs text-gray-500 text-center">
          Dragging: {draggedTile.isJoker ? 'Joker' : draggedTile.letter} (value: {draggedTile.value})
        </div>
      )}
    </div>
  )
}

/**
 * Key Concepts Explained:
 *
 * 1. **Current Player Logic**
 *    - `game.players[game.currentPlayerIndex]` gets active player
 *    - `currentPlayerIndex` is 0 or 1 (two players)
 *    - Switches after each move
 *
 * 2. **Array.map() for Rendering Lists**
 *    - `tiles.map((tile) => <Tile ... />)` creates Tile component for each tile
 *    - Each element needs unique `key` prop (we use tile.id)
 *    - React uses keys to track which items changed
 *
 * 3. **Conditional Rendering**
 *    - `{tiles.length > 0 ? <TilesList> : <EmptyMessage>}` (ternary operator)
 *    - Shows different UI based on condition
 *
 * 4. **State Management**
 *    - `draggedTile` is local state (only this component cares)
 *    - `game` is global state (from Zustand store)
 *    - Use local for UI-only state, global for shared data
 *
 * 5. **Gradient Background**
 *    - `bg-gradient-to-b from-amber-700 to-amber-800`
 *    - Creates wood-like rack appearance
 *    - `to-b` = gradient direction (top to bottom)
 *
 * 6. **Pluralization**
 *    - `{count} tile{count !== 1 ? 's' : ''}`
 *    - Shows "1 tile" or "2 tiles" (grammatically correct)
 */
