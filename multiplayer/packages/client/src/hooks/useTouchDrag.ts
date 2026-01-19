/**
 * Touch Drag Hook
 *
 * Provides touch-based drag-and-drop functionality for mobile devices.
 * Creates a visual "ghost" element that follows the finger during drag.
 */

import { useState, useCallback, useRef } from 'react'
import { Tile as TileType } from '@kvizovka/shared'

export interface TouchDragState {
  isDragging: boolean
  tile: TileType | null
  tileIndex: number
  currentX: number
  currentY: number
  startX: number
  startY: number
  // Target square while dragging (for visual feedback)
  targetRow: number | null
  targetCol: number | null
  // Source info for dragging from board
  fromBoard: boolean
  fromRow: number | null
  fromCol: number | null
}

export interface UseTouchDragReturn {
  dragState: TouchDragState
  handleTouchStart: (e: React.TouchEvent, tile: TileType, index: number) => void
  handleTouchStartFromBoard: (e: React.TouchEvent, tile: TileType, row: number, col: number) => void
  handleTouchMove: (e: React.TouchEvent, boardRef?: React.RefObject<HTMLElement>) => void
  handleTouchEnd: (e: React.TouchEvent, onDrop: (row: number, col: number, tile: TileType, index: number, fromBoard: boolean, fromRow: number | null, fromCol: number | null) => void, boardRef: React.RefObject<HTMLElement>) => void
  handleTouchCancel: () => void
}

const initialState: TouchDragState = {
  isDragging: false,
  tile: null,
  tileIndex: -1,
  currentX: 0,
  currentY: 0,
  startX: 0,
  startY: 0,
  targetRow: null,
  targetCol: null,
  fromBoard: false,
  fromRow: null,
  fromCol: null,
}

/**
 * Hook for handling touch-based drag and drop
 */
export function useTouchDrag(): UseTouchDragReturn {
  const [dragState, setDragState] = useState<TouchDragState>(initialState)
  const dragStartTime = useRef<number>(0)

  const handleTouchStart = useCallback((e: React.TouchEvent, tile: TileType, index: number) => {
    const touch = e.touches[0]
    dragStartTime.current = Date.now()

    setDragState({
      isDragging: true,
      tile,
      tileIndex: index,
      currentX: touch.clientX,
      currentY: touch.clientY,
      startX: touch.clientX,
      startY: touch.clientY,
      targetRow: null,
      targetCol: null,
      fromBoard: false,
      fromRow: null,
      fromCol: null,
    })
  }, [])

  const handleTouchStartFromBoard = useCallback((e: React.TouchEvent, tile: TileType, row: number, col: number) => {
    const touch = e.touches[0]
    dragStartTime.current = Date.now()

    setDragState({
      isDragging: true,
      tile,
      tileIndex: -1, // Not from rack
      currentX: touch.clientX,
      currentY: touch.clientY,
      startX: touch.clientX,
      startY: touch.clientY,
      targetRow: null,
      targetCol: null,
      fromBoard: true,
      fromRow: row,
      fromCol: col,
    })
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent, boardRef?: React.RefObject<HTMLElement>) => {
    if (!dragState.isDragging) return

    // Prevent scrolling while dragging
    e.preventDefault()

    const touch = e.touches[0]
    const touchX = touch.clientX
    const touchY = touch.clientY

    // Calculate target square for visual feedback
    let targetRow: number | null = null
    let targetCol: number | null = null

    if (boardRef?.current) {
      const boardGrid = boardRef.current.querySelector('.grid') as HTMLElement
      const boardElement = boardGrid || boardRef.current
      const boardRect = boardElement.getBoundingClientRect()

      // Check if touch is within board bounds (with some tolerance)
      const tolerance = 10 // pixels outside board still counts
      if (
        touchX >= boardRect.left - tolerance &&
        touchX <= boardRect.right + tolerance &&
        touchY >= boardRect.top - tolerance &&
        touchY <= boardRect.bottom + tolerance
      ) {
        const relativeX = Math.max(0, Math.min(touchX - boardRect.left, boardRect.width - 1))
        const relativeY = Math.max(0, Math.min(touchY - boardRect.top, boardRect.height - 1))
        const cellWidth = boardRect.width / 17
        const cellHeight = boardRect.height / 17

        targetCol = Math.floor(relativeX / cellWidth)
        targetRow = Math.floor(relativeY / cellHeight)

        // Clamp to valid range
        targetRow = Math.max(0, Math.min(16, targetRow))
        targetCol = Math.max(0, Math.min(16, targetCol))
      }
    }

    setDragState(prev => ({
      ...prev,
      currentX: touchX,
      currentY: touchY,
      targetRow,
      targetCol,
    }))
  }, [dragState.isDragging])

  const handleTouchEnd = useCallback((
    e: React.TouchEvent,
    onDrop: (row: number, col: number, tile: TileType, index: number, fromBoard: boolean, fromRow: number | null, fromCol: number | null) => void,
    boardRef: React.RefObject<HTMLElement>
  ) => {
    if (!dragState.isDragging || !dragState.tile) {
      setDragState(initialState)
      return
    }

    // Get the final touch position
    const touch = e.changedTouches[0]
    const dropX = touch.clientX
    const dropY = touch.clientY

    // Find the board grid element and calculate which square was dropped on
    // The board grid is the element with CSS grid display inside the boardRef container
    const boardContainer = boardRef.current
    if (boardContainer) {
      // Find the actual grid element (it has display: grid)
      const boardGrid = boardContainer.querySelector('.grid') as HTMLElement
      const boardElement = boardGrid || boardContainer

      const boardRect = boardElement.getBoundingClientRect()

      // Check if drop is within board bounds
      if (
        dropX >= boardRect.left &&
        dropX <= boardRect.right &&
        dropY >= boardRect.top &&
        dropY <= boardRect.bottom
      ) {
        // Calculate grid position (17x17 board)
        const relativeX = dropX - boardRect.left
        const relativeY = dropY - boardRect.top
        const cellWidth = boardRect.width / 17
        const cellHeight = boardRect.height / 17

        const col = Math.floor(relativeX / cellWidth)
        const row = Math.floor(relativeY / cellHeight)

        // Validate bounds
        if (row >= 0 && row < 17 && col >= 0 && col < 17) {
          onDrop(row, col, dragState.tile, dragState.tileIndex, dragState.fromBoard, dragState.fromRow, dragState.fromCol)
        }
      } else if (dragState.fromBoard) {
        // Dropped outside board - if from board, return to rack (use -1, -1 as signal)
        onDrop(-1, -1, dragState.tile, dragState.tileIndex, dragState.fromBoard, dragState.fromRow, dragState.fromCol)
      }
    }

    // Reset drag state
    setDragState(initialState)
  }, [dragState])

  const handleTouchCancel = useCallback(() => {
    setDragState(initialState)
  }, [])

  return {
    dragState,
    handleTouchStart,
    handleTouchStartFromBoard,
    handleTouchMove,
    handleTouchEnd,
    handleTouchCancel,
  }
}
