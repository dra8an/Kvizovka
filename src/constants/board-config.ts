/**
 * Board Configuration
 *
 * This file defines the layout of the Kvizovka game board.
 *
 * The board is 17x17 (289 squares total) with 45 premium fields.
 * Premium fields multiply letter or word scores.
 *
 * Coordinate system:
 * - Row 0 = top, Row 16 = bottom
 * - Col 0 = left, Col 16 = right
 * - Center is at (8, 8) - this is where the first word must be placed
 */

import { PremiumFieldType, Coordinate } from '../types'

/**
 * Board dimensions
 * Kvizovka uses 17x17 (vs Scrabble's 15x15)
 */
export const BOARD_SIZE = 17

/**
 * Center position (where first word must touch)
 * Math: 17 / 2 = 8.5, rounded down = 8 (0-indexed)
 */
export const BOARD_CENTER = {
  row: 8,
  col: 8,
} as const // 'as const' makes this readonly (can't be changed)

/**
 * Premium Field Positions
 *
 * This map stores the position of every premium field on the board.
 * Key = "row,col" (e.g., "8,8" for center)
 * Value = PremiumFieldType ('DOUBLE_LETTER', 'TRIPLE_LETTER', etc.)
 *
 * Why use a Map?
 * - Fast lookup: O(1) to check if a square is premium
 * - Memory efficient: Only stores 45 positions (not all 289 squares)
 *
 * Example usage:
 *   const fieldType = PREMIUM_FIELDS.get('8,8')  // Returns 'CENTER'
 *   const isDouble = PREMIUM_FIELDS.get('0,3') === 'DOUBLE_LETTER'
 */
export const PREMIUM_FIELDS = new Map<Coordinate, PremiumFieldType>([
  // ========================================
  // CENTER SQUARE (1 position)
  // ========================================
  // The starting square - first word must touch this
  ['8,8', 'CENTER'],

  // ========================================
  // WORD MULTIPLIER SQUARES (16 positions)
  // ========================================
  // X-marked squares that multiply the entire word score by 2
  // Pattern: Forms an X shape across the board

  // Top-left to bottom-right diagonal
  ['0,0', 'WORD_MULTIPLIER'],
  ['2,2', 'WORD_MULTIPLIER'],
  ['4,4', 'WORD_MULTIPLIER'],
  ['6,6', 'WORD_MULTIPLIER'],
  ['10,10', 'WORD_MULTIPLIER'],
  ['12,12', 'WORD_MULTIPLIER'],
  ['14,14', 'WORD_MULTIPLIER'],
  ['16,16', 'WORD_MULTIPLIER'],

  // Top-right to bottom-left diagonal
  ['0,16', 'WORD_MULTIPLIER'],
  ['2,14', 'WORD_MULTIPLIER'],
  ['4,12', 'WORD_MULTIPLIER'],
  ['6,10', 'WORD_MULTIPLIER'],
  ['10,6', 'WORD_MULTIPLIER'],
  ['12,4', 'WORD_MULTIPLIER'],
  ['14,2', 'WORD_MULTIPLIER'],
  ['16,0', 'WORD_MULTIPLIER'],

  // ========================================
  // DOUBLE LETTER SQUARES - 2x (12 positions)
  // ========================================
  // Yellow squares with 2 dots
  // Multiply the letter value by 2 (only applies once, when first covered)

  // Top edge
  ['0,3', 'DOUBLE_LETTER'],
  ['0,13', 'DOUBLE_LETTER'],

  // Left edge
  ['3,0', 'DOUBLE_LETTER'],
  ['13,0', 'DOUBLE_LETTER'],

  // Right edge
  ['3,16', 'DOUBLE_LETTER'],
  ['13,16', 'DOUBLE_LETTER'],

  // Bottom edge
  ['16,3', 'DOUBLE_LETTER'],
  ['16,13', 'DOUBLE_LETTER'],

  // Inner positions
  ['5,5', 'DOUBLE_LETTER'],
  ['5,11', 'DOUBLE_LETTER'],
  ['11,5', 'DOUBLE_LETTER'],
  ['11,11', 'DOUBLE_LETTER'],

  // ========================================
  // TRIPLE LETTER SQUARES - 3x (8 positions)
  // ========================================
  // Green squares with 3 dots
  // Multiply the letter value by 3

  // Cross pattern in the middle
  ['1,8', 'TRIPLE_LETTER'],
  ['8,1', 'TRIPLE_LETTER'],
  ['8,15', 'TRIPLE_LETTER'],
  ['15,8', 'TRIPLE_LETTER'],

  // Inner ring
  ['5,8', 'TRIPLE_LETTER'],
  ['8,5', 'TRIPLE_LETTER'],
  ['8,11', 'TRIPLE_LETTER'],
  ['11,8', 'TRIPLE_LETTER'],

  // ========================================
  // QUADRUPLE LETTER SQUARES - 4x (8 positions)
  // ========================================
  // Red squares with 4 dots
  // Multiply the letter value by 4 (most valuable multiplier!)

  // Corners near center
  ['3,3', 'QUADRUPLE_LETTER'],
  ['3,13', 'QUADRUPLE_LETTER'],
  ['13,3', 'QUADRUPLE_LETTER'],
  ['13,13', 'QUADRUPLE_LETTER'],

  // Outer positions
  ['0,8', 'QUADRUPLE_LETTER'],
  ['8,0', 'QUADRUPLE_LETTER'],
  ['8,16', 'QUADRUPLE_LETTER'],
  ['16,8', 'QUADRUPLE_LETTER'],
])

/**
 * Helper function to get premium field type at a position
 *
 * This is a convenience function that:
 * 1. Converts (row, col) to "row,col" string format
 * 2. Looks up the position in PREMIUM_FIELDS map
 * 3. Returns the field type or null if regular square
 *
 * Example:
 *   getPremiumField(8, 8)  // Returns 'CENTER'
 *   getPremiumField(0, 0)  // Returns 'WORD_MULTIPLIER'
 *   getPremiumField(1, 1)  // Returns null (regular square)
 */
export function getPremiumField(row: number, col: number): PremiumFieldType {
  // Convert to coordinate string (e.g., "8,8")
  const coordinate: Coordinate = `${row},${col}`

  // Look up in map, return null if not found
  return PREMIUM_FIELDS.get(coordinate) || null
}

/**
 * Check if a position is within board bounds
 *
 * Valid positions: row and col must be 0-16
 *
 * Example:
 *   isValidPosition(8, 8)   // true (center)
 *   isValidPosition(0, 0)   // true (top-left corner)
 *   isValidPosition(-1, 5)  // false (row too small)
 *   isValidPosition(8, 17)  // false (col too large)
 */
export function isValidPosition(row: number, col: number): boolean {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE
}

/**
 * Get all adjacent positions (up, down, left, right)
 *
 * Returns array of positions that are next to the given position.
 * Does NOT include diagonals.
 * Filters out positions outside the board.
 *
 * Example:
 *   getAdjacentPositions(8, 8)
 *   // Returns: [{row: 7, col: 8}, {row: 9, col: 8}, {row: 8, col: 7}, {row: 8, col: 9}]
 *
 *   getAdjacentPositions(0, 0)
 *   // Returns: [{row: 0, col: 1}, {row: 1, col: 0}]  (only 2 neighbors at corner)
 */
export function getAdjacentPositions(
  row: number,
  col: number
): Array<{ row: number; col: number }> {
  const positions = [
    { row: row - 1, col }, // Up
    { row: row + 1, col }, // Down
    { row, col: col - 1 }, // Left
    { row, col: col + 1 }, // Right
  ]

  // Filter to keep only valid positions
  return positions.filter((pos) => isValidPosition(pos.row, pos.col))
}

/**
 * Example Usage:
 *
 * ```typescript
 * // Initialize a board and set premium fields
 * const board: Board = createEmptyBoard()
 *
 * for (let row = 0; row < BOARD_SIZE; row++) {
 *   for (let col = 0; col < BOARD_SIZE; col++) {
 *     board[row][col].premiumField = getPremiumField(row, col)
 *   }
 * }
 *
 * // Check if center square is premium
 * const centerType = getPremiumField(8, 8)
 * console.log(centerType) // 'CENTER'
 *
 * // Get neighbors of a position
 * const neighbors = getAdjacentPositions(8, 8)
 * console.log(neighbors.length) // 4 (center has all 4 neighbors)
 * ```
 */
