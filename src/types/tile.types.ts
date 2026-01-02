/**
 * Tile Type Definitions
 *
 * This file defines all TypeScript types related to tiles.
 *
 * In Kvizovka:
 * - 228 letter tiles (Serbian alphabet)
 * - 10 joker tiles (blank tiles that can be any letter)
 * - Each player holds 10 tiles (not 7 like Scrabble)
 */

/**
 * Tile Interface
 *
 * Represents a single tile in the game.
 *
 * Example tiles:
 * - Letter: { id: '1', letter: 'A', value: 1, isJoker: false }
 * - Joker: { id: '229', letter: '', value: 0, isJoker: true, jokerLetter: 'A' }
 */
export interface Tile {
  /**
   * Unique identifier for this tile
   * Used for React keys and tracking tiles
   *
   * Example: 'tile-0', 'tile-1', 'joker-0'
   */
  id: string

  /**
   * Letter on the tile
   * - For letter tiles: 'A', 'B', 'C', 'Č', 'Ć', etc.
   * - For joker tiles: '' (empty string)
   *
   * Serbian alphabet includes: A-Z plus Č, Ć, Đ, Š, Ž, DŽ, LJ, NJ
   */
  letter: string

  /**
   * Point value of the tile
   * - 1 point: Common letters (A, E, I, O, N, R, S, T)
   * - 2 points: Moderately common letters
   * - 3 points: Less common letters
   * - 4 points: Rare letters (Đ, DŽ, LJ, NJ, F)
   * - 0 points: Joker tiles
   */
  value: number

  /**
   * Whether this is a joker (blank) tile
   * Joker tiles can represent any letter
   */
  isJoker: boolean

  /**
   * What letter the joker represents (if it's a joker)
   * Only set when a joker tile is played
   *
   * Example: Joker played as 'A' → jokerLetter = 'A'
   */
  jokerLetter?: string  // ? means optional
}

/**
 * Tile Distribution Entry
 *
 * Defines how many tiles of each letter exist and their point values.
 * Used to initialize the tile bag.
 */
export interface TileDistribution {
  /**
   * Number of tiles with this letter
   * Example: 'A' appears 14 times
   */
  count: number

  /**
   * Point value for this letter
   * Example: 'A' is worth 1 point
   */
  value: number
}

/**
 * Tile Bag State
 *
 * The bag contains all undrawn tiles.
 * Players draw from this bag during the game.
 */
export interface TileBagState {
  /**
   * Tiles currently in the bag (not yet drawn)
   */
  tiles: Tile[]

  /**
   * Number of remaining tiles
   * Useful for UI display
   */
  remaining: number
}

/**
 * Word Category Enum
 *
 * Categories of valid words in Kvizovka.
 *
 * Enum explained:
 * - enum creates a set of named constants
 * - Can use as a type: let category: WordCategory = WordCategory.NOUN
 * - Values are strings (useful for storage/API)
 */
export enum WordCategory {
  /**
   * Nouns (imenice) - nominative case only
   * Examples: PAS (dog), KUĆA (house), AUTO (car)
   */
  NOUN = 'NOUN',

  /**
   * Verbs (glagoli) - infinitive form, non-reflexive only
   * Examples: TRČATI (to run), JESTI (to eat), PITI (to drink)
   */
  VERB = 'VERB',

  /**
   * Adjectives (pridevi) - all genders/cases, positive form only
   * Examples: LEP (beautiful), VELIKI (big), MALI (small)
   */
  ADJECTIVE = 'ADJECTIVE',

  /**
   * Pronouns (zamenice)
   * Examples: OVO (this), ONO (that), KOJI (which)
   */
  PRONOUN = 'PRONOUN',

  /**
   * Numbers (brojevi)
   * Examples: JEDAN (one), DVA (two), PRVI (first)
   */
  NUMBER = 'NUMBER',
}

/**
 * Dictionary Word Entry
 *
 * Represents a word in the dictionary with metadata.
 */
export interface DictionaryWord {
  /**
   * The word text (e.g., "PAS")
   */
  word: string

  /**
   * Word category (noun, verb, etc.)
   */
  category: WordCategory

  /**
   * Optional definition (for dictionary lookup feature)
   */
  definition?: string
}

/**
 * Validation Result
 *
 * Result of validating a word against the dictionary.
 */
export interface ValidationResult {
  /**
   * Whether the word is valid
   */
  isValid: boolean

  /**
   * The word that was validated
   */
  word: string

  /**
   * Word category (if valid)
   */
  category?: WordCategory

  /**
   * Reason why invalid (if not valid)
   * Example: "Word not found in dictionary", "Word too short"
   */
  reason?: string
}

/**
 * Example Usage:
 *
 * ```typescript
 * // Create a letter tile
 * const tileA: Tile = {
 *   id: 'tile-0',
 *   letter: 'A',
 *   value: 1,
 *   isJoker: false
 * }
 *
 * // Create a joker tile
 * const joker: Tile = {
 *   id: 'joker-0',
 *   letter: '',
 *   value: 0,
 *   isJoker: true
 * }
 *
 * // Use joker as 'A'
 * joker.jokerLetter = 'A'
 *
 * // Check word category
 * const category: WordCategory = WordCategory.NOUN
 * console.log(category) // 'NOUN'
 *
 * // Validate a word
 * const result: ValidationResult = {
 *   isValid: true,
 *   word: 'PAS',
 *   category: WordCategory.NOUN
 * }
 * ```
 */
