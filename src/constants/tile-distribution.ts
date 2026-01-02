/**
 * Tile Distribution for Kvizovka
 *
 * This file defines the distribution of tiles in the game.
 *
 * In Kvizovka:
 * - 238 total tiles (228 letters + 10 jokers)
 * - Serbian alphabet with Latin script
 * - Point values based on letter frequency (rare letters = more points)
 *
 * Serbian alphabet includes special letters:
 * - Č, Ć, Đ, Š, Ž (single letters with diacritics)
 * - DŽ, LJ, NJ (digraphs - two characters that count as one letter)
 */

import { TileDistribution } from '../types'

/**
 * Tile Distribution Map
 *
 * Key = letter (uppercase Serbian alphabet)
 * Value = { count: number of tiles, value: point value }
 *
 * Point value system:
 * - 1 point: Very common letters (A, E, I, O, N, R, S, T, etc.)
 * - 2 points: Moderately common letters (B, D, G, K, L, M, P, V, Z)
 * - 3 points: Less common letters (C, Č, Ć, H, J, U, Ž)
 * - 4 points: Rare letters (Đ, DŽ, F, LJ, NJ, Š)
 *
 * Total tiles: 228 letters + 10 jokers = 238
 */
export const TILE_DISTRIBUTION: Record<string, TileDistribution> = {
  // ========================================
  // 1 POINT TILES (140 tiles)
  // ========================================
  // Most common letters in Serbian language

  A: { count: 14, value: 1 }, // Very common vowel
  E: { count: 12, value: 1 }, // Common vowel
  I: { count: 11, value: 1 }, // Common vowel
  O: { count: 11, value: 1 }, // Common vowel
  N: { count: 10, value: 1 }, // Very common consonant
  R: { count: 10, value: 1 }, // Common consonant (can be vowel in Serbian!)
  S: { count: 10, value: 1 }, // Common consonant
  T: { count: 10, value: 1 }, // Common consonant
  J: { count: 8, value: 1 }, // Common in Serbian
  K: { count: 8, value: 1 }, // Common consonant
  M: { count: 8, value: 1 }, // Common consonant
  P: { count: 8, value: 1 }, // Common consonant
  V: { count: 8, value: 1 }, // Common consonant

  // ========================================
  // 2 POINT TILES (58 tiles)
  // ========================================
  // Moderately common letters

  B: { count: 5, value: 2 },
  D: { count: 5, value: 2 },
  G: { count: 4, value: 2 },
  L: { count: 6, value: 2 },
  U: { count: 6, value: 2 }, // Less common vowel
  Z: { count: 4, value: 2 },

  // ========================================
  // 3 POINT TILES (22 tiles)
  // ========================================
  // Less common letters and some special characters

  C: { count: 4, value: 3 },
  Č: { count: 3, value: 3 }, // Special Serbian letter
  Ć: { count: 3, value: 3 }, // Special Serbian letter
  H: { count: 3, value: 3 },
  Ž: { count: 3, value: 3 }, // Special Serbian letter

  // ========================================
  // 4 POINT TILES (8 tiles)
  // ========================================
  // Rare letters - highest point value!

  Đ: { count: 2, value: 4 }, // Rare Serbian letter
  DŽ: { count: 2, value: 4 }, // Digraph (rare)
  F: { count: 2, value: 4 }, // Rare in Serbian (mostly foreign words)
  LJ: { count: 2, value: 4 }, // Digraph (unique to Serbian/Croatian)
  NJ: { count: 2, value: 4 }, // Digraph (unique to Serbian/Croatian)
  Š: { count: 2, value: 4 }, // Special Serbian letter

  // ========================================
  // JOKER TILES (10 tiles)
  // ========================================
  // Blank tiles that can represent any letter
  // Worth 0 points but extremely valuable for making words!

  // Note: Jokers are stored as empty string '' in the Tile object
  // We use 'JOKER' here just as a key for initialization
  JOKER: { count: 10, value: 0 },
}

/**
 * Total number of tiles in the game
 * Should equal 238 (228 letters + 10 jokers)
 */
export const TOTAL_TILES = Object.values(TILE_DISTRIBUTION).reduce(
  (sum, tile) => sum + tile.count,
  0
)

/**
 * Number of tiles each player holds
 * Kvizovka uses 10 (vs Scrabble's 7)
 */
export const TILES_PER_PLAYER = 10

/**
 * Letter frequency reference (for AI and strategy)
 *
 * This map shows the probability of drawing each letter.
 * Useful for:
 * - AI decision making (don't waste common letters)
 * - Teaching players strategy (which tiles to exchange)
 * - Balancing game difficulty
 *
 * Formula: frequency = count / total_tiles
 * Example: A appears 14 times out of 238 tiles = 5.88%
 */
export const LETTER_FREQUENCIES: Record<string, number> = Object.entries(
  TILE_DISTRIBUTION
).reduce(
  (frequencies, [letter, { count }]) => {
    frequencies[letter] = count / TOTAL_TILES
    return frequencies
  },
  {} as Record<string, number>
)

/**
 * Get tile value for a letter
 *
 * Returns the point value of a letter.
 * Returns 0 if letter not found (e.g., for jokers).
 *
 * Example:
 *   getTileValue('A')  // Returns 1
 *   getTileValue('Đ')  // Returns 4
 *   getTileValue('')   // Returns 0 (joker)
 */
export function getTileValue(letter: string): number {
  // Convert to uppercase to handle case-insensitive input
  const upperLetter = letter.toUpperCase()

  // Look up in distribution map
  const tile = TILE_DISTRIBUTION[upperLetter]

  // Return value or 0 if not found
  return tile ? tile.value : 0
}

/**
 * Get tile count for a letter
 *
 * Returns how many tiles of this letter exist in the game.
 *
 * Example:
 *   getTileCount('A')      // Returns 14
 *   getTileCount('JOKER')  // Returns 10
 *   getTileCount('X')      // Returns 0 (not in Serbian alphabet)
 */
export function getTileCount(letter: string): number {
  const upperLetter = letter.toUpperCase()
  const tile = TILE_DISTRIBUTION[upperLetter]
  return tile ? tile.count : 0
}

/**
 * Check if a letter is a digraph
 *
 * Digraphs are two-character letters unique to Serbian/Croatian.
 * They take up one tile but are written as two characters.
 *
 * Example:
 *   isDigraph('DŽ')  // Returns true
 *   isDigraph('LJ')  // Returns true
 *   isDigraph('NJ')  // Returns true
 *   isDigraph('A')   // Returns false
 */
export function isDigraph(letter: string): boolean {
  const digraphs = ['DŽ', 'LJ', 'NJ']
  return digraphs.includes(letter.toUpperCase())
}

/**
 * Example Usage:
 *
 * ```typescript
 * // Initialize tile bag for a new game
 * const tileBag: Tile[] = []
 * let tileId = 0
 *
 * for (const [letter, { count, value }] of Object.entries(TILE_DISTRIBUTION)) {
 *   for (let i = 0; i < count; i++) {
 *     if (letter === 'JOKER') {
 *       // Create joker tile (blank)
 *       tileBag.push({
 *         id: `joker-${i}`,
 *         letter: '',
 *         value: 0,
 *         isJoker: true
 *       })
 *     } else {
 *       // Create regular letter tile
 *       tileBag.push({
 *         id: `tile-${tileId++}`,
 *         letter: letter,
 *         value: value,
 *         isJoker: false
 *       })
 *     }
 *   }
 * }
 *
 * // Shuffle the bag
 * shuffle(tileBag)
 *
 * // Check value of a letter
 * console.log(getTileValue('Đ'))  // 4 (rare letter)
 * console.log(getTileValue('A'))  // 1 (common letter)
 *
 * // Check frequency
 * console.log(LETTER_FREQUENCIES['A'])  // 0.0588 (5.88%)
 * ```
 */
