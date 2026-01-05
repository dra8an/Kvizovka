/**
 * TileBag Class
 *
 * Manages the bag of tiles in Kvizovka.
 *
 * Responsibilities:
 * - Initialize 238 tiles (228 letters + 10 jokers)
 * - Shuffle tiles randomly
 * - Draw tiles for players
 * - Return tiles to bag (for exchanges)
 * - Track remaining tile count
 *
 * Think of this as the "pile" of tiles players draw from.
 */

import { Tile } from '../types'
import { TILE_DISTRIBUTION, TOTAL_TILES } from '../constants'

/**
 * TileBag Class
 *
 * Example usage:
 * ```typescript
 * const bag = new TileBag()
 * bag.initialize()
 * bag.shuffle()
 *
 * const playerTiles = bag.draw(10)  // Draw 10 tiles
 * console.log(bag.remaining())      // 228 tiles left
 * ```
 */
export class TileBag {
  /**
   * Array of all tiles in the bag
   * Private = only accessible within this class
   */
  private tiles: Tile[] = []

  /**
   * Constructor - creates a new TileBag instance
   */
  constructor() {
    // Bag starts empty, call initialize() to fill it
  }

  /**
   * Initialize the bag with all 238 tiles
   *
   * Creates:
   * - 228 letter tiles (based on TILE_DISTRIBUTION)
   * - 10 joker/blank tiles
   *
   * Tiles are NOT shuffled yet - call shuffle() after this
   */
  initialize(): void {
    this.tiles = []
    let tileIdCounter = 0

    // Loop through each letter in distribution
    for (const [letter, { count, value }] of Object.entries(
      TILE_DISTRIBUTION
    )) {
      // Create 'count' number of tiles for this letter
      for (let i = 0; i < count; i++) {
        if (letter === 'JOKER') {
          // Create a joker tile (blank)
          this.tiles.push({
            id: `joker-${i}`,
            letter: '', // Jokers have no letter until played
            value: 0, // Worth 0 points
            isJoker: true,
          })
        } else {
          // Create a regular letter tile
          this.tiles.push({
            id: `tile-${tileIdCounter++}`,
            letter: letter, // A, B, C, Č, Ć, etc.
            value: value, // 1-4 points
            isJoker: false,
          })
        }
      }
    }

    // Verify we have exactly 238 tiles
    if (this.tiles.length !== TOTAL_TILES) {
      console.warn(
        `⚠️ Tile count mismatch! Expected ${TOTAL_TILES}, got ${this.tiles.length}`
      )
    }
  }

  /**
   * Shuffle the tiles randomly
   *
   * Uses Fisher-Yates shuffle algorithm for true randomness.
   * This ensures every possible ordering is equally likely.
   *
   * Call this after initialize() and before drawing tiles.
   *
   * Algorithm explained:
   * - Start from the end of array
   * - Pick random index from 0 to current position
   * - Swap current and random
   * - Move to next position
   * - Repeat until done
   */
  shuffle(): void {
    // Fisher-Yates shuffle
    for (let i = this.tiles.length - 1; i > 0; i--) {
      // Pick random index from 0 to i
      const j = Math.floor(Math.random() * (i + 1))

      // Swap tiles[i] and tiles[j]
      // Destructuring assignment: [a, b] = [b, a] swaps values
      ;[this.tiles[i], this.tiles[j]] = [this.tiles[j], this.tiles[i]]
    }
  }

  /**
   * Draw tiles from the bag
   *
   * @param count - Number of tiles to draw
   * @returns Array of drawn tiles (may be less than count if bag nearly empty)
   *
   * Tiles are removed from the bag when drawn.
   *
   * Example:
   * ```typescript
   * const playerTiles = bag.draw(10)  // Draw 10 tiles for player
   * ```
   */
  draw(count: number): Tile[] {
    // Can't draw more tiles than we have!
    const actualCount = Math.min(count, this.tiles.length)

    // Remove tiles from end of array (fast operation)
    const drawnTiles = this.tiles.splice(this.tiles.length - actualCount, actualCount)

    return drawnTiles
  }

  /**
   * Draw a single tile
   *
   * @returns One tile, or null if bag is empty
   *
   * Example:
   * ```typescript
   * const tile = bag.drawOne()
   * if (tile) {
   *   console.log(`Drew: ${tile.letter}`)
   * }
   * ```
   */
  drawOne(): Tile | null {
    if (this.tiles.length === 0) {
      return null
    }

    // Remove and return last tile
    return this.tiles.pop() || null
  }

  /**
   * Return tiles to the bag
   *
   * @param tiles - Tiles to return
   *
   * Used when player exchanges tiles.
   * Returned tiles go back into the bag and should be shuffled.
   *
   * Example:
   * ```typescript
   * // Player wants to exchange 3 tiles
   * const unwantedTiles = [tile1, tile2, tile3]
   * bag.returnTiles(unwantedTiles)
   * bag.shuffle()  // Shuffle bag after returning
   * const newTiles = bag.draw(3)  // Draw 3 new tiles
   * ```
   */
  returnTiles(tiles: Tile[]): void {
    // Add tiles back to the bag
    this.tiles.push(...tiles)
    // Note: Caller should shuffle after returning tiles
  }

  /**
   * Get number of remaining tiles in bag
   *
   * @returns Count of tiles left
   *
   * Example:
   * ```typescript
   * console.log(`${bag.remaining()} tiles remaining`)
   * ```
   */
  remaining(): number {
    return this.tiles.length
  }

  /**
   * Check if bag is empty
   *
   * @returns true if no tiles left
   */
  isEmpty(): boolean {
    return this.tiles.length === 0
  }

  /**
   * Peek at remaining tiles (without removing them)
   *
   * @returns Copy of tiles array
   *
   * Useful for AI or debugging, but not for cheating!
   * Returns a copy so caller can't modify the real bag.
   */
  peekTiles(): Tile[] {
    return [...this.tiles] // Spread operator creates a copy
  }

  /**
   * Get distribution of remaining tiles
   *
   * @returns Object with letter counts
   *
   * Example:
   * ```typescript
   * const dist = bag.getDistribution()
   * console.log(dist)
   * // { 'A': 10, 'B': 3, 'K': 5, ... }
   * ```
   *
   * Useful for:
   * - AI strategy (what tiles are likely to be drawn)
   * - Debugging
   * - End game calculations
   */
  getDistribution(): Record<string, number> {
    const distribution: Record<string, number> = {}

    for (const tile of this.tiles) {
      const key = tile.isJoker ? 'JOKER' : tile.letter

      if (distribution[key]) {
        distribution[key]++
      } else {
        distribution[key] = 1
      }
    }

    return distribution
  }

  /**
   * Count tiles by letter
   *
   * @param letter - Letter to count (or 'JOKER')
   * @returns Number of that letter remaining
   *
   * Example:
   * ```typescript
   * const aCount = bag.countLetter('A')
   * console.log(`${aCount} 'A' tiles left`)
   * ```
   */
  countLetter(letter: string): number {
    return this.tiles.filter((tile) => {
      if (letter === 'JOKER') {
        return tile.isJoker
      } else {
        return tile.letter === letter.toUpperCase()
      }
    }).length
  }

  /**
   * Reset the bag to initial state
   *
   * Clears and reinitializes with all 238 tiles
   * Does NOT shuffle - call shuffle() separately if needed
   */
  reset(): void {
    this.initialize()
  }

  /**
   * Get a random tile from the bag (for testing)
   *
   * @returns Random tile from bag, or null if empty
   *
   * Different from draw() - this is for peeking/testing only
   * Doesn't remove the tile from bag
   */
  getRandomTile(): Tile | null {
    if (this.tiles.length === 0) {
      return null
    }

    const randomIndex = Math.floor(Math.random() * this.tiles.length)
    return this.tiles[randomIndex]
  }
}

/**
 * Helper function: Create a new shuffled tile bag
 *
 * Convenience function that initializes and shuffles in one step
 *
 * @returns New TileBag ready for use
 *
 * Example:
 * ```typescript
 * const bag = createTileBag()
 * const tiles = bag.draw(10)
 * ```
 */
export function createTileBag(): TileBag {
  const bag = new TileBag()
  bag.initialize()
  bag.shuffle()
  return bag
}

/**
 * Example Usage:
 *
 * ```typescript
 * // Create and initialize bag
 * const bag = new TileBag()
 * bag.initialize()
 * bag.shuffle()
 *
 * console.log(`Total tiles: ${bag.remaining()}`)  // 238
 *
 * // Draw tiles for player 1
 * const player1Tiles = bag.draw(10)
 * console.log(`Player 1 drew ${player1Tiles.length} tiles`)
 * console.log(`Remaining: ${bag.remaining()}`)  // 228
 *
 * // Draw tiles for player 2
 * const player2Tiles = bag.draw(10)
 * console.log(`Remaining: ${bag.remaining()}`)  // 218
 *
 * // Player exchanges tiles
 * const unwanted = [player1Tiles[0], player1Tiles[1]]
 * bag.returnTiles(unwanted)
 * bag.shuffle()  // Important: shuffle after returning
 * const newTiles = bag.draw(2)
 *
 * // Check what's left
 * const distribution = bag.getDistribution()
 * console.log('Remaining distribution:', distribution)
 *
 * // Count specific letters
 * const aCount = bag.countLetter('A')
 * console.log(`${aCount} 'A' tiles remaining`)
 * ```
 */
