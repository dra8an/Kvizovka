/**
 * OpponentTiles Component
 *
 * Displays opponent's tiles in a compact, read-only format.
 *
 * Features:
 * - Shows all opponent's tiles
 * - Compact size (smaller than player's rack)
 * - Read-only (no interaction)
 * - Shows opponent name
 * - Grayed out to indicate "not yours"
 *
 * In Kvizovka, unlike Scrabble, you can see opponent's tiles.
 * This is important for strategic planning.
 */

import { Player } from '../../types'

interface OpponentTilesProps {
  opponent: Player
}

/**
 * OpponentTiles Component
 *
 * Example usage:
 * ```tsx
 * <OpponentTiles opponent={opponent} />
 * ```
 */
export function OpponentTiles({ opponent }: OpponentTilesProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-3 border border-gray-300">
      {/* Opponent name */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-700">
          {opponent.name}'s Tiles
        </h3>
        <span className="text-xs text-gray-500">
          {opponent.tiles.length} tile{opponent.tiles.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Opponent's tiles */}
      <div className="flex flex-wrap gap-1 justify-center">
        {opponent.tiles.length > 0 ? (
          opponent.tiles.map((tile, index) => (
            <div
              key={`${tile.id}-${index}`}
              className="relative w-10 h-10 bg-gray-100 border-2 border-gray-300 rounded shadow-sm flex items-center justify-center"
              title={tile.isJoker ? `Joker${tile.jokerLetter ? ` (${tile.jokerLetter})` : ''}` : tile.letter}
            >
              {/* Letter */}
              <span className="text-sm font-bold text-gray-700">
                {tile.isJoker ? (tile.jokerLetter || '*') : tile.letter}
              </span>

              {/* Value (subscript) */}
              <span className="absolute bottom-0.5 right-1 text-[10px] font-semibold text-gray-600">
                {tile.value}
              </span>

              {/* Joker indicator */}
              {tile.isJoker && (
                <span className="absolute top-0 right-0 text-[10px]" title="Joker">
                  ✨
                </span>
              )}
            </div>
          ))
        ) : (
          <p className="text-xs text-gray-400 py-2">No tiles</p>
        )}
      </div>
    </div>
  )
}
