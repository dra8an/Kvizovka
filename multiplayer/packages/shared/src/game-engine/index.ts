/**
 * Game Engine Index
 *
 * Exports all game engine classes from one central location.
 *
 * Instead of:
 *   import { Board } from './game-engine/Board.js'
 *   import { TileBag } from './game-engine/TileBag.js'
 *   import { ScoreCalculator } from './game-engine/ScoreCalculator.js'
 *
 * You can do:
 *   import { Board, TileBag, ScoreCalculator } from './game-engine.js'
 */

// Export all game engine classes
export { Board } from './Board.js'
export { TileBag, createTileBag } from './TileBag.js'
export { ScoreCalculator, getHighestScoringOption } from './ScoreCalculator.js'
export { WordValidator } from './WordValidator.js'
export { MoveValidator } from './MoveValidator.js'

// Export types specific to game engine
export type { MoveValidationResult } from './MoveValidator.js'
