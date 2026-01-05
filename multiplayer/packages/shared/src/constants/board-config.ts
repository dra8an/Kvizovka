/**
 * Board Configuration
 *
 * This file defines the layout of the Kvizovka game board.
 *
 * The board is 17x17 (289 squares total) with premium fields.
 * Premium fields multiply letter or word scores.
 *
 * Coordinate system:
 * - Row 0 = top, Row 16 = bottom
 * - Col 0 = left, Col 16 = right
 * - Center is at (8, 8) - this is where the first word must be placed
 *
 * Color coding (from official Kvizovka board):
 * - Yellow = 2x letter value (DOUBLE_LETTER)
 * - Green = 3x letter value (TRIPLE_LETTER)
 * - Red = 4x letter value (QUADRUPLE_LETTER)
 * - Blue = 2x word value (WORD_MULTIPLIER, marked with "X")
 * - Black with star = CENTER (starting square)
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
 * Value = PremiumFieldType
 *
 * Layout based on official Kvizovka board image
 */
export const PREMIUM_FIELDS = new Map<Coordinate, PremiumFieldType>([
  // ========================================
  // CENTER SQUARE (1 position)
  // ========================================
  // Black square with star - starting square
  ['8,8', 'CENTER'],

  // ========================================
  // WORD MULTIPLIER SQUARES - Blue with "X" (12 positions)
  // ========================================
  // Multiply the entire word score by 2

  // Row 1
  ['2,2', 'WORD_MULTIPLIER'],
  ['2,8', 'WORD_MULTIPLIER'],
  ['2,14', 'WORD_MULTIPLIER'],

  // Row 6
  ['8,2', 'WORD_MULTIPLIER'],
  ['8,14', 'WORD_MULTIPLIER'],

  // Row 14
  ['14,2', 'WORD_MULTIPLIER'],
  ['14,8', 'WORD_MULTIPLIER'],
  ['14,14', 'WORD_MULTIPLIER'],

  // ========================================
  // DOUBLE LETTER SQUARES - Yellow (32 positions)
  // ========================================
  // Multiply the letter value by 2

  // Row 0 (top)
  ['0,4', 'DOUBLE_LETTER'],
  ['0,12', 'DOUBLE_LETTER'],

  // Row 2
  ['2,6', 'DOUBLE_LETTER'],
  ['2,10', 'DOUBLE_LETTER'],

  // Row 4
  ['4,0', 'DOUBLE_LETTER'],
  ['4,8', 'DOUBLE_LETTER'],
  ['4,16', 'DOUBLE_LETTER'],

  // Row 6
  ['6,2', 'DOUBLE_LETTER'],
  ['6,6', 'DOUBLE_LETTER'],
  ['6,10', 'DOUBLE_LETTER'],
  ['6,14', 'DOUBLE_LETTER'],

  // Row 8
  ['8,4', 'DOUBLE_LETTER'],
  ['8,12', 'DOUBLE_LETTER'],

  // Row 10
  ['10,2', 'DOUBLE_LETTER'],
  ['10,6', 'DOUBLE_LETTER'],
  ['10,10', 'DOUBLE_LETTER'],
  ['10,14', 'DOUBLE_LETTER'],

  // Row 12
  ['12,0', 'DOUBLE_LETTER'],
  ['12,8', 'DOUBLE_LETTER'],
  ['12,16', 'DOUBLE_LETTER'],

  // Row 14
  ['14,6', 'DOUBLE_LETTER'],
  ['14,10', 'DOUBLE_LETTER'],

  // Row 16 (bottom)
  ['16,4', 'DOUBLE_LETTER'],
  ['16,12', 'DOUBLE_LETTER'],

  // ========================================
  // TRIPLE LETTER SQUARES - Green (4 positions)
  // ========================================
  // Multiply the letter value by 3

  ['4,4', 'TRIPLE_LETTER'],
  ['4,12', 'TRIPLE_LETTER'],
  ['12,4', 'TRIPLE_LETTER'],
  ['12,12', 'TRIPLE_LETTER'],

  // ========================================
  // QUADRUPLE LETTER SQUARES - Red (8 positions)
  // ========================================
  // Multiply the letter value by 4 (highest multiplier!)

  // Row 0 (top edge)
  ['0,0', 'QUADRUPLE_LETTER'],
  ['0,8', 'QUADRUPLE_LETTER'],
  ['0,16', 'QUADRUPLE_LETTER'],

  // Row 8 (middle edge)
  ['8,0', 'QUADRUPLE_LETTER'],
  ['8,16', 'QUADRUPLE_LETTER'],

  // Row 16 (bottom edge)
  ['16,0', 'QUADRUPLE_LETTER'],
  ['16,8', 'QUADRUPLE_LETTER'],
  ['16,16', 'QUADRUPLE_LETTER'],
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
 *   getPremiumField(1, 2)  // Returns 'WORD_MULTIPLIER'
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
