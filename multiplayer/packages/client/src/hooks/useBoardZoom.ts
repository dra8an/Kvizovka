/**
 * Board Zoom Hook
 *
 * Manages zoom/pan state for the mobile board view.
 * - Auto-zooms when tiles are placed
 * - Allows panning when zoomed (single finger drag)
 * - Supports pinch-to-zoom gesture (two finger pinch)
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import { PlacedTile } from '@kvizovka/shared'

export interface ZoomPanState {
  scale: number      // 1 = no zoom, up to MAX_SCALE
  panX: number       // translate X in pixels
  panY: number       // translate Y in pixels
  isPanning: boolean // currently panning (for gesture detection)
  isPinching: boolean // currently pinching (for gesture detection)
}

export interface UseBoardZoomReturn {
  zoomPan: ZoomPanState
  handleGestureStart: (e: React.TouchEvent) => void
  handleGestureMove: (e: React.TouchEvent) => void
  handleGestureEnd: () => void
  resetZoom: () => void
}

const MIN_SCALE = 1
const MAX_SCALE = 4
const AUTO_ZOOM_SCALE = 2.5

const initialState: ZoomPanState = {
  scale: 1,
  panX: 0,
  panY: 0,
  isPanning: false,
  isPinching: false,
}

/**
 * Calculate distance between two touch points
 */
function getTouchDistance(touches: React.TouchList): number {
  const dx = touches[0].clientX - touches[1].clientX
  const dy = touches[0].clientY - touches[1].clientY
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * Calculate midpoint between two touch points
 */
function getTouchMidpoint(touches: React.TouchList): { x: number; y: number } {
  return {
    x: (touches[0].clientX + touches[1].clientX) / 2,
    y: (touches[0].clientY + touches[1].clientY) / 2,
  }
}

/**
 * Hook for managing board zoom and pan on mobile
 */
export function useBoardZoom(
  selectedTiles: PlacedTile[],
  boardRef: React.RefObject<HTMLElement>
): UseBoardZoomReturn {
  const [zoomPan, setZoomPan] = useState<ZoomPanState>(initialState)

  // Pan gesture refs
  const panStartRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null)

  // Pinch gesture refs
  const pinchStartRef = useRef<{
    distance: number
    scale: number
    panX: number
    panY: number
    midpoint: { x: number; y: number }
  } | null>(null)

  const prevTileCountRef = useRef<number>(0)
  // Store original board dimensions (before any zoom)
  const originalBoardSizeRef = useRef<{ width: number; height: number } | null>(null)

  /**
   * Constrain pan values to keep board within viewport
   */
  const constrainPan = useCallback((panX: number, panY: number, scale: number): { panX: number; panY: number } => {
    const boardElement = boardRef.current
    const originalSize = originalBoardSizeRef.current

    if (!boardElement || !originalSize) {
      return { panX, panY }
    }

    const containerRect = boardElement.getBoundingClientRect()
    const viewportWidth = containerRect.width
    const viewportHeight = containerRect.height

    const scaledWidth = originalSize.width * scale
    const scaledHeight = originalSize.height * scale

    // If board is smaller than viewport at this scale, center it
    if (scaledWidth <= viewportWidth) {
      panX = (viewportWidth - scaledWidth) / 2
    } else {
      const minPanX = viewportWidth - scaledWidth
      const maxPanX = 0
      panX = Math.max(minPanX, Math.min(maxPanX, panX))
    }

    if (scaledHeight <= viewportHeight) {
      panY = (viewportHeight - scaledHeight) / 2
    } else {
      const minPanY = viewportHeight - scaledHeight
      const maxPanY = 0
      panY = Math.max(minPanY, Math.min(maxPanY, panY))
    }

    return { panX, panY }
  }, [boardRef])

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

      const scale = AUTO_ZOOM_SCALE

      // Calculate cell size (original, unscaled)
      const cellWidth = boardRect.width / 17
      const cellHeight = boardRect.height / 17

      // Calculate center position of tiles in pixels (relative to board)
      const tileCenterX = centerCol * cellWidth
      const tileCenterY = centerRow * cellHeight

      // Pan so that the tile center is at viewport center
      let panX = viewportWidth / 2 - tileCenterX * scale
      let panY = viewportHeight / 2 - tileCenterY * scale

      // Constrain pan
      const constrained = constrainPan(panX, panY, scale)

      setZoomPan({
        scale,
        panX: constrained.panX,
        panY: constrained.panY,
        isPanning: false,
        isPinching: false,
      })
    }

    prevTileCountRef.current = selectedTiles.length
  }, [selectedTiles, boardRef, constrainPan])

  // Handle gesture start (pan or pinch)
  const handleGestureStart = useCallback((e: React.TouchEvent) => {
    // Two fingers = pinch
    if (e.touches.length === 2) {
      // Store original board size if not already stored (for pinch from scale 1)
      if (!originalBoardSizeRef.current) {
        const boardElement = boardRef.current
        if (boardElement) {
          const boardGrid = boardElement.querySelector('.grid') as HTMLElement
          const boardEl = boardGrid || boardElement
          const boardRect = boardEl.getBoundingClientRect()
          originalBoardSizeRef.current = {
            width: boardRect.width / zoomPan.scale,
            height: boardRect.height / zoomPan.scale,
          }
        }
      }

      const distance = getTouchDistance(e.touches)
      const midpoint = getTouchMidpoint(e.touches)

      pinchStartRef.current = {
        distance,
        scale: zoomPan.scale,
        panX: zoomPan.panX,
        panY: zoomPan.panY,
        midpoint,
      }
      panStartRef.current = null

      setZoomPan(prev => ({ ...prev, isPinching: true, isPanning: false }))
      return
    }

    // One finger = pan (only if already zoomed)
    if (e.touches.length === 1 && zoomPan.scale > 1) {
      const touch = e.touches[0]
      panStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        panX: zoomPan.panX,
        panY: zoomPan.panY,
      }
      pinchStartRef.current = null

      setZoomPan(prev => ({ ...prev, isPanning: true, isPinching: false }))
    }
  }, [zoomPan.scale, zoomPan.panX, zoomPan.panY, boardRef])

  // Handle gesture move (pan or pinch)
  const handleGestureMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault()

    // Pinch gesture (two fingers)
    if (e.touches.length === 2 && pinchStartRef.current) {
      const currentDistance = getTouchDistance(e.touches)
      const currentMidpoint = getTouchMidpoint(e.touches)

      // Calculate new scale based on distance ratio
      const distanceRatio = currentDistance / pinchStartRef.current.distance
      let newScale = pinchStartRef.current.scale * distanceRatio
      newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale))

      // Get board position for zoom centering
      const boardElement = boardRef.current
      if (!boardElement) return

      const containerRect = boardElement.getBoundingClientRect()

      // Calculate the point we're zooming around (midpoint relative to container)
      const midpointRelX = currentMidpoint.x - containerRect.left
      const midpointRelY = currentMidpoint.y - containerRect.top

      // Calculate new pan to keep the midpoint stationary
      // The board position at midpoint before zoom: (midpointRelX - panX) / scale
      // After zoom, we want: boardPosAtMidpoint * newScale + newPanX = midpointRelX
      // So: newPanX = midpointRelX - boardPosAtMidpoint * newScale
      const boardPosAtMidpointX = (midpointRelX - pinchStartRef.current.panX) / pinchStartRef.current.scale
      const boardPosAtMidpointY = (midpointRelY - pinchStartRef.current.panY) / pinchStartRef.current.scale

      let newPanX = midpointRelX - boardPosAtMidpointX * newScale
      let newPanY = midpointRelY - boardPosAtMidpointY * newScale

      // Also account for midpoint movement (panning while pinching)
      const midpointDeltaX = currentMidpoint.x - pinchStartRef.current.midpoint.x
      const midpointDeltaY = currentMidpoint.y - pinchStartRef.current.midpoint.y
      newPanX += midpointDeltaX
      newPanY += midpointDeltaY

      // Constrain pan
      const constrained = constrainPan(newPanX, newPanY, newScale)

      setZoomPan(prev => ({
        ...prev,
        scale: newScale,
        panX: constrained.panX,
        panY: constrained.panY,
      }))
      return
    }

    // Pan gesture (one finger)
    if (e.touches.length === 1 && panStartRef.current && zoomPan.scale > 1) {
      const touch = e.touches[0]
      const deltaX = touch.clientX - panStartRef.current.x
      const deltaY = touch.clientY - panStartRef.current.y

      let newPanX = panStartRef.current.panX + deltaX
      let newPanY = panStartRef.current.panY + deltaY

      const constrained = constrainPan(newPanX, newPanY, zoomPan.scale)

      setZoomPan(prev => ({
        ...prev,
        panX: constrained.panX,
        panY: constrained.panY,
      }))
    }
  }, [zoomPan.scale, boardRef, constrainPan])

  // Handle gesture end
  const handleGestureEnd = useCallback(() => {
    panStartRef.current = null
    pinchStartRef.current = null

    setZoomPan(prev => {
      // If zoomed out to 1x, reset everything
      if (prev.scale <= 1) {
        originalBoardSizeRef.current = null
        return initialState
      }
      return { ...prev, isPanning: false, isPinching: false }
    })
  }, [])

  // Reset zoom
  const resetZoom = useCallback(() => {
    setZoomPan(initialState)
    originalBoardSizeRef.current = null
  }, [])

  return {
    zoomPan,
    handleGestureStart,
    handleGestureMove,
    handleGestureEnd,
    resetZoom,
  }
}
