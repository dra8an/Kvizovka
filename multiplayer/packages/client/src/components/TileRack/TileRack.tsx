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
import { Tile as TileType, PlacedTile } from '@kvizovka/shared'

/**
 * TileRack Component Props (for online mode)
 */
interface TileRackProps {
  /**
   * Tiles to display (optional - uses gameStore if not provided)
   */
  tiles?: TileType[]

  /**
   * Player name (optional - uses gameStore if not provided)
   */
  playerName?: string

  /**
   * Currently placed tiles (optional - uses gameStore if not provided)
   */
  selectedTiles?: PlacedTile[]

  /**
   * Callback when tile is removed from board (optional - uses gameStore if not provided)
   */
  onTileRemoved?: (row: number, col: number) => void

  /**
   * Disabled state (for online mode when not your turn)
   */
  disabled?: boolean
}

/**
 * TileRack Component
 *
 * Supports two modes:
 * 1. Local mode (no props): Uses gameStore with full features
 * 2. Online mode (with props): Simplified display and dragging
 *
 * Example usage:
 * ```tsx
 * // Local mode
 * <TileRack />
 *
 * // Online mode
 * <TileRack
 *   tiles={you.tiles}
 *   playerName={you.name}
 *   selectedTiles={localSelectedTiles}
 *   onTileRemoved={(row, col) => ...}
 *   disabled={!isYourTurn}
 * />
 * ```
 */
export function TileRack(props: TileRackProps = {}) {
  // Subscribe to game store (for local mode)
  const storeGame = useGameStore((state) => state.game)
  const storeSelectedTiles = useGameStore((state) => state.selectedTiles)
  const storeUnselectTile = useGameStore((state) => state.unselectTile)
  const storeReorderPlayerTiles = useGameStore((state) => state.reorderPlayerTiles)
  const storeIsExchangeMode = useGameStore((state) => state.isExchangeMode)
  const storeTilesForExchange = useGameStore((state) => state.tilesForExchange)
  const storeToggleTileForExchange = useGameStore((state) => state.toggleTileForExchange)

  // Determine which data source to use (props or store)
  const isOnlineMode = props.tiles !== undefined
  const game = storeGame
  const currentPlayer = game?.players[game?.currentPlayerIndex || 0]
  const playerName = props.playerName || currentPlayer?.name || 'Player'
  const selectedTiles = props.selectedTiles !== undefined ? props.selectedTiles : storeSelectedTiles
  const disabled = props.disabled || false

  // For online mode, use provided tiles directly
  // For local mode, get from game and filter out selected
  const selectedTileIds = new Set(selectedTiles.map((st) => st.tile.id))
  const allPlayerTiles = props.tiles || currentPlayer?.tiles || []
  const availableTiles = allPlayerTiles.filter((tile) => !selectedTileIds.has(tile.id))

  // Exchange mode only for local mode
  const isExchangeMode = !isOnlineMode && storeIsExchangeMode
  const tilesForExchange = !isOnlineMode ? storeTilesForExchange : []

  // Actions
  const unselectTile = (row: number, col: number) => {
    if (props.onTileRemoved) {
      props.onTileRemoved(row, col)
    } else {
      storeUnselectTile(row, col)
    }
  }

  const reorderPlayerTiles = (fromIndex: number, toIndex: number) => {
    if (!isOnlineMode) {
      storeReorderPlayerTiles(fromIndex, toIndex)
    }
    // Online mode doesn't support reordering
  }

  const toggleTileForExchange = (tile: TileType) => {
    if (!isOnlineMode) {
      storeToggleTileForExchange(tile)
    }
    // Online mode doesn't support exchange mode in TileRack
  }

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

  /**
   * Handle tile click for exchange mode
   *
   * When in exchange mode, clicking a tile toggles its selection.
   */
  const handleTileClick = (tile: TileType) => {
    if (isExchangeMode) {
      toggleTileForExchange(tile)
    }
  }

  /**
   * Check if a tile is selected for exchange
   */
  const isTileSelectedForExchange = (tile: TileType): boolean => {
    return tilesForExchange.some((t) => t.id === tile.id)
  }

  return (
    <div className="flex flex-col gap-1.5">
      {/* Player info */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-800">{playerName}'s Tiles</h3>
          <p className="text-xs text-gray-600">
            {availableTiles.length} tile{availableTiles.length !== 1 ? 's' : ''} in hand
            {selectedTiles.length > 0 && (
              <span className="ml-2 text-blue-600 font-semibold">
                ({selectedTiles.length} placed)
              </span>
            )}
          </p>
        </div>
        {!disabled && (
          <div className="text-xs text-gray-600">
            <p className="font-semibold">Your Turn</p>
          </div>
        )}
      </div>

      {/* Tile rack container */}
      <div
        className={`
          bg-gradient-to-b py-2 px-3 rounded-lg shadow-lg
          ${isExchangeMode ? 'from-purple-700 to-purple-800' : 'from-amber-700 to-amber-800'}
        `}
        onDrop={handleDropOnRack}
        onDragOver={handleDragOverRack}
      >
        {/* Exchange mode banner */}
        {isExchangeMode && (
          <div className="mb-2 p-2 bg-purple-900 rounded text-center">
            <p className="text-sm font-bold text-purple-100">
              Exchange Mode: Click tiles to select
            </p>
            <p className="text-xs text-purple-200 mt-0.5">
              {tilesForExchange.length} tile{tilesForExchange.length !== 1 ? 's' : ''} selected
            </p>
          </div>
        )}

        {/* Tiles */}
        <div className="flex gap-1.5 justify-center flex-wrap">
          {availableTiles.length > 0 ? (
            availableTiles.map((tile, index) => {
              const isSelectedForExchange = isTileSelectedForExchange(tile)
              return (
                <div
                  key={tile.id}
                  onDrop={(e) => handleDropOnTile(e, index)}
                  onDragOver={(e) => handleDragOverTile(e, index)}
                  onDragLeave={handleDragLeaveTile}
                  onClick={() => handleTileClick(tile)}
                  className={`
                    transition-all duration-150
                    ${dropTargetIndex === index && draggedFromIndex !== index ? 'scale-110' : ''}
                    ${isExchangeMode ? 'cursor-pointer' : ''}
                    ${isSelectedForExchange ? 'ring-4 ring-purple-400 rounded scale-105' : ''}
                  `}
                >
                  <Tile
                    tile={tile}
                    tileIndex={index}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    isDragging={draggedTile?.id === tile.id}
                    isWithinRack={true}
                    disabled={isExchangeMode || disabled}
                  />
                </div>
              )
            })
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
          <p className={`text-xs ${isExchangeMode ? 'text-purple-200' : 'text-amber-200'}`}>
            {isExchangeMode
              ? 'Click tiles to select for exchange'
              : 'Drag tiles to the board to place them'
            }
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
