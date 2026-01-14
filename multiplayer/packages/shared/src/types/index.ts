/**
 * Type Definitions Index
 *
 * This file exports all types from one place.
 * Makes imports cleaner in other files.
 *
 * Instead of:
 *   import { Board } from './types/board.types.js'
 *   import { Tile } from './types/tile.types.js'
 *   import { GameState } from './types/game.types.js'
 *
 * You can do:
 *   import { Board, Tile, GameState } from './types.js'
 */

// Export all board-related types
export * from './board.types.js'

// Export all tile-related types
export * from './tile.types.js'

// Export all game-related types
export * from './game.types.js'

// Export all socket event types
export * from './socket-events.js'
export type { ChatMessage } from './socket-events.js'

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
} from './board.types.js'

export {
  // Board enums
  TilePlacementState,
} from './board.types.js'

export type {
  // Tile types
  Tile,
  TileDistribution,
  TileBagState,
  DictionaryWord,
  ValidationResult,
} from './tile.types.js'

export {
  // Tile enums
  WordCategory,
} from './tile.types.js'

export type {
  // Game types
  GameState,
  Player,
  Move,
  ScoreBreakdown,
  WordScore,
  GameSettings,
} from './game.types.js'

export {
  // Game enums
  GameMode,
  GameStatus,
  MoveType,
} from './game.types.js'
