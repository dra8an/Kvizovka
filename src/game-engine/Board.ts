/**
 * Board Class
 *
 * Manages the 17×17 Kvizovka game board.
 *
 * Responsibilities:
 * - Initialize the board with premium fields
 * - Get and set tiles on squares
 * - Check adjacency and connectivity
 * - Place blocker tiles around words
 *
 * The board is the "playing field" where tiles are placed.
 */

import {
  Board as BoardType,
  BoardSquare,
  Tile,
  BlockerTile,
  Position,
  Direction,
  PlacedTile,
  Word,
} from '../types'
import {
  BOARD_SIZE,
  BOARD_CENTER,
  getPremiumField,
  isValidPosition,
  getAdjacentPositions,
} from '../constants'

/**
 * Board Class
 *
 * Example usage:
 * ```typescript
 * const board = new Board()
 * board.initialize()
 * const centerSquare = board.getSquare(8, 8)
 * board.setTile(8, 8, myTile)
 * ```
 */
export class Board {
  /**
   * The 17×17 grid of board squares
   * Private = can only be accessed within this class
   */
  private grid: BoardType

  /**
   * Constructor - creates a new Board instance
   *
   * JavaScript tip: Constructor runs when you write `new Board()`
   */
  constructor() {
    // Initialize empty grid
    // We'll populate it in the initialize() method
    this.grid = []
  }

  /**
   * Initialize the board
   *
   * Creates a 17×17 grid with:
   * - All squares empty (no tiles)
   * - Premium fields in correct positions
   * - All premium fields unused
   *
   * Call this once when starting a new game.
   */
  initialize(): void {
    // Create 17 rows
    for (let row = 0; row < BOARD_SIZE; row++) {
      this.grid[row] = []

      // Create 17 columns in each row
      for (let col = 0; col < BOARD_SIZE; col++) {
        this.grid[row][col] = {
          row,
          col,
          tile: null, // No tile yet
          premiumField: getPremiumField(row, col), // May be null or a premium type
          isUsed: false, // Premium not used yet
        }
      }
    }
  }

  /**
   * Get a square at a specific position
   *
   * @param row - Row number (0-16)
   * @param col - Column number (0-16)
   * @returns The BoardSquare at that position, or null if invalid
   *
   * Example:
   * ```typescript
   * const centerSquare = board.getSquare(8, 8)
   * console.log(centerSquare.premiumField)  // 'CENTER'
   * ```
   */
  getSquare(row: number, col: number): BoardSquare | null {
    // Check if position is valid
    if (!isValidPosition(row, col)) {
      return null
    }

    return this.grid[row][col]
  }

  /**
   * Get a tile at a specific position
   *
   * @param row - Row number (0-16)
   * @param col - Column number (0-16)
   * @returns The tile at that position, or null if empty/invalid
   */
  getTile(row: number, col: number): Tile | BlockerTile | null {
    const square = this.getSquare(row, col)
    return square ? square.tile : null
  }

  /**
   * Set a tile at a specific position
   *
   * @param row - Row number (0-16)
   * @param col - Column number (0-16)
   * @param tile - The tile to place (or null to remove)
   * @returns true if successful, false if position invalid
   *
   * Example:
   * ```typescript
   * const tile: Tile = { id: 'tile-1', letter: 'A', value: 1, isJoker: false }
   * board.setTile(8, 8, tile)  // Place 'A' on center square
   * ```
   */
  setTile(row: number, col: number, tile: Tile | BlockerTile | null): boolean {
    const square = this.getSquare(row, col)

    if (!square) {
      return false // Invalid position
    }

    square.tile = tile

    // NOTE: Premium fields are NOT marked as used here!
    // They are marked as used AFTER score calculation in markSquaresAsUsed()
    // This ensures multipliers are applied during scoring.

    return true
  }

  /**
   * Remove a tile from a position
   *
   * @param row - Row number
   * @param col - Column number
   * @returns The removed tile, or null if nothing there
   */
  removeTile(row: number, col: number): Tile | BlockerTile | null {
    const square = this.getSquare(row, col)

    if (!square) {
      return null
    }

    const tile = square.tile
    square.tile = null
    return tile
  }

  /**
   * Check if a position is empty (no tile)
   *
   * @param row - Row number
   * @param col - Column number
   * @returns true if empty, false if occupied or invalid
   */
  isEmpty(row: number, col: number): boolean {
    const tile = this.getTile(row, col)
    return tile === null
  }

  /**
   * Check if a position has a blocker tile
   *
   * @param row - Row number
   * @param col - Column number
   * @returns true if blocker tile present
   */
  isBlocker(row: number, col: number): boolean {
    const tile = this.getTile(row, col)
    return tile !== null && 'type' in tile && tile.type === 'BLOCKER'
  }

  /**
   * Check if board is completely empty
   *
   * @returns true if no tiles on board
   *
   * Used to determine if this is the first move of the game
   * (first move must touch center square)
   */
  isEmptyBoard(): boolean {
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (!this.isEmpty(row, col)) {
          return false
        }
      }
    }
    return true
  }

  /**
   * Check if a position touches the center square
   *
   * @param row - Row number
   * @param col - Column number
   * @returns true if position is center or adjacent to center
   *
   * Used for first move validation (must touch center)
   */
  touchesCenter(row: number, col: number): boolean {
    // Check if this IS the center
    if (row === BOARD_CENTER.row && col === BOARD_CENTER.col) {
      return true
    }

    // Check if adjacent to center
    const neighbors = getAdjacentPositions(row, col)
    return neighbors.some(
      (pos) => pos.row === BOARD_CENTER.row && pos.col === BOARD_CENTER.col
    )
  }

  /**
   * Get all tiles placed in a line (horizontal or vertical)
   *
   * @param row - Starting row
   * @param col - Starting column
   * @param direction - HORIZONTAL or VERTICAL
   * @returns Array of squares in that line with tiles
   *
   * This helps form words from placed tiles.
   *
   * Example:
   * If tiles are at (8,7), (8,8), (8,9) horizontally,
   * calling getTilesInLine(8, 7, 'HORIZONTAL') returns those 3 squares
   */
  getTilesInLine(
    row: number,
    col: number,
    direction: Direction
  ): BoardSquare[] {
    const tiles: BoardSquare[] = []

    if (direction === 'HORIZONTAL') {
      // Scan left to find start of word (stop at empty or blocker)
      let startCol = col
      while (startCol > 0 && !this.isEmpty(row, startCol - 1) && !this.isBlocker(row, startCol - 1)) {
        startCol--
      }

      // Scan right to collect all tiles in word (stop at empty or blocker)
      let currentCol = startCol
      while (currentCol < BOARD_SIZE && !this.isEmpty(row, currentCol) && !this.isBlocker(row, currentCol)) {
        const square = this.getSquare(row, currentCol)
        if (square) {
          tiles.push(square)
        }
        currentCol++
      }
    } else {
      // VERTICAL
      // Scan up to find start (stop at empty or blocker)
      let startRow = row
      while (startRow > 0 && !this.isEmpty(startRow - 1, col) && !this.isBlocker(startRow - 1, col)) {
        startRow--
      }

      // Scan down to collect tiles (stop at empty or blocker)
      let currentRow = startRow
      while (currentRow < BOARD_SIZE && !this.isEmpty(currentRow, col) && !this.isBlocker(currentRow, col)) {
        const square = this.getSquare(currentRow, col)
        if (square) {
          tiles.push(square)
        }
        currentRow++
      }
    }

    return tiles
  }

  /**
   * Place blocker tiles around a word
   *
   * Kvizovka-specific rule: After placing a word, black blocker tiles
   * are placed before the first letter and after the last letter
   * (if those positions are on the board and empty).
   *
   * @param placedTiles - The tiles that were just placed
   * @param direction - Direction of the word
   *
   * Example:
   * Word "KUĆA" placed at (8,8) to (8,11) horizontally
   * → Blocker placed at (8,7) and (8,12) if empty
   */
  placeBlockers(placedTiles: PlacedTile[], direction: Direction): void {
    if (placedTiles.length === 0) {
      return
    }

    // Sort tiles to find first and last
    const sorted = [...placedTiles].sort((a, b) => {
      if (direction === 'HORIZONTAL') {
        return a.col - b.col
      } else {
        return a.row - b.row
      }
    })

    const first = sorted[0]
    const last = sorted[sorted.length - 1]

    // Place blocker before first tile
    if (direction === 'HORIZONTAL') {
      const beforeCol = first.col - 1
      if (isValidPosition(first.row, beforeCol) && this.isEmpty(first.row, beforeCol)) {
        const blocker: BlockerTile = { type: 'BLOCKER', id: `blocker-${first.row}-${beforeCol}` }
        this.setTile(first.row, beforeCol, blocker)
      }

      // Place blocker after last tile
      const afterCol = last.col + 1
      if (isValidPosition(last.row, afterCol) && this.isEmpty(last.row, afterCol)) {
        const blocker: BlockerTile = { type: 'BLOCKER', id: `blocker-${last.row}-${afterCol}` }
        this.setTile(last.row, afterCol, blocker)
      }
    } else {
      // VERTICAL
      const beforeRow = first.row - 1
      if (isValidPosition(beforeRow, first.col) && this.isEmpty(beforeRow, first.col)) {
        const blocker: BlockerTile = { type: 'BLOCKER', id: `blocker-${beforeRow}-${first.col}` }
        this.setTile(beforeRow, first.col, blocker)
      }

      const afterRow = last.row + 1
      if (isValidPosition(afterRow, last.col) && this.isEmpty(afterRow, last.col)) {
        const blocker: BlockerTile = { type: 'BLOCKER', id: `blocker-${afterRow}-${last.col}` }
        this.setTile(afterRow, last.col, blocker)
      }
    }
  }

  /**
   * Get all adjacent occupied squares
   *
   * @param row - Row number
   * @param col - Column number
   * @returns Array of adjacent squares with tiles
   *
   * Useful for checking connectivity (new tiles must touch existing ones)
   */
  getAdjacentOccupiedSquares(row: number, col: number): BoardSquare[] {
    const adjacent = getAdjacentPositions(row, col)
    const occupied: BoardSquare[] = []

    for (const pos of adjacent) {
      if (!this.isEmpty(pos.row, pos.col)) {
        const square = this.getSquare(pos.row, pos.col)
        if (square) {
          occupied.push(square)
        }
      }
    }

    return occupied
  }

  /**
   * Check if new tiles are connected to existing tiles
   *
   * @param placedTiles - Newly placed tiles
   * @returns true if connected to at least one existing tile
   *
   * Rule: All moves (except first) must connect to existing tiles
   */
  areConnected(placedTiles: PlacedTile[]): boolean {
    // First move (empty board) doesn't need connection
    if (this.isEmptyBoard()) {
      return true
    }

    // Check if any placed tile is adjacent to an existing tile
    for (const placed of placedTiles) {
      const adjacent = this.getAdjacentOccupiedSquares(placed.row, placed.col)

      // Filter out the newly placed tiles (they don't count as "existing")
      const existingAdjacent = adjacent.filter((square) => {
        return !placedTiles.some(
          (p) => p.row === square.row && p.col === square.col
        )
      })

      if (existingAdjacent.length > 0) {
        return true // Connected!
      }
    }

    return false // Not connected to any existing tiles
  }

  /**
   * Mark premium squares as used after tiles are placed
   *
   * @param placedTiles - Tiles that were just placed
   *
   * IMPORTANT: Call this AFTER score calculation!
   * Premium fields must be unmarked during scoring so multipliers apply.
   * After scoring, mark them as used so they don't apply again.
   *
   * Example:
   *   1. Place tiles on board (premium squares still isUsed = false)
   *   2. Calculate score (multipliers applied because !isUsed)
   *   3. Mark squares as used (prevent future multipliers)
   */
  markSquaresAsUsed(placedTiles: PlacedTile[]): void {
    for (const placed of placedTiles) {
      const square = this.getSquare(placed.row, placed.col)

      if (square && square.premiumField && !square.isUsed) {
        square.isUsed = true
        console.log(`✅ Marked (${placed.row},${placed.col}) ${square.premiumField} as used`)
      }
    }
  }

  /**
   * Get the entire board grid
   *
   * @returns The full 17×17 board
   *
   * Use for rendering the board in UI or saving game state
   */
  getGrid(): BoardType {
    return this.grid
  }

  /**
   * Clone the board (deep copy)
   *
   * @returns A new Board instance with same state
   *
   * Useful for AI move evaluation (try moves without affecting real board)
   */
  clone(): Board {
    const newBoard = new Board()
    newBoard.initialize()

    // Copy all tiles and states
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const square = this.getSquare(row, col)
        if (square && square.tile) {
          newBoard.setTile(row, col, { ...square.tile })
        }
        const newSquare = newBoard.getSquare(row, col)
        if (newSquare && square) {
          newSquare.isUsed = square.isUsed
        }
      }
    }

    return newBoard
  }

  /**
   * Reset the board to empty state
   *
   * Clears all tiles but keeps premium field configuration
   */
  reset(): void {
    this.initialize()
  }
}

/**
 * Example Usage:
 *
 * ```typescript
 * // Create and initialize board
 * const board = new Board()
 * board.initialize()
 *
 * // Place a tile
 * const tile: Tile = {
 *   id: 'tile-1',
 *   letter: 'K',
 *   value: 2,
 *   isJoker: false
 * }
 * board.setTile(8, 8, tile)
 *
 * // Check if center is occupied
 * console.log(board.isEmpty(8, 8))  // false
 *
 * // Get tiles in a line
 * const horizontal = board.getTilesInLine(8, 8, 'HORIZONTAL')
 *
 * // Place blockers around word
 * const placedTiles = [
 *   { tile, row: 8, col: 8 },
 *   { tile: tile2, row: 8, col: 9 }
 * ]
 * board.placeBlockers(placedTiles, 'HORIZONTAL')
 * ```
 */
