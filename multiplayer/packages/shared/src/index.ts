/**
 * @kvizovka/shared - Shared TypeScript code for Kvizovka game
 *
 * This package contains types, game engine, constants, and utilities
 * that are shared between the client and server packages.
 */

// Re-export enums (these are both types AND values, so can't use 'export type')
export { GameMode, GameStatus, MoveType, WordCategory, TilePlacementState } from './types/index.js'

// Re-export pure types
export type {
  Tile,
  PlacedTile,
  BoardSquare,
  PremiumFieldType,
  Direction,
  Player,
  GameState,
  Move,
  DictionaryWord,
  ValidationResult,
  Room,
  ChatMessage,
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from './types/index.js'

// Export Board type with alias to avoid conflict with Board class
export type { Board as BoardType } from './types/index.js'

// Re-export everything from constants
export * from './constants/index.js'

// Re-export everything from game-engine (includes Board class)
export * from './game-engine/index.js'

// Re-export everything from utils
export { Dictionary, dictionary } from './utils/dictionary.js'
