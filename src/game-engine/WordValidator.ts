/**
 * WordValidator Class
 *
 * Validates words against the dictionary and game rules.
 *
 * Responsibilities:
 * - Check if word exists in dictionary
 * - Verify minimum word length (4 letters)
 * - Extract words from board positions
 * - Validate word categories (noun, verb, etc.)
 *
 * This uses the Dictionary utility we created in Step 4.
 */

import { BoardSquare, ValidationResult, Direction } from '../types'
import { dictionary } from '../utils/dictionary'
import { MIN_WORD_LENGTH } from '../constants'

/**
 * WordValidator Class
 *
 * Example usage:
 * ```typescript
 * const validator = new WordValidator()
 * const result = validator.validateWord('KUĆA')
 * if (result.isValid) {
 *   console.log('Word is valid!')
 * }
 * ```
 */
export class WordValidator {
  /**
   * Validate a word string
   *
   * @param word - The word to validate
   * @returns ValidationResult with details
   *
   * Checks:
   * - Minimum length (4 letters)
   * - Exists in dictionary
   * - Proper word category
   */
  validateWord(word: string): ValidationResult {
    // Check minimum length
    if (word.length < MIN_WORD_LENGTH) {
      return {
        isValid: false,
        word: word.toUpperCase(),
        reason: `Word too short (minimum ${MIN_WORD_LENGTH} letters)`,
      }
    }

    // Check dictionary
    return dictionary.validateWord(word)
  }

  /**
   * Extract word text from board squares
   *
   * @param squares - Array of BoardSquare objects
   * @returns Word text (e.g., "KUĆA")
   *
   * Handles:
   * - Regular tiles → use letter
   * - Joker tiles → use jokerLetter
   * - Blocker tiles → skip (shouldn't happen in valid word)
   */
  extractWordFromSquares(squares: BoardSquare[]): string {
    return squares
      .map((square) => {
        const tile = square.tile

        if (!tile) {
          return '' // Empty square
        }

        // Check if blocker tile
        if ('type' in tile && tile.type === 'BLOCKER') {
          return '' // Skip blockers
        }

        // Type guard: now TypeScript knows tile is Tile, not BlockerTile
        // Regular or joker tile
        if ('isJoker' in tile && tile.isJoker && tile.jokerLetter) {
          return tile.jokerLetter
        }

        // Regular tile letter
        if ('letter' in tile) {
          return tile.letter
        }

        return ''
      })
      .join('')
  }

  /**
   * Validate all words formed by placed tiles
   *
   * @param words - Array of word squares
   * @returns Array of validation results
   *
   * Each word must be valid for the move to be legal.
   */
  validateAllWords(words: BoardSquare[][]): ValidationResult[] {
    const results: ValidationResult[] = []

    for (const wordSquares of words) {
      const wordText = this.extractWordFromSquares(wordSquares)

      // Only validate if word has content
      if (wordText.length > 0) {
        const result = this.validateWord(wordText)
        results.push(result)
      }
    }

    return results
  }

  /**
   * Check if all words in a move are valid
   *
   * @param words - Array of word squares
   * @returns true if ALL words are valid
   *
   * A move is only valid if every word formed is in the dictionary
   */
  areAllWordsValid(words: BoardSquare[][]): boolean {
    const results = this.validateAllWords(words)

    // Check if any word is invalid
    return results.every((result) => result.isValid)
  }

  /**
   * Get invalid words from a move
   *
   * @param words - Array of word squares
   * @returns Array of invalid words with reasons
   *
   * Useful for error messages: "These words are invalid: XYZ, ABC"
   */
  getInvalidWords(words: BoardSquare[][]): ValidationResult[] {
    const results = this.validateAllWords(words)
    return results.filter((result) => !result.isValid)
  }
}

/**
 * Example Usage:
 *
 * ```typescript
 * // Create validator
 * const validator = new WordValidator()
 *
 * // Validate single word
 * const result = validator.validateWord('KUĆA')
 * console.log(result)
 * // {
 * //   isValid: true,
 * //   word: 'KUĆA',
 * //   category: WordCategory.NOUN
 * // }
 *
 * // Extract word from board squares
 * const squares: BoardSquare[] = [
 *   { row: 8, col: 8, tile: tileK, ... },
 *   { row: 8, col: 9, tile: tileU, ... },
 *   { row: 8, col: 10, tile: tileC, ... },
 *   { row: 8, col: 11, tile: tileA, ... }
 * ]
 * const word = validator.extractWordFromSquares(squares)
 * console.log(word)  // "KUĆA"
 *
 * // Validate all words in a move
 * const allWords = [mainWord, crossWord1, crossWord2]
 * const allValid = validator.areAllWordsValid(allWords)
 * if (!allValid) {
 *   const invalid = validator.getInvalidWords(allWords)
 *   console.log('Invalid words:', invalid)
 * }
 * ```
 */
