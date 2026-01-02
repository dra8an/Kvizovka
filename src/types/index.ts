/**
 * Type Definitions Index
 *
 * This file exports all types from one place.
 * Makes imports cleaner in other files.
 *
 * Instead of:
 *   import { Board } from './types/board.types'
 *   import { Tile } from './types/tile.types'
 *   import { GameState } from './types/game.types'
 *
 * You can do:
 *   import { Board, Tile, GameState } from './types'
 */

// Export all board-related types
export * from './board.types'

// Export all tile-related types
export * from './tile.types'

// Export all game-related types
export * from './game.types'

/**
 * Re-export commonly used types for convenience
 * (These are already exported above, but listing them explicitly
 *  makes it clear what the most important types are)
 */
export type {
  // Board types
  Board,
  BoardSquare,
  PremiumFieldType,
  Position,
  Direction,
  PlacedTile,
  Word,
  BlockerTile,
} from './board.types'

export type {
  // Tile types
  Tile,
  TileDistribution,
  TileBagState,
  DictionaryWord,
  ValidationResult,
} from './tile.types'

export {
  // Tile enums
  WordCategory,
} from './tile.types'

export type {
  // Game types
  GameState,
  Player,
  Move,
  ScoreBreakdown,
  WordScore,
  GameSettings,
} from './game.types'

export {
  // Game enums
  GameMode,
  GameStatus,
  MoveType,
} from './game.types'
