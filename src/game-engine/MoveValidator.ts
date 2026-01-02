/**
 * MoveValidator Class
 *
 * Validates complete moves according to Kvizovka rules.
 *
 * Responsibilities:
 * - Check tile placement validity
 * - Verify tiles form a single line
 * - Ensure connectivity to existing tiles
 * - Validate first move touches center
 * - Find all words formed by a move
 * - Coordinate with WordValidator
 *
 * This is the "referee" that enforces all game rules!
 */

import { Board } from './Board'
import { WordValidator } from './WordValidator'
import { PlacedTile, Direction, BoardSquare } from '../types'
import { BOARD_CENTER, MIN_WORD_LENGTH } from '../constants'

/**
 * Move Validation Result
 *
 * Detailed result of validating a move
 */
export interface MoveValidationResult {
  /**
   * Is the move valid?
   */
  isValid: boolean

  /**
   * Reason if invalid
   */
  reason?: string

  /**
   * All words formed by this move
   */
  wordsFormed?: BoardSquare[][]

  /**
   * Direction of main word (HORIZONTAL or VERTICAL)
   */
  direction?: Direction
}

/**
 * MoveValidator Class
 *
 * Example usage:
 * ```typescript
 * const validator = new MoveValidator(board)
 * const result = validator.validateMove(placedTiles)
 * if (result.isValid) {
 *   console.log('Move is legal!')
 * }
 * ```
 */
export class MoveValidator {
  private board: Board
  private wordValidator: WordValidator

  /**
   * Constructor
   *
   * @param board - The game board to validate against
   */
  constructor(board: Board) {
    this.board = board
    this.wordValidator = new WordValidator()
  }

  /**
   * Validate a complete move
   *
   * @param placedTiles - Tiles being placed in this move
   * @returns MoveValidationResult with details
   *
   * Checks (in order):
   * 1. At least one tile placed
   * 2. All positions valid and empty
   * 3. Tiles form a single line
   * 4. First move touches center
   * 5. Subsequent moves connect to existing tiles
   * 6. All words formed are valid
   */
  validateMove(placedTiles: PlacedTile[]): MoveValidationResult {
    // Rule 1: Must place at least one tile
    if (placedTiles.length === 0) {
      return {
        isValid: false,
        reason: 'No tiles placed',
      }
    }

    // Rule 2: All positions must be valid and empty
    for (const placed of placedTiles) {
      if (!this.board.getSquare(placed.row, placed.col)) {
        return {
          isValid: false,
          reason: `Invalid position: (${placed.row}, ${placed.col})`,
        }
      }

      if (!this.board.isEmpty(placed.row, placed.col)) {
        return {
          isValid: false,
          reason: `Square (${placed.row}, ${placed.col}) is occupied`,
        }
      }
    }

    // Rule 3: Tiles must form a single line (horizontal or vertical)
    const direction = this.determineDirection(placedTiles)
    if (!direction) {
      return {
        isValid: false,
        reason: 'Tiles must form a single horizontal or vertical line',
      }
    }

    // Rule 4 & 5: Check connectivity
    if (this.board.isEmptyBoard()) {
      // First move: must touch center
      const touchesCenter = placedTiles.some((tile) =>
        this.board.touchesCenter(tile.row, tile.col)
      )

      if (!touchesCenter) {
        return {
          isValid: false,
          reason: 'First move must touch the center square',
        }
      }
    } else {
      // Subsequent moves: must connect to existing tiles
      if (!this.board.areConnected(placedTiles)) {
        return {
          isValid: false,
          reason: 'Move must connect to existing tiles on the board',
        }
      }
    }

    // Temporarily place tiles to find words
    for (const placed of placedTiles) {
      this.board.setTile(placed.row, placed.col, placed.tile)
    }

    // Find all words formed
    const wordsFormed = this.findAllWordsFormed(placedTiles, direction)

    // Remove temporary tiles
    for (const placed of placedTiles) {
      this.board.removeTile(placed.row, placed.col)
    }

    // Rule 6: All words must be valid
    const invalidWords = this.wordValidator.getInvalidWords(wordsFormed)

    if (invalidWords.length > 0) {
      const invalidWordsList = invalidWords
        .map((w) => `${w.word} (${w.reason})`)
        .join(', ')

      return {
        isValid: false,
        reason: `Invalid words: ${invalidWordsList}`,
      }
    }

    // Rule 7: Must form at least one word of minimum length
    const hasValidLengthWord = wordsFormed.some(
      (word) => word.length >= MIN_WORD_LENGTH
    )

    if (!hasValidLengthWord) {
      return {
        isValid: false,
        reason: `All words must be at least ${MIN_WORD_LENGTH} letters long`,
      }
    }

    // All checks passed!
    return {
      isValid: true,
      wordsFormed,
      direction,
    }
  }

  /**
   * Determine direction of placed tiles
   *
   * @param placedTiles - Tiles being placed
   * @returns 'HORIZONTAL', 'VERTICAL', or null if invalid
   *
   * Valid patterns:
   * - All same row → HORIZONTAL
   * - All same column → VERTICAL
   * - Single tile → Check adjacent tiles to determine
   * - Mixed rows and columns → Invalid (null)
   */
  private determineDirection(placedTiles: PlacedTile[]): Direction | null {
    if (placedTiles.length === 1) {
      // Single tile: determine from adjacent tiles
      return this.determineSingleTileDirection(placedTiles[0])
    }

    // Check if all tiles in same row (horizontal)
    const allSameRow = placedTiles.every(
      (tile) => tile.row === placedTiles[0].row
    )

    if (allSameRow) {
      // Verify tiles are contiguous (no gaps)
      const cols = placedTiles.map((t) => t.col).sort((a, b) => a - b)
      const isContiguous = this.arePositionsContiguous(
        placedTiles[0].row,
        cols,
        'HORIZONTAL'
      )

      return isContiguous ? 'HORIZONTAL' : null
    }

    // Check if all tiles in same column (vertical)
    const allSameCol = placedTiles.every(
      (tile) => tile.col === placedTiles[0].col
    )

    if (allSameCol) {
      const rows = placedTiles.map((t) => t.row).sort((a, b) => a - b)
      const isContiguous = this.arePositionsContiguous(
        placedTiles[0].col,
        rows,
        'VERTICAL'
      )

      return isContiguous ? 'VERTICAL' : null
    }

    // Mixed rows and columns = invalid
    return null
  }

  /**
   * Determine direction for a single tile placement
   *
   * @param tile - The single tile being placed
   * @returns Direction based on adjacent tiles
   */
  private determineSingleTileDirection(tile: PlacedTile): Direction | null {
    const { row, col } = tile

    // Check horizontal neighbors
    const hasLeftNeighbor = !this.board.isEmpty(row, col - 1)
    const hasRightNeighbor = !this.board.isEmpty(row, col + 1)

    // Check vertical neighbors
    const hasTopNeighbor = !this.board.isEmpty(row - 1, col)
    const hasBottomNeighbor = !this.board.isEmpty(row + 1, col)

    const hasHorizontalNeighbor = hasLeftNeighbor || hasRightNeighbor
    const hasVerticalNeighbor = hasTopNeighbor || hasBottomNeighbor

    // If only horizontal neighbors, word is horizontal
    if (hasHorizontalNeighbor && !hasVerticalNeighbor) {
      return 'HORIZONTAL'
    }

    // If only vertical neighbors, word is vertical
    if (hasVerticalNeighbor && !hasHorizontalNeighbor) {
      return 'VERTICAL'
    }

    // If both or neither, default to horizontal
    return 'HORIZONTAL'
  }

  /**
   * Check if positions are contiguous (no gaps)
   *
   * @param fixedCoord - The row (for horizontal) or col (for vertical) that's constant
   * @param positions - The changing coordinates (cols for horizontal, rows for vertical)
   * @param direction - Direction being checked
   * @returns true if no gaps
   *
   * Example: Tiles at columns [5, 6, 8] → gap at 7 → not contiguous
   */
  private arePositionsContiguous(
    fixedCoord: number,
    positions: number[],
    direction: Direction
  ): boolean {
    // Check each gap between consecutive positions
    for (let i = 0; i < positions.length - 1; i++) {
      const current = positions[i]
      const next = positions[i + 1]

      // Check all squares between current and next
      for (let pos = current + 1; pos < next; pos++) {
        const isEmpty =
          direction === 'HORIZONTAL'
            ? this.board.isEmpty(fixedCoord, pos)
            : this.board.isEmpty(pos, fixedCoord)

        if (isEmpty) {
          return false // Gap found!
        }
      }
    }

    return true // No gaps
  }

  /**
   * Find all words formed by a move
   *
   * @param placedTiles - Tiles being placed
   * @param direction - Main word direction
   * @returns Array of word squares
   *
   * Finds:
   * - Main word (in the direction of placement)
   * - Cross words (perpendicular to main word)
   *
   * Example:
   * Placing "CAT" horizontally might also form "AX" vertically
   */
  private findAllWordsFormed(
    placedTiles: PlacedTile[],
    direction: Direction
  ): BoardSquare[][] {
    const words: BoardSquare[][] = []

    // Find main word
    const mainWord = this.findMainWord(placedTiles, direction)
    if (mainWord.length >= MIN_WORD_LENGTH) {
      words.push(mainWord)
    }

    // Find cross words (perpendicular to main word)
    const crossWords = this.findCrossWords(placedTiles, direction)
    words.push(...crossWords)

    return words
  }

  /**
   * Find the main word formed in the direction of placement
   *
   * @param placedTiles - Tiles being placed
   * @param direction - Direction of word
   * @returns Array of squares making up the word
   */
  private findMainWord(
    placedTiles: PlacedTile[],
    direction: Direction
  ): BoardSquare[] {
    // Use first placed tile as reference
    const { row, col } = placedTiles[0]

    // Get all tiles in line (including existing tiles)
    return this.board.getTilesInLine(row, col, direction)
  }

  /**
   * Find cross words formed perpendicular to main word
   *
   * @param placedTiles - Tiles being placed
   * @param mainDirection - Direction of main word
   * @returns Array of cross words
   */
  private findCrossWords(
    placedTiles: PlacedTile[],
    mainDirection: Direction
  ): BoardSquare[][] {
    const crossWords: BoardSquare[][] = []

    // Perpendicular direction
    const crossDirection: Direction =
      mainDirection === 'HORIZONTAL' ? 'VERTICAL' : 'HORIZONTAL'

    // Check each placed tile for cross words
    for (const placed of placedTiles) {
      const crossWord = this.board.getTilesInLine(
        placed.row,
        placed.col,
        crossDirection
      )

      // Only count if it's a valid word (2+ tiles)
      if (crossWord.length >= MIN_WORD_LENGTH) {
        crossWords.push(crossWord)
      }
    }

    return crossWords
  }
}

/**
 * Example Usage:
 *
 * ```typescript
 * // Create board and validator
 * const board = new Board()
 * board.initialize()
 * const validator = new MoveValidator(board)
 *
 * // Place tiles
 * const placedTiles: PlacedTile[] = [
 *   { tile: tileK, row: 8, col: 8 },
 *   { tile: tileU, row: 8, col: 9 },
 *   { tile: tileC, row: 8, col: 10 },
 *   { tile: tileA, row: 8, col: 11 }
 * ]
 *
 * // Validate move
 * const result = validator.validateMove(placedTiles)
 *
 * if (result.isValid) {
 *   console.log('Move is valid!')
 *   console.log('Words formed:', result.wordsFormed)
 *   console.log('Direction:', result.direction)
 *
 *   // Actually place the tiles on board
 *   for (const placed of placedTiles) {
 *     board.setTile(placed.row, placed.col, placed.tile)
 *   }
 *
 *   // Place blockers
 *   board.placeBlockers(placedTiles, result.direction!)
 * } else {
 *   console.log('Invalid move:', result.reason)
 * }
 * ```
 */
