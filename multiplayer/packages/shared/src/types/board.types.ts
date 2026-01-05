/**
 * Board Type Definitions
 *
 * This file defines all TypeScript types related to the game board.
 *
 * Key TypeScript concepts used here:
 * - type: Creates a type alias (like a shortcut for complex types)
 * - interface: Defines the shape of an object
 * - enum: Defines a set of named constants
 * - Array types: Type[] or Array<Type>
 */

/**
 * Premium Field Types
 *
 * These are the special squares on the board that multiply scores.
 * Using a union type (|) means a value can be ONE of these options.
 *
 * Example: let field: PremiumFieldType = 'DOUBLE_LETTER' ✅
 *          let field: PremiumFieldType = 'INVALID' ❌ (TypeScript error)
 */
export type PremiumFieldType =
  | 'DOUBLE_LETTER'      // Yellow square with 2 dots - multiplies letter value by 2
  | 'TRIPLE_LETTER'      // Green square with 3 dots - multiplies letter value by 3
  | 'QUADRUPLE_LETTER'   // Red square with 4 dots - multiplies letter value by 4
  | 'WORD_MULTIPLIER'    // X-marked square - multiplies entire word value by 2
  | 'CENTER'             // Starting square (center of board)
  | null                 // Regular square with no multiplier

/**
 * Tile Type
 *
 * Imported from tile.types.ts to avoid circular dependencies.
 * We'll define this properly in tile.types.ts.
 */
export interface Tile {
  id: string
  letter: string
  value: number
  isJoker: boolean
  jokerLetter?: string
}

/**
 * Black Blocker Tile
 *
 * Special tile type that represents a blocker.
 * Blockers are placed around words to prevent extension.
 *
 * This is Kvizovka-specific (not in Scrabble).
 */
export interface BlockerTile {
  type: 'BLOCKER'      // Literal type - must be exactly this string
  id: string           // Unique identifier
}

/**
 * Board Square
 *
 * Represents a single square on the 17x17 game board.
 *
 * Interface explained:
 * - Each property has a name, type, and optional comment
 * - ? means optional (can be undefined)
 * - | means "or" (union type)
 */
export interface BoardSquare {
  /**
   * Row position (0-16)
   * 0 is top, 16 is bottom
   */
  row: number

  /**
   * Column position (0-16)
   * 0 is left, 16 is right
   */
  col: number

  /**
   * Tile placed on this square
   * - Can be a letter Tile
   * - Can be a BlockerTile (black blocker)
   * - Can be null (empty square)
   */
  tile: Tile | BlockerTile | null

  /**
   * Type of premium field (if any)
   * null means regular square
   */
  premiumField: PremiumFieldType

  /**
   * Whether the premium field has been used
   * Premium fields only apply once (when first covered)
   */
  isUsed: boolean
}

/**
 * Board Type
 *
 * The game board is a 2D array of squares (17x17 = 289 squares total).
 *
 * Type explanation:
 * - BoardSquare[][] means "array of arrays of BoardSquare"
 * - Outer array = rows (17 rows)
 * - Inner array = columns (17 columns per row)
 *
 * Access example:
 *   const square = board[8][8]  // Gets center square (row 8, col 8)
 */
export type Board = BoardSquare[][]

/**
 * Position Type
 *
 * Represents a position on the board.
 * Used for specifying locations without creating a full BoardSquare.
 */
export interface Position {
  row: number  // 0-16
  col: number  // 0-16
}

/**
 * Direction Type
 *
 * Word placement direction.
 */
export type Direction = 'HORIZONTAL' | 'VERTICAL'

/**
 * Placed Tile Type
 *
 * Represents a tile that has been placed on the board during a move.
 * Different from BoardSquare - this is for tracking the current move.
 */
export interface PlacedTile {
  tile: Tile
  row: number
  col: number
}

/**
 * Word Type
 *
 * Represents a word formed on the board.
 */
export interface Word {
  /**
   * The word text (e.g., "CATS")
   */
  text: string

  /**
   * Squares that make up this word
   */
  squares: BoardSquare[]

  /**
   * Direction of the word
   */
  direction: Direction

  /**
   * Starting position
   */
  start: Position

  /**
   * Ending position
   */
  end: Position
}

/**
 * Helper type for coordinates
 * Format: "row,col" (e.g., "8,8" for center)
 * Used for mapping premium field positions
 */
export type Coordinate = string

/**
 * Example Usage:
 *
 * ```typescript
 * // Create a board square
 * const square: BoardSquare = {
 *   row: 8,
 *   col: 8,
 *   tile: null,
 *   premiumField: 'CENTER',
 *   isUsed: false
 * }
 *
 * // Create a board (17x17 grid)
 * const board: Board = Array(17).fill(null).map(() =>
 *   Array(17).fill(null).map(() => ({ ...emptySquare }))
 * )
 *
 * // Access a square
 * const centerSquare = board[8][8]
 * console.log(centerSquare.premiumField) // 'CENTER'
 * ```
 */
