/**
 * Drag Overlay Component
 *
 * Renders a "ghost" tile that follows the finger during touch drag.
 * Uses CSS transform for smooth 60fps movement.
 */

import { Tile as TileType } from '@kvizovka/shared'
import { useTranslation } from 'react-i18next'
import { latinToCyrillic } from '../../utils/letterMapping'

interface DragOverlayProps {
  tile: TileType
  x: number
  y: number
}

export function DragOverlay({ tile, x, y }: DragOverlayProps) {
  const { i18n } = useTranslation()

  const letter = tile.isJoker ? '🃏' : latinToCyrillic(tile.letter, i18n.language)

  return (
    <div
      className="fixed pointer-events-none z-50"
      style={{
        left: 0,
        top: 0,
        transform: `translate(${x - 20}px, ${y - 20}px)`,
        willChange: 'transform',
      }}
    >
      <div
        className={`
          w-10 h-10 rounded-lg shadow-2xl border-2
          flex flex-col items-center justify-center
          ${tile.isJoker ? 'bg-purple-200 border-purple-400' : 'bg-amber-100 border-amber-300'}
          opacity-90 scale-110
        `}
      >
        <div className="text-base font-bold text-gray-900">{letter}</div>
      </div>
    </div>
  )
}
