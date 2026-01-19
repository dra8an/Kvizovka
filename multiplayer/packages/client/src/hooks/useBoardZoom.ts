/**
 * Board Zoom Hook
 *
 * Manages zoom/pan state for the mobile board view.
 * Auto-zooms when tiles are placed, allows panning when zoomed (like Google Maps).
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import { PlacedTile } from '@kvizovka/shared'

export interface ZoomPanState {
  scale: number      // 1 = no zoom, 2.5+ = zoomed
  panX: number       // translate X in pixels
  panY: number       // translate Y in pixels
  isPanning: boolean // currently panning (for gesture detection)
}

export interface UseBoardZoomReturn {
  zoomPan: ZoomPanState
  handlePanStart: (e: React.TouchEvent) => void
  handlePanMove: (e: React.TouchEvent) => void
  handlePanEnd: () => void
  resetZoom: () => void
}

const initialState: ZoomPanState = {
  scale: 1,
  panX: 0,
  panY: 0,
  isPanning: false,
}

/**
 * Hook for managing board zoom and pan on mobile
 */
export function useBoardZoom(
  selectedTiles: PlacedTile[],
  boardRef: React.RefObject<HTMLElement>
): UseBoardZoomReturn {
  const [zoomPan, setZoomPan] = useState<ZoomPanState>(initialState)
  const panStartRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null)
  const prevTileCountRef = useRef<number>(0)
  // Store original board dimensions (before any zoom)
  const originalBoardSizeRef = useRef<{ width: number; height: number } | null>(null)

  // Auto-zoom when tiles are placed
  useEffect(() => {
    // Reset zoom when all tiles are recalled
    if (selectedTiles.length === 0) {
      if (prevTileCountRef.current > 0) {
        setZoomPan(initialState)
        originalBoardSizeRef.current = null
      }
      prevTileCountRef.current = 0
      return
    }

    // Only auto-zoom when first tile is placed (going from 0 to 1+)
    if (prevTileCountRef.current === 0 && selectedTiles.length > 0) {
      const boardElement = boardRef.current
      if (!boardElement) {
        prevTileCountRef.current = selectedTiles.length
        return
      }

      const boardGrid = boardElement.querySelector('.grid') as HTMLElement
      const boardEl = boardGrid || boardElement
      const boardRect = boardEl.getBoundingClientRect()

      // Store original board dimensions (before zoom)
      originalBoardSizeRef.current = {
        width: boardRect.width,
        height: boardRect.height,
      }

      // Get viewport (container) dimensions
      const containerRect = boardElement.getBoundingClientRect()
      const viewportWidth = containerRect.width
      const viewportHeight = containerRect.height

      // Calculate center of placed tiles
      const rows = selectedTiles.map(t => t.row)
      const cols = selectedTiles.map(t => t.col)
      const minRow = Math.min(...rows)
      const maxRow = Math.max(...rows)
      const minCol = Math.min(...cols)
      const maxCol = Math.max(...cols)
      const centerRow = (minRow + maxRow) / 2 + 0.5
      const centerCol = (minCol + maxCol) / 2 + 0.5

      // Target: show ~8x10 cells around the placed tiles
      // We'll use 2.5x as a good balance for visibility
      const scale = 2.5

      // Calculate cell size (original, unscaled)
      const cellWidth = boardRect.width / 17
      const cellHeight = boardRect.height / 17

      // Calculate center position of tiles in pixels (relative to board)
      const tileCenterX = centerCol * cellWidth
      const tileCenterY = centerRow * cellHeight

      // Pan so that the tile center is at viewport center
      // After scaling with transformOrigin: '0 0', position = originalPosition * scale + pan
      // We want: tileCenterX * scale + panX = viewportWidth / 2
      // So: panX = viewportWidth / 2 - tileCenterX * scale
      let panX = viewportWidth / 2 - tileCenterX * scale
      let panY = viewportHeight / 2 - tileCenterY * scale

      // Constrain pan to keep board within viewport
      const scaledWidth = boardRect.width * scale
      const scaledHeight = boardRect.height * scale

      // Pan limits: board edges should not go past viewport edges
      // Left edge of board (at panX) should not go past right edge of viewport
      // Right edge of board (at panX + scaledWidth) should not go past left edge (0) of viewport... wait, reversed
      // Actually: maxPanX = 0 (board's left edge at viewport's left edge)
      //           minPanX = viewportWidth - scaledWidth (board's right edge at viewport's right edge)
      const minPanX = viewportWidth - scaledWidth
      const maxPanX = 0
      const minPanY = viewportHeight - scaledHeight
      const maxPanY = 0

      panX = Math.max(minPanX, Math.min(maxPanX, panX))
      panY = Math.max(minPanY, Math.min(maxPanY, panY))

      setZoomPan({
        scale,
        panX,
        panY,
        isPanning: false,
      })
    }

    prevTileCountRef.current = selectedTiles.length
  }, [selectedTiles, boardRef])

  // Handle pan start
  const handlePanStart = useCallback((e: React.TouchEvent) => {
    if (zoomPan.scale <= 1) return

    const touch = e.touches[0]
    panStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      panX: zoomPan.panX,
      panY: zoomPan.panY,
    }

    setZoomPan(prev => ({ ...prev, isPanning: true }))
  }, [zoomPan.scale, zoomPan.panX, zoomPan.panY])

  // Handle pan move
  const handlePanMove = useCallback((e: React.TouchEvent) => {
    if (!panStartRef.current || zoomPan.scale <= 1) return

    e.preventDefault()

    const touch = e.touches[0]
    const deltaX = touch.clientX - panStartRef.current.x
    const deltaY = touch.clientY - panStartRef.current.y

    let newPanX = panStartRef.current.panX + deltaX
    let newPanY = panStartRef.current.panY + deltaY

    // Constrain pan using original board dimensions and container viewport
    const boardElement = boardRef.current
    const originalSize = originalBoardSizeRef.current

    if (boardElement && originalSize) {
      // Get viewport (container) dimensions
      const containerRect = boardElement.getBoundingClientRect()
      const viewportWidth = containerRect.width
      const viewportHeight = containerRect.height

      // Calculate scaled board dimensions
      const scaledWidth = originalSize.width * zoomPan.scale
      const scaledHeight = originalSize.height * zoomPan.scale

      // Pan limits: board should stay within viewport bounds
      // maxPanX = 0: board's left edge at viewport's left edge (can't pan further right)
      // minPanX = viewportWidth - scaledWidth: board's right edge at viewport's right edge (can't pan further left)
      const minPanX = viewportWidth - scaledWidth
      const maxPanX = 0
      const minPanY = viewportHeight - scaledHeight
      const maxPanY = 0

      newPanX = Math.max(minPanX, Math.min(maxPanX, newPanX))
      newPanY = Math.max(minPanY, Math.min(maxPanY, newPanY))
    }

    setZoomPan(prev => ({
      ...prev,
      panX: newPanX,
      panY: newPanY,
    }))
  }, [zoomPan.scale, boardRef])

  // Handle pan end
  const handlePanEnd = useCallback(() => {
    panStartRef.current = null
    setZoomPan(prev => ({ ...prev, isPanning: false }))
  }, [])

  // Reset zoom
  const resetZoom = useCallback(() => {
    setZoomPan(initialState)
    originalBoardSizeRef.current = null
  }, [])

  return {
    zoomPan,
    handlePanStart,
    handlePanMove,
    handlePanEnd,
    resetZoom,
  }
}
