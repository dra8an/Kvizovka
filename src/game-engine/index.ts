/**
 * Game Engine Index
 *
 * Exports all game engine classes from one central location.
 *
 * Instead of:
 *   import { Board } from './game-engine/Board'
 *   import { TileBag } from './game-engine/TileBag'
 *   import { ScoreCalculator } from './game-engine/ScoreCalculator'
 *
 * You can do:
 *   import { Board, TileBag, ScoreCalculator } from './game-engine'
 */

// Export all game engine classes
export { Board } from './Board'
export { TileBag, createTileBag } from './TileBag'
export { ScoreCalculator, getHighestScoringOption } from './ScoreCalculator'
export { WordValidator } from './WordValidator'
export { MoveValidator } from './MoveValidator'

// Export types specific to game engine
export type { MoveValidationResult } from './MoveValidator'
