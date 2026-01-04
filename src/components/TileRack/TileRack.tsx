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
  const selectedTiles = useGameStore((state) => state.selectedTiles)
  const unselectTile = useGameStore((state) => state.unselectTile)
  const reorderPlayerTiles = useGameStore((state) => state.reorderPlayerTiles)

  // Local state for drag-and-drop
  const [draggedTile, setDraggedTile] = useState<TileType | null>(null)
  const [draggedFromIndex, setDraggedFromIndex] = useState<number | null>(null)
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null)

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

  // Filter out tiles that are currently placed on the board (in selectedTiles)
  const selectedTileIds = new Set(selectedTiles.map((st) => st.tile.id))
  const availableTiles = currentPlayer.tiles.filter(
    (tile) => !selectedTileIds.has(tile.id)
  )

  /**
   * Handle drag start
   *
   * Store the dragged tile and its index so we can use it when dropped.
   */
  const handleDragStart = (tile: TileType, index: number) => {
    setDraggedTile(tile)
    setDraggedFromIndex(index)
    console.log('Started dragging tile:', tile.letter, 'from index', index)
  }

  /**
   * Handle drag end
   *
   * Clear dragged tile state.
   */
  const handleDragEnd = () => {
    setDraggedTile(null)
    setDraggedFromIndex(null)
    setDropTargetIndex(null)
    console.log('Stopped dragging')
  }

  /**
   * Handle drop on rack container
   *
   * When a tile is dropped on the rack container, remove it from selectedTiles.
   */
  const handleDropOnRack = (e: React.DragEvent) => {
    e.preventDefault()

    // Get drag data
    const dragData = e.dataTransfer.getData('text/plain')
    if (!dragData) return

    // Check if dragging from board (format: "square:row:col")
    if (dragData.startsWith('square:')) {
      const [, rowStr, colStr] = dragData.split(':')
      const row = parseInt(rowStr)
      const col = parseInt(colStr)

      // Remove tile from board (selectedTiles)
      unselectTile(row, col)
      console.log(`Returned tile from board ${row},${col} to hand`)
    }
  }

  /**
   * Handle drop on a specific tile position (for reordering)
   *
   * When a tile is dropped on another tile, reorder them.
   */
  const handleDropOnTile = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault()
    e.stopPropagation() // Prevent rack container from handling this

    // Get drag data
    const dragData = e.dataTransfer.getData('text/plain')
    if (!dragData) return

    // Check if dragging within rack (format: "rack-tile:{index}:{tileId}")
    if (dragData.startsWith('rack-tile:')) {
      const parts = dragData.split(':')
      const fromIndex = parseInt(parts[1])

      if (fromIndex !== toIndex && fromIndex >= 0 && toIndex >= 0) {
        reorderPlayerTiles(fromIndex, toIndex)
        console.log(`Reordered tile from index ${fromIndex} to ${toIndex}`)
      }
    }

    setDropTargetIndex(null)
  }

  /**
   * Handle drag over a tile (for visual feedback)
   */
  const handleDragOverTile = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.stopPropagation()

    // Only show drop target if dragging a tile from within the rack
    const dragData = e.dataTransfer.types.includes('text/plain')
    if (dragData && draggedFromIndex !== null) {
      setDropTargetIndex(index)
    }
  }

  /**
   * Handle drag leave from a tile
   */
  const handleDragLeaveTile = () => {
    setDropTargetIndex(null)
  }

  /**
   * Handle drag over rack container
   *
   * Allow drops on the rack.
   */
  const handleDragOverRack = (e: React.DragEvent) => {
    e.preventDefault() // Allow drop
  }

  return (
    <div className="flex flex-col gap-1.5">
      {/* Player info */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-800">{currentPlayer.name}'s Tiles</h3>
          <p className="text-xs text-gray-600">
            {availableTiles.length} tile{availableTiles.length !== 1 ? 's' : ''} in hand
            {selectedTiles.length > 0 && (
              <span className="ml-2 text-blue-600 font-semibold">
                ({selectedTiles.length} placed)
              </span>
            )}
          </p>
        </div>
        <div className="text-xs text-gray-600">
          <p className="font-semibold">Your Turn</p>
        </div>
      </div>

      {/* Tile rack container */}
      <div
        className="bg-gradient-to-b from-amber-700 to-amber-800 py-2 px-3 rounded-lg shadow-lg"
        onDrop={handleDropOnRack}
        onDragOver={handleDragOverRack}
      >
        {/* Tiles */}
        <div className="flex gap-1.5 justify-center flex-wrap">
          {availableTiles.length > 0 ? (
            availableTiles.map((tile, index) => (
              <div
                key={tile.id}
                onDrop={(e) => handleDropOnTile(e, index)}
                onDragOver={(e) => handleDragOverTile(e, index)}
                onDragLeave={handleDragLeaveTile}
                className={`
                  transition-all duration-150
                  ${dropTargetIndex === index && draggedFromIndex !== index ? 'scale-110' : ''}
                `}
              >
                <Tile
                  tile={tile}
                  tileIndex={index}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  isDragging={draggedTile?.id === tile.id}
                  isWithinRack={true}
                />
              </div>
            ))
          ) : (
            <div className="text-amber-200 py-2">
              {selectedTiles.length > 0
                ? 'All tiles placed on board'
                : 'No tiles in hand'
              }
            </div>
          )}
        </div>

        {/* Rack info */}
        <div className="mt-1.5 text-center">
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
