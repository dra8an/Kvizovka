/**
 * Scoring Rules for Kvizovka
 *
 * This file defines all scoring-related constants:
 * - Bonuses (all tiles used, long words)
 * - Time limits and penalties
 * - Final scoring rules
 */

/**
 * ========================================
 * BONUS SCORING
 * ========================================
 */

/**
 * Bonus for using all 10 tiles in one move
 *
 * When a player uses all 10 tiles from their rack in a single move,
 * they get a bonus added to their score.
 *
 * Value: 40-50 points (we'll use 45 as the standard value)
 *
 * This is similar to "bingo" in Scrabble (which gives 50 points for 7 tiles).
 * Since Kvizovka uses 10 tiles, the bonus is slightly less per tile.
 */
export const ALL_TILES_BONUS = 45

/**
 * Long Word Bonuses
 *
 * Words with 10 or more letters get extra bonus points.
 * The longer the word, the bigger the bonus.
 *
 * Bonus structure:
 * - 10 letters: +20 points
 * - 11 letters: +25 points
 * - 12 letters: +30 points
 * - 13 letters: +35 points
 * - 14 letters: +40 points
 * - 15 letters: +45 points
 * - 16+ letters: +50 points (maximum bonus)
 *
 * Example:
 *   Word "AUTOMOBIL" (10 letters) = base score + 20
 *   Word "KOMPJUTERSKI" (12 letters) = base score + 30
 */
export const LONG_WORD_BONUSES: Record<number, number> = {
  10: 20,
  11: 25,
  12: 30,
  13: 35,
  14: 40,
  15: 45,
  16: 50,
  17: 50, // Maximum - unlikely but possible
}

/**
 * Get long word bonus for a given word length
 *
 * Returns bonus points if word is 10+ letters.
 * Returns 0 if word is less than 10 letters.
 *
 * Example:
 *   getLongWordBonus(9)   // 0 (no bonus)
 *   getLongWordBonus(10)  // 20
 *   getLongWordBonus(12)  // 30
 *   getLongWordBonus(20)  // 50 (max)
 */
export function getLongWordBonus(wordLength: number): number {
  if (wordLength < 10) {
    return 0 // No bonus for words under 10 letters
  }

  // If word is longer than our max defined length, use max bonus
  if (wordLength > 16) {
    return LONG_WORD_BONUSES[16]
  }

  return LONG_WORD_BONUSES[wordLength] || 0
}

/**
 * ========================================
 * MULTIPLIERS
 * ========================================
 */

/**
 * Premium field multipliers
 *
 * These multiply the value of letters or entire words.
 * Applied when a tile is placed on a premium field.
 *
 * Important: Multipliers only apply ONCE when the field is first covered.
 * After that, the field is "used" and acts as a normal square.
 */
export const MULTIPLIERS = {
  DOUBLE_LETTER: 2, // Yellow square - multiply letter by 2
  TRIPLE_LETTER: 3, // Green square - multiply letter by 3
  QUADRUPLE_LETTER: 4, // Red square - multiply letter by 4
  WORD_MULTIPLIER: 2, // X-marked square - multiply entire word by 2
} as const

/**
 * ========================================
 * TIME LIMITS
 * ========================================
 */

/**
 * Default time limit per player (milliseconds)
 *
 * In tournament play, each player gets 30-35 minutes total.
 * We'll use 30 minutes as the default (can be configured).
 *
 * Calculation: 30 minutes × 60 seconds × 1000 milliseconds = 1,800,000 ms
 *
 * This is a chess-style clock:
 * - Your time runs only during your turn
 * - When you submit a move, your clock stops and opponent's starts
 * - If you run out of time, you lose immediately
 */
export const DEFAULT_TIME_LIMIT = 30 * 60 * 1000 // 30 minutes in milliseconds

/**
 * Alternative time limits (can be selected in game settings)
 */
export const TIME_LIMITS = {
  SHORT: 15 * 60 * 1000, // 15 minutes (fast game)
  STANDARD: 30 * 60 * 1000, // 30 minutes (tournament standard)
  LONG: 35 * 60 * 1000, // 35 minutes (leisurely game)
  UNLIMITED: Infinity, // No time limit (casual play)
} as const

/**
 * ========================================
 * TIME PENALTIES
 * ========================================
 */

/**
 * Time penalties for invalid words (tournament rules)
 *
 * When a player tries to play an invalid word:
 * - 1st offense: 1 minute penalty
 * - 2nd offense: 2 minutes penalty
 * - 3rd+ offense: 4 minutes penalty
 *
 * These are cumulative and added to the player's time.
 *
 * Example:
 *   Player has 20:00 remaining
 *   Plays invalid word (1st offense) → 19:00 remaining
 *   Plays invalid word (2nd offense) → 17:00 remaining
 *   Plays invalid word (3rd offense) → 13:00 remaining
 */
export const INVALID_WORD_PENALTIES = {
  FIRST: 1 * 60 * 1000, // 1 minute
  SECOND: 2 * 60 * 1000, // 2 minutes
  THIRD: 4 * 60 * 1000, // 4 minutes
} as const

/**
 * Get time penalty for invalid word attempt
 *
 * @param attemptNumber - How many invalid words this player has tried (1, 2, 3+)
 * @returns Penalty time in milliseconds
 *
 * Example:
 *   getInvalidWordPenalty(1)  // 60,000 ms (1 minute)
 *   getInvalidWordPenalty(2)  // 120,000 ms (2 minutes)
 *   getInvalidWordPenalty(3)  // 240,000 ms (4 minutes)
 *   getInvalidWordPenalty(5)  // 240,000 ms (still 4 minutes)
 */
export function getInvalidWordPenalty(attemptNumber: number): number {
  if (attemptNumber === 1) {
    return INVALID_WORD_PENALTIES.FIRST
  } else if (attemptNumber === 2) {
    return INVALID_WORD_PENALTIES.SECOND
  } else {
    // 3 or more attempts = maximum penalty
    return INVALID_WORD_PENALTIES.THIRD
  }
}

/**
 * ========================================
 * FINAL SCORING
 * ========================================
 */

/**
 * Minimum word length
 *
 * All words must be at least 4 letters long.
 * Shorter words are not valid in Kvizovka (unlike Scrabble which allows 2-letter words).
 */
export const MIN_WORD_LENGTH = 4

/**
 * Maximum rounds per player
 *
 * Each player gets 10 rounds maximum.
 * Game ends when both players have played 10 rounds OR tile bag is empty.
 */
export const MAX_ROUNDS_PER_PLAYER = 10

/**
 * Penalty for unused tiles at game end
 *
 * When the game ends, each player loses points for tiles left in their rack.
 * Penalty = sum of tile values
 *
 * Special case: Joker tiles count as -10 points each (not 0)
 *
 * Example:
 *   Player has tiles: A(1), E(1), Đ(4), JOKER(0)
 *   Penalty = 1 + 1 + 4 + 10 = 16 points
 *   Final score = game score - 16
 */
export const JOKER_END_PENALTY = 10 // Joker worth -10 at game end

/**
 * Calculate end game penalty for unused tiles
 *
 * @param tiles - Array of tiles remaining in player's rack
 * @returns Total penalty points to subtract from score
 *
 * Example:
 *   const tiles = [
 *     { letter: 'A', value: 1, isJoker: false },
 *     { letter: '', value: 0, isJoker: true },
 *     { letter: 'K', value: 2, isJoker: false }
 *   ]
 *   calculateEndGamePenalty(tiles)  // Returns 13 (1 + 10 + 2)
 */
export function calculateEndGamePenalty(
  tiles: Array<{ value: number; isJoker: boolean }>
): number {
  return tiles.reduce((penalty, tile) => {
    if (tile.isJoker) {
      return penalty + JOKER_END_PENALTY
    } else {
      return penalty + tile.value
    }
  }, 0)
}

/**
 * ========================================
 * WINNER DETERMINATION
 * ========================================
 */

/**
 * Determine game winner
 *
 * Winner is the player with the highest score after:
 * 1. All rounds completed OR tile bag empty
 * 2. End-game penalties applied (unused tiles)
 *
 * Tie-breaker rules (in order):
 * 1. Player with fewer unused tiles wins
 * 2. Player with more time remaining wins
 * 3. Player who went first wins (rare)
 */
export const TIE_BREAKER_RULES = {
  FEWER_TILES: 1,
  MORE_TIME: 2,
  FIRST_PLAYER: 3,
} as const

/**
 * Example Usage:
 *
 * ```typescript
 * // Calculate move score
 * let moveScore = baseWordScore
 *
 * // Add all-tiles bonus if applicable
 * if (tilesUsed === 10) {
 *   moveScore += ALL_TILES_BONUS
 * }
 *
 * // Add long-word bonus if applicable
 * const wordLength = word.length
 * moveScore += getLongWordBonus(wordLength)
 *
 * // Apply time penalty for invalid word
 * const penalty = getInvalidWordPenalty(invalidAttempts)
 * player.timeRemaining -= penalty
 *
 * // Calculate final score at game end
 * const unusedPenalty = calculateEndGamePenalty(player.tiles)
 * const finalScore = player.score - unusedPenalty
 * ```
 */
