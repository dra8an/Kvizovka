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
import { useTranslation } from 'react-i18next'
import { useGameStore } from '../../store/gameStore'
import { Tile } from './Tile'
import { Tile as TileType } from '../../types'
import { latinToCyrillic } from '../../utils/letterMapping'

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
  const { t, i18n } = useTranslation(['game', 'common'])

  // Subscribe to game store
  const game = useGameStore((state) => state.game)
  const selectedTiles = useGameStore((state) => state.selectedTiles)
  const unselectTile = useGameStore((state) => state.unselectTile)
  const reorderPlayerTiles = useGameStore((state) => state.reorderPlayerTiles)
  const isExchangeMode = useGameStore((state) => state.isExchangeMode)
  const tilesForExchange = useGameStore((state) => state.tilesForExchange)
  const toggleTileForExchange = useGameStore((state) => state.toggleTileForExchange)
  const setDraggedTileInStore = useGameStore((state) => state.setDraggedTile)
  const setHoveredSquare = useGameStore((state) => state.setHoveredSquare)
  const draggedTile = useGameStore((state) => state.draggedTile)
  const hoveredSquare = useGameStore((state) => state.hoveredSquare)

  // Local state for drag-and-drop
  const [localDraggedTile, setLocalDraggedTile] = useState<TileType | null>(null)
  const [draggedFromIndex, setDraggedFromIndex] = useState<number | null>(null)
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null)

  // If no game, show placeholder
  if (!game) {
    return (
      <div className="flex items-center justify-center p-6 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
        <p className="text-gray-500">{t('game:statuses.noActiveGameLong')}</p>
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
    setLocalDraggedTile(tile)
    setDraggedFromIndex(index)
    setDraggedTileInStore(tile) // Update store for board visual feedback
    console.log('Started dragging tile:', tile.letter, 'from index', index)
  }

  /**
   * Handle drag end
   *
   * Clear dragged tile state.
   */
  const handleDragEnd = () => {
    setLocalDraggedTile(null)
    setDraggedFromIndex(null)
    setDropTargetIndex(null)
    setDraggedTileInStore(null) // Clear store
    setHoveredSquare(null) // Clear hovered square
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

  /**
   * Get steal state for a tile being dragged over a stealable joker
   * Returns 'valid' if can steal, 'invalid' if cannot, undefined if not hovering joker
   */
  const getStealState = (tile: TileType): 'valid' | 'invalid' | undefined => {
    // Only check if this tile is being dragged and we're hovering over a square
    if (!draggedTile || draggedTile.id !== tile.id || !hoveredSquare || !game) {
      return undefined
    }

    // Check if the hovered square has a stealable joker
    const stealableJoker = game.stealableJokers?.find(
      (j) => j.row === hoveredSquare.row && j.col === hoveredSquare.col
    )

    if (!stealableJoker) {
      return undefined // Not hovering over a stealable joker
    }

    // Check if the tile's letter matches the joker's assigned letter
    return tile.letter === stealableJoker.assignedLetter ? 'valid' : 'invalid'
  }

  return (
    <div className="flex flex-col gap-1.5">
      {/* Player info */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-800">{t('game:tileRack.playerTiles', { playerName: currentPlayer.name })}</h3>
          <p className="text-xs text-gray-600">
            {t('common:plurals.tilesInHand', { count: availableTiles.length })}
            {selectedTiles.length > 0 && (
              <span className="ml-2 text-blue-600 font-semibold">
                {t('common:plurals.tilesPlaced', { count: selectedTiles.length })}
              </span>
            )}
          </p>
        </div>
        <div className="text-xs text-gray-600">
          <p className="font-semibold">{t('common:labels.yourTurn')}</p>
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
            availableTiles.map((tile, index) => {
              const isSelectedForExchange = isTileSelectedForExchange(tile)
              const stealState = getStealState(tile)

              // Get glow class based on steal state
              let glowClass = ''
              if (stealState === 'valid') {
                glowClass = 'ring-4 ring-green-500 shadow-[0_0_25px_rgba(34,197,94,0.8)] scale-110'
              } else if (stealState === 'invalid') {
                glowClass = 'ring-4 ring-red-500 shadow-[0_0_25px_rgba(239,68,68,0.8)] scale-110'
              }

              return (
                <div
                  key={tile.id}
                  onDrop={(e) => handleDropOnTile(e, index)}
                  onDragOver={(e) => handleDragOverTile(e, index)}
                  onDragLeave={handleDragLeaveTile}
                  onClick={() => handleTileClick(tile)}
                  className={`
                    relative transition-all duration-200
                    ${dropTargetIndex === index && draggedFromIndex !== index ? 'scale-110' : ''}
                    ${isExchangeMode ? 'cursor-pointer' : ''}
                    ${isSelectedForExchange ? 'animate-bounce-once scale-105' : ''}
                    ${glowClass}
                  `}
                >
                  {/* Slightly darker overlay during exchange mode */}
                  {isExchangeMode && !isSelectedForExchange && (
                    <div className="absolute inset-0 bg-black/20 rounded-lg pointer-events-none z-10" />
                  )}

                  {/* Significantly darker overlay for selected tiles */}
                  {isSelectedForExchange && (
                    <div className="absolute inset-0 bg-black/60 rounded-lg pointer-events-none z-10" />
                  )}

                  {/* Red X overlay for selected tiles */}
                  {isSelectedForExchange && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center shadow-lg z-20">
                      <span className="text-white text-sm font-bold">✕</span>
                    </div>
                  )}

                  <Tile
                    tile={tile}
                    tileIndex={index}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    isDragging={localDraggedTile?.id === tile.id}
                    isWithinRack={true}
                    disabled={isExchangeMode}
                  />
                </div>
              )
            })
          ) : (
            <div className="text-amber-200 py-2">
              {selectedTiles.length > 0
                ? t('game:tileRack.allPlaced')
                : t('game:tileRack.noTiles')
              }
            </div>
          )}
        </div>

        {/* Rack info */}
        <div className="mt-1.5 text-center">
          <p className={`text-xs ${isExchangeMode ? 'text-purple-200' : 'text-amber-200'}`}>
            {isExchangeMode
              ? t('game:tileRack.selectForExchange')
              : t('game:tileRack.dragToBoard')
            }
          </p>
        </div>
      </div>

      {/* Debug info (can be removed later) */}
      {localDraggedTile && (
        <div className="text-xs text-gray-500 text-center">
          {t('game:tileRack.dragging', {
            letter: localDraggedTile.isJoker
              ? t('common:labels.joker')
              : latinToCyrillic(localDraggedTile.letter, i18n.language),
            value: localDraggedTile.value
          })}
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
