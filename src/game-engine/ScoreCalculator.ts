/**
 * ScoreCalculator Class
 *
 * Calculates scores for words placed on the board.
 *
 * Responsibilities:
 * - Calculate base word score (sum of tile values)
 * - Apply letter multipliers (2x, 3x, 4x)
 * - Apply word multipliers (2x, can stack)
 * - Calculate bonuses (all tiles used, long words)
 * - Provide detailed score breakdown
 *
 * Scoring is complex in Kvizovka with many rules!
 */

import { BoardSquare, ScoreBreakdown, WordScore, PlacedTile } from '../types'
import {
  MULTIPLIERS,
  ALL_TILES_BONUS,
  getLongWordBonus,
} from '../constants'

/**
 * ScoreCalculator Class
 *
 * Example usage:
 * ```typescript
 * const calculator = new ScoreCalculator()
 * const breakdown = calculator.calculateWordScore(wordSquares, newlyPlacedTiles)
 * console.log(breakdown.totalScore)  // 45
 * ```
 */
export class ScoreCalculator {
  /**
   * Calculate score for a single word
   *
   * @param wordSquares - All squares that make up the word
   * @param newlyPlacedTiles - Which tiles were just placed (for multipliers)
   * @returns WordScore object with breakdown
   *
   * Key rules:
   * - Letter multipliers (2x, 3x, 4x) only apply to newly placed tiles
   * - Word multipliers (2x) apply to entire word if new tile on X-field
   * - Word multipliers can stack (2 X-fields = 4x total)
   * - Jokers worth 0 points
   *
   * Example:
   * Word "KUĆA" (K=2, U=2, Ć=3, A=1) on normal squares = 8 points
   * Word "KUĆA" with Ć on 3x letter field = 2+2+(3×3)+1 = 14 points
   */
  calculateWordScore(
    wordSquares: BoardSquare[],
    newlyPlacedTiles: PlacedTile[]
  ): WordScore {
    let baseScore = 0
    let letterMultiplier = 1
    let wordMultiplier = 1

    // Build word text for display
    const word = wordSquares
      .map((sq) => {
        if (sq.tile && 'letter' in sq.tile) {
          return sq.tile.isJoker && sq.tile.jokerLetter
            ? sq.tile.jokerLetter
            : sq.tile.letter
        }
        return ''
      })
      .join('')

    // Calculate base score with multipliers
    for (const square of wordSquares) {
      const tile = square.tile

      // Skip blocker tiles
      if (!tile || 'type' in tile) {
        continue
      }

      // Get tile value (jokers are 0)
      const tileValue = tile.value

      // Check if this tile was just placed
      const isNewTile = newlyPlacedTiles.some(
        (pt) => pt.row === square.row && pt.col === square.col
      )

      // Apply premium field multipliers (only for new tiles on unused fields)
      if (isNewTile && square.premiumField && !square.isUsed) {
        switch (square.premiumField) {
          case 'DOUBLE_LETTER':
            baseScore += tileValue * MULTIPLIERS.DOUBLE_LETTER
            break
          case 'TRIPLE_LETTER':
            baseScore += tileValue * MULTIPLIERS.TRIPLE_LETTER
            break
          case 'QUADRUPLE_LETTER':
            baseScore += tileValue * MULTIPLIERS.QUADRUPLE_LETTER
            break
          case 'WORD_MULTIPLIER':
            // Word multiplier applies to whole word
            baseScore += tileValue
            wordMultiplier *= MULTIPLIERS.WORD_MULTIPLIER
            break
          case 'CENTER':
            // Center is just a normal square (no multiplier)
            baseScore += tileValue
            break
          default:
            baseScore += tileValue
        }
      } else {
        // No multiplier - just add tile value
        baseScore += tileValue
      }
    }

    // Apply word multiplier
    const finalScore = baseScore * wordMultiplier

    return {
      word,
      baseScore,
      letterMultipliers: 0, // For future use if tracking individual multipliers
      wordMultipliers: wordMultiplier,
      finalScore,
    }
  }

  /**
   * Calculate total score for a move (all words formed)
   *
   * @param allWords - All words formed by the move
   * @param newlyPlacedTiles - Tiles that were just placed
   * @param tilesUsedCount - Number of tiles used in this move
   * @returns ScoreBreakdown with total and bonuses
   *
   * Rules:
   * - Sum scores of all words formed
   * - Add 45 points if all 10 tiles used
   * - Add long word bonus (20-50pts for 10+ letter words)
   *
   * Example:
   * - Main word "AUTOMOBIL" (10 letters) = 30 pts base
   * - Cross word "AS" = 2 pts
   * - Total = 32 pts
   * - Long word bonus = +20 pts (10 letters)
   * - Grand total = 52 pts
   */
  calculateMoveScore(
    allWords: BoardSquare[][],
    newlyPlacedTiles: PlacedTile[],
    tilesUsedCount: number
  ): ScoreBreakdown {
    const wordScores: WordScore[] = []
    let totalScore = 0

    // Calculate score for each word
    for (const wordSquares of allWords) {
      const wordScore = this.calculateWordScore(wordSquares, newlyPlacedTiles)
      wordScores.push(wordScore)
      totalScore += wordScore.finalScore
    }

    // Check for all-tiles bonus
    let allTilesBonus = 0
    if (tilesUsedCount === 10) {
      allTilesBonus = ALL_TILES_BONUS
      totalScore += allTilesBonus
    }

    // Check for long-word bonus
    let longWordBonus = 0
    for (const wordScore of wordScores) {
      const bonus = getLongWordBonus(wordScore.word.length)
      if (bonus > longWordBonus) {
        longWordBonus = bonus // Use highest bonus if multiple long words
      }
    }
    totalScore += longWordBonus

    return {
      totalScore,
      wordScores,
      allTilesBonus,
      longWordBonus,
    }
  }

  /**
   * Calculate final game score for a player
   *
   * @param playerScore - Current score
   * @param remainingTiles - Tiles left in player's rack
   * @returns Final score after penalties
   *
   * Rules:
   * - Subtract value of unused tiles
   * - Jokers count as -10 each (not 0!)
   *
   * Example:
   * - Player score: 450
   * - Remaining: A(1), K(2), Joker(0→10)
   * - Penalty: 1 + 2 + 10 = 13
   * - Final: 450 - 13 = 437
   */
  calculateFinalScore(
    playerScore: number,
    remainingTiles: Array<{ value: number; isJoker: boolean }>
  ): number {
    let penalty = 0

    for (const tile of remainingTiles) {
      if (tile.isJoker) {
        penalty += 10 // Joker penalty
      } else {
        penalty += tile.value
      }
    }

    return playerScore - penalty
  }

  /**
   * Get score preview for hypothetical move
   *
   * @param wordSquares - Potential word
   * @param newlyPlacedTiles - Tiles to be placed
   * @returns Estimated score (without bonuses)
   *
   * Useful for:
   * - AI move evaluation
   * - Player hints ("This word is worth 24 points")
   * - UI score preview
   */
  getScorePreview(
    wordSquares: BoardSquare[],
    newlyPlacedTiles: PlacedTile[]
  ): number {
    const wordScore = this.calculateWordScore(wordSquares, newlyPlacedTiles)
    return wordScore.finalScore
  }
}

/**
 * Helper function: Get highest scoring word from options
 *
 * @param options - Array of word options with scores
 * @returns Index of highest scoring option
 *
 * Useful for AI decision making
 */
export function getHighestScoringOption(
  options: Array<{ score: number }>
): number {
  if (options.length === 0) {
    return -1
  }

  let maxScore = options[0].score
  let maxIndex = 0

  for (let i = 1; i < options.length; i++) {
    if (options[i].score > maxScore) {
      maxScore = options[i].score
      maxIndex = i
    }
  }

  return maxIndex
}

/**
 * Example Usage:
 *
 * ```typescript
 * // Initialize calculator
 * const calculator = new ScoreCalculator()
 *
 * // Calculate score for a single word
 * const wordSquares: BoardSquare[] = [
 *   { row: 8, col: 8, tile: tileK, premiumField: 'CENTER', isUsed: false },
 *   { row: 8, col: 9, tile: tileU, premiumField: null, isUsed: false },
 *   { row: 8, col: 10, tile: tileC, premiumField: 'DOUBLE_LETTER', isUsed: false },
 *   { row: 8, col: 11, tile: tileA, premiumField: null, isUsed: false }
 * ]
 *
 * const newTiles: PlacedTile[] = [
 *   { tile: tileK, row: 8, col: 8 },
 *   { tile: tileU, row: 8, col: 9 },
 *   { tile: tileC, row: 8, col: 10 },
 *   { tile: tileA, row: 8, col: 11 }
 * ]
 *
 * const wordScore = calculator.calculateWordScore(wordSquares, newTiles)
 * console.log(wordScore)
 * // {
 * //   word: 'KUĆA',
 * //   baseScore: 11,  // 2 + 2 + (3×2) + 1
 * //   wordMultipliers: 1,
 * //   finalScore: 11
 * // }
 *
 * // Calculate total move score with bonuses
 * const allWords = [wordSquares]
 * const breakdown = calculator.calculateMoveScore(allWords, newTiles, 4)
 * console.log(breakdown)
 * // {
 * //   totalScore: 11,
 * //   wordScores: [wordScore],
 * //   allTilesBonus: 0,  // Only used 4 tiles, not 10
 * //   longWordBonus: 0   // Only 4 letters, not 10+
 * // }
 *
 * // Calculate final score at game end
 * const finalScore = calculator.calculateFinalScore(450, [
 *   { value: 1, isJoker: false },
 *   { value: 0, isJoker: true }
 * ])
 * console.log(finalScore)  // 450 - 1 - 10 = 439
 * ```
 */
